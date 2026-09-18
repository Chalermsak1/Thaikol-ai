import re
from typing import List, Tuple

# Unicode range for the Thai script (\u0E00 - \u0E7F)
THAI_CHAR_REGEX = re.compile(r"[\u0E00-\u0E7F]")
WORD_CHAR_REGEX = re.compile(r"[\w\u0E00-\u0E7F]")

THAILAND_LOCATION_RULES = [
    ("Bangkok", ["กรุงเทพ", "กรุงเทพมหานคร", "bangkok", "bkk", "สยาม", "อารีย์", "เยาวราช", "สุขุมวิท"]),
    ("Chiang Mai", ["เชียงใหม่", "chiang mai", "chiangmai", "ดอยช้าง", "กาดหลวง"]),
    ("Phetchabun (Khaokho)", ["เขาค้อ", "เพชรบูรณ์", "khaokho", "phetchabun"]),
    ("Phuket", ["ภูเก็ต", "phuket"]),
    ("Pattaya", ["พัทยา", "pattaya"]),
    ("Hua Hin", ["หัวหิน", "hua hin", "huahin"]),
    ("Thailand (General)", ["ประเทศไทย", "เมืองไทย", "thailand", "thai", "thaicuisine", "thaiherb"]),
]

THAILAND_KEYWORD_LIST = [
    "thailand", "thai", "กรุงเทพ", "เชียงใหม่", "เขาค้อ", "เพชรบูรณ์", "ภูเก็ต", "พัทยา",
    "ประเทศไทย", "คนไทย", "สยาม", "bangkok", "bkk", "chiangmai", "phuket", "pattaya"
]


def calculate_thai_language_ratio(text: str) -> float:
    """Calculates approximate percentage of Thai characters relative to all letter/word characters.

    Returns float in range [0.0, 1.0].
    """
    if not text or not isinstance(text, str):
        return 0.0

    thai_chars = len(THAI_CHAR_REGEX.findall(text))
    word_chars = len(WORD_CHAR_REGEX.findall(text))

    if word_chars == 0:
        return 0.0

    ratio = thai_chars / word_chars
    return round(min(1.0, max(0.0, ratio)), 3)


def calculate_thailand_keyword_count(text: str) -> Tuple[int, List[str]]:
    """Counts occurrences of known Thailand geographic/cultural keywords and identifies explicit locations."""
    if not text:
        return 0, []

    text_lower = text.lower()
    total_count = 0
    detected_locations: List[str] = []

    # Check location rules
    for location_name, cues in THAILAND_LOCATION_RULES:
        found_any = False
        for cue in cues:
            matches = len(re.findall(re.escape(cue.lower()), text_lower))
            if matches > 0:
                total_count += matches
                found_any = True
        if found_any and location_name not in detected_locations:
            detected_locations.append(location_name)

    return total_count, detected_locations


def calculate_thailand_hashtag_count(hashtags: List[str]) -> int:
    """Counts hashtags containing Thai script or referencing Thailand terms."""
    if not hashtags:
        return 0

    count = 0
    for tag in hashtags:
        cleaned_tag = tag.strip().lstrip("#").lower()
        # Has Thai script
        if THAI_CHAR_REGEX.search(cleaned_tag):
            count += 1
            continue
        # Matches any Thailand keyword
        if any(kw in cleaned_tag for kw in THAILAND_KEYWORD_LIST):
            count += 1

    return count


def calculate_local_signal_score(
    thai_language_ratio: float,
    thailand_keyword_count: int,
    thailand_hashtag_count: int,
    location_mentions: List[str],
) -> float:
    """Calculates a transparent heuristic score representing Thailand/local content signals.

    DISCLAIMER: This score represents public content/locality signals only, NOT verified audience demographics.
    Returns float in range [0.0, 1.0].
    """
    score = 0.0

    # Language signal contributes up to 0.50
    score += thai_language_ratio * 0.50

    # Explicit Thailand keywords contribute up to 0.25 (5 keywords max)
    score += min(thailand_keyword_count, 5) * 0.05

    # Thai hashtags contribute up to 0.15 (5 hashtags max)
    score += min(thailand_hashtag_count, 5) * 0.03

    # Explicit city/province mentions add 0.10
    if location_mentions:
        score += 0.10

    return round(min(1.0, max(0.0, score)), 2)
