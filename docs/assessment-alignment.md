# ThaiKOL AI — Internship Assessment Alignment Matrix

This document maps each specific requirement from the **AI Engineer Internship Assessment** directly to the concrete system architecture, implementation files, API endpoints, and verification tests in **ThaiKOL AI**.

---

## Direct Requirement Mapping Table

| Assessment Requirement | ThaiKOL AI Component | Implementation Files | API Endpoint / Interface | Automated Test Coverage |
|---|---|---|---|---|
| **1. Analyze Facebook Page & Website** | Brand Discovery & Extraction Engine | [`backend/services/website_provider.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/website_provider.py)<br>[`backend/services/facebook_provider.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/facebook_provider.py)<br>[`backend/services/corpus_builder.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/corpus_builder.py)<br>[`backend/services/brand_profiler.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/brand_profiler.py) | `POST /api/v1/brands/analyze` | `tests/test_brands_api.py`<br>`tests/test_website_provider.py`<br>`tests/test_facebook_provider.py`<br>`tests/test_corpus_builder.py` |
| **2. Understand Brand Identity, Products & Tone** | Structured Brand Profiler with Evidence Tracking | [`backend/schemas/brand.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/schemas/brand.py)<br>[`backend/services/llm_profiler.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/llm_profiler.py) | `BrandProfile`<br>`EvidenceItem` (`OBSERVED`, `INFERRED`, `ESTIMATED`) | `tests/test_brand_profiler.py`<br>`tests/test_e2e_pipeline.py` |
| **3. Identify & Discover TikTok Creators in Thailand** | TikTok Candidate Ingestion & Deduplication Pipeline | [`backend/services/tiktok_discovery_service.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/tiktok_discovery_service.py)<br>[`backend/services/tiktok_provider.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/tiktok_provider.py)<br>[`backend/services/query_generator.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/query_generator.py) | `POST /api/v1/tiktok/discover`<br>`GET /api/v1/tiktok/candidates` | `tests/test_tiktok_provider.py`<br>`tests/test_creator_deduplication.py`<br>`tests/test_query_generator.py`<br>`tests/test_tiktok_api.py` |
| **4. Evaluate Relevance (AI Matching)** | Multilingual Dense Vector Embeddings & Cosine Matcher | [`backend/services/embedding_service.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/embedding_service.py)<br>[`backend/services/semantic_matcher.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/semantic_matcher.py)<br>[`backend/services/text_representation.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/text_representation.py) | `POST /api/v1/matching/semantic`<br>`POST /api/v1/matching/semantic-from-brand` | `tests/test_semantic_matcher.py`<br>`tests/test_cosine_similarity.py`<br>`tests/test_text_representation.py`<br>`tests/test_embedding_service.py` |
| **5. Evaluate Engagement & Performance Metrics** | Pool-Relative Engagement Percentile Scorer | [`backend/services/engagement_scorer.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/engagement_scorer.py) | Sub-score in `MultiFactorKOLScorer` | `tests/test_engagement_scorer.py` |
| **6. Audience & Local Fit Signals** | Thailand Locality Scorer & Observable Audience Fit Proxy | [`backend/services/tiktok_signals.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/tiktok_signals.py)<br>[`backend/services/audience_fit_service.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/audience_fit_service.py) | Sub-score and informational signal in `KOLRecommendation` | `tests/test_tiktok_signals.py`<br>`tests/test_audience_fit.py`<br>`tests/test_recommendation_scorer.py` |
| **7. Brand Safety & Risk Screening** | Content-Level Keyword & Flag Screening Service | [`backend/services/brand_safety_service.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/brand_safety_service.py)<br>[`backend/config/brand_safety.yaml`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/config/brand_safety.yaml) | Sub-score in `ScoreBreakdown` | `tests/test_brand_safety.py` |
| **8. Multi-Factor Scoring & Ranking** | Transparent Weighted Multi-Factor Scorer | [`backend/services/kol_scorer.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/kol_scorer.py)<br>[`backend/services/scoring_config.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/scoring_config.py)<br>[`backend/config/scoring.yaml`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/config/scoring.yaml) | `POST /api/v1/matching/recommend` | `tests/test_recommendation_scorer.py`<br>`tests/test_scoring_weights.py` |
| **9. Explainable Recommendations ("Why this KOL?")** | Deterministic Rationale & Caution Generation Engine | [`backend/services/explainability_service.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/services/explainability_service.py) | `reasons`, `cautions`, `matching_topics` in `KOLRecommendation` | `tests/test_explainability.py` |
| **10. Display Public TikTok Profile Links** | Validated Profile URLs | [`backend/schemas/recommendation.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/schemas/recommendation.py)<br>[`frontend/src/components/MainKOLMatcherApp.tsx`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/frontend/src/components/MainKOLMatcherApp.tsx) | `profile_url` (`https://www.tiktok.com/@{username}`) | `tests/test_e2e_pipeline.py` |
| **11. Working Prototype with Real Business Example** | End-to-End Orchestrated Pipeline (Khaokho Talaypu Benchmark) | [`backend/api/v1/endpoints/matching.py`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/api/v1/endpoints/matching.py)<br>[`data/fixtures/sample_brands.json`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/data/fixtures/sample_brands.json)<br>[`data/fixtures/sample_tiktoks.json`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/data/fixtures/sample_tiktoks.json) | `POST /api/v1/matching/recommend-from-brand` | `tests/test_e2e_pipeline.py`<br>`tests/test_recommendation_api.py` |
| **12. Presentation / Loom Walkthrough Preparation** | Structured 10-Minute Video Script & Interview Talking Points | [`docs/demo-script.md`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/docs/demo-script.md)<br>[`docs/interview-talking-points.md`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/docs/interview-talking-points.md) | Documentation & presentation assets | Verified by script structure and documentation audit |

