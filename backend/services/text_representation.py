import re
from typing import List, Set
from schemas.brand import BrandProfile
from schemas.kol import KOLCandidate


def build_brand_embedding_text(brand_profile: BrandProfile) -> str:
    """Constructs a deterministic, structured textual representation of a BrandProfile for embedding generation.

    Excludes internal IDs, database metadata, secret keys, or confidence scores.
    """
    sections: List[str] = []

    if brand_profile.brand_name:
        sections.append(f"Brand:\n{brand_profile.brand_name.strip()}")

    if brand_profile.industry:
        sections.append(f"Industry:\n{brand_profile.industry.strip()}")

    if brand_profile.products_services:
        prods = "\n".join(f"- {p.strip()}" for p in brand_profile.products_services if p.strip())
        if prods:
            sections.append(f"Products:\n{prods}")

    if brand_profile.target_audience:
        aud = "\n".join(f"- {a.strip()}" for a in brand_profile.target_audience if a.strip())
        if aud:
            sections.append(f"Audience:\n{aud}")

    if brand_profile.content_themes:
        themes = "\n".join(f"- {t.strip()}" for t in brand_profile.content_themes if t.strip())
        if themes:
            sections.append(f"Themes:\n{themes}")

    if brand_profile.brand_tone:
        tones = "\n".join(f"- {t.strip()}" for t in brand_profile.brand_tone if t.strip())
        if tones:
            sections.append(f"Tone:\n{tones}")

    if brand_profile.keywords:
        kws = "\n".join(f"- {k.strip()}" for k in brand_profile.keywords if k.strip())
        if kws:
            sections.append(f"Keywords:\n{kws}")

    if brand_profile.location_signals:
        locs = ", ".join(l.strip() for l in brand_profile.location_signals if l.strip())
        if locs:
            sections.append(f"Location:\n{locs}")

    if brand_profile.summary:
        sections.append(f"Summary:\n{brand_profile.summary.strip()}")

    return "\n\n".join(sections).strip()


def build_creator_embedding_text(candidate: KOLCandidate, max_captions: int = 5, max_hashtags: int = 15) -> str:
    """Constructs a deterministic, bounded textual representation of a creator for embedding generation.

    CRITICAL: Strictly excludes all numerical metrics (followers, views, likes, comments, shares, engagement rate)
    so semantic similarity measures only content relevance.
    """
    sections: List[str] = []

    name = candidate.display_name.strip() if candidate.display_name else candidate.username.strip()
    sections.append(f"Creator:\n{name} (@{candidate.username.strip()})")

    if candidate.bio and candidate.bio.strip():
        sections.append(f"Bio:\n{candidate.bio.strip()}")

    # Captions (bounded to top N unique captions)
    if candidate.sample_captions:
        clean_caps = [c.strip() for c in candidate.sample_captions if c.strip()][:max_captions]
        if clean_caps:
            caps_str = "\n".join(f"- {c}" for c in clean_caps)
            sections.append(f"Captions:\n{caps_str}")

