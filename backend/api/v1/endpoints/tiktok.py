from typing import Any, Generator, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from core.config import settings
from core.database import SessionLocal, check_db_connection
from core.logging import logger
from models.kol import KOLCandidateModel, KOLDiscoveryRunModel
from schemas.kol import (
    TikTokDiscoveryRequest,
    TikTokDiscoveryResponse,
    KOLCandidate,
    KOLDiscoveryRunResponse,
)
from services.tiktok_discovery_service import tiktok_discovery_service

router = APIRouter()


def get_optional_db() -> Generator[Optional[Session], None, None]:
    """Provides an active database session if available, yielding None if DB is offline."""
    if SessionLocal is None or not check_db_connection():
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "/discover",
    response_model=TikTokDiscoveryResponse,
    status_code=status.HTTP_200_OK,
    summary="Discover TikTok Creator Candidates by Keyword Queries",
    description=(
        "Executes public TikTok search queries, normalizes creator records, deduplicates creators, "
        "aggregates sample video metrics (views, likes, comments, shares, saves), calculates "
        "Estimated Engagement Rate, and extracts transparent Thailand content signals. "
        "Fully supports DEMO_MODE=true for offline demonstration."
    ),
)
def discover_tiktok_creators(
    request: TikTokDiscoveryRequest,
    db: Optional[Session] = Depends(get_optional_db),
) -> TikTokDiscoveryResponse:
    try:
        response = tiktok_discovery_service.discover_and_aggregate(
            request=request,
            db=db,
        )
        return response
    except Exception as e:
        logger.error("TikTok discovery pipeline failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"TikTok discovery processing failed: {str(e)}",
        )


@router.get(
    "/discovery-runs/{run_id}",
    response_model=KOLDiscoveryRunResponse,
    summary="Get TikTok Discovery Run Status and Metadata",
    description="Inspects audit metadata, queries, provider, and candidate counts for a specific discovery execution.",
)
def get_discovery_run(
    run_id: str,
    db: Optional[Session] = Depends(get_optional_db),
) -> KOLDiscoveryRunResponse:
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database storage is not currently available.",
        )

    run_record = db.query(KOLDiscoveryRunModel).filter(KOLDiscoveryRunModel.id == run_id).first()
    if not run_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Discovery run '{run_id}' not found.",
        )

    return KOLDiscoveryRunResponse(
        id=run_record.id,
        queries=run_record.queries or [],
        provider=run_record.provider,
        started_at=run_record.started_at.isoformat() if run_record.started_at else "",
        completed_at=run_record.completed_at.isoformat() if run_record.completed_at else None,
        status=run_record.status,
        candidate_count=run_record.candidate_count or 0,
        error=run_record.error,
    )


@router.get(
    "/candidates",
    response_model=List[KOLCandidate],
    summary="List Discovered TikTok KOL Candidates",
    description="Returns stored TikTok creator candidates, optionally filtered by search keyword or query term.",
)
def list_candidates(
    query: Optional[str] = Query(None, description="Filter by username, display name, or matched query"),
    limit: int = Query(50, ge=1, le=100, description="Max candidate records to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: Optional[Session] = Depends(get_optional_db),
) -> List[KOLCandidate]:
    # 1. Try DB retrieval
    if db is not None:
        try:
            q = db.query(KOLCandidateModel)
            if query and query.strip():
                term = f"%{query.strip().lower()}%"
                q = q.filter(
                    (KOLCandidateModel.normalized_username.ilike(term))
                    | (KOLCandidateModel.display_name.ilike(term))
                )
            records = q.order_by(KOLCandidateModel.follower_count.desc().nullslast()).offset(offset).limit(limit).all()
            if records:
                return [
                    KOLCandidate(
                        username=r.username,
                        normalized_username=r.normalized_username,
                        display_name=r.display_name,
                        profile_url=r.profile_url,
                        bio=r.bio,
                        follower_count=r.follower_count,
                        sample_video_count=r.sample_video_count,
                        total_views=r.total_views,
                        total_likes=r.total_likes,
                        total_comments=r.total_comments,
                        total_shares=r.total_shares,
                        total_saves=r.total_saves,
                        average_views=r.average_views,
                        average_likes=r.average_likes,
                        average_comments=r.average_comments,
                        average_shares=r.average_shares,
                        average_saves=r.average_saves,
                        estimated_engagement_rate=r.estimated_engagement_rate,
                        hashtags=r.hashtags or [],
                        sample_captions=r.sample_captions or [],
                        matched_queries=r.matched_queries or [],
                        thai_language_ratio=r.thai_language_ratio or 0.0,
                        thailand_keyword_count=r.thailand_keyword_count or 0,
                        thailand_hashtag_count=r.thailand_hashtag_count or 0,
                        location_mentions=r.location_mentions or [],
                        local_signal_score=r.local_signal_score or 0.0,
                        data_source=r.data_source or "live",
                        collected_at=r.collected_at.isoformat() if r.collected_at else "",
                        data_freshness="cached",
                        is_demo_fixture=r.is_demo_fixture or False,
                        provenance=r.provenance or "database",
                    )
                    for r in records
                ]
        except Exception as e:
            logger.warning("Failed to query candidates from DB: %s", e)

    # 2. Fallback to discover in-memory if DEMO_MODE or DB is empty
    search_queries = [query.strip()] if query and query.strip() else ["general"]
    req = TikTokDiscoveryRequest(
        queries=search_queries,
        max_results_per_query=limit,
        max_candidates=limit,
    )
    res = tiktok_discovery_service.discover_and_aggregate(req, db=None)
    return res.candidates[offset : offset + limit]
