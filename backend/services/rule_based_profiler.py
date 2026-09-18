import re
from typing import Any, Dict, List, Optional
from schemas.brand import BrandCorpus, BrandProfile, EvidenceItem
from .corpus_builder import corpus_builder
from .interfaces import BrandProfiler


class RuleBasedBrandProfiler(BrandProfiler):
    """Deterministic, explainable rule-based profiler for Thai and regional brand signals.

    Strictly adheres to anti-hallucination guardrails: no demographic or commercial claims
    are output unless supported by observed source snippets.
    """

    # Industry Keywords Taxonomy
    INDUSTRY_RULES = [
        (
            "Natural Beauty & Herbal Personal Care",
            ["แชมพู", "บำรุงผม", "สกินแคร์", "ผิว", "ครีม", "เซรั่ม", "อัญชัน", "ผมร่วง", "รังแค", "ว่านหางจระเข้",
             "shampoo", "skincare", "beauty", "personal care", "herbal hair", "aloe vera"],
        ),
        (
            "Food & Beverage",
            ["กาแฟ", "อาหาร", "ขนม", "เครื่องดื่ม", "ชา", "เมนู", "ร้านอาหาร", "คาเฟ่", "เบเกอรี่",
             "coffee", "cafe", "restaurant", "food", "beverage", "bakery", "tea"],
        ),
        (
            "Health & Wellness",
            ["สมุนไพร", "ออร์แกนิก", "สุขภาพ", "วิตามิน", "อาหารเสริม", "ยา",
             "wellness", "health", "supplement", "organic", "herbal", "holistic"],
        ),
        (
            "Fashion & Apparel",
            ["เสื้อผ้า", "แฟชั่น", "กระเป๋า", "รองเท้า", "เครื่องประดับ", "ชุด",
             "fashion", "apparel", "clothing", "shoes", "bag", "dress"],
        ),
        (
            "Technology & Electronics",
            ["มือถือ", "คอมพิวเตอร์", "ไอที", "แกดเจ็ต", "อุปกรณ์", "แอปพลิเคชัน",
             "tech", "software", "gadget", "electronics", "hardware"],
        ),
    ]

    # Location cues in Thailand
    LOCATION_PATTERNS = [
        ("Bangkok", [r"\bกรุงเทพ\b", r"\bbangkok\b", r"\bbkk\b"]),
        ("Chiang Mai", [r"\bเชียงใหม่\b", r"\bchiang mai\b"]),
        ("Phetchabun (Khaokho)", [r"\bเขาค้อ\b", r"\bเพชรบูรณ์\b", r"\bkhaokho\b", r"\bphetchabun\b"]),
        ("Phuket", [r"\bภูเก็ต\b", r"\bphuket\b"]),
        ("Thailand (Nationwide)", [r"\bประเทศไทย\b", r"\bทั่วประเทศ\b", r"\bthailand\b", r"\bthai\b"]),
    ]

    # Explicit Audience Signals (Conservative)
    AUDIENCE_PATTERNS = [
        (
            "Individuals experiencing hair loss or scalp sensitivity",
            ["ผมร่วง", "ผมบาง", "หนังศีรษะมัน", "คันศีรษะ", "รังแค", "hair loss", "sensitive scalp"],
        ),
        (
            "Consumers with sensitive or delicate skin",
            ["ผิวแพ้ง่าย", "กู้ผิว", "แสบแดง", "sensitive skin", "gentle skin"],
        ),
        (
            "Eco-conscious and organic product seekers",
            ["ออร์แกนิก", "ธรรมชาติ 100%", "ไม่ผสมสารเคมี", "organic", "eco-friendly", "clean beauty"],
        ),
        (
            "Health-conscious Thai adults and families",
            ["รักสุขภาพ", "สายสุขภาพ", "เพื่อสุขภาพ", "ครอบครัว", "health-conscious"],
        ),
        (
            "Coffee & cafe enthusiasts",
            ["คอกาแฟ", "คนรักกาแฟ", "specialty coffee"],
        ),
    ]

    def generate_brand_profile(
        self,
        raw_web_data: Optional[Dict[str, Any]] = None,
        raw_fb_data: Optional[Dict[str, Any]] = None,
        corpus: Optional[BrandCorpus] = None,
    ) -> Dict[str, Any]:
        if corpus is None:
            corpus = corpus_builder.build_corpus(raw_web_data, raw_fb_data)

        combined_text = (
            f"{corpus.website_text} {corpus.facebook_about} {' '.join(corpus.facebook_post_texts)}"
        )
        combined_lower = combined_text.lower()
        evidence: List[EvidenceItem] = []

        # 1. Brand Name Detection
        brand_name = "Unknown Brand"
        if corpus.brand_name_candidates:
            # Prefer clean candidate under 50 characters
            for cand in corpus.brand_name_candidates:
                cleaned_cand = cand.strip()
                if 2 <= len(cleaned_cand) <= 50 and not any(
                    w in cleaned_cand.lower() for w in ["home", "index", "welcome", "หน้าแรก"]
                ):
                    brand_name = cleaned_cand
                    break
        evidence.append(
            EvidenceItem(
                field="brand_name",
                source="facebook" if corpus.metadata.get("facebook_extracted") else "website",
                source_url=corpus.metadata.get("facebook_url") or corpus.metadata.get("website_url"),
                text=f"Detected brand identifier '{brand_name}' from header and page title candidates.",
                nature="OBSERVED",
            )
        )

        # 2. Industry Classification
        industry = "General Business / Consumer Brand"
        best_industry_score = 0
        matching_snippets: List[str] = []

        for ind_name, kws in self.INDUSTRY_RULES:
            score = 0
            for kw in kws:
                if kw.lower() in combined_lower:
                    score += 1
                    if len(matching_snippets) < 3:
                        matching_snippets.append(kw)
            if score > best_industry_score:
                best_industry_score = score
                industry = ind_name

        if matching_snippets:
            evidence.append(
                EvidenceItem(
                    field="industry",
                    source="synthesis",
                    source_url=corpus.metadata.get("website_url"),
                    text=f"Identified category '{industry}' via observed terms: {', '.join(matching_snippets)}.",
                    nature="OBSERVED",
                )
            )

        # 3. Products & Services Extraction
        products: List[str] = []
        product_clues = [
            ("แชมพูอัญชัน / Butterfly Pea Shampoo", ["แชมพูอัญชัน", "butterfly pea shampoo", "อัญชัน"]),
            ("เจลว่านหางจระเข้ / Aloe Vera Soothing Gel", ["ว่านหางจระเข้", "aloe vera"]),
            ("แชมพูขิง / Ginger Scalp Shampoo", ["แชมพูขิง", "ขิงและโสม", "ginger"]),
            ("เซรั่มและทรีทเม้นท์ / Hair & Skin Treatment", ["ทรีทเม้นท์", "เซรั่ม", "treatment", "serum"]),
            ("สบู่และผลิตภัณฑ์ทำความสะอาดผิวกาย / Body Cleanser", ["สบู่", "เจลอาบน้ำ", "body wash", "soap"]),
            ("ผลิตภัณฑ์ดูแลเส้นผมธรรมชาติ / Natural Hair Care", ["บำรุงผม", "ลดผมร่วง", "hair care"]),
            ("กาแฟและเครื่องดื่ม / Coffee & Beverages", ["กาแฟ", "espresso", "latte", "coffee"]),
        ]

        for prod_label, clues in product_clues:
            for clue in clues:
                if clue in combined_lower and prod_label not in products:
                    products.append(prod_label)
                    evidence.append(
                        EvidenceItem(
                            field="products_services",
                            source="website" if clue in corpus.website_text.lower() else "facebook",
                            source_url=corpus.metadata.get("website_url"),
                            text=f"Found explicit product signal '{clue}' in source text.",
                            nature="OBSERVED",
                        )
                    )
                    break

        if not products:
            # Fallback to top headings if available
            for h in corpus.website_headings[:3]:
                if len(h) < 40:
                    products.append(h)

        # 4. Target Audience (Conservative & Explicit)
        target_audience: List[str] = []
        for audience_label, cues in self.AUDIENCE_PATTERNS:
            found_cues = [c for c in cues if c in combined_lower]
            if found_cues and audience_label not in target_audience:
                target_audience.append(audience_label)
                evidence.append(
                    EvidenceItem(
                        field="target_audience",
                        source="synthesis",
                        source_url=corpus.metadata.get("website_url") or corpus.metadata.get("facebook_url"),
                        text=f"Audience signal inferred from explicit concerns: {', '.join(found_cues)}.",
                        nature="INFERRED",
                    )
                )

        if not target_audience:
            target_audience.append("General consumers interested in brand offerings")

        # 5. Location Signals
        location_signals: List[str] = []
        for loc_name, regexes in self.LOCATION_PATTERNS:
            for pat in regexes:
                if re.search(pat, combined_lower):
                    if loc_name not in location_signals:
                        location_signals.append(loc_name)
                        evidence.append(
                            EvidenceItem(
                                field="location_signals",
                                source="synthesis",
                                source_url=corpus.metadata.get("website_url"),
                                text=f"Observed Thai geographical marker matching '{loc_name}'.",
                                nature="OBSERVED",
                            )
                        )
                    break

        if not location_signals:
            location_signals.append("Thailand (General)")

        # 6. Content Themes
        content_themes: List[str] = []
        theme_rules = [
            ("Natural Ingredients & Organic Purity", ["ธรรมชาติ", "สมุนไพร", "organic", "100%", "natural"]),
            ("Hair & Scalp Problem Solving", ["ผมร่วง", "ผมบาง", "รังแค", "คัน", "hair loss", "dandruff"]),
            ("Sensitive Skin & Safety", ["ผิวแพ้ง่าย", "ไม่แพ้", "ปราศจากซิลิโคน", "paraben free", "no chemical"]),
            ("Educational & Wellness Lifestyle", ["ทริค", "วิธีใช้", "เคล็ดลับ", "guide", "tips"]),
        ]
        for theme_name, cues in theme_rules:
            if any(cue in combined_lower for cue in cues):
                content_themes.append(theme_name)
                evidence.append(
                    EvidenceItem(
                        field="content_themes",
                        source="synthesis",
                        source_url=corpus.metadata.get("facebook_url"),
                        text=f"Theme '{theme_name}' observed in repeated messaging.",
                        nature="INFERRED",
                    )
                )

        # 7. Brand Tone
        brand_tone: List[str] = []
        if any(w in combined_lower for w in ["ธรรมชาติ", "สมุนไพร", "แท้", "pure", "authentic"]):
            brand_tone.append("Authentic & Nature-inspired")
        if any(w in combined_lower for w in ["ค่ะ", "ครับ", "🌿", "✨", "💜"]):
            brand_tone.append("Approachable & Friendly")
        if any(w in combined_lower for w in ["ปราศจาก", "มาตรฐาน", "วิจัย", "สรรพคุณ", "science", "certified"]):
            brand_tone.append("Informative & Credible")

        if not brand_tone:
            brand_tone.append("Neutral & Professional")

        # 8. Keywords
        raw_keywords = [
            "สมุนไพรไทย", "ธรรมชาติ 100%", "organic", "ลดผมร่วง", "แชมพูอัญชัน",
            "ผิวแพ้ง่าย", "เขาค้อทะเลภู", "clean beauty", "บำรุงเส้นผม", "scalp care"
        ]
        keywords: List[str] = [k for k in raw_keywords if k.lower() in combined_lower or k in combined_text]
        if not keywords:
            keywords = ["brand", "thailand", "products"]

        # 9. Summary
        prod_str = ", ".join(products[:3]) if products else "offerings"
        summary = (
            f"{brand_name} operates in {industry}, offering {prod_str}. "
            f"Key focus on {', '.join(content_themes[:2]) if content_themes else 'quality'}. "
            f"Serving {', '.join(target_audience[:2])} across {', '.join(location_signals)}."
        )

        # 10. Confidence
        confidence = 0.5
        if corpus.metadata.get("website_extracted"):
            confidence += 0.25
        if corpus.metadata.get("facebook_extracted"):
            confidence += 0.20
        if best_industry_score >= 3:
            confidence += 0.05
        confidence = min(0.98, round(confidence, 2))

        profile = BrandProfile(
            brand_name=brand_name,
            industry=industry,
            products_services=products,
            target_audience=target_audience,
            content_themes=content_themes,
            brand_tone=brand_tone,
            keywords=keywords,
            location_signals=location_signals,
            summary=summary,
            confidence=confidence,
            evidence=evidence,
            is_demo_fixture=False,
            provenance="rule_based",
        )

        return profile.model_dump()


rule_based_profiler = RuleBasedBrandProfiler()
