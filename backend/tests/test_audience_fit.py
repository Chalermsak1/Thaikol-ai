from schemas.brand import BrandProfile
from schemas.kol import KOLCandidate
from services.audience_fit_service import calculate_audience_fit_proxy


def test_audience_fit_proxy_calculation():
    cand = KOLCandidate(
        username="thai_kol",
        normalized_username="thai_kol",
        display_name="Thai KOL",
        profile_url="https://www.tiktok.com/@thai_kol",
        bio="รีวิวของใช้ในบ้าน",
        sample_captions=["แชมพูสมุนไพร เขาค้อ ใช้ดีมาก"],
        hashtags=["แชมพูสมุนไพร", "ลดผมร่วง"],
        thai_language_ratio=0.95,
        local_signal_score=0.85,
        collected_at="2026-09-17T20:00:00Z",
    )
    brand = BrandProfile(
        brand_name="Khaokho Talaypu",
        industry="Haircare",
        keywords=["แชมพูสมุนไพร", "ลดผมร่วง"],
        target_audience=["คนรักธรรมชาติ", "ผู้มีปัญหาผมร่วง"],
        summary="Herbal shampoo brand",
    )

    proxy = calculate_audience_fit_proxy(cand, brand)
    assert proxy is not None
    assert 50.0 <= proxy <= 100.0


def test_audience_fit_proxy_empty_content_returns_none():
    cand = KOLCandidate(
        username="empty_kol",
        normalized_username="empty_kol",
        display_name="Empty",
        profile_url="https://www.tiktok.com/@empty_kol",
        bio=None,
        sample_captions=[],
        hashtags=[],
        collected_at="2026-09-17T20:00:00Z",
    )
    proxy = calculate_audience_fit_proxy(cand)
    assert proxy is None
