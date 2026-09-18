from schemas.kol import KOLCandidate
from services.brand_safety_service import brand_safety_service


def test_brand_safety_clean_candidate():
    c = KOLCandidate(
        username="clean_kol",
        normalized_username="clean_kol",
        display_name="Clean Creator",
        profile_url="https://www.tiktok.com/@clean_kol",
        bio="รีวิวสกินแคร์ แชมพูธรรมชาติ ดูแลสุขภาพผม",
        sample_captions=["แนะนำแชมพูสมุนไพรออร์แกนิก ลดผมร่วงได้ดีมาก"],
        hashtags=["รีวิวบิวตี้", "แชมพูสมุนไพร"],
        collected_at="2026-09-17T20:00:00Z",
    )
    result = brand_safety_service.evaluate_candidate(c)
    assert result.score == 100.0
    assert result.risk_level == "safe"
    assert result.matched_flags == []
    assert result.evidence == []
    assert "Content screening for campaign suitability only" in result.disclaimer


def test_brand_safety_gambling_flag():
    c = KOLCandidate(
        username="risky_kol",
        normalized_username="risky_kol",
        display_name="Risky Creator",
        profile_url="https://www.tiktok.com/@risky_kol",
        bio="รับงานทุกประเภท ติดต่อแอดไลน์",
        sample_captions=["สล็อตเว็บตรง แตกง่าย จ่ายจริง สนใจคลิกลิงก์หน้าโปรไฟล์"],
        hashtags=["สล็อตเว็บตรง", "บาคาร่า"],
        collected_at="2026-09-17T20:00:00Z",
    )
    result = brand_safety_service.evaluate_candidate(c)
    assert result.score < 100.0
    assert "illegal_drugs_and_gambling" in result.matched_flags
    assert any("สล็อตเว็บตรง" in e for e in result.evidence)
    assert result.risk_level in ["review", "high_risk"]


def test_brand_safety_adult_flag():
    c = KOLCandidate(
        username="adult_kol",
        normalized_username="adult_kol",
        display_name="Adult Creator",
        profile_url="https://www.tiktok.com/@adult_kol",
        bio="ติดตามคลิปเต็ม 18+ ที่ OnlyFans",
        sample_captions=["ดูคลิปหลุดและงานอย่างว่าได้ที่ลิงก์ bio"],
        hashtags=["18+"],
        collected_at="2026-09-17T20:00:00Z",
    )
    result = brand_safety_service.evaluate_candidate(c)
    assert result.score < 100.0
    assert "explicit_sexual_content" in result.matched_flags


def test_brand_safety_empty_text_handled_safely():
    c = KOLCandidate(
        username="empty_text_kol",
        normalized_username="empty_text_kol",
        display_name="Empty Text Creator",
        profile_url="https://www.tiktok.com/@empty_text_kol",
        bio=None,
        sample_captions=[],
        hashtags=[],
        collected_at="2026-09-17T20:00:00Z",
    )
    result = brand_safety_service.evaluate_candidate(c)
    assert result.score == 100.0
    assert result.risk_level == "safe"
