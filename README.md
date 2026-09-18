# ThaiKOL AI — AI-Powered TikTok KOL Matcher 🇹🇭✨

> **AI Engineer Internship Assessment Portfolio Project**  
> An end-to-end, explainable TikTok influencer discovery, semantic matching, and multi-factor ranking system tailored for the Thai market.

---

## Problem

Influencer marketing on TikTok in Thailand is expanding rapidly, yet brand marketing teams and digital agencies struggle with three critical pain points:
1. **Manual Discovery & Niche Inefficiency**: Marketers spend hours manually searching generic hashtags (`#รีวิว`, `#ใช้ดีบอกต่อ`) in the TikTok app, leading to subjective selection and missed high-affinity micro-influencers.
2. **Keyword Fragility**: Traditional search tools rely on exact keyword matches. They fail to identify creators who discuss products using colloquial Thai phrasing, regional dialects, or natural conversational styles.
3. **The Black-Box & Demographic Fabrication Problem**: Many commercial agency tools calculate opaque scores without justification or fabricate unverifiable follower demographics (age, gender, income) that cannot be retrieved from public APIs.

---

## Solution

**ThaiKOL AI** provides an automated, transparent, and explainable decision-support web platform. By analyzing a business's public website and Facebook page, ThaiKOL AI:
1. Extracts a verified brand identity corpus with clear source evidence tracking (`OBSERVED` vs. `INFERRED`).
2. Autonomously generates high-signal Thai and English search terms to discover active TikTok creators.
3. Evaluates semantic relevance using a local multilingual sentence-transformer embedding model (`paraphrase-multilingual-MiniLM-L12-v2`).
4. Scores creators across five transparent, mathematically audited factors: Semantic Relevance, Engagement Quality, Local Content Relevance, Brand Safety, and Data Completeness.
5. Produces ranked recommendations with deterministic rationale ("Why this KOL?"), caution flags, and direct links to public TikTok profiles.

---

## Key Features

- 🌐 **Automated Dual-Source Brand Intelligence**: Ingests public website HTML and Facebook page context, synthesizing industry category, products, target audience, content themes, tone, and location signals.
- 🎯 **Autonomous Search Query Generation**: Translates brand identity into high-converting Thai and English TikTok search terms (e.g. `แชมพูสมุนไพร`, `ลดผมร่วง`, `clean beauty`).
- 🤖 **Local Multilingual Dense Embeddings**: 384-dimensional vector embeddings run 100% on-device using Sentence Transformers. Zero third-party API billing, zero token latency, and zero private data leakage.
- 📊 **Audited 5-Factor Weighted Scoring**: Fully configurable, transparent composite formula combining semantic fit, relative engagement percentiles, Thai locality cues, content-level brand safety, and data completeness.
- 💡 **Explainable "Why this KOL?" Breakdown**: Granular point-contribution grid (`+39.78` pts semantic, `+20.30` pts engagement), deterministic positive reasons, and caution/review flags.
- 🛡️ **Zero Demographic Fabrication**: Explicitly disclaims unverifiable audience demographic charts. Replaces them with an informational `Audience Fit Proxy` derived strictly from observable public signals (Thai script ratio, location mentions).
- 🔗 **Direct TikTok Profile Links**: Every recommendation outputs direct, verified links to creator profiles (`https://www.tiktok.com/@username`).
- ⚡ **Zero-Fail Offline Demo Mode**: Fully functional offline demo mode using authentic Thai personal care benchmarks (**Khaokho Talaypu เขาค้อทะเลภู**), complete with clear data-provenance badges.
- 📤 **Lightweight Export & Filters**: Instant score and topic filtering, one-click "Copy Recommendation Summary" to clipboard, and structured CSV export.

---

## End-to-End Workflow

```
[ Business Input ] (Website URL + Facebook Page URL)
        │
        ▼
[ Brand Extraction & Corpus Builder ] (HTML parse, meta tags, public FB posts)
        │
        ▼
[ Autonomous Query Generator ] (Thai & English discovery keywords)
        │
        ▼
[ TikTok Candidate Discovery ] (Public video ingestion, deduplication, ER calculation)
        │
        ▼
[ AI Semantic Vector Matching ] (Multilingual MiniLM-L12 dense embeddings & cosine similarity)
        │
        ▼
[ Multi-Factor Scorer & Brand Safety ] (Audited 5-factor weighted formula & keyword screening)
        │
        ▼
[ Explainable Recommendation UI ] (Top 5/10 cards, "Why this KOL?", TikTok profile links, CSV export)
```

---

## Architecture

