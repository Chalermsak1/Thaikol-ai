import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from core.database import Base
from models.kol import KOLCandidateModel, KOLSampleVideoModel, KOLDiscoveryRunModel
from schemas.kol import TikTokDiscoveryRequest
from services.tiktok_discovery_service import TikTokDiscoveryService
from services.tiktok_provider import MockTikTokProvider


@pytest.fixture
def in_memory_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_tiktok_db_persistence(in_memory_db):
    service = TikTokDiscoveryService(provider=MockTikTokProvider())

    req = TikTokDiscoveryRequest(
        queries=["แชมพูสมุนไพร", "ลดผมร่วง"],
        max_results_per_query=5,
        max_candidates=5,
    )

    resp = service.discover_and_aggregate(request=req, db=in_memory_db)
    assert resp.status == "success"
    assert resp.candidate_count > 0

    # 1. Verify Discovery Run in DB
    run_record = in_memory_db.query(KOLDiscoveryRunModel).filter_by(id=resp.discovery_run_id).first()
    assert run_record is not None
    assert run_record.status == "success"
    assert run_record.candidate_count == resp.candidate_count
    assert "แชมพูสมุนไพร" in run_record.queries

    # 2. Verify Candidates in DB
    db_candidates = in_memory_db.query(KOLCandidateModel).all()
    assert len(db_candidates) == resp.candidate_count

    first_cand = db_candidates[0]
    assert first_cand.username is not None
    assert first_cand.normalized_username is not None
    assert first_cand.profile_url.startswith("https://www.tiktok.com/@")
    assert first_cand.sample_video_count >= 1

    # 3. Verify Sample Videos in DB
    videos = in_memory_db.query(KOLSampleVideoModel).filter_by(kol_candidate_id=first_cand.id).all()
    assert len(videos) >= 1
    assert videos[0].video_url is not None


def test_tiktok_db_upsert_on_rediscovery(in_memory_db):
    service = TikTokDiscoveryService(provider=MockTikTokProvider())

    req1 = TikTokDiscoveryRequest(queries=["แชมพูสมุนไพร"], max_results_per_query=5, max_candidates=5)
    resp1 = service.discover_and_aggregate(request=req1, db=in_memory_db)

    count_after_first = in_memory_db.query(KOLCandidateModel).count()
    assert count_after_first > 0

    # Second run with same query or overlapping query: should NOT crash or create duplicate normalized_usernames
    req2 = TikTokDiscoveryRequest(queries=["แชมพูสมุนไพร"], max_results_per_query=5, max_candidates=5)
    resp2 = service.discover_and_aggregate(request=req2, db=in_memory_db)

    count_after_second = in_memory_db.query(KOLCandidateModel).count()
    assert count_after_second == count_after_first


def test_tiktok_db_snapshot_and_provenance_persistence(in_memory_db):
    from models.kol import KOLCandidateSnapshotModel
    from services.tiktok_provider import TikTokProvider

    # Simulate a live-style provider returning non-demo external data
    class MockLiveExternalProvider(TikTokProvider):
        def discover_kols_by_keywords(self, keywords, limit=20):
            return [
                {
                    "video_id": "vid_live_001",
                    "video_url": "https://www.tiktok.com/@live_thai_creator/video/vid_live_001",
                    "creator_username": "live_thai_creator",
                    "creator_display_name": "Live Thai Creator",
                    "creator_bio": "รีวิวของดีบอกต่อ",
                    "creator_profile_url": "https://www.tiktok.com/@live_thai_creator",
                    "is_profile_verified": True,
                    "profile_status": "verified",
                    "follower_count": 50000,
                    "views": 25000,
                    "likes": 1200,
                    "comments": 45,
                    "shares": 30,
                    "saves": 20,
                    "hashtags": ["รีวิว", "ของดี"],
                    "caption": "รีวิวแชมพูลดผมร่วง ใช้ดีมาก",
                    "created_at": "2026-09-26T12:00:00Z",
                    "data_source": "apify",
                    "is_demo_fixture": False,
                    "provenance": "apify_tiktok_scraper",
                    "matched_query": keywords[0],
                }
            ]

        def get_profile_details(self, handle):
            return {}

    service = TikTokDiscoveryService(provider=MockLiveExternalProvider())
    req = TikTokDiscoveryRequest(queries=["รีวิวแชมพู"], max_results_per_query=5, max_candidates=5)
    resp = service.discover_and_aggregate(request=req, db=in_memory_db)

    assert resp.status == "success"
    assert resp.candidate_count == 1

    # 1. Verify candidate fields & provenance
    cand = in_memory_db.query(KOLCandidateModel).filter_by(normalized_username="live_thai_creator").first()
    assert cand is not None
    assert cand.username == "live_thai_creator"
    assert cand.profile_url == "https://www.tiktok.com/@live_thai_creator"
    assert cand.is_profile_verified is True
    assert cand.profile_status == "verified"
    assert cand.follower_count == 50000
    assert cand.data_source == "apify"
    assert cand.is_demo_fixture is False
    assert cand.provenance == "apify_tiktok_scraper"

    # 2. Verify snapshot record
    snapshot = in_memory_db.query(KOLCandidateSnapshotModel).filter_by(kol_candidate_id=cand.id).first()
    assert snapshot is not None
    assert snapshot.provider == "apify"
    assert snapshot.follower_count == 50000
    assert snapshot.sample_video_count == 1
    assert snapshot.total_views == 25000
    assert snapshot.total_likes == 1200

    # 3. Verify sample video record
    video = in_memory_db.query(KOLSampleVideoModel).filter_by(kol_candidate_id=cand.id).first()
    assert video is not None
    assert video.video_id == "vid_live_001"
    assert video.video_url == "https://www.tiktok.com/@live_thai_creator/video/vid_live_001"