# Comprehensive Thai marketing and creator vocabulary sorted by length descending
# for maximal longest-match segmentation of compound hashtags and phrases.
THAI_MARKETING_TERMS: List[str] = sorted(
    [
        # Long compound keywords
        "สมุนไพรไทยเพื่อสุขภาพ", "ยาสระผมสมุนไพร", "แชมพูลดผมร่วง", "อาหารเสริมเพื่อสุขภาพ",
        "สกินแคร์คนเป็นสิว", "รีวิวสกินแคร์", "รีวิวของใช้", "ของดีบอกต่อ", "ใช้ดีบอกต่อ",
        "เซรั่มหน้าใส", "ครีมบำรุงผิว", "สกินแคร์กู้ผิว", "ลดน้ำหนักปลอดภัย", "สอนแต่งหน้า",
        # Hair & Scalp
        "ลดผมร่วง", "บำรุงผม", "ผมร่วง", "ผมแห้งเสีย", "ผมสวย", "หนังศีรษะ", "ผมบาง", "รังแค",
        "แชมพู", "ยาสระผม", "ครีมนวด", "เซรั่มผม", "ทรีทเม้นท์",
        # Herbs & Nature
        "สมุนไพรไทย", "สมุนไพร", "เพื่อสุขภาพ", "สุขภาพ", "ธรรมชาติ", "ออร์แกนิก", "ออแกนิค",
        # Skincare & Face
        "สกินแคร์", "ความงาม", "บิวตี้", "เครื่องสำอาง", "ผิวแพ้ง่าย", "กู้หน้าพัง", "กู้ผิว",
        "ผิวขาว", "ผิวใส", "ผิวสวย", "ผิวมัน", "ผิวแห้ง", "หน้าใส", "หน้าฉ่ำ", "หน้าเนียน",
        "เซรั่ม", "สบู่", "โลชั่น", "กันแดด", "มอยเจอร์ไรเซอร์", "คลีนซิ่ง", "โทนเนอร์",
        "มาส์กหน้า", "สครับ", "น้ำหอม", "คอลลาเจน", "กลูต้า", "วิตามินซี", "ไฮยา", "เรตินอล",
        "ริ้วรอย", "รอยสิว", "สิวอุดตัน", "สิวเสี้ยน", "สิวอักเสบ", "ฝ้ากระ", "จุดด่างดำ",
        # Makeup
        "แต่งหน้า", "ลิปสติก", "ลิปบาล์ม", "บลัชออน", "แป้งพัฟ", "รองพื้น", "คุชชั่น",
        # Health & Diet
        "ลดน้ำหนัก", "ลดพุง", "คุมหิว", "โปรตีน", "ดีท็อกซ์", "ปลอดภัย", "อาหารเสริม", "วิตามิน",
        # Lifestyle & Food
        "ของกิน", "อาหาร", "ทำอาหาร", "อร่อย", "คาเฟ่", "ท่องเที่ยว", "เที่ยวไทย",
        "แม่และเด็ก", "ของใช้ในบ้าน", "เสื้อผ้า", "แฟชั่น",
        # Creator Intents & Commercial
        "มือใหม่", "ป้ายยา", "ชี้เป้า", "เปิดกรุ", "เห่อของใหม่", "แกะกล่อง", "ถูกและดี",
        "งบน้อย", "ของแท้", "โปรโมชั่น", "ส่งฟรี", "คุมมัน", "กันน้ำ", "ติดทน",
        "บอกต่อ", "รีวิว", "ของดี", "ใช้ดี", "จริงใจ", "คนไทย", "ประเทศไทย", "กรุงเทพ",
    ],
    key=len,
    reverse=True,
)


def unpack_thai_hashtag(tag: str) -> List[str]:
    """Decomposes concatenated Thai hashtags and compound phrases into individual semantic tokens.

    Example:
        '#สมุนไพรไทยเพื่อสุขภาพ' -> ['สมุนไพรไทย', 'สมุนไพร', 'ไทย', 'เพื่อสุขภาพ', 'สุขภาพ']
        '#รีวิวบิวตี้' -> ['รีวิว', 'บิวตี้']
        '#แชมพูลดผมร่วง' -> ['แชมพู', 'ลดผมร่วง', 'ผมร่วง']
    """
    clean = re.sub(r"[#_0-9\s]", "", tag).strip()
    if not clean or len(clean) < 2:
        return [clean] if clean else []

    extracted: List[str] = []
    # 1. Match known high-signal Thai vocabulary terms
    for term in THAI_MARKETING_TERMS:
        if term in clean:
            if term not in extracted:
                extracted.append(term)

    # 2. Also split camelCase or snake_case for bilingual tags
    bilingual_parts = re.findall(r"[A-Z]?[a-z]+|[A-Z]+(?=[A-Z][a-z]|\d|\W|$)|\d+", tag)
    for p in bilingual_parts:
        low = p.lower().strip()
        if len(low) >= 3 and low not in extracted:
            extracted.append(low)

    return extracted if extracted else [clean]


def build_creator_embedding_text(candidate: KOLCandidate, max_captions: int = 5, max_hashtags: int = 15) -> str:
    """Constructs a deterministic, bounded textual representation of a creator for embedding generation.

    CRITICAL: Strictly excludes all numerical metrics (followers, views, likes, comments, shares, engagement rate)
    so semantic similarity measures only content relevance.
    """
    sections: List[str] = []

    name = candidate.display_name.strip() if candidate.display_name else candidate.username.strip()
    sections.append(f"Creator:\n{name} (@{candidate.username.strip()})")

    if candidate.bio and candidate.bio.strip():
        sections.append(f"Bio:\n{candidate.bio.strip()}")

    # Captions (bounded to top N unique captions)
    if candidate.sample_captions:
        clean_caps = [c.strip() for c in candidate.sample_captions if c.strip()][:max_captions]
        if clean_caps:
            caps_str = "\n".join(f"- {c}" for c in clean_caps)
            sections.append(f"Captions:\n{caps_str}")

    # Hashtags (bounded) with unpacked semantic tokens
    if candidate.hashtags:
        clean_tags = [h.strip().lstrip("#") for h in candidate.hashtags if h.strip()][:max_hashtags]
        if clean_tags:
            tags_str = " ".join(f"#{t}" for t in clean_tags)
            sections.append(f"Hashtags:\n{tags_str}")

            # Segment compound Thai hashtags into keywords for multilingual semantic embedding
            segmented_tokens: List[str] = []
            for t in clean_tags:
                sub_words = unpack_thai_hashtag(t)
                for sw in sub_words:
                    if sw != t and sw not in segmented_tokens:
                        segmented_tokens.append(sw)
            if segmented_tokens:
                sections.append(f"Hashtag Topics:\n{', '.join(segmented_tokens)}")

    # Matched queries
    if candidate.matched_queries:
        clean_qs = [q.strip() for q in candidate.matched_queries if q.strip()]
        if clean_qs:
            qs_str = ", ".join(clean_qs)
            sections.append(f"Search Topics:\n{qs_str}")

    # Explicit locations
    if candidate.location_mentions:
        locs_str = ", ".join(l.strip() for l in candidate.location_mentions if l.strip())
        if locs_str:
            sections.append(f"Local mentions:\n{locs_str}")

    return "\n\n".join(sections).strip()


