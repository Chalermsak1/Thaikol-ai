import pytest
from services.tiktok_signals import (
    calculate_thai_language_ratio,
    calculate_thailand_keyword_count,
    calculate_thailand_hashtag_count,
    calculate_local_signal_score,
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
