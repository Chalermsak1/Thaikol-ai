import json
from pathlib import Path
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, status

from core.config import settings
from core.logging import logger
from schemas.brand import (
    BrandAnalyzeRequest,
    BrandAnalyzeResponse,
    BrandProfile,
    EvidenceItem,
)
from services.corpus_builder import corpus_builder
from services.facebook_provider import get_facebook_provider
from services.llm_profiler import get_brand_profiler
from services.website_provider import ProductionWebsiteProvider

router = APIRouter()


def _load_demo_fixture() -> BrandAnalyzeResponse:
    """Loads and formats the canonical Khaokho Talaypu demo fixture for offline evaluation."""
    candidate_paths = [
        Path(__file__).resolve().parents[3].parent / "data" / "fixtures" / "sample_brands.json",
        Path(__file__).resolve().parents[4] / "data" / "fixtures" / "sample_brands.json",
        Path.cwd() / "data" / "fixtures" / "sample_brands.json",
        Path.cwd().parent / "data" / "fixtures" / "sample_brands.json",
    ]
    fixture_path = next((p for p in candidate_paths if p.exists()), Path("data/fixtures/sample_brands.json"))

    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        brand = data[0]

    evidence = [
        EvidenceItem(
            field="industry",
            source="website",
            source_url=brand["website_url"],
            text="Pioneer Thai natural and herbal personal care brand established in Phetchabun.",
            nature="OBSERVED",
        ),
        EvidenceItem(
            field="products_services",
            source="website",
            source_url=brand["website_url"],
            text="Specializes in 100% natural butterfly pea, aloe vera, and ginger shampoos.",
            nature="OBSERVED",
        ),
        EvidenceItem(
            field="target_audience",
            source="facebook",
            source_url=brand["facebook_url"],
            text="Eco-conscious Thai consumers, clean beauty advocates, people experiencing sensitive scalp.",
            nature="INFERRED",
        ),
        EvidenceItem(
            field="location_signals",
            source="website",
            source_url=brand["website_url"],
            text="Grown and produced locally in Khaokho, Phetchabun, Thailand.",
            nature="OBSERVED",
        ),
    ]

    profile = BrandProfile(
        brand_name=brand["name"],
        industry=brand["category"],
        products_services=brand["key_products"],
        target_audience=[
            "Eco-conscious Thai consumers",
            "Consumers with sensitive scalps or hair loss",
            "Clean beauty advocates",
        ],
        content_themes=[
            "100% Natural & Herbal Ingredients",
            "Zero Silicone / Paraben Free",
            "Hair Fall & Scalp Problem Solving",
        ],
        brand_tone=[
            "Authentic & Wholesome",
            "Nature-inspired",
            "Educational & Caring",
        ],
        keywords=brand["keywords"],
        location_signals=["Phetchabun (Khaokho)", "Thailand (Nationwide)"],
        summary=brand["brand_summary"],
        confidence=0.96,
        evidence=evidence,
        is_demo_fixture=True,
        provenance="curated_demo_fixture",
    )

    sources = {
        "website": {
            "final_url": brand["website_url"],
            "page_title": f"{brand['name']} | Official Website",
            "meta_description": brand["brand_summary"],
            "extraction_status": "success",
            "is_demo_fixture": True,
        },
        "facebook": {
            "page_url": brand["facebook_url"],
            "page_name": brand["name"],
            "page_category": brand["category"],
            "follower_count": 248000,
            "extraction_status": "success",
            "is_demo_fixture": True,
        },
    }

    pipeline_status = {
        "website": "demo_fixture",
        "facebook": "demo_fixture",
        "profiling": "success",
    }

    return BrandAnalyzeResponse(
        brand_profile=profile,
        sources=sources,
        pipeline_status=pipeline_status,
    )


@router.post(
    "/analyze",
    response_model=BrandAnalyzeResponse,
    summary="Analyze Brand Identity from Public Web & Facebook",
    description=(
        "Collects public signals from client website and Facebook page, builds a unified BrandCorpus, "
        "and extracts an explainable BrandProfile with evidence audit trails. "
        "Supports DEMO_MODE=true for reliable offline demonstrations."
    ),
)
def analyze_brand(request: BrandAnalyzeRequest) -> BrandAnalyzeResponse:
    has_web = bool(request.website_url and request.website_url.strip())
    has_fb = bool(request.facebook_page_url and request.facebook_page_url.strip())

    # Demo Mode Handling: If DEMO_MODE=true and no live URL or matching demo domain
    if settings.DEMO_MODE:
        # Check if caller passed nothing or requested the demo brand
        if (
            not (has_web or has_fb)
            or (has_web and "khaokho" in request.website_url.lower())
            or (has_fb and "khaokho" in request.facebook_page_url.lower())
        ):
            logger.info("Serving curated DEMO_MODE fixture for brand analysis")
            return _load_demo_fixture()

    if not has_web and not has_fb:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one of 'website_url' or 'facebook_page_url' must be provided.",
        )

    pipeline_status: Dict[str, str] = {
        "website": "skipped",
        "facebook": "skipped",
        "profiling": "pending",
    }
    sources: Dict[str, Any] = {}

    web_data: Optional[Dict[str, Any]] = None
    fb_data: Optional[Dict[str, Any]] = None

    # 1. Website Extraction
    if has_web:
        assert request.website_url is not None
        web_provider = ProductionWebsiteProvider()
        web_data = web_provider.extract_brand_content(request.website_url)
        sources["website"] = web_data
        pipeline_status["website"] = web_data.get("extraction_status", "failed")

    # 2. Facebook Extraction
    if has_fb:
        assert request.facebook_page_url is not None
        fb_provider = get_facebook_provider()
        fb_data = fb_provider.extract_page_content(request.facebook_page_url)
        sources["facebook"] = fb_data
        pipeline_status["facebook"] = fb_data.get("extraction_status", "failed")

    # Check if both sources failed
    web_failed = has_web and pipeline_status["website"] != "success"
    fb_failed = has_fb and pipeline_status["facebook"] != "success"

    if (has_web and web_failed) and (has_fb and fb_failed):
        # Both requested sources failed
        pipeline_status["profiling"] = "failed"
        err_msg = "Both website and Facebook extraction failed. Check provided URLs and accessibility."
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": err_msg,
                "pipeline_status": pipeline_status,
                "sources": sources,
            },
        )
    elif (has_web and not has_fb and web_failed):
        # Website only requested and failed
        pipeline_status["profiling"] = "failed"
        err_detail = web_data.get("error") if web_data else "Unknown extraction error"
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": f"Website extraction failed: {err_detail}",
                "pipeline_status": pipeline_status,
                "sources": sources,
            },
        )
    elif (has_fb and not has_web and fb_failed):
        # Facebook only requested and failed
        pipeline_status["profiling"] = "failed"
        err_detail = fb_data.get("error") if fb_data else "Unknown extraction error"
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": f"Facebook extraction failed: {err_detail}",
                "pipeline_status": pipeline_status,
                "sources": sources,
            },
        )

    # 3. Corpus Assembly & Profiling
    corpus = corpus_builder.build_corpus(web_data, fb_data)
    profiler = get_brand_profiler()

    try:
        profile_dict = profiler.generate_brand_profile(corpus=corpus)
        profile = BrandProfile.model_validate(profile_dict)
        pipeline_status["profiling"] = "success"
    except Exception as err:
        logger.error("Brand profiling failed: %s", err)
        pipeline_status["profiling"] = "failed"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate brand profile: {str(err)}",
        )

    return BrandAnalyzeResponse(
        brand_profile=profile,
        sources=sources,
        pipeline_status=pipeline_status,
    )
