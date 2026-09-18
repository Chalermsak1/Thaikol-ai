import pytest
from schemas.brand import BrandProfile
from schemas.kol import KOLCandidate
from services.text_representation import (
    build_brand_embedding_text,
    build_creator_embedding_text,
    extract_matching_topics,
)


def test_build_brand_embedding_text_comprehensive():
    profile = BrandProfile(
        brand_name="Khaokho Talaypu",
        industry="Natural Beauty & Herbal Personal Care",
        products_services=["Herbal Shampoo", "Organic Aloe Vera Gel"],
        target_audience=["Eco-conscious Thai consumers", "Sensitive scalp individuals"],
        content_themes=["Natural ingredients", "Hair loss prevention", "Clean beauty"],
        brand_tone=["Nature-inspired", "Educational"],
        keywords=["แชมพูสมุนไพร", "clean beauty", "organic herbs"],
        location_signals=["Phetchabun", "Thailand"],
        summary="Pioneer Thai natural personal care brand.",
    )

    text = build_brand_embedding_text(profile)

    assert "Brand:\nKhaokho Talaypu" in text
    assert "Industry:\nNatural Beauty & Herbal Personal Care" in text
    assert "Products:\n- Herbal Shampoo\n- Organic Aloe Vera Gel" in text
    assert "Audience:\n- Eco-conscious Thai consumers" in text
    assert "Themes:\n- Natural ingredients" in text
    assert "Tone:\n- Nature-inspired" in text
    assert "Keywords:\n- แชมพูสมุนไพร" in text
    assert "Location:\nPhetchabun, Thailand" in text
    assert "Summary:\nPioneer Thai natural personal care brand." in text

    # Verify no leaked metadata or confidence scores
    assert "0.8" not in text
    assert "confidence" not in text.lower()


def test_build_brand_embedding_text_minimal_fields():
    profile = BrandProfile(
        brand_name="Minimal Brand",
        industry="Retail",
    )
    text = build_brand_embedding_text(profile)

    assert "Brand:\nMinimal Brand" in text
    assert "Industry:\nRetail" in text
    assert "Products:" not in text
    assert "Audience:" not in text


def test_build_creator_embedding_text_strictly_excludes_metrics():
    """CRITICAL: Follower counts, views, likes, shares, comments, engagement rate must NOT be in semantic text."""
    candidate = KOLCandidate(
        username="mookda_skincare",
        normalized_username="mookda_skincare",
        display_name="Mookda รีวิวผิวสวย",
        profile_url="https://www.tiktok.com/@mookda_skincare",
        bio="รีวิวสกินแคร์กู้ผิวแพ้ง่าย สมุนไพรไทย & ออร์แกนิก",
        follower_count=145000,
        total_views=999999,
        average_views=38000.0,
        average_likes=1975.0,
        average_comments=121.0,
        average_shares=78.0,
        estimated_engagement_rate=0.048,
        sample_captions=["กู้ผมร่วงด้วยแชมพูสมุนไพรแท้", "เจลว่านหางออร์แกนิกสำหรับผิวแพ้ง่าย"],
        hashtags=["ผมร่วง", "สมุนไพร", "รีวิวบิวตี้"],
        matched_queries=["แชมพูสมุนไพร"],
        location_mentions=["Bangkok"],
        collected_at="2026-09-17T00:00:00Z",
    )

    text = build_creator_embedding_text(candidate)

    # Assert content fields are present
    assert "Mookda รีวิวผิวสวย" in text
    assert "@mookda_skincare" in text
    assert "รีวิวสกินแคร์กู้ผิวแพ้ง่าย" in text
    assert "กู้ผมร่วงด้วยแชมพูสมุนไพรแท้" in text
    assert "#ผมร่วง #สมุนไพร #รีวิวบิวตี้" in text
    assert "แชมพูสมุนไพร" in text
    assert "Bangkok" in text

    # STRICT ASSERTIONS: No numerical performance metrics!
    assert "145000" not in text
    assert "999999" not in text
    assert "38000" not in text
    assert "1975" not in text
    assert "0.048" not in text
    assert "follower" not in text.lower()
    assert "views" not in text.lower()
    assert "likes" not in text.lower()


def test_extract_matching_topics_deterministic():
    brand = BrandProfile(
        brand_name="Khaokho Talaypu",
        industry="Natural Beauty & Personal Care",
        products_services=["แชมพูสมุนไพร", "เจลว่านหาง"],
        content_themes=["ลดผมร่วง", "hair care", "organic herbs"],
        keywords=["แชมพูสมุนไพร", "ผมร่วง", "clean beauty"],
    )

    candidate = KOLCandidate(
        username="mookda_skincare",
        normalized_username="mookda_skincare",
        display_name="Mookda",
        profile_url="https://www.tiktok.com/@mookda_skincare",
        bio="รีวิวบำรุงผมและสกินแคร์ออร์แกนิก",
        sample_captions=["ลดผมร่วงด้วยแชมพูสมุนไพรสูตรธรรมชาติ ดีจริง #ลดผมร่วง #สมุนไพร"],
        hashtags=["ลดผมร่วง", "สมุนไพร", "hair care"],
        matched_queries=["แชมพูสมุนไพร"],
        collected_at="2026-09-17T00:00:00Z",
    )

    topics = extract_matching_topics(brand, candidate)

    assert isinstance(topics, list)
    assert len(topics) > 0
    # Overlapping topics should contain key domain matches
    assert any(t in topics for t in ["แชมพูสมุนไพร", "ผมร่วง", "ลดผมร่วง", "hair care", "สมุนไพร"])
