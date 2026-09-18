from unittest.mock import MagicMock, patch
import pytest
from services.cache import cache_service
from services.security import validate_safe_url
from services.website_provider import ProductionWebsiteProvider


def test_validate_safe_url_valid():
    """Test that safe public HTTP/HTTPS URLs pass validation."""
    valid_urls = [
        "https://www.google.com",
        "https://www.example.com/test",
        "http://github.com",
    ]
    for url in valid_urls:
        assert validate_safe_url(url) == url


def test_validate_safe_url_ssrf_rejection():
    """Test that private IPs, localhost, and invalid schemes are blocked."""
    invalid_urls = [
        "http://localhost:8000",
        "http://127.0.0.1/admin",
        "http://0.0.0.0",
        "http://10.0.0.1",
        "http://192.168.1.1",
        "http://172.16.0.1",
        "http://169.254.169.254/latest/meta-data",
        "ftp://example.com",
        "file:///etc/passwd",
        "javascript:alert(1)",
    ]
    for url in invalid_urls:
        with pytest.raises(ValueError):
            validate_safe_url(url)


def test_website_provider_successful_html_extraction():
    """Test parsing of HTML elements, noise removal, and metadata extraction."""
    sample_html = """
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <title>เขาค้อทะเลภู | สมุนไพรธรรมชาติแท้</title>
        <meta name="description" content="ผลิตภัณฑ์ดูแลเส้นผมและผิวพรรณธรรมชาติ 100% จากเขาค้อ">
        <link rel="canonical" href="https://www.khaokhotalaypu.com">
        <meta property="og:title" content="Khaokho Talaypu Official">
        <meta property="og:description" content="แชมพูอัญชันลดผมร่วง ไร้ซิลิโคนและพาราเบน">
        <script>var tracker = 'bad_tracking_code';</script>
        <style>.nav { color: red; }</style>
    </head>
    <body>
        <nav><a href="/home">Home Menu Item</a></nav>
        <header>Header Banner Noise</header>
        <main>
            <h1>แชมพูสมุนไพรสูตรอัญชันและกะเม็ง</h1>
            <h2>สำหรับผู้มีปัญหาผมร่วง</h2>
            <p>ช่วยบำรุงรากผมให้ดกดำแข็งแรง ลดการขาดหลุดร่วง ปราศจากสารเคมีทำร้ายหนังศีรษะ 100%</p>
            <h3>สรรพคุณสมุนไพรไทย</h3>
            <p>สารสกัดดอกอัญชันแท้จากธรรมชาติ ปลูกด้วยวิถีอินทรีย์ ปลอดภัยสำหรับผิวแพ้ง่าย</p>
        </main>
        <footer>Footer Copyright Noise 2026</footer>
    </body>
    </html>
    """
    provider = ProductionWebsiteProvider()
    content = provider._parse_html(sample_html, "https://www.khaokhotalaypu.com", "2026-09-17T12:00:00Z")

    assert content.extraction_status == "success"
    assert content.page_title == "เขาค้อทะเลภู | สมุนไพรธรรมชาติแท้"
    assert "ผลิตภัณฑ์ดูแลเส้นผม" in (content.meta_description or "")
    assert content.og_title == "Khaokho Talaypu Official"
    assert content.canonical_url == "https://www.khaokhotalaypu.com"
    assert "แชมพูสมุนไพรสูตรอัญชันและกะเม็ง" in content.headings
    assert "สำหรับผู้มีปัญหาผมร่วง" in content.headings
    # Ensure noise like script, nav, footer is absent from visible text
    assert "bad_tracking_code" not in content.visible_text
    assert "Home Menu Item" not in content.visible_text
    assert "Footer Copyright Noise" not in content.visible_text
    assert "ช่วยบำรุงรากผม" in content.visible_text


def test_website_provider_empty_html():
    """Test that empty HTML parses gracefully without throwing exceptions."""
    provider = ProductionWebsiteProvider()
    content = provider._parse_html("", "https://www.example.com", "2026-09-17T12:00:00Z")
    assert content.extraction_status == "success"
    assert content.page_title is None
    assert content.visible_text == ""
    assert content.headings == []


def test_website_provider_timeout_handled():
    """Test that network timeout yields a controlled failure payload."""
    provider = ProductionWebsiteProvider(timeout=0.01)
    with patch("httpx.Client.stream", side_effect=Exception("Connection timed out")):
        result = provider.extract_brand_content("https://www.example.com")
        assert result["extraction_status"] == "failed"
        assert "timed out" in result["error"].lower() or "failed" in result["error"].lower()


def test_website_provider_caching():
    """Test that subsequent extractions for the same URL hit the memory cache."""
    provider = ProductionWebsiteProvider()
    cache_service.clear()
    url = "https://www.example.com/cached-test"

    dummy_content = {
        "final_url": url,
        "page_title": "Cached Title",
        "visible_text": "Cached Text",
        "headings": [],
        "extracted_at": "2026-09-17T12:00:00Z",
        "extraction_status": "success",
        "error": None,
    }
    key = cache_service.build_key("website", url)
    cache_service.set(key, dummy_content)

    # Should return cached content directly without HTTP request
    result = provider.extract_brand_content(url)
    assert result["page_title"] == "Cached Title"