---

## Detailed Requirement Narrative

### 1. Brand Discovery & Profiling
The assessment calls for an automated extraction of brand context from a Facebook page and website. 
- **Implementation**: `ProductionWebsiteProvider` uses BeautifulSoup4 to extract title, meta tags, OpenGraph attributes, headings, and semantic text bodies. `FacebookProvider` parses public page categories, follower counts, and recent public posts. 
- **Explainability Distinction**: In `BrandProfile`, all extracted facts are tagged with `nature`:
  - `OBSERVED`: Direct verbatim text from client channels (e.g. "Grown and produced locally in Khaokho, Phetchabun").
  - `INFERRED`: Logical synthesis of audience or themes from combined signals.
  - `ESTIMATED`: Numerical or statistical aggregations.

### 2. Candidate Discovery & Ingestion
The system queries public TikTok creators in Thailand without requiring manual handle entry.
- **Implementation**: `generate_kol_search_queries` automatically extracts Thai and English search keywords from the synthesized `BrandProfile` (e.g. `แชมพูสมุนไพร`, `รีวิวแชมพู`, `natural beauty thailand`). The `TikTokProvider` discovers public videos matching these queries, deduplicates by normalized `@username`, aggregates author metrics across sample videos, and calculates Estimated Engagement Rate:
  $$\text{ER} = \frac{\overline{\text{likes}} + \overline{\text{comments}} + \overline{\text{shares}}}{\max(\text{followers}, \overline{\text{views}})} \times 100$$

### 3. AI Semantic Relevance Matching
Rather than relying on brittle keyword overlap, the system models semantic alignment in a shared vector space.
- **Implementation**: Uses `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384-dimensional dense vectors). The brand corpus and creator content (bio + recent video captions + top hashtags) are encoded and compared via cosine similarity:
  $$\text{Score}_{\text{semantic}} = \text{round}\left(\max\left(0, \frac{\cos(\mathbf{u}, \mathbf{v}) + 0.20}{1.20}\right) \times 100, 1\right)$$

### 4. Transparent Multi-Factor Ranking & Explainability
The assessment mandates ranking creators and explaining why each creator is recommended.
- **Implementation**: `MultiFactorKOLScorer` applies the audited 5-factor weighted formula:
  $$\text{Final Score} = \text{round}(0.45 \cdot S_{\text{semantic}} + 0.25 \cdot S_{\text{engagement}} + 0.15 \cdot S_{\text{local}} + 0.10 \cdot S_{\text{safety}} + 0.05 \cdot S_{\text{data}}, 1)$$
- **Explainability**: Each recommendation returns a granular `ScoreBreakdown` (score, weight, and point contribution) alongside deterministic rule-based `reasons` and `cautions`. No generative hallucinations are introduced.

### 5. Audience Fit Handling & Anti-Fabrication
Follower demographic data (age, gender, income) is not publicly available on social networks without private OAuth consent.
- **Methodological Integrity**: ThaiKOL AI never fabricates fake audience demographics. Instead, `AudienceFitService` computes an `Audience Fit Proxy` based strictly on observable public content signals (Thai language ratio, local location mentions, clean beauty cues).
- **Isolation**: The Audience Fit Proxy is explicitly documented as an informational signal and has **0.00% effect on the Final Score**.
