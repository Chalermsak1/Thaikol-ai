import re
from datetime import datetime, timezone
from typing import List, Set
from schemas.brand import BrandProfile, GeneratedSearchQuery


def clean_query_text(text: str) -> str:
    """Normalizes query text: trims whitespace, removes control chars and extra spaces."""
    if not text:
        return ""
    # Collapse multiple spaces and remove non-printable characters
    cleaned = re.sub(r"\s+", " ", text).strip()
    return cleaned


def split_multilingual_phrases(text: str) -> List[str]:
    """Splits compound or bilingual phrases (e.g. 'แชมพูอัญชัน / Butterfly Pea Shampoo')
    into individual clean search query candidate strings.
    """
    if not text:
        return []
    # Split on slash, pipe, bullet, semicolon, or spaced hyphen
    parts = re.split(r"[/|•·;]|\s+-\s+", text)
    cleaned_parts = []
    for p in parts:
        c = clean_query_text(p)
        # Strip surrounding brackets or quotation marks
        c = re.sub(r"^[\(\[\{'\"]+|[\)\]\}'\"]+$", "", c).strip()
        if c:
            cleaned_parts.append(c)
    return cleaned_parts if cleaned_parts else [clean_query_text(text)]


def is_valid_query(query: str) -> bool:
    """Checks query suitability: length limits (2-40 chars), not overly generic."""
    if not query or len(query) < 2 or len(query) > 40:
        return False
    # Avoid uselessly broad single tokens
    generic_stops = {
        "and", "the", "with", "for", "from", "that", "this",
        "จาก", "และ", "ใน", "กับ", "เพื่อ", "ของ", "ที่", "โดย", "เป็น", "มี", "ได้", "สำหรับ"
    }
    if query.lower() in generic_stops:
        return False
    return True


def generate_structured_search_queries(
    brand_profile: BrandProfile, max_queries: int = 5
) -> List[GeneratedSearchQuery]:
    """Generates diverse, prioritized search query objects for TikTok creator discovery.

    Combines brand keywords, product concepts, content themes, and local signals
    while controlling provider invocation cost and preventing duplicate queries.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    raw_candidates: List[dict] = []

    # Priority 1: High-specificity brand keywords
    if brand_profile.keywords:
        for kw in brand_profile.keywords:
            for phrase in split_multilingual_phrases(kw):
                c = clean_query_text(phrase)
                if is_valid_query(c):
                    raw_candidates.append(
                        {
                            "query": c,
                            "reason": "brand keyword",
                            "priority": 1,
                        }
                    )

    # Priority 2: Key products / services and consumer review formulations
    if brand_profile.products_services:
        for p in brand_profile.products_services:
            for phrase in split_multilingual_phrases(p):
                c = clean_query_text(phrase)
                if is_valid_query(c):
                    raw_candidates.append(
                        {
                            "query": c,
                            "reason": "core product concept",
                            "priority": 2,
                        }
                    )
                    # Formulate consumer review search query if short enough
                    is_thai = bool(re.search(r"[\u0E00-\u0E7F]", c))
                    if is_thai and not c.startswith("รีวิว") and len(c) <= 25:
                        review_q = f"รีวิว{c}"
                        if is_valid_query(review_q):
                            raw_candidates.append(
                                {
                                    "query": review_q,
                                    "reason": "consumer review intent",
                                    "priority": 2,
                                }
                            )
                    elif not is_thai and not c.lower().endswith("review") and len(c) <= 25:
                        review_q = f"{c} review"
                        if is_valid_query(review_q):
                            raw_candidates.append(
                                {
                                    "query": review_q,
                                    "reason": "consumer review intent",
                                    "priority": 2,
                                }
                            )

    # Priority 3: Content themes
    if brand_profile.content_themes:
        for th in brand_profile.content_themes:
            c = clean_query_text(th)
            if is_valid_query(c):
                raw_candidates.append(
                    {
                        "query": c,
                        "reason": "content theme pillar",
                        "priority": 3,
                    }
                )

    # Priority 4: Category / Industry + Thai locality signals
    if brand_profile.industry:
        ind = clean_query_text(brand_profile.industry)
        if is_valid_query(ind):
            raw_candidates.append(
                {
                    "query": ind,
                    "reason": "brand industry classification",
                    "priority": 4,
                }
            )
            th_variant = f"{ind} thailand"
            if len(th_variant) <= 35 and is_valid_query(th_variant):
                raw_candidates.append(
                    {
                        "query": th_variant,
                        "reason": "localized industry variant",
                        "priority": 4,
                    }
                )

    # Deduplicate while preserving priority ordering
    seen_normalized: Set[str] = set()
    result: List[GeneratedSearchQuery] = []

    for item in raw_candidates:
        q_norm = item["query"].lower().strip()
        if q_norm and q_norm not in seen_normalized:
            seen_normalized.add(q_norm)
            result.append(
                GeneratedSearchQuery(
                    query=item["query"],
                    reason=item["reason"],
                    priority=item["priority"],
                    generated_at=now_iso,
                )
            )
        if len(result) >= max_queries:
            break

    # Fallback if no valid queries generated
    if not result:
        fallback_query = clean_query_text(brand_profile.brand_name) or "thailand creator"
        result.append(
            GeneratedSearchQuery(
                query=fallback_query,
                reason="brand name fallback",
                priority=1,
                generated_at=now_iso,
            )
        )

    return result[:max_queries]


def generate_kol_search_queries(brand_profile: BrandProfile, max_queries: int = 6) -> List[str]:
    """Backward-compatible helper returning simple list of query strings."""
    structured = generate_structured_search_queries(brand_profile, max_queries=max_queries)
    return [sq.query for sq in structured]