ThaiKOL AI is built as a clean, decoupled full-stack monorepo following modern software engineering practices:

```
thaikol-ai/
├── backend/
│   ├── api/v1/endpoints/    # REST endpoints (brands, tiktok, matching, health)
│   ├── config/              # Declarative YAML configs (scoring, brand safety, data quality)
│   ├── core/                # Application settings, database sessions, structured logging
│   ├── models/              # SQLAlchemy 2.0 ORM models (Brand, TikTokCandidate, Recommendations)
│   ├── schemas/             # Pydantic v2 strict data transfer contracts
│   ├── services/            # Isolated business logic & provider implementations
│   │   ├── website_provider.py         # BeautifulSoup4 web scraper with SSRF protection
│   │   ├── facebook_provider.py        # Isolated Facebook provider (Apify / Mock)
│   │   ├── tiktok_provider.py          # Isolated TikTok provider (Apify / Mock)
│   │   ├── embedding_service.py        # SentenceTransformers MiniLM local model
│   │   ├── semantic_matcher.py         # Cosine similarity and topic extraction
│   │   ├── engagement_scorer.py        # Pool-relative engagement percentiles
│   │   ├── brand_safety_service.py     # Content-level keyword screening
│   │   ├── explainability_service.py   # Deterministic rationale generator
│   │   └── kol_scorer.py               # MultiFactorKOLScorer engine
│   └── tests/               # 94 automated unit, integration, and E2E regression tests
├── frontend/
│   ├── src/
│   │   ├── components/      # MainKOLMatcherApp, HeroSection, Header, Sandboxes
│   │   ├── App.tsx          # Main React application entry point
│   │   └── index.css        # Tailwind CSS and glassmorphism styling
│   └── vite.config.ts       # Vite configuration with API reverse proxy
├── data/fixtures/           # Curated benchmarks (sample_brands.json, sample_tiktoks.json)
├── docs/                    # Complete architectural and assessment documentation
├── docker-compose.yml       # Production-ready multi-service container definition
└── README.md
```

---

## AI Methodology

### Why Sentence Embeddings Over Generative LLMs for Matching?
- **Determinism & Reproducibility**: Dense embeddings mapped to a continuous geometric space produce identical, repeatable cosine similarity scores for identical texts.
- **Zero Hallucination**: Generative LLMs frequently hallucinate influencer handles, fake metrics, or fabricated follower counts. In ThaiKOL AI, all scored creators exist in the ingested pool.
- **Speed & Efficiency**: Vector comparisons execute in sub-milliseconds on CPU, enabling instant ranking without API latency or token expenses.

---

## KOL Discovery

1. **Query Formulation**: High-signal terms are extracted from the brand's industry, key ingredients, and content themes.
2. **Provider Ingestion**: The `TikTokProvider` interface queries public videos matching each term.
3. **Creator Deduplication**: Raw video authors are deduplicated by normalized lowercase username.
4. **Metric Aggregation**: Performance metrics are aggregated across sampled videos to compute:
   - Average Views, Average Likes, Average Comments, Average Shares
   - **Estimated Engagement Rate ($\text{ER}$)**:
     $$\text{ER} = \frac{\overline{\text{likes}} + \overline{\text{comments}} + \overline{\text{shares}}}{\max(\text{followers}, \overline{\text{views}})} \times 100$$
5. **Thailand Locality Signals**: Evaluates Thai script ratio in captions, Thai geographic mentions, and `#thailand` hashtags to compute a `local_signal_score`.

---

## Semantic Matching

- **Model**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384 dimensions).
- **Brand Text**: Structured combination of industry, summary, products, target audience, content themes, and brand tone.
- **Creator Text**: Structured combination of creator bio, top hashtags, and recent video captions (strictly excluding metrics to prevent popularity bias).
- **Cosine Similarity Transformation**:
  $$\text{Score}_{\text{semantic}} = \text{round}\left(\frac{\cos(\mathbf{u}, \mathbf{v}) + 1.0}{2.0} \times 100,\ 1\right)$$

---

## Multi-Factor Scoring

Recommendations are ranked using the mathematically audited, configurable five-factor formula (`config/scoring.yaml`):

$$\text{Final Score} = \text{round}(0.45 \cdot S_{\text{semantic}} + 0.25 \cdot S_{\text{engagement}} + 0.15 \cdot S_{\text{local}} + 0.10 \cdot S_{\text{safety}} + 0.05 \cdot S_{\text{data}}, 1)$$

