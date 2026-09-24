from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set
import re
import uuid
from sqlalchemy.orm import Session

from core.logging import logger
from models.kol import KOLCandidateModel, KOLSampleVideoModel, KOLDiscoveryRunModel
from schemas.kol import (
    TikTokDiscoveryRequest,
    TikTokDiscoveryResponse,
    TikTokVideo,
    KOLCandidate,
)
from services.interfaces import TikTokProvider
from services.tiktok_provider import get_tiktok_provider
from services.tiktok_signals import (
    calculate_thai_language_ratio,
    calculate_thailand_keyword_count,
    calculate_thailand_hashtag_count,
    calculate_local_signal_score,
)


def _safe_int(val: Any) -> Optional[int]:
    """Safely parses integer values, returning None for missing, null, or invalid values."""
    if val is None:
        return None
    try:
        num = int(float(val))
        return num if num >= 0 else None
    except (ValueError, TypeError):
        return None


def normalize_tiktok_video(
    raw: Dict[str, Any],
    fallback_query: Optional[str] = None,
    collected_at: Optional[str] = None,
) -> TikTokVideo:
    """Normalizes a raw video record into a structured TikTokVideo schema with safe nulls."""
    now_iso = collected_at or datetime.now(timezone.utc).isoformat()
    raw_user = (raw.get("creator_username") or raw.get("author") or "unknown_user").strip().lstrip("@")

    # Do NOT generate a new profile URL from username merely because the username exists.
    # Only accept explicit creator_profile_url / profile_url, or extract from verified TikTok video URL if scraped.
    raw_profile = raw.get("creator_profile_url") or raw.get("profile_url")
    if not raw_profile:
        vid_url = str(raw.get("video_url") or raw.get("webVideoUrl") or "")
        m = re.match(r"(https?://(?:www\.)?tiktok\.com/@[a-zA-Z0-9_.-]+)", vid_url)
        if m:
            raw_profile = m.group(1)

    profile_url = str(raw_profile).strip() if raw_profile and str(raw_profile).strip() else None

    is_demo = bool(raw.get("is_demo_fixture", False)) or raw.get("provenance") == "curated_demo_fixture"

    # Audit: demo fixture profiles are synthetic and unverified; live profiles are verified if trusted
    if is_demo:
        is_profile_verified = False
        profile_status = "unavailable"
    elif profile_url and ("tiktok.com/@" in profile_url):
        is_profile_verified = bool(raw.get("is_profile_verified", True))
        profile_status = "verified" if is_profile_verified else "unavailable"
    else:
        is_profile_verified = False
        profile_status = "unavailable"

    hashtags = raw.get("hashtags") or []
    cleaned_hashtags: List[str] = []
    for h in hashtags:
        if isinstance(h, str):
            cleaned_hashtags.append(h.strip().lstrip("#"))
        elif isinstance(h, dict) and "name" in h:
            cleaned_hashtags.append(str(h["name"]).strip().lstrip("#"))

    default_video_url = f"{profile_url}/video/unknown" if profile_url else f"https://www.tiktok.com/video/{raw.get('id', 'unknown')}"

    return TikTokVideo(
        video_id=str(raw.get("video_id") or raw.get("id") or str(uuid.uuid4())),
        video_url=str(raw.get("video_url") or raw.get("webVideoUrl") or default_video_url),
        creator_username=raw_user,
        creator_display_name=raw.get("creator_display_name") or raw_user,
        creator_bio=raw.get("creator_bio"),
        creator_profile_url=profile_url,
        is_profile_verified=is_profile_verified,
        profile_status=profile_status,
        follower_count=_safe_int(raw.get("follower_count")),
        views=_safe_int(raw.get("views")),
        likes=_safe_int(raw.get("likes")),
        comments=_safe_int(raw.get("comments")),
        shares=_safe_int(raw.get("shares")),
        saves=_safe_int(raw.get("saves")),
        hashtags=cleaned_hashtags,
        caption=raw.get("caption"),
        created_at=raw.get("created_at"),
        data_source=raw.get("data_source", "live"),
        collected_at=now_iso,
        is_demo_fixture=bool(raw.get("is_demo_fixture", False)),
        provenance=raw.get("provenance", "live"),
    )


