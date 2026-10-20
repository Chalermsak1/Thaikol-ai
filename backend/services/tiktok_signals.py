import re
from typing import List, Tuple, Dict, Any, Optional

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


# ─── Commercial & Contact Signals ──────────────────────────────────────────

# LINE ID patterns:
# Examples: "Line: @mookda", "LineID: mookda99", "ติดต่องาน line @shop", "ID Line: work123"
LINE_ID_REGEX = re.compile(
    r"(?:line(?:\s*id)?|ไลน์|ไอดีไลน์|id\s*line)[:\s\-]*([@\w\.\-]+)",
    re.IGNORECASE,
)

# Email address pattern
EMAIL_REGEX = re.compile(
    r"([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)",
    re.IGNORECASE,
)

# Thai mobile phone number:
# Examples: 081-234-5678, 0812345678, 098 765 4321, 061-111-2222
PHONE_REGEX = re.compile(
    r"(?:tel|เบอร์|โทร|ติดต่อ|phone|call)?[:\s\-]*(0[689]\d{1}[-\s]?\d{3}[-\s]?\d{4})",
    re.IGNORECASE,
)


def extract_bio_contacts(bio: Optional[str]) -> Dict[str, Optional[str]]:
    """Extracts business contact information (LINE ID, Email, Phone) from public bio text."""
    contacts: Dict[str, Optional[str]] = {
        "contact_line_id": None,
        "contact_email": None,
        "contact_phone": None,
    }
    if not bio or not isinstance(bio, str):
        return contacts

    clean_bio = bio.strip()

    # Extract Email
    email_match = EMAIL_REGEX.search(clean_bio)
    if email_match:
        contacts["contact_email"] = email_match.group(1).strip()

    # Extract LINE ID
    line_match = LINE_ID_REGEX.search(clean_bio)
    if line_match:
        raw_line = line_match.group(1).strip()
        # Clean trailing punctuation
        raw_line = raw_line.rstrip(".,;")
        if len(raw_line) >= 2 and "@" in raw_line or len(raw_line) >= 3:
            contacts["contact_line_id"] = raw_line

    # Extract Phone
    phone_match = PHONE_REGEX.search(clean_bio)
    if phone_match:
        raw_phone = phone_match.group(1).strip().replace(" ", "").replace("-", "")
        if len(raw_phone) == 10:
            contacts["contact_phone"] = f"{raw_phone[:3]}-{raw_phone[3:6]}-{raw_phone[6:]}"

    return contacts


def classify_creator_tier(follower_count: Optional[int]) -> str:
    """Classifies creator into standard industry tiers based on follower count."""
    if follower_count is None:
        return "Nano (1K-10K)"
    if follower_count >= 1_000_000:
        return "Mega (1M+)"
    if follower_count >= 500_000:
        return "Macro (500K-1M)"
    if follower_count >= 100_000:
        return "Mid-Tier (100K-500K)"
    if follower_count >= 10_000:
        return "Micro (10K-100K)"
    return "Nano (1K-10K)"


def estimate_rate_card_range(
    follower_count: Optional[int], avg_views: Optional[float]
) -> Tuple[Optional[int], Optional[int]]:
    """Estimates commercial rate card range (min, max in THB) for a sponsored video on TikTok Thailand.

    Benchmarks:
    - Nano (<10K): 1,500 - 3,500 THB
    - Micro (10K-100K): 3,500 - 9,500 THB
    - Mid-Tier (100K-500K): 9,500 - 28,000 THB
    - Macro (500K-1M): 28,000 - 65,000 THB
    - Mega (1M+): 65,000 - 180,000+ THB
    Adjusted upwards if average views are disproportionately high.
    """
    followers = follower_count or 10_000
    views = avg_views or (followers * 0.15)

    # Base rate driven 60% by followers, 40% by views
    base_calc = (followers * 0.05) + (views * 0.08)

    if followers >= 1_000_000:
        min_rate = max(65_000, int(base_calc * 0.75))
        max_rate = max(140_000, int(base_calc * 1.35))
    elif followers >= 500_000:
        min_rate = max(28_000, int(base_calc * 0.8))
        max_rate = max(65_000, int(base_calc * 1.3))
    elif followers >= 100_000:
        min_rate = max(9_500, int(base_calc * 0.8))
        max_rate = max(26_000, int(base_calc * 1.25))
    elif followers >= 10_000:
        min_rate = max(3_500, int(base_calc * 0.85))
        max_rate = max(9_500, int(base_calc * 1.25))
    else:
        min_rate = 1_500
        max_rate = 3_500

    # Round to nearest 500 THB
    min_rate = int(round(min_rate / 500.0) * 500)
    max_rate = int(round(max_rate / 500.0) * 500)

    return min_rate, max_rate


CONTENT_FORMAT_RULES = [
    ("รีวิว / พลีชีพ", ["รีวิว", "ป้ายยา", "review", "ใช้ดีบอกต่อ", "ของมันต้องมี", "พลีชีพ", "ลองแล้ว"]),
    ("สอนใช้ / How-to", ["สอน", "how to", "howto", "วิธี", "ทริค", "เทคนิค", "step", "ขั้นตอน"]),
    ("แกะกล่อง / Unboxing", ["แกะกล่อง", "unboxing", "เห่อ", "ช้อปปิ้ง", "haul", "เปิดถุง"]),
    ("ไลฟ์สไตล์ / Vlog", ["vlog", "1วัน", "daily", "ชีวิตประจำวัน", "ตามติด", "routine"]),
    ("ละครสั้น / บันเทิง", ["ละครสั้น", "บทบาทสมมติ", "ตลก", "ขำๆ", "ฮา", "พากย์"]),
]

TIKTOK_SHOP_CUES = [
    "ตะกร้า", "tiktokshop", "ช้อปกันวันละคลิป", "นายหน้า", "พิกัดในโปรไฟล์",
    "ลิงก์หน้าโปรไฟล์", "ช้อปเลย", "กดที่ตะกร้า", "พิกัด", "ช้อปปิ้ง",
]


def detect_content_formats_and_shop(
    captions: List[str], hashtags: List[str], bio: Optional[str]
) -> Tuple[List[str], bool]:
    """Detects primary content delivery formats and TikTok Shop / Affiliate seller signals."""
    corpus_parts = [bio or ""] + captions + hashtags
    corpus_lower = " ".join([p.lower() for p in corpus_parts if p])

    detected_formats: List[str] = []
    for fmt_name, cues in CONTENT_FORMAT_RULES:
        if any(c in corpus_lower for c in cues):
            detected_formats.append(fmt_name)

    if not detected_formats:
        detected_formats.append("รีวิว / พลีชีพ")

    has_shop = any(cue in corpus_lower for cue in TIKTOK_SHOP_CUES)

    return detected_formats[:3], has_shop


def extract_last_posted_at(videos: List[Any]) -> Optional[str]:
    """Extracts the most recent publication ISO timestamp from a creator's sample videos."""
    if not videos:
        return None

    timestamps: List[str] = []
    for v in videos:
        # Handles both object with created_at attribute and dict
        created = getattr(v, "created_at", None) or (v.get("created_at") if isinstance(v, dict) else None)
        if created and isinstance(created, str):
            timestamps.append(created)

    if not timestamps:
        return None

    # Return latest timestamp
    return sorted(timestamps, reverse=True)[0]