def test_tiktok_db_failed_provider_does_not_leave_fake_success(in_memory_db):
    from services.tiktok_provider import TikTokProvider
    from services.provider_exceptions import ProviderTimeoutError

    class FailingProvider(TikTokProvider):
        def discover_kols_by_keywords(self, keywords, limit=20):
            raise ProviderTimeoutError("Apify scraper timed out", provider="ApifyTikTokProvider")

        def get_profile_details(self, handle):
            return {}

    service = TikTokDiscoveryService(provider=FailingProvider())
    req = TikTokDiscoveryRequest(queries=["query_timeout"], max_results_per_query=5, max_candidates=5)

    with pytest.raises(ProviderTimeoutError):
        service.discover_and_aggregate(request=req, db=in_memory_db)

    # Verify no fake successful run was left
    success_runs = in_memory_db.query(KOLDiscoveryRunModel).filter_by(status="success").all()
    assert len(success_runs) == 0

    # Verify failed run record tracks error
    failed_runs = in_memory_db.query(KOLDiscoveryRunModel).filter_by(status="failed").all()
    assert len(failed_runs) == 1
    assert "timed out" in failed_runs[0].error


def test_tiktok_db_fallback_recovers_when_candidates_exist(in_memory_db):
    from services.tiktok_provider import TikTokProvider
    from services.provider_exceptions import ProviderAuthenticationError

    # 1. Populate a candidate in DB
    existing_cand = KOLCandidateModel(
        id="cand_test_001",
        username="herbal_expert_thai",
        normalized_username="herbal_expert_thai",
        display_name="Herbal Expert Thai",
        bio="สมุนไพรบำรุงผม และสกินแคร์ธรรมชาติ",
        profile_url="https://www.tiktok.com/@herbal_expert_thai",
        follower_count=55000,
        sample_video_count=1,
    )
    in_memory_db.add(existing_cand)
    in_memory_db.commit()

    # 2. Simulate failing provider (e.g. Apify 403 Forbidden)
    class AuthFailingProvider(TikTokProvider):
        def discover_kols_by_keywords(self, keywords, limit=20):
            raise ProviderAuthenticationError("Apify 403 Forbidden - Token expired", provider="ApifyTikTokProvider")

        def get_profile_details(self, handle):
            return {}

    service = TikTokDiscoveryService(provider=AuthFailingProvider())
    req = TikTokDiscoveryRequest(queries=["สมุนไพร"], max_results_per_query=5, max_candidates=5)

    # 3. Discovery should NOT crash; it recovers from DB candidates
    resp = service.discover_and_aggregate(request=req, db=in_memory_db)
    assert resp.status == "fallback"
    assert resp.candidate_count == 1
    assert resp.candidates[0].username == "herbal_expert_thai"
    assert resp.candidates[0].data_source == "database_cache"