class TikTokDiscoveryService:
    """Discovers, normalizes, deduplicates, and aggregates public TikTok creators."""

    def __init__(self, provider: Optional[TikTokProvider] = None):
        self.provider = provider or get_tiktok_provider()

    def discover_and_aggregate(
        self,
        request: TikTokDiscoveryRequest,
        db: Optional[Session] = None,
    ) -> TikTokDiscoveryResponse:
        """Executes full discovery pipeline across provided search queries."""
        run_id = str(uuid.uuid4())
        started_at = datetime.now(timezone.utc)
        provider_name = self.provider.__class__.__name__

        logger.info(
            "Starting TikTok discovery run %s for queries: %s (limit/q: %d)",
            run_id,
            request.queries,
            request.max_results_per_query,
        )

        # Audit Run Model in DB
        discovery_run_record: Optional[KOLDiscoveryRunModel] = None
        if db is not None:
            try:
                discovery_run_record = KOLDiscoveryRunModel(
                    id=run_id,
                    queries=request.queries,
                    provider=provider_name,
                    started_at=started_at,
                    status="running",
                    candidate_count=0,
                )
                db.add(discovery_run_record)
                db.commit()
            except Exception as e:
                logger.warning("Failed to initialize discovery run record in DB: %s", e)
                db.rollback()

        # Step 1: Collect raw video results from provider for all queries
        raw_items: List[Dict[str, Any]] = []
        for q in request.queries:
            try:
                items = self.provider.discover_kols_by_keywords(
                    keywords=[q], limit=request.max_results_per_query
                )
                for it in items:
                    if "matched_query" not in it:
                        it["matched_query"] = q
                raw_items.extend(items)
            except Exception as err:
                logger.error("Error discovering videos for query '%s': %s", q, err)

        # Step 2: Normalize into TikTokVideo instances
        now_iso = datetime.now(timezone.utc).isoformat()
        normalized_videos: List[tuple[TikTokVideo, str]] = []
        for raw in raw_items:
            matched_q = raw.get("matched_query", request.queries[0])
            norm_vid = normalize_tiktok_video(raw, fallback_query=matched_q, collected_at=now_iso)
            normalized_videos.append((norm_vid, matched_q))

        # Step 3: Deduplicate creators across queries
        candidates_map: Dict[str, Dict[str, Any]] = {}
        for vid, q in normalized_videos:
            raw_handle = vid.creator_username.strip().lstrip("@")
            norm_handle = raw_handle.lower()
            if not norm_handle:
                continue

            if norm_handle not in candidates_map:
                candidates_map[norm_handle] = {
                    "username": raw_handle,
                    "normalized_username": norm_handle,
                    "display_name": vid.creator_display_name or raw_handle,
                    "profile_url": vid.creator_profile_url,
                    "is_profile_verified": vid.is_profile_verified,
                    "profile_status": vid.profile_status,
                    "bio": vid.creator_bio,
                    "follower_count": vid.follower_count,
                    "sample_videos": {},
                    "matched_queries": set(),
                    "hashtags": set(),
                    "sample_captions": [],
                    "data_source": vid.data_source,
                    "is_demo_fixture": vid.is_demo_fixture,
                    "provenance": vid.provenance,
                    "collected_at": vid.collected_at,
                }

            entry = candidates_map[norm_handle]

            # Update follower count if higher or if previously missing
            if vid.follower_count is not None:
                if entry["follower_count"] is None or vid.follower_count > entry["follower_count"]:
                    entry["follower_count"] = vid.follower_count

            # Update bio if previously missing
            if vid.creator_bio and not entry["bio"]:
                entry["bio"] = vid.creator_bio

            # Update display name if previously generic
            if vid.creator_display_name and entry["display_name"] == raw_handle:
                entry["display_name"] = vid.creator_display_name

            # Add matched query
            if q:
                entry["matched_queries"].add(q)

            # Deduplicate videos by video_id
            if vid.video_id not in entry["sample_videos"]:
                entry["sample_videos"][vid.video_id] = vid
                if vid.caption and vid.caption not in entry["sample_captions"]:
                    entry["sample_captions"].append(vid.caption)
                for tag in vid.hashtags:
                    entry["hashtags"].add(tag)

        # Step 4: Aggregate creator metrics across sampled videos & compute local signals
        candidates: List[KOLCandidate] = []
        for norm_handle, data in candidates_map.items():
            videos_list: List[TikTokVideo] = list(data["sample_videos"].values())
            sample_video_count = len(videos_list)

            # Aggregating views
            valid_views = [v.views for v in videos_list if v.views is not None]
            total_views = sum(valid_views) if valid_views else None
            avg_views = round(float(total_views) / len(valid_views), 1) if valid_views else None

            # Aggregating likes
            valid_likes = [v.likes for v in videos_list if v.likes is not None]
            total_likes = sum(valid_likes) if valid_likes else None
            avg_likes = round(float(total_likes) / len(valid_likes), 1) if valid_likes else None

            # Aggregating comments
            valid_comments = [v.comments for v in videos_list if v.comments is not None]
            total_comments = sum(valid_comments) if valid_comments else None
            avg_comments = round(float(total_comments) / len(valid_comments), 1) if valid_comments else None

            # Aggregating shares
            valid_shares = [v.shares for v in videos_list if v.shares is not None]
            total_shares = sum(valid_shares) if valid_shares else None
            avg_shares = round(float(total_shares) / len(valid_shares), 1) if valid_shares else None

            # Aggregating saves
            valid_saves = [v.saves for v in videos_list if v.saves is not None]
            total_saves = sum(valid_saves) if valid_saves else None
            avg_saves = round(float(total_saves) / len(valid_saves), 1) if valid_saves else None

            # Derived Estimated Engagement Rate:
            # (avg_likes + avg_comments + avg_shares) / max(follower_count, 1)
            followers = data["follower_count"]
            estimated_engagement_rate: Optional[float] = None
            if followers is not None and (avg_likes is not None or avg_comments is not None or avg_shares is not None):
                l_val = avg_likes or 0.0
                c_val = avg_comments or 0.0
                s_val = avg_shares or 0.0
                denom = max(followers, 1)
                estimated_engagement_rate = round(float(l_val + c_val + s_val) / denom, 4)

            # Local Thailand Content Signals Extraction
            corpus_parts = [data["bio"] or ""] + data["sample_captions"] + list(data["hashtags"])
            combined_corpus = " ".join([p for p in corpus_parts if p])

            thai_ratio = calculate_thai_language_ratio(combined_corpus)
            kw_count, locations = calculate_thailand_keyword_count(combined_corpus)
            hashtag_count = calculate_thailand_hashtag_count(list(data["hashtags"]))
            local_score = calculate_local_signal_score(
                thai_ratio, kw_count, hashtag_count, locations
            )

            candidate = KOLCandidate(
                username=data["username"],
                normalized_username=data["normalized_username"],
                display_name=data["display_name"],
                profile_url=data["profile_url"],
                is_profile_verified=data["is_profile_verified"],
                profile_status=data["profile_status"],
                bio=data["bio"],
                follower_count=followers,
                sample_video_count=sample_video_count,
                total_views=total_views,
                total_likes=total_likes,
                total_comments=total_comments,
                total_shares=total_shares,
                total_saves=total_saves,
                average_views=avg_views,
                average_likes=avg_likes,
                average_comments=avg_comments,
                average_shares=avg_shares,
                average_saves=avg_saves,
                estimated_engagement_rate=estimated_engagement_rate,
                hashtags=sorted(list(data["hashtags"])),
                sample_captions=data["sample_captions"],
                matched_queries=sorted(list(data["matched_queries"])),
                thai_language_ratio=thai_ratio,
                thailand_keyword_count=kw_count,
                thailand_hashtag_count=hashtag_count,
                location_mentions=locations,
                local_signal_score=local_score,
                data_source=data["data_source"],
                collected_at=data["collected_at"],
                data_freshness="fresh",
                is_demo_fixture=data["is_demo_fixture"],
                provenance=data["provenance"],
            )
            candidates.append(candidate)

        # Cap candidates to request.max_candidates
        candidates = candidates[: request.max_candidates]

        # Step 5: Persist candidates & sample videos to Database
        if db is not None:
            try:
                for cand in candidates:
                    # Check if candidate already exists in database
                    existing = (
                        db.query(KOLCandidateModel)
                        .filter(KOLCandidateModel.normalized_username == cand.normalized_username)
                        .first()
                    )

                    if existing:
                        target_model = existing
                        target_model.username = cand.username
                        target_model.display_name = cand.display_name
                        target_model.profile_url = cand.profile_url
                        target_model.is_profile_verified = cand.is_profile_verified
                        target_model.profile_status = cand.profile_status
                        target_model.bio = cand.bio
                        target_model.follower_count = cand.follower_count
                        target_model.sample_video_count = cand.sample_video_count
                        target_model.total_views = cand.total_views
                        target_model.total_likes = cand.total_likes
                        target_model.total_comments = cand.total_comments
                        target_model.total_shares = cand.total_shares
                        target_model.total_saves = cand.total_saves
                        target_model.average_views = cand.average_views
                        target_model.average_likes = cand.average_likes
                        target_model.average_comments = cand.average_comments
                        target_model.average_shares = cand.average_shares
                        target_model.average_saves = cand.average_saves
                        target_model.estimated_engagement_rate = cand.estimated_engagement_rate
                        target_model.hashtags = cand.hashtags
                        target_model.sample_captions = cand.sample_captions
                        # Merge matched queries
                        existing_queries = set(target_model.matched_queries or [])
                        target_model.matched_queries = sorted(list(existing_queries.union(set(cand.matched_queries))))
                        target_model.thai_language_ratio = cand.thai_language_ratio
                        target_model.thailand_keyword_count = cand.thailand_keyword_count
                        target_model.thailand_hashtag_count = cand.thailand_hashtag_count
                        target_model.location_mentions = cand.location_mentions
                        target_model.local_signal_score = cand.local_signal_score
                        target_model.data_source = cand.data_source
                        target_model.is_demo_fixture = cand.is_demo_fixture
                        target_model.provenance = cand.provenance
                        target_model.updated_at = datetime.now(timezone.utc)
                    else:
                        target_model = KOLCandidateModel(
                            id=str(uuid.uuid4()),
                            username=cand.username,
                            normalized_username=cand.normalized_username,
                            display_name=cand.display_name,
                            profile_url=cand.profile_url,
                            is_profile_verified=cand.is_profile_verified,
                            profile_status=cand.profile_status,
                            bio=cand.bio,
                            follower_count=cand.follower_count,
                            sample_video_count=cand.sample_video_count,
                            total_views=cand.total_views,
                            total_likes=cand.total_likes,
                            total_comments=cand.total_comments,
                            total_shares=cand.total_shares,
                            total_saves=cand.total_saves,
                            average_views=cand.average_views,
                            average_likes=cand.average_likes,
                            average_comments=cand.average_comments,
                            average_shares=cand.average_shares,
                            average_saves=cand.average_saves,
                            estimated_engagement_rate=cand.estimated_engagement_rate,
                            hashtags=cand.hashtags,
                            sample_captions=cand.sample_captions,
                            matched_queries=cand.matched_queries,
                            thai_language_ratio=cand.thai_language_ratio,
                            thailand_keyword_count=cand.thailand_keyword_count,
                            thailand_hashtag_count=cand.thailand_hashtag_count,
                            location_mentions=cand.location_mentions,
                            local_signal_score=cand.local_signal_score,
                            data_source=cand.data_source,
                            is_demo_fixture=cand.is_demo_fixture,
                            provenance=cand.provenance,
                            collected_at=datetime.now(timezone.utc),
                        )
                        db.add(target_model)
                        db.flush()

                    # Save sample videos associated with this candidate
                    v_dict = candidates_map[cand.normalized_username]["sample_videos"]
                    for vid_id, v in v_dict.items():
                        existing_vid = (
                            db.query(KOLSampleVideoModel)
                            .filter(
                                KOLSampleVideoModel.kol_candidate_id == target_model.id,
                                KOLSampleVideoModel.video_id == v.video_id,
                            )
                            .first()
                        )
                        if not existing_vid:
                            created_dt = None
                            if v.created_at:
                                try:
                                    created_dt = datetime.fromisoformat(v.created_at.replace("Z", "+00:00"))
                                except Exception:
                                    pass

                            sample_vid_model = KOLSampleVideoModel(
                                id=str(uuid.uuid4()),
                                kol_candidate_id=target_model.id,
                                video_id=v.video_id,
                                video_url=v.video_url,
                                caption=v.caption,
                                hashtags=v.hashtags,
                                views=v.views,
                                likes=v.likes,
                                comments=v.comments,
                                shares=v.shares,
                                saves=v.saves,
                                created_at=created_dt,
                                collected_at=datetime.now(timezone.utc),
                            )
                            db.add(sample_vid_model)

                # Update discovery run record
                if discovery_run_record:
                    discovery_run_record.status = "success"
                    discovery_run_record.candidate_count = len(candidates)
                    discovery_run_record.completed_at = datetime.now(timezone.utc)

                db.commit()
                logger.info("Persisted %d candidates and run %s to DB", len(candidates), run_id)
            except Exception as e:
                logger.warning("Database persistence error in discovery run: %s", e)
                db.rollback()
                if discovery_run_record:
                    try:
                        discovery_run_record.status = "partial"
                        discovery_run_record.error = str(e)
                        db.commit()
                    except Exception:
                        pass

        return TikTokDiscoveryResponse(
            discovery_run_id=run_id,
            status="success" if candidates else "partial",
            candidate_count=len(candidates),
            candidates=candidates,
        )


tiktok_discovery_service = TikTokDiscoveryService()
