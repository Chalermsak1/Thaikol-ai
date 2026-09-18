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

    # Hashtags (bounded)
    if candidate.hashtags:
        clean_tags = [h.strip().lstrip("#") for h in candidate.hashtags if h.strip()][:max_hashtags]
        if clean_tags:
            tags_str = " ".join(f"#{t}" for t in clean_tags)
            sections.append(f"Hashtags:\n{tags_str}")

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

    # 2. Compile creator content corpus
    creator_parts: List[str] = []
    if candidate.bio:
        creator_parts.append(candidate.bio)
    creator_parts.extend(candidate.sample_captions)
    creator_parts.extend([f"#{h}" for h in candidate.hashtags])
    creator_parts.extend(candidate.hashtags)
    creator_parts.extend(candidate.matched_queries)

    creator_corpus = " ".join(creator_parts).lower()

    # 3. Direct substring & keyword matching
    for term in brand_terms:
        term_clean = term.strip()
        term_lower = term_clean.lower()
        if term_lower in creator_corpus:
            matched.add(term_clean)

    # 4. Check creator hashtags directly against brand keywords / themes
    brand_corpus = " ".join(brand_terms + [brand_profile.summary]).lower()
    for tag in candidate.hashtags:
        tag_clean = tag.strip().lstrip("#")
        tag_lower = tag_clean.lower()
        if len(tag_clean) >= 3 and tag_lower in brand_corpus:
            matched.add(tag_clean)

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
