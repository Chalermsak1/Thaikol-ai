import threading
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from core.config import settings
from core.database import SessionLocal, check_db_connection
from core.logging import logger
from models.matching_run import MatchingRunModel
from schemas.brand import BrandAnalyzeRequest
from schemas.kol import TikTokDiscoveryRequest
from schemas.matching import MatchingRunStatus
from schemas.recommendation import (
    KOLRecommendationFromBrandRequest,
    KOLRecommendationRequest,
    KOLRecommendationResponse,
)
from services.kol_scorer import multi_factor_kol_scorer
from services.query_generator import generate_structured_search_queries
from services.scoring_config import get_scoring_weights
from services.semantic_matcher import semantic_kol_matcher
from services.tiktok_discovery_service import tiktok_discovery_service


class MatchingRunManager:
    """Manages asynchronous background execution of the full ThaiKOL matching pipeline."""

    def __init__(self, max_retained_runs: int = 50):
        self._runs: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
        self._max_retained_runs = max_retained_runs

    def start_run(self, request: KOLRecommendationFromBrandRequest) -> str:
        """Initializes a new matching run, enqueues background processing, and returns run_id."""
        run_id = str(uuid.uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()

        with self._lock:
            # Prune oldest runs if limit reached
            if len(self._runs) >= self._max_retained_runs:
                oldest_id = next(iter(self._runs))
                del self._runs[oldest_id]

            self._runs[run_id] = {
                "run_id": run_id,
                "status": "queued",
                "stage": "queued",
                "progress_percent": 0,
                "stage_message": "Run queued for execution...",
                "brand_name": None,
                "candidate_count": None,
                "error": None,
                "started_at": now_iso,
                "completed_at": None,
                "result": None,
                "request": request,
            }

        # Persist initial queued record to DB if available
        if SessionLocal is not None and check_db_connection():
            try:
                with SessionLocal() as db:
                    run_record = MatchingRunModel(
                        id=run_id,
                        status="queued",
                        stage="queued",
                        progress_percent=0,
                        stage_message="Run queued for execution...",
                        started_at=datetime.now(timezone.utc),
                        request_payload=request.model_dump() if hasattr(request, "model_dump") else {},
                    )
                    db.add(run_record)
                    db.commit()
            except Exception as e:
                logger.debug("Could not persist initial run record to DB: %s", e)

        thread = threading.Thread(
            target=self._execute_pipeline,
            args=(run_id, request),
            daemon=True,
            name=f"matching-run-{run_id[:8]}",
        )
        thread.start()
        return run_id

    def get_run(self, run_id: str) -> Optional[MatchingRunStatus]:
        """Retrieves snapshot status for a given run_id from memory or database."""
        with self._lock:
            state = self._runs.get(run_id)
            if state:
                return MatchingRunStatus(
                    run_id=state["run_id"],
                    status=state["status"],
                    stage=state["stage"],
                    progress_percent=state["progress_percent"],
                    stage_message=state["stage_message"],
                    brand_name=state["brand_name"],
                    candidate_count=state["candidate_count"],
                    error=state["error"],
                    started_at=state["started_at"],
                    completed_at=state["completed_at"],
                    result=state["result"],
                )

        # Fallback to database for persisted historical runs
        if SessionLocal is not None and check_db_connection():
            try:
                with SessionLocal() as db:
                    row = db.query(MatchingRunModel).filter_by(id=run_id).first()
                    if row:
                        return MatchingRunStatus(
                            run_id=row.id,
                            status=row.status,
                            stage=row.stage,
                            progress_percent=row.progress_percent,
                            stage_message=row.stage_message or "",
                            brand_name=row.brand_name,
                            candidate_count=row.candidate_count,
                            error=row.error,
                            started_at=row.started_at.isoformat() if row.started_at else None,
                            completed_at=row.completed_at.isoformat() if row.completed_at else None,
                            result=row.result,
                        )
            except Exception as e:
                logger.debug("Could not retrieve run %s from DB: %s", run_id, e)

        return None

    def list_runs(self) -> List[MatchingRunStatus]:
        """Lists recent matching runs in reverse chronological order."""
        with self._lock:
            statuses = []
            for state in reversed(list(self._runs.values())):
                statuses.append(
                    MatchingRunStatus(
                        run_id=state["run_id"],
                        status=state["status"],
                        stage=state["stage"],
                        progress_percent=state["progress_percent"],
                        stage_message=state["stage_message"],
                        brand_name=state["brand_name"],
                        candidate_count=state["candidate_count"],
                        error=state["error"],
                        started_at=state["started_at"],
                        completed_at=state["completed_at"],
                        result=None,  # omit heavy payload from list view
                    )
                )
            return statuses

    def _execute_pipeline(self, run_id: str, request: KOLRecommendationFromBrandRequest) -> None:
        """Executes the pipeline stages sequentially with live progress telemetry."""
        from api.v1.endpoints.brands import analyze_brand

        db = None
        if SessionLocal is not None and check_db_connection():
            try:
                db = SessionLocal()
            except Exception as e:
                logger.warning("Could not establish DB session for run %s: %s", run_id, e)

        try:
            # Stage 1: Brand Analysis
            self._update_stage(
                run_id,
                status="running",
                stage="brand_analysis",
                progress=15,
                message="Analyzing brand signals from public web and social sources...",
            )
            brand_req = BrandAnalyzeRequest(
                website_url=request.website_url,
                facebook_page_url=request.facebook_page_url,
            )
            brand_res = analyze_brand(brand_req)
            brand_profile = brand_res.brand_profile

            with self._lock:
                if run_id in self._runs:
                    self._runs[run_id]["brand_name"] = brand_profile.brand_name

            # Stage 2: Query Generation
            self._update_stage(
                run_id,
                status="running",
                stage="query_generation",
                progress=30,
                message="Generating prioritized creator search queries...",
            )
            structured_queries = generate_structured_search_queries(
                brand_profile, max_queries=settings.TIKTOK_MAX_QUERIES
            )
            search_terms = [sq.query for sq in structured_queries]

            # Stage 3: TikTok Discovery
            self._update_stage(
                run_id,
                status="running",
                stage="tiktok_discovery",
                progress=50,
                message=f"Discovering creators on TikTok for {len(search_terms)} queries...",
            )
            disco_req = TikTokDiscoveryRequest(
                queries=search_terms,
                max_results_per_query=settings.TIKTOK_MAX_RESULTS_PER_QUERY,
                max_candidates=settings.TIKTOK_MAX_CANDIDATES,
            )
            disco_res = tiktok_discovery_service.discover_and_aggregate(disco_req, db=db)
            candidates = disco_res.candidates

            with self._lock:
                if run_id in self._runs:
                    self._runs[run_id]["candidate_count"] = len(candidates)

            if not candidates:
                raise ValueError(
                    "No suitable creators were found from the candidate discovery pool. "
                    "Try broader search terms or verify provider connectivity."
                )

            # Stage 4: Normalization
            self._update_stage(
                run_id,
                status="running",
                stage="normalization",
                progress=65,
                message=f"Deduplicated and normalized {len(candidates)} candidate creator profiles...",
            )

            # Stage 5: Enrichment
            self._update_stage(
                run_id,
                status="running",
                stage="enrichment",
                progress=75,
                message="Computing engagement metrics and verified content signals...",
            )

            # Stage 6: Semantic Embedding
            self._update_stage(
                run_id,
                status="running",
                stage="embedding",
                progress=85,
                message="Encoding brand traits and creator content in 384D multilingual vector space...",
            )
            semantic_matches = semantic_kol_matcher.match_brand_with_candidates(
                brand_profile=brand_profile,
                candidates=candidates,
            )

            # Stage 7: Multi-Factor Scoring
            self._update_stage(
                run_id,
                status="running",
                stage="scoring",
                progress=95,
                message="Calculating audited 5-factor composite scores and rationales...",
            )
            weights_used = get_scoring_weights(request.custom_weights)
            recommendations = multi_factor_kol_scorer.score_and_rank_candidates(
                brand_profile=brand_profile,
                candidates=candidates,
                semantic_results=semantic_matches,
                custom_weights=request.custom_weights,
            )

            if request.limit and request.limit > 0 and len(recommendations) > request.limit:
                recommendations = recommendations[: request.limit]

            rec_res = KOLRecommendationResponse(
                status="success",
                recommendation_count=len(recommendations),
                recommendations=recommendations,
                weights_used=weights_used,
                audience_data_note="Audience Fit Proxy uses observable content/locality signals only. Not verified demographic data.",
            )
            rec_res.brand_profile = brand_profile
            rec_res.search_queries = search_terms
            rec_res.candidate_pool_count = len(candidates)
            rec_res.data_source = (
                candidates[0].data_source
                if candidates and hasattr(candidates[0], "data_source")
                else ("demo_fixture" if getattr(brand_profile, "is_demo_fixture", False) else "live")
            )

            # Stage 8: Completed
            now_iso = datetime.now(timezone.utc).isoformat()
            with self._lock:
                if run_id in self._runs:
                    self._runs[run_id]["status"] = "completed"
                    self._runs[run_id]["stage"] = "completed"
                    self._runs[run_id]["progress_percent"] = 100
                    self._runs[run_id]["stage_message"] = (
                        f"Complete: {len(recommendations)} creators ranked for {brand_profile.brand_name}."
                    )
                    self._runs[run_id]["completed_at"] = now_iso
                    self._runs[run_id]["result"] = rec_res.model_dump()

            if db is not None:
                try:
                    row = db.query(MatchingRunModel).filter_by(id=run_id).first()
                    if row:
                        row.status = "completed"
                        row.stage = "completed"
                        row.progress_percent = 100
                        row.stage_message = f"Complete: {len(recommendations)} creators ranked for {brand_profile.brand_name}."
                        row.completed_at = datetime.now(timezone.utc)
                        row.result = rec_res.model_dump()
                        row.candidate_count = len(candidates)
                        row.brand_name = brand_profile.brand_name
                        db.commit()
                except Exception as db_err:
                    logger.debug("Could not commit completed run to DB: %s", db_err)

            logger.info("Matching run %s completed successfully (%d recommendations)", run_id, len(recommendations))

        except Exception as err:
            logger.error("Matching run %s failed: %s", run_id, err)
            now_iso = datetime.now(timezone.utc).isoformat()
            with self._lock:
                if run_id in self._runs:
                    self._runs[run_id]["status"] = "failed"
                    self._runs[run_id]["stage"] = "failed"
                    self._runs[run_id]["error"] = str(err)
                    self._runs[run_id]["stage_message"] = f"Failed: {str(err)}"
                    self._runs[run_id]["completed_at"] = now_iso

            if db is not None:
                try:
                    row = db.query(MatchingRunModel).filter_by(id=run_id).first()
                    if row:
                        row.status = "failed"
                        row.stage = "failed"
                        row.error = str(err)
                        row.stage_message = f"Failed: {str(err)}"
                        row.completed_at = datetime.now(timezone.utc)
                        db.commit()
                except Exception as db_err:
                    logger.debug("Could not commit failed run to DB: %s", db_err)
        finally:
            if db is not None:
                try:
                    db.close()
                except Exception:
                    pass

    def _update_stage(
        self,
        run_id: str,
        status: str,
        stage: str,
        progress: int,
        message: str,
    ) -> None:
        """Internal helper to safely update the run state."""
        with self._lock:
            if run_id in self._runs:
                self._runs[run_id]["status"] = status
                self._runs[run_id]["stage"] = stage
                self._runs[run_id]["progress_percent"] = progress
                self._runs[run_id]["stage_message"] = message

    def cancel_run(self, run_id: str) -> bool:
        """Cancels an active or queued matching run."""
        with self._lock:
            state = self._runs.get(run_id)
            if not state or state["status"] in ("completed", "failed", "cancelled"):
                return False
            state["status"] = "cancelled"
            state["stage"] = "cancelled"
            state["stage_message"] = "Run cancelled by user."
            state["completed_at"] = datetime.now(timezone.utc).isoformat()

        if SessionLocal is not None and check_db_connection():
            try:
                with SessionLocal() as db:
                    row = db.query(MatchingRunModel).filter_by(id=run_id).first()
                    if row and row.status not in ("completed", "failed", "cancelled"):
                        row.status = "cancelled"
                        row.stage = "cancelled"
                        row.stage_message = "Run cancelled by user."
                        row.completed_at = datetime.now(timezone.utc)
                        db.commit()
            except Exception as e:
                logger.debug("Could not commit cancel status to DB: %s", e)

        return True


matching_run_manager = MatchingRunManager()
