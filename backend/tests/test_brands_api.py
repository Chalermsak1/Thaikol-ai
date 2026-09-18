from unittest.mock import patch
from starlette.testclient import TestClient


def test_analyze_brand_demo_mode(client: TestClient):
    """Test that POST /api/v1/brands/analyze in DEMO_MODE returns the canonical Khaokho Talaypu fixture."""
    response = client.post("/api/v1/brands/analyze", json={})
    assert response.status_code == 200
    data = response.json()

    assert "brand_profile" in data
    profile = data["brand_profile"]
    assert "Khaokho Talaypu" in profile["brand_name"]
    assert profile["is_demo_fixture"] is True
    assert profile["provenance"] == "curated_demo_fixture"
    assert data["pipeline_status"]["website"] == "demo_fixture"
    assert data["pipeline_status"]["facebook"] == "demo_fixture"
    assert data["pipeline_status"]["profiling"] == "success"
    assert len(profile["evidence"]) > 0


def test_analyze_brand_with_mocked_live_sources(client: TestClient):
    """Test full analysis pipeline with mocked successful website and Facebook extractions."""
    mock_web = {
        "final_url": "https://www.thaitea.com",
        "page_title": "Thai Tea Masters | Authentic Thai Beverage",
        "headings": ["Specialty Tea Leaves", "Bangkok Flagship Store"],
        "visible_text": "Brewing authentic Thai tea and milk tea in Bangkok since 1995. Specialty drinks for tea lovers.",
        "extraction_status": "success",
    }
    mock_fb = {
        "page_url": "https://www.facebook.com/thaiteamasters",
        "page_name": "Thai Tea Masters Official",
        "page_category": "Tea Room & Cafe",
        "about": "Award winning Thai milk tea made with real tea leaves in Bangkok.",
        "recent_posts": [],
        "extraction_status": "success",
    }

    with patch("core.config.settings.DEMO_MODE", False):
        with patch("services.website_provider.ProductionWebsiteProvider.extract_brand_content", return_value=mock_web):
            with patch("services.facebook_provider.MockFacebookProvider.extract_page_content", return_value=mock_fb):
                response = client.post(
                    "/api/v1/brands/analyze",
                    json={
                        "website_url": "https://www.thaitea.com",
                        "facebook_page_url": "https://www.facebook.com/thaiteamasters",
                    },
                )
                assert response.status_code == 200
                data = response.json()
                profile = data["brand_profile"]

                assert profile["industry"] == "Food & Beverage"
                assert "Bangkok" in profile["location_signals"]
                assert data["pipeline_status"]["website"] == "success"
                assert data["pipeline_status"]["facebook"] == "success"
                assert data["pipeline_status"]["profiling"] == "success"


def test_analyze_brand_partial_failure_website_only(client: TestClient):
    """Test pipeline resilience when Facebook extraction fails but website extraction succeeds."""
    mock_web = {
        "final_url": "https://www.onlyweb.com",
        "page_title": "Organic Skincare Co.",
        "headings": ["Products"],
        "visible_text": "Gentle organic skincare for sensitive skin.",
        "extraction_status": "success",
    }
    mock_fb_failed = {
        "page_url": "https://www.facebook.com/broken",
        "extraction_status": "failed",
        "error": "Page does not exist",
    }

    with patch("core.config.settings.DEMO_MODE", False):
        with patch("services.website_provider.ProductionWebsiteProvider.extract_brand_content", return_value=mock_web):
            with patch("services.facebook_provider.MockFacebookProvider.extract_page_content", return_value=mock_fb_failed):
                response = client.post(
                    "/api/v1/brands/analyze",
                    json={
                        "website_url": "https://www.onlyweb.com",
                        "facebook_page_url": "https://www.facebook.com/broken",
                    },
                )
                assert response.status_code == 200
                data = response.json()
                assert data["pipeline_status"]["website"] == "success"
                assert data["pipeline_status"]["facebook"] == "failed"
                assert data["pipeline_status"]["profiling"] == "success"
                assert data["brand_profile"]["brand_name"] is not None


def test_analyze_brand_total_failure_returns_422(client: TestClient):
    """Test that when all requested sources fail, the endpoint returns HTTP 422 with descriptive details."""
    mock_web_failed = {
        "final_url": "https://www.broken-web.com",
        "extraction_status": "failed",
        "error": "DNS resolution error",
    }
    mock_fb_failed = {
        "page_url": "https://www.facebook.com/broken-fb",
        "extraction_status": "failed",
        "error": "Blocked",
    }

    with patch("core.config.settings.DEMO_MODE", False):
        with patch("services.website_provider.ProductionWebsiteProvider.extract_brand_content", return_value=mock_web_failed):
            with patch("services.facebook_provider.MockFacebookProvider.extract_page_content", return_value=mock_fb_failed):
                response = client.post(
                    "/api/v1/brands/analyze",
                    json={
                        "website_url": "https://www.broken-web.com",
                        "facebook_page_url": "https://www.facebook.com/broken-fb",
                    },
                )
                assert response.status_code == 422
                data = response.json()
                assert "detail" in data