| Factor | Weight | Evaluation Method |
|---|---|---|
| **Semantic Relevance** | **45%** | Cosine similarity of 384-dim dense embeddings |
| **Engagement Quality** | **25%** | Relative pool percentiles: 70% engagement rate percentile + 30% reach efficiency |
| **Local Content Relevance** | **15%** | Thai character ratio, Thai location keywords, and regional hashtags |
| **Brand Safety** | **10%** | Content screening against gambling, prohibited supplements, and explicit claims |
| **Data Quality** | **5%** | Profile completeness across 8 key attributes (bio, followers, metrics, avatar) |

---

## Explainability

Every recommendation card includes a collapsible **"Why this KOL?"** panel featuring:
- **Score Breakdown Grid**: Explicit score, configured weight percentage, and point contribution for each factor.
- **Deterministic Rationale**: Clear bullet points explaining why the candidate was recommended (e.g. *Strong semantic overlap with clean beauty themes*; *Top-quartile engagement rate (6.4%)*).
- **Caution Flags**: Flags low view counts, missing metrics, or commercial review requirements.
- **Matching Content Topics**: Distinct tags showing exact thematic overlap.

---

## Data Sources

- **Client Websites**: Extracted via direct HTTP requests using BeautifulSoup4 with strict SSRF protection.
- **Facebook Public Pages**: Scraped via Apify actor or mock provider for public category, description, and recent posts.
- **TikTok Public Data**: Ingested via Apify actor or mock provider for public video captions, play counts, and interaction stats.
- See [`docs/external_data_sources.md`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/docs/external_data_sources.md) for full technical documentation.

---

## Demo Mode

When `DEMO_MODE=true` (the default setting), ThaiKOL AI operates **100% offline without external dependencies**:
- Automatically loads the **Khaokho Talaypu (เขาค้อทะเลภู)** benchmark fixture.
- Ingests curated Thai creator candidate pools.
- Runs real local vector embeddings on device.
- Badged in the UI as: `DEMO DATA — Curated Benchmark Fixture`.

---

## Live Mode

When `DEMO_MODE=false` and an `APIFY_API_TOKEN` is configured:
- Fetches live website HTML and executes live Apify actors for Facebook and TikTok.
- Evaluates real, live public video snapshots.
- Badged in the UI as: `LIVE — Public TikTok Snapshot`.

---

## Future Improvements

Future versions of ThaiKOL AI could improve the platform by integrating
more reliable real-time public creator data, adding richer and verified
audience insights where legally and technically available, improving
creator discovery coverage and ranking quality, and introducing
production-scale monitoring, caching, and data pipelines. The system could
also be extended with campaign-level performance feedback so that matching
quality can be evaluated against actual campaign outcomes.

Specific directions include:

- **Live TikTok Data Integration**: Replace the Apify-based polling approach with a certified TikTok Creator Marketplace API integration to access officially sanctioned public creator metrics and reach estimates.
- **LLM-Powered Brand Profiling**: Fully activate the scaffolded Ollama integration to enable zero-shot brand entity extraction from richer and more ambiguous input text, complementing the existing rule-based profiler.
- **Verified Audience Insights**: Where future platform APIs permit, replace the current Audience Fit Proxy (content-signal proxy) with verified audience composition data, clearly labeled with source and confidence bounds.
- **Multi-Brand Campaign Planning**: Extend the platform to support managing multiple client brands, campaign budgets, and KOL shortlisting across ongoing campaigns from a single workspace.
- **Campaign Outcome Feedback Loop**: Integrate post-campaign performance signals (click-through rate, conversion attribution, brand recall lift) to close the feedback loop and improve future matching recommendations through reinforcement.
- **Production Infrastructure**: Add database-backed caching, horizontal scaling, observability dashboards (Prometheus/Grafana), and automated data refresh pipelines for production deployment.

---

## Setup

### Prerequisites
- Python 3.12+
- Node.js 18+ and npm
- Docker and Docker Compose (optional, for containerized run)

### Option 1: Local Development (Recommended)

#### 1. Backend
```bash
cd thaikol-ai/backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start FastAPI server on port 8000
uvicorn main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

#### 2. Frontend
```bash
cd thaikol-ai/frontend
npm install

# Start Vite dev server on port 5173
npm run dev
```
- Web Application: `http://localhost:5173`

---

### Option 2: Docker Compose

```bash
cd thaikol-ai
cp .env.example .env
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DEMO_MODE` | Set `true` for offline fixture operation | `true` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg2://postgres:postgres@localhost:5432/thaikol_db` |
| `EMBEDDING_MODEL_NAME` | Multilingual Sentence Transformer | `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` |
| `APIFY_API_TOKEN` | Apify API token for live TikTok/Facebook scraping | `""` *(empty uses demo fixtures)* |
| `OLLAMA_BASE_URL` | Optional local Ollama endpoint | `http://localhost:11434` |

