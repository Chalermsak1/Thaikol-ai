# ThaiKOL AI Data Fixtures & Privacy Guidelines

## Purpose
This directory contains deterministic, curated data fixtures designed for:
1. **Offline Internship Assessments & Demonstrations**: Enabling the application to run smoothly without depending on external network access, rate-limited APIs, or third-party paid scraping actors.
2. **Deterministic Automated Testing**: Providing predictable fixtures for unit and integration testing.

## Data Ethics & Integrity Policy
- **No Fabricated Real Influencer Metrics**: In accordance with project requirements, third-party performance statistics are explicitly flagged as synthetic demo fixtures (`"is_demo_fixture": true`, `"data_source": "fixture_synthetic"`). We do not misrepresent synthetic numbers as audited real-world measurements.
- **Public Information Only**: In live mode, our crawlers and Apify actors process only publicly available profile metadata, public bio text, and public post captions.
- **Clear Provenance Flagging**: Every entity processed in the system carries provenance metadata (`is_demo_fixture: bool`, `provenance: str`).

## Fixture Files
- `fixtures/sample_brands.json`: Representative Thai business profile (Khaokho Talaypu / เขาค้อทะเลภู), documenting natural herbal cosmetics, audience demographics, key products, and Thai content keywords.
- `fixtures/sample_kols.json`: Diverse Thai TikTok creator profiles including highly relevant beauty/herbal creators (`@mookda_skincare`), lifestyle creators (`@cleanlife_pat`), and out-of-niche control creators (`@gam_tech_bkk`).