def extract_matching_topics(brand_profile: BrandProfile, candidate: KOLCandidate) -> List[str]:
    """Deterministically identifies lexical and topical overlap between brand themes/keywords and creator content.

    Excludes hallucinations and does not rely on LLM. Normalizes Latin text while preserving Thai Unicode.
    """
    matched: Set[str] = set()

    # 1. Compile brand phrase catalog
    brand_terms: List[str] = []
    for k in brand_profile.keywords:
        if k and len(k.strip()) >= 2:
            brand_terms.append(k.strip())
    for t in brand_profile.content_themes:
        if t and len(t.strip()) >= 2:
            brand_terms.append(t.strip())
    for p in brand_profile.products_services:
        if p and len(p.strip()) >= 2:
            brand_terms.append(p.strip())
    if brand_profile.industry and len(brand_profile.industry.strip()) >= 3:
        brand_terms.append(brand_profile.industry.strip())

    # 2. Compile creator content corpus, including unpacked compound hashtags
    creator_parts: List[str] = []
    if candidate.bio:
        creator_parts.append(candidate.bio)
    creator_parts.extend(candidate.sample_captions)
    creator_parts.extend([f"#{h}" for h in candidate.hashtags])
    creator_parts.extend(candidate.hashtags)
    # Include unpacked tokens from hashtags to capture word boundaries
    for tag in candidate.hashtags:
        unpacked = unpack_thai_hashtag(tag)
        if unpacked:
            creator_parts.extend(unpacked)
    creator_parts.extend(candidate.matched_queries)

    creator_corpus = " ".join(creator_parts).lower()

    # 3. Direct substring & keyword matching
    for term in brand_terms:
        term_clean = term.strip()
        term_lower = term_clean.lower()
        if term_lower in creator_corpus:
            matched.add(term_clean)

    # 4. Check creator hashtags and unpacked tokens directly against brand keywords / themes
    brand_corpus = " ".join(brand_terms + [brand_profile.summary]).lower()
    for tag in candidate.hashtags:
        tag_clean = tag.strip().lstrip("#")
        tag_lower = tag_clean.lower()
        if len(tag_clean) >= 3 and tag_lower in brand_corpus:
            matched.add(tag_clean)
        # Check unpacked sub-tokens
        for sub in unpack_thai_hashtag(tag_clean):
            if len(sub) >= 3 and sub.lower() in brand_corpus:
                matched.add(sub)

    # 5. Check common domain keywords
    domain_cues = [
        ("ผมร่วง", ["ผมร่วง", "ลดผมร่วง", "กู้ผม"]),
        ("สมุนไพร", ["สมุนไพร", "herbal", "thaiherb"]),
        ("แชมพู", ["แชมพู", "shampoo"]),
        ("สกินแคร์", ["สกินแคร์", "skincare"]),
        ("ผิวแพ้ง่าย", ["ผิวแพ้ง่าย", "sensitive skin"]),
        ("ออร์แกนิก", ["ออร์แกนิก", "organic"]),
        ("บำรุงผม", ["บำรุงผม", "hair care"]),
        ("ธรรมชาติ", ["ธรรมชาติ", "natural"]),
    ]

    for label, variants in domain_cues:
        brand_has = any(v in brand_corpus for v in variants)
        creator_has = any(v in creator_corpus for v in variants)
        if brand_has and creator_has:
            matched.add(label)

    # Return clean sorted list capped to top 8 distinct topics
    return sorted(list(matched))[:8]
