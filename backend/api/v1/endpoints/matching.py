import uuid
from typing import Generator, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.config import settings
from core.database import SessionLocal, check_db_connection
from core.logging import logger
from models.matching import KOLSemanticMatchModel
from models.recommendation import KOLRecommendationModel
from schemas.matching import (
    SemanticMatchRequest,
    SemanticMatchResponse,
    SemanticMatchResult,
    SemanticMatchFromBrandRequest,
    MatchingRunStatus,
)
from schemas.recommendation import (
    KOLRecommendationRequest,
    KOLRecommendationResponse,
    KOLRecommendationFromBrandRequest,
)
from schemas.brand import BrandAnalyzeRequest
from schemas.kol import TikTokDiscoveryRequest
from services.semantic_matcher import semantic_kol_matcher
from services.tiktok_discovery_service import tiktok_discovery_service
from services.kol_scorer import multi_factor_kol_scorer
from services.scoring_config import get_scoring_weights, validate_weights
from services.query_generator import generate_kol_search_queries
from services.provider_exceptions import (
    ProviderConfigurationError,
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderError,
)
from api.v1.endpoints.brands import analyze_brand

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
    "/semantic",
    response_model=SemanticMatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Compute Semantic Relevance Between Brand and TikTok Creators",
    description=(
        "Encodes the structured BrandProfile and creator candidate content into dense multilingual vector "
        "embeddings using sentence-transformers, calculates cosine similarities, extracts deterministic "
        "matching topics, and returns creators ranked strictly by semantic relevance score."
    ),
)
def match_creators_semantic(
    request: SemanticMatchRequest,
    db: Optional[Session] = Depends(get_optional_db),
) -> SemanticMatchResponse:
    if not request.kol_candidates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one KOLCandidate must be provided in 'kol_candidates'.",
        )

    try:
        matches = semantic_kol_matcher.match_brand_with_candidates(
            brand_profile=request.brand_profile,
            candidates=request.kol_candidates,
        )
    except RuntimeError as e:
        logger.error("Embedding model runtime error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "embedding_unavailable",
                "message": f"Embedding service is currently unavailable: {str(e)}",
            },
        )
    except Exception as e:
        logger.error("Semantic matching error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic matching pipeline failed: {str(e)}",
        )

    # Persist match records if DB is online
    if db is not None:
        try:
            brand_id = request.brand_profile.brand_name.strip()
            for m in matches:
                record = KOLSemanticMatchModel(
                    id=str(uuid.uuid4()),
                    brand_identifier=brand_id,
                    kol_username=m.username,
                    cosine_similarity=m.cosine_similarity,
                    semantic_relevance_score=m.semantic_relevance_score,
                    matching_topics=m.matching_topics,
                    embedding_model=settings.EMBEDDING_MODEL_NAME,
                )
                db.add(record)
            db.commit()
        except Exception as err:
            logger.warning("Failed to persist semantic match results to DB: %s", err)
            db.rollback()

    return SemanticMatchResponse(
        match_count=len(matches),
        matches=matches,
        embedding_model=settings.EMBEDDING_MODEL_NAME,
    )


@router.post(
    "/semantic-from-brand",
    response_model=SemanticMatchResponse,
    status_code=status.HTTP_200_OK,
    summary="End-to-End Brand Analysis and Semantic Matching Pipeline",
    description=(
        "Analyzes client website and Facebook page to synthesize a BrandProfile, retrieves creator "
        "candidates, and computes semantic relevance rankings in a single call."
    ),
)
def match_from_brand_urls(
    request: SemanticMatchFromBrandRequest,
    db: Optional[Session] = Depends(get_optional_db),
) -> SemanticMatchResponse:
    # 1. Synthesize or load BrandProfile
    brand_req = BrandAnalyzeRequest(
        website_url=request.website_url,
        facebook_page_url=request.facebook_page_url,
    )
    brand_res = analyze_brand(brand_req)
    brand_profile = brand_res.brand_profile

    # 2. Get candidates
    candidates = request.kol_candidates
    if not candidates:
        search_terms = generate_kol_search_queries(brand_profile)
        disco_req = TikTokDiscoveryRequest(
            queries=search_terms,
            max_results_per_query=20,
            max_candidates=30,
        )
        disco_res = tiktok_discovery_service.discover_and_aggregate(disco_req, db=db)
        candidates = disco_res.candidates

    match_req = SemanticMatchRequest(
        brand_profile=brand_profile,
        kol_candidates=candidates,
    )
    return match_creators_semantic(match_req, db=db)