---

## API Reference

### Primary Product Orchestration Endpoint
`POST /api/v1/matching/recommend-from-brand`

**Request:**
```json
{
  "website_url": "https://khaokhotalaypu.com",
  "facebook_page_url": "https://facebook.com/KhaokhoTalaypu",
  "limit": 5
}
```

**Response:**
```json
{
  "status": "success",
  "recommendation_count": 5,
  "candidate_pool_count": 11,
  "data_source": "demo_fixture",
  "brand_profile": {
    "brand_name": "Khaokho Talaypu (เขาค้อทะเลภู)",
    "industry": "Natural Beauty & Herbal Personal Care",
    "products_services": ["Butterfly Pea Shampoo", "Aloe Vera Treatment"]
  },
  "search_queries": ["แชมพูสมุนไพร", "อัญชัน", "ลดผมร่วง"],
  "recommendations": [
    {
      "rank": 1,
      "username": "mook_organic",
      "display_name": "Mook Organic Living",
      "profile_url": "https://www.tiktok.com/@mook_organic",
      "final_score": 87.8,
      "semantic_relevance_score": 88.4,
      "engagement_quality_score": 81.2,
      "local_content_relevance_score": 85.0,
      "brand_safety_score": 100.0,
      "data_quality_score": 100.0,
      "score_breakdown": {
        "semantic_relevance": {"score": 88.4, "weight": 0.45, "weighted_contribution": 39.78},
        "engagement_quality": {"score": 81.2, "weight": 0.25, "weighted_contribution": 20.30},
        "local_content_relevance": {"score": 85.0, "weight": 0.15, "weighted_contribution": 12.75},
        "brand_safety": {"score": 100.0, "weight": 0.10, "weighted_contribution": 10.00},
        "data_quality": {"score": 100.0, "weight": 0.05, "weighted_contribution": 5.00},
        "final_score": 87.8
      },
      "reasons": ["High semantic relevance with organic personal care"],
      "cautions": []
    }
  ]
}
```

---

## Testing

ThaiKOL AI includes a comprehensive automated test suite covering all services, mathematical scoring formulas, database persistence, and end-to-end user journeys:

```bash
# Run backend pytest suite
cd thaikol-ai/backend
source .venv/bin/activate
pytest -v
```
*Result*: **94 passed in ~0.3 seconds**.

```bash
# Run frontend TypeScript and Vite production build
cd thaikol-ai/frontend
npm run build
```
*Result*: **Built in ~800ms with 0 errors**.

---

## Limitations

1. **Public Data Snapshots**: Ingests point-in-time public videos; does not reflect real-time live streams or ephemeral stories.
2. **Text-Based Brand Safety**: Screens captions and hashtags; does not perform computer vision scanning of raw video pixels.
3. **No Private Conversion Data**: Measures public engagement, not private brand sales or affiliate conversions.
4. **Decision-Support Focus**: ThaiKOL AI does not perform automated talent outreach, contracting, or payments.

---

## Privacy & Ethics

- Operates strictly on **publicly accessible data**. No private messages, account passwords, or non-public personal information are collected.
- **Zero Demographic Fabrication**: The platform refuses to manufacture fake audience age or gender distributions.
- **Content-Level Screening Only**: Brand safety flags represent commercial keyword screening, not personal moral judgments.
- Full details in [`docs/ethics.md`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/docs/ethics.md).

---

## Future Improvements

1. **Multimodal Embeddings**: Incorporating visual video frame embeddings (CLIP/SigLIP) and Whisper audio transcripts.
2. **Vector Database Integration**: Integrating Qdrant or pgvector for sub-millisecond similarity search across millions of creators.
3. **Historical Velocity Tracking**: Periodic background workers monitoring creator engagement growth trends over 30, 60, and 90 days.
4. **Official Creator Marketplace API**: Integrating authorized TikTok Creator Marketplace OAuth for creators who opt in.

---

## External References

- [Sentence Transformers Documentation](https://sbert.net/)
- [Hugging Face Model Hub: paraphrase-multilingual-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)
- [FastAPI Framework](https://fastapi.tiangolo.com/)
- [Apify TikTok Scraper Actor](https://apify.com/clockworks/tiktok-scraper)
- [BeautifulSoup4 Documentation](https://www.crummy.com/software/BeautifulSoup/)
- [Tailwind CSS](https://tailwindcss.com/)
