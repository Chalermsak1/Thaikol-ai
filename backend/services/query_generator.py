from typing import List
from schemas.brand import BrandProfile


def generate_kol_search_queries(brand_profile: BrandProfile, max_queries: int = 6) -> List[str]:
    """Generates targeted, deduplicated TikTok search queries based on brand traits.

    Uses keywords, products, content themes, industry, and location signals.
    Returns deterministic list of search queries.
    """
    candidates: List[str] = []

    # 1. Primary brand keywords (highest specificity)
    if brand_profile.keywords:
        for kw in brand_profile.keywords:
            trimmed = kw.strip()
            if trimmed:
                candidates.append(trimmed)

    # 2. Key products / services
    if brand_profile.products_services:
        for p in brand_profile.products_services:
            trimmed = p.strip()
            if trimmed:
                candidates.append(trimmed)
                # Formulate review search query
                if not trimmed.startswith("รีวิว") and len(trimmed) < 20:
                    candidates.append(f"รีวิว{trimmed}")

    # 3. Content themes
    if brand_profile.content_themes:
        for th in brand_profile.content_themes:
            trimmed = th.strip()
            if trimmed:
                candidates.append(trimmed)

    # 4. Industry / Category combined with Thailand if needed
    if brand_profile.industry and len(candidates) < max_queries:
        ind = brand_profile.industry.strip()
        candidates.append(ind)
        candidates.append(f"{ind} thailand")

    # Deduplicate while preserving order
    seen = set()
    deduped: List[str] = []
    for q in candidates:
        norm = q.strip().lower()
        if norm and norm not in seen:
            seen.add(norm)
            deduped.append(q.strip())

    return deduped[:max_queries]
