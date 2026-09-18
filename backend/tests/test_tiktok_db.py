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
