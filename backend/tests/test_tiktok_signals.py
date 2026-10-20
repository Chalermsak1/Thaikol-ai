import pytest
from services.tiktok_signals import (
    calculate_thai_language_ratio,
    calculate_thailand_keyword_count,
    calculate_thailand_hashtag_count,
    calculate_local_signal_score,
    extract_bio_contacts,
    classify_creator_tier,
    estimate_rate_card_range,
    detect_content_formats_and_shop,
    extract_last_posted_at,
)


def test_calculate_thai_language_ratio():
    # Pure Thai text
    thai_text = "รีวิวแชมพูสมุนไพรลดผมร่วงสูตรโบราณจากธรรมชาติ"
    ratio_thai = calculate_thai_language_ratio(thai_text)
    assert ratio_thai == 1.0

    # Pure English text
    eng_text = "Best organic herbal shampoo for hair loss review"
    ratio_eng = calculate_thai_language_ratio(eng_text)
    assert ratio_eng == 0.0

    # Mixed Thai and English
    mixed_text = "รีวิวแชมพู Organic Herbal Shampoo ใช้ดีมาก"
    ratio_mixed = calculate_thai_language_ratio(mixed_text)
    assert 0.2 < ratio_mixed < 0.8

    # Edge cases
    assert calculate_thai_language_ratio("") == 0.0
    assert calculate_thai_language_ratio("12345 !@#$%") == 0.0


def test_calculate_thailand_keyword_count_and_locations():
    text = "ไปเที่ยว เชียงใหม่ แวะคาเฟ่ชื่อดัง แล้วบินกลับ กรุงเทพ สบายใจใน ประเทศไทย"
    count, locations = calculate_thailand_keyword_count(text)

    assert count >= 3
    assert "Chiang Mai" in locations
    assert "Bangkok" in locations
    assert "Thailand (General)" in locations

    # Text without Thailand locations
    empty_count, empty_locs = calculate_thailand_keyword_count("Travelling to Tokyo and London")
    assert empty_count == 0
    assert empty_locs == []


def test_calculate_thailand_hashtag_count():
    hashtags = ["#ผมร่วง", "สมุนไพร", "bangkok", "fashion", "organic", "รีวิวบิวตี้"]
    count = calculate_thailand_hashtag_count(hashtags)

    # "#ผมร่วง", "สมุนไพร", "bangkok", "รีวิวบิวตี้" all match Thai script or TH keyword
    assert count == 4

    eng_tags = ["coding", "ai", "react", "fastapi"]
    assert calculate_thailand_hashtag_count(eng_tags) == 0


def test_calculate_local_signal_score_bounds_and_heuristic():
    # High local fit
    high_score = calculate_local_signal_score(
        thai_language_ratio=0.9,
        thailand_keyword_count=3,
        thailand_hashtag_count=4,
        location_mentions=["Bangkok", "Chiang Mai"],
    )
    assert 0.7 <= high_score <= 1.0

    # Low / Zero local fit
    low_score = calculate_local_signal_score(
        thai_language_ratio=0.0,
        thailand_keyword_count=0,
        thailand_hashtag_count=0,
        location_mentions=[],
    )
    assert low_score == 0.0

    # Ensure score stays bounded [0.0, 1.0] even with high input counts
    extreme_score = calculate_local_signal_score(
        thai_language_ratio=1.0,
        thailand_keyword_count=50,
        thailand_hashtag_count=50,
        location_mentions=["Bangkok", "Chiang Mai", "Phuket", "Pattaya"],
    )
    assert extreme_score <= 1.0


def test_extract_bio_contacts():
    # Bio with Line, Email, and Phone
    bio_full = "รีวิวบิวตี้ & แฟชั่น | ติดต่องาน Line: @mookda.work หรือ email: mookda.biz@gmail.com โทร 081-234-5678"
    contacts = extract_bio_contacts(bio_full)
    assert contacts["contact_line_id"] == "@mookda.work"
    assert contacts["contact_email"] == "mookda.biz@gmail.com"
    assert contacts["contact_phone"] == "081-234-5678"

    # Bio with Thai prefix for Line
    bio_line_only = "ติดต่องานแบรนด์ ไลน์: work_creator99"
    contacts2 = extract_bio_contacts(bio_line_only)
    assert contacts2["contact_line_id"] == "work_creator99"
    assert contacts2["contact_email"] is None

    # Empty or None bio
    assert extract_bio_contacts(None) == {"contact_line_id": None, "contact_email": None, "contact_phone": None}
    assert extract_bio_contacts("") == {"contact_line_id": None, "contact_email": None, "contact_phone": None}


def test_classify_creator_tier():
    assert classify_creator_tier(5_000) == "Nano (1K-10K)"
    assert classify_creator_tier(50_000) == "Micro (10K-100K)"
    assert classify_creator_tier(250_000) == "Mid-Tier (100K-500K)"
    assert classify_creator_tier(750_000) == "Macro (500K-1M)"
    assert classify_creator_tier(2_000_000) == "Mega (1M+)"
    assert classify_creator_tier(None) == "Nano (1K-10K)"


def test_estimate_rate_card_range():
    min_rate, max_rate = estimate_rate_card_range(50_000, 15_000)
    assert min_rate is not None and max_rate is not None
    assert min_rate >= 3_500
    assert max_rate <= 15_000
    assert min_rate <= max_rate


def test_detect_content_formats_and_shop():
    captions = ["แกะกล่องสกินแคร์ตัวใหม่ล่าสุด ป้ายยาแรงมาก #unboxing #รีวิว"]
    hashtags = ["#unboxing", "#รีวิวบิวตี้", "#tiktokshop"]
    bio = "พิกัดในโปรไฟล์ กดที่ตะกร้าได้เลยจ้า Line: @shop"

    formats, has_shop = detect_content_formats_and_shop(captions, hashtags, bio)
    assert "รีวิว / พลีชีพ" in formats or "แกะกล่อง / Unboxing" in formats
    assert has_shop is True