@router.post(
    "/recommend",
    response_model=KOLRecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Multi-Factor Explainable KOL Recommendation",
    description=(
        "Calculates multi-factor composite scores (semantic relevance, engagement quality, "
        "local content relevance, brand safety, data quality), generates deterministic explanations, "
        "and returns ranked recommendations with full score breakdowns."
    ),
)
def recommend_creators(
    request: KOLRecommendationRequest,
    db: Optional[Session] = Depends(get_optional_db),
) -> KOLRecommendationResponse:
    if not request.kol_candidates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one KOLCandidate must be provided in 'kol_candidates'.",
        )

    # Validate custom weights if provided
    try:
        weights_used = get_scoring_weights(request.custom_weights)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid scoring weights: {str(val_err)}",
        )

    # 1. Semantic matching
    try:
        semantic_matches = semantic_kol_matcher.match_brand_with_candidates(
            brand_profile=request.brand_profile,
            candidates=request.kol_candidates,
        )
    except RuntimeError as e:
        logger.error("Embedding model runtime error during recommendation: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "embedding_unavailable",
                "message": f"Embedding service is currently unavailable: {str(e)}",
            },
        )
    except Exception as e:
        logger.error("Semantic matching error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic matching pipeline failed: {str(e)}",
        )

    # 2. Multi-factor scoring and ranking
    try:
        recommendations = multi_factor_kol_scorer.score_and_rank_candidates(
            brand_profile=request.brand_profile,
            candidates=request.kol_candidates,
            semantic_results=semantic_matches,
            custom_weights=request.custom_weights,
        )
    except Exception as e:
        logger.error("Multi-factor scoring failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Multi-factor scoring failed: {str(e)}",
        )

    # 3. Persist recommendation records if DB is online
    if db is not None:
        try:
            brand_id = request.brand_profile.brand_name.strip()
            for r in recommendations:
                rec_model = KOLRecommendationModel(
                    id=str(uuid.uuid4()),
                    brand_identifier=brand_id,
                    kol_username=r.username,
                    rank=r.rank,
                    final_score=r.final_score,
                    semantic_relevance_score=r.semantic_relevance_score,
                    engagement_quality_score=r.engagement_quality_score,
                    local_content_relevance_score=r.local_content_relevance_score,
                    audience_fit_proxy=r.audience_fit_proxy,
                    brand_safety_score=r.brand_safety_score,
                    brand_safety_risk_level=r.brand_safety_risk_level,
                    data_quality_score=r.data_quality_score,
                    score_breakdown=r.score_breakdown.model_dump(),
                    reasons=r.reasons,
                    cautions=r.cautions,
                )
                db.add(rec_model)
            db.commit()
        except Exception as err:
            logger.warning("Failed to persist recommendations to DB: %s", err)
            db.rollback()

    return KOLRecommendationResponse(
        status="success",
        recommendation_count=len(recommendations),
        recommendations=recommendations,
        weights_used=weights_used,
        audience_data_note="Audience demographics are not directly verified from public content. Audience Fit Proxy uses observable content/locality signals only.",
    )


