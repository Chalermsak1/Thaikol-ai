from datetime import datetime, timezone, timedelta
import pytest
from services.freshness import calculate_data_freshness
from services.query_generator import (
    generate_structured_search_queries,
    generate_kol_search_queries,
)
from schemas.brand import BrandProfile, EvidenceItem
from models.kol import KOLCandidateModel, KOLCandidateSnapshotModel


def test_calculate_data_freshness_thresholds():
    """Validates calculate_data_freshness across configured threshold windows."""
    now = datetime.now(timezone.utc)

    # 1. 1 hour old -> fresh
    t1 = (now - timedelta(hours=1)).isoformat()
    assert calculate_data_freshness(t1, hours_threshold=6) == "fresh"

    # 2. 12 hours old -> aging (threshold is 6, aging is up to 6*3=18)
    t2 = (now - timedelta(hours=12)).isoformat()
    assert calculate_data_freshness(t2, hours_threshold=6) == "aging"

    # 3. 48 hours old -> stale (> 18h)
    t3 = (now - timedelta(hours=48)).isoformat()
    assert calculate_data_freshness(t3, hours_threshold=6) == "stale"

    # 4. None or malformed -> unknown
    assert calculate_data_freshness(None) == "unknown"
    assert calculate_data_freshness("invalid-date-string") == "unknown"


def test_structured_query_generation_and_deduplication():
    """Validates that search queries generated from BrandProfile are deduplicated, prioritized, and capped."""
    profile = BrandProfile(
        brand_name="Khaokho Talaypu",
        industry="Health & Beauty",
        products_services=["แชมพูสมุนไพร", "ทรีทเม้นท์บำรุงผม", "มะกรูดลดผมร่วง"],
        target_audience=["ผู้มีปัญหาผมร่วง", "ผู้ชื่นชอบผลิตภัณฑ์ธรรมชาติ"],
        content_themes=["รีวิวดูแลเส้นผม", "วิธีแก้ผมร่วง", "สมุนไพรไทย"],
        brand_tone=["เป็นมิตร", "น่าเชื่อถือ"],
        keywords=["แชมพูสมุนไพร", "ผมร่วง", "มะกรูด", "ธรรมชาติ"],
        location_signals=["Thailand", "เขาค้อ"],
        summary="แบรนด์แชมพูและผลิตภัณฑ์ดูแลผมจากธรรมชาติ",
        confidence=0.9,
        evidence=[],
    )

    structured_queries = generate_structured_search_queries(profile, max_queries=6)
    assert len(structured_queries) <= 6
    assert len(structured_queries) > 0

    # Ensure prioritized order
    priorities = [q.priority for q in structured_queries]
    assert priorities == sorted(priorities)

    # Verify no duplicates
    query_texts = [q.query.lower() for q in structured_queries]
    assert len(query_texts) == len(set(query_texts))

    # Test backward compatibility string function
    legacy_queries = generate_kol_search_queries(profile, max_queries=5)
    assert isinstance(legacy_queries, list)
    assert all(isinstance(q, str) for q in legacy_queries)
    assert len(legacy_queries) <= 5


def test_snapshot_model_attributes():
    """Verifies that KOLCandidateSnapshotModel stores immutable point-in-time metrics."""
    snapshot = KOLCandidateSnapshotModel(
        id="snap-1234",
        kol_candidate_id="cand-123",
        provider="apify",
        collected_at=datetime.now(timezone.utc),
        follower_count=150000,
        sample_video_count=10,
        total_views=2500000,
        total_likes=180000,
        total_comments=5400,
        total_shares=3200,
        total_saves=1100,
        estimated_engagement_rate=0.085,
    )

    assert snapshot.kol_candidate_id == "cand-123"
    assert snapshot.follower_count == 150000
    assert snapshot.estimated_engagement_rate == 0.085
    assert snapshot.provider == "apify"
