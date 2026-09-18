import re
from typing import Any, Dict, List, Optional
from schemas.brand import BrandCorpus, FacebookPageContent, SourceReference, WebsiteContent


class BrandCorpusBuilder:
    """Consolidates extracted signals from website and Facebook into a normalized BrandCorpus

    while preserving explicit line-by-line and post-by-post source attribution.
    """

    def build_corpus(
        self,
        website_data: Optional[Dict[str, Any]] = None,
        facebook_data: Optional[Dict[str, Any]] = None,
    ) -> BrandCorpus:
        source_refs: List[SourceReference] = []
        seen_texts: set[str] = set()

        def add_ref(text: str, source: str, source_url: Optional[str] = None, post_id: Optional[str] = None):
            cleaned = re.sub(r"\s+", " ", text).strip()
            if not cleaned or len(cleaned) < 5:
                return
            # Deduplicate exact text phrases across the corpus
            key = f"{source}:{cleaned.lower()[:150]}"
            if key in seen_texts:
                return
            seen_texts.add(key)
            source_refs.append(
                SourceReference(
                    source=source,  # type: ignore
                    source_url=source_url,
                    post_id=post_id,
                    text=cleaned,
                )
            )

        # 1. Process Website Content
        web_text_parts: List[str] = []
        web_headings: List[str] = []
        brand_candidates: List[str] = []
        web_url = None

        if website_data and website_data.get("extraction_status") == "success":
            web_url = website_data.get("final_url")

            # Title
            title = website_data.get("page_title")
            if title:
                web_text_parts.append(title)
                add_ref(title, "website", web_url)
                # Attempt to extract brand candidate from title (split by |, -, :)
                for chunk in re.split(r"[|\-–—:]", title):
                    cand = chunk.strip()
                    if 2 <= len(cand) <= 40 and cand not in brand_candidates:
                        brand_candidates.append(cand)

            # OpenGraph title
            og_title = website_data.get("og_title")
            if og_title and og_title != title:
                web_text_parts.append(og_title)
                add_ref(og_title, "website", web_url)
                for chunk in re.split(r"[|\-–—:]", og_title):
                    cand = chunk.strip()
                    if 2 <= len(cand) <= 40 and cand not in brand_candidates:
                        brand_candidates.append(cand)

            # Meta Description
            meta_desc = website_data.get("meta_description")
            if meta_desc:
                web_text_parts.append(meta_desc)
                add_ref(meta_desc, "website", web_url)

            # Headings
            for h in website_data.get("headings", []):
                h_clean = h.strip()
                if h_clean:
                    web_headings.append(h_clean)
                    web_text_parts.append(h_clean)
                    add_ref(h_clean, "website", web_url)

            # Body Visible Text
            visible_text = website_data.get("visible_text", "")
            if visible_text:
                web_text_parts.append(visible_text)
                # Add sentences or small paragraphs to source refs
                for sentence in re.split(r"[.\n]+", visible_text):
                    s_clean = sentence.strip()
                    if len(s_clean) > 20:
                        add_ref(s_clean, "website", web_url)

        # 2. Process Facebook Content
        fb_about = ""
        fb_posts_texts: List[str] = []
        fb_url = None

        if facebook_data and facebook_data.get("extraction_status") == "success":
            fb_url = facebook_data.get("page_url")

            page_name = facebook_data.get("page_name")
            if page_name:
                if page_name not in brand_candidates:
                    brand_candidates.insert(0, page_name)
                add_ref(f"Facebook Page: {page_name}", "facebook", fb_url)

            category = facebook_data.get("page_category")
            if category:
                add_ref(f"Facebook Category: {category}", "facebook", fb_url)

            about = facebook_data.get("about")
            if about:
                fb_about = about.strip()
                add_ref(about, "facebook", fb_url)

            for post in facebook_data.get("recent_posts", []):
                p_text = post.get("text", "").strip() if isinstance(post, dict) else post.text.strip()
                p_id = post.get("post_id") if isinstance(post, dict) else post.post_id
                p_url = post.get("post_url") if isinstance(post, dict) else post.post_url
                if p_text:
                    fb_posts_texts.append(p_text)
                    add_ref(p_text, "facebook", p_url or fb_url, post_id=p_id)

        metadata = {
            "website_extracted": bool(website_data and website_data.get("extraction_status") == "success"),
            "website_url": web_url,
            "facebook_extracted": bool(facebook_data and facebook_data.get("extraction_status") == "success"),
            "facebook_url": fb_url,
            "total_source_references": len(source_refs),
        }

        return BrandCorpus(
            brand_name_candidates=brand_candidates,
            website_text=" ".join(web_text_parts),
            facebook_about=fb_about,
            facebook_post_texts=fb_posts_texts,
            website_headings=web_headings,
            metadata=metadata,
            source_references=source_refs,
        )


corpus_builder = BrandCorpusBuilder()