@router.post(
    "/recommend-from-brand",
    response_model=KOLRecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="End-to-End Brand Analysis to Explainable KOL Recommendation Pipeline",
    description=(
        "Executes the entire workflow: analyzes client brand URLs, synthesizes a BrandProfile, "
        "generates tailored TikTok discovery queries, retrieves creator candidates, computes semantic "
        "matching and multi-factor scores, and outputs ranked recommendations."
    ),
)
def recommend_from_brand_urls(
    request: KOLRecommendationFromBrandRequest,
    db: Optional[Session] = Depends(get_optional_db),
) -> KOLRecommendationResponse:
    # 1. Synthesize BrandProfile from URLs
    brand_req = BrandAnalyzeRequest(
        website_url=request.website_url,
        facebook_page_url=request.facebook_page_url,
    )
    brand_res = analyze_brand(brand_req)
    brand_profile = brand_res.brand_profile

    # 2. Get or discover creator candidates
    candidates = request.kol_candidates
    search_terms: List[str] = []
    if not candidates:
        search_terms = generate_kol_search_queries(brand_profile)
        disco_req = TikTokDiscoveryRequest(
            queries=search_terms,
            max_results_per_query=20,
            max_candidates=30,
        )
        try:
            disco_res = tiktok_discovery_service.discover_and_aggregate(disco_req, db=db)
            candidates = disco_res.candidates
        except ProviderConfigurationError as e:
            logger.warning("TikTok provider configuration error: %s", e)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"TikTok live data provider is not configured: {e.message}",
            )
        except ProviderRateLimitError as e:
            logger.warning("TikTok provider rate limit: %s", e)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Creator discovery reached provider rate limit: {e.message}",
            )
        except ProviderTimeoutError as e:
            logger.warning("TikTok provider timeout: %s", e)
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=f"The external provider timed out: {e.message}",
            )
        except ProviderError as e:
            logger.error("TikTok provider error: %s", e)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Creator discovery is temporarily unavailable: {e.message}",
            )

    if not candidates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "status": "no_candidates_found",
                "message": (
                    "No suitable creators were found from the current candidate pool. "
                    "Try broader keywords or another business."
                ),
            },
        )

    rec_req = KOLRecommendationRequest(
        brand_profile=brand_profile,
        kol_candidates=candidates,
        custom_weights=request.custom_weights,
    )
    rec_res = recommend_creators(rec_req, db=db)

    # Attach workflow metadata for single-endpoint UI orchestration
    rec_res.brand_profile = brand_profile
    rec_res.search_queries = search_terms
    rec_res.candidate_pool_count = len(candidates)
    rec_res.data_source = (
        candidates[0].data_source
        if candidates and hasattr(candidates[0], "data_source")
        else ("demo_fixture" if getattr(brand_profile, "is_demo_fixture", False) else "live")
    )

    if request.limit and request.limit > 0 and len(rec_res.recommendations) > request.limit:
        rec_res.recommendations = rec_res.recommendations[:request.limit]
        rec_res.recommendation_count = len(rec_res.recommendations)

    return rec_res


# ==============================================================================
# Asynchronous Background Matching Run Endpoints
# ==============================================================================
from services.matching_run_manager import matching_run_manager


@router.post(
    "/runs",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Enqueue Asynchronous Brand Analysis & Creator Matching Run",
    description="Enqueues a background matching run and returns the run_id immediately with status 'queued'.",
)
def create_matching_run(
    request: KOLRecommendationFromBrandRequest,
) -> dict:
    run_id = matching_run_manager.start_run(request)
    return {
        "run_id": run_id,
        "status": "queued",
        "stage": "queued",
        "progress_percent": 0,
        "message": "Matching run queued for background execution.",
    }


@router.get(
    "/runs/{run_id}",
    response_model=MatchingRunStatus,
    summary="Get Matching Run Status and Pipeline Progress",
    description="Polls real-time pipeline stage, progress percentage, error status, and completed recommendation results.",
)
def get_matching_run(run_id: str) -> MatchingRunStatus:
    run_status = matching_run_manager.get_run(run_id)
    if not run_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Matching run '{run_id}' not found.",
        )
    return run_status


@router.get(
    "/runs",
    response_model=List[MatchingRunStatus],
    summary="List Recent Matching Runs",
    description="Returns telemetry list of recent asynchronous matching runs.",
)
def list_matching_runs() -> List[MatchingRunStatus]:
    return matching_run_manager.list_runs()


@router.get(
    "/runs/{run_id}/results",
    summary="Get Completed Matching Run Recommendations",
    description="Retrieves final ranked creator recommendations once the matching run reaches 'completed' state.",
)
def get_matching_run_results(run_id: str) -> dict:
    run_status = matching_run_manager.get_run(run_id)
    if not run_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Matching run '{run_id}' not found.",
        )
    if run_status.status == "failed":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "status": "failed",
                "message": f"Matching run failed: {run_status.error}",
            },
        )
    if run_status.status != "completed" or not run_status.result:
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail={
                "status": run_status.status,
                "stage": run_status.stage,
                "progress_percent": run_status.progress_percent,
                "message": run_status.stage_message,
            },
        )
    return run_status.result


@router.delete(
    "/runs/{run_id}",
    summary="Cancel Matching Run",
    description="Cancels an active or queued background matching run.",
)
def cancel_matching_run(run_id: str) -> dict:
    cancelled = matching_run_manager.cancel_run(run_id)
    if not cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Matching run '{run_id}' cannot be cancelled (may be already completed, failed, or not found).",
        )
    return {
        "run_id": run_id,
        "status": "cancelled",
        "message": f"Matching run '{run_id}' was cancelled.",
    }

