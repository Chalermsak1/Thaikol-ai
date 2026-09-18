from unittest.mock import patch
from schemas.brand import BrandCorpus, SourceReference
from services.llm_profiler import LLMBrandProfiler
from services.rule_based_profiler import RuleBasedBrandProfiler


def test_rule_based_profiler_deterministic_extraction():
    """Test deterministic rule-based profiling with Thai herbal hair care signals."""
    corpus = BrandCorpus(
        brand_name_candidates=["Khaokho Talaypu เขาค้อทะเลภู"],
        website_text="เขาค้อทะเลภู แชมพูสมุนไพรอัญชันธรรมชาติ 100% แก้ผมร่วงและรังแค ปลูกที่เขาค้อ เพชรบูรณ์",
        facebook_about="ผลิตภัณฑ์ดูแลเส้นผมออร์แกนิก ปลอดภัยสำหรับผิวแพ้ง่าย",
        facebook_post_texts=["สระแล้วผมหนาไม่ร่วง สารสกัดจากธรรมชาติแท้ 🌿"],
        website_headings=["แชมพูอัญชัน"],
        metadata={"website_extracted": True, "facebook_extracted": True, "website_url": "https://www.khaokhotalaypu.com"},
        source_references=[
            SourceReference(source="website", text="แชมพูสมุนไพรอัญชันธรรมชาติ 100%", source_url="https://www.khaokhotalaypu.com")
        ],
    )

    profiler = RuleBasedBrandProfiler()
    profile = profiler.generate_brand_profile(corpus=corpus)

    assert "Khaokho" in profile["brand_name"]
    assert profile["industry"] == "Natural Beauty & Herbal Personal Care"
    assert any("อัญชัน" in p or "แชมพู" in p for p in profile["products_services"])
    assert any("ผมร่วง" in a or "hair loss" in a.lower() for a in profile["target_audience"])
    assert any("Phetchabun" in loc or "Khaokho" in loc for loc in profile["location_signals"])
    assert profile["confidence"] >= 0.8
    assert len(profile["evidence"]) >= 3
    # Check that evidence items follow OBSERVED/INFERRED typing
    assert any(e["nature"] in ("OBSERVED", "INFERRED") for e in profile["evidence"])


def test_rule_based_profiler_anti_hallucination():
    """Test that rule-based profiler does NOT invent specific demographics when not in source."""
    corpus = BrandCorpus(
        brand_name_candidates=["Clean Coffee Bangkok"],
        website_text="Specialty drip coffee shop in Bangkok.",
        facebook_about="",
        facebook_post_texts=[],
        website_headings=[],
        metadata={"website_extracted": True, "website_url": "https://www.cleancoffee.com"},
        source_references=[],
    )

    profiler = RuleBasedBrandProfiler()
    profile = profiler.generate_brand_profile(corpus=corpus)

    assert profile["industry"] == "Food & Beverage"
    assert "Bangkok" in profile["location_signals"]

    # Verify demographics like specific ages (e.g. 18-24) or gender percentages were NOT fabricated
    audience_text = " ".join(profile["target_audience"]).lower()
    assert "18-24" not in audience_text
    assert "female 70%" not in audience_text


def test_llm_profiler_fallback_when_ollama_offline():
    """Test that LLMBrandProfiler gracefully falls back to RuleBasedBrandProfiler if Ollama fails."""
    corpus = BrandCorpus(
        brand_name_candidates=["Test Brand"],
        website_text="Specialty herbal soap made with natural oils.",
        facebook_about="",
        facebook_post_texts=[],
        website_headings=[],
        metadata={"website_extracted": True},
        source_references=[],
    )

    llm_profiler = LLMBrandProfiler(base_url="http://localhost:11434", timeout=0.01)

    # Simulate connection error to Ollama
    with patch.object(llm_profiler, "_call_ollama", side_effect=Exception("Connection refused")):
        profile = llm_profiler.generate_brand_profile(corpus=corpus)
        assert profile is not None
        assert profile["brand_name"] == "Test Brand"
        assert profile["industry"] is not None
        assert profile["provenance"] == "rule_based"
