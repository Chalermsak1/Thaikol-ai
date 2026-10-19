# ThaiKOL AI

## AI-Powered TikTok KOL Matcher for the Thai Market
### Live-Data First Architecture • Transparent Multi-Factor Scoring • Deterministic Demo Mode

ThaiKOL AI is an AI-powered creator discovery and recommendation system designed to help brand marketing teams and digital agencies systematically identify, evaluate, and rank relevant TikTok creators in Thailand. The system analyzes real public brand websites and Facebook pages, discovers real public TikTok creators via legitimate external scraping providers (Apify), normalizes and persists creator data with point-in-time snapshots, evaluates content relevance in a multilingual dense vector space, and ranks candidates using transparent 5-factor scoring with deterministic explanations.

```
Live-Data First • Real-World Apify Integration • Async Job Engine • Snapshot Freshness • Multilingual NLP • React 18 • TypeScript • FastAPI • Python 3.12 • PostgreSQL
```

<p align="center">
  <img src="docs/screenshots/mobile-homepage-brand-overview.png" alt="ThaiKOL AI Mobile Brand & Discovery Overview" width="350" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/screenshots/mobile-creator-cards-carousel.png" alt="ThaiKOL AI Mobile Creator Cards & Top Matches Carousel" width="350" />
</p>
<p align="center">
  <strong>ThaiKOL AI Mobile-First Interface</strong><br />
  <em>Left: Active Brand Context, Dynamic Categories & Search • Right: Top Matches Creator Portrait Deck (snap-x), Micro-Metrics & Video Previews</em>
</p>

---

## 1. The Problem

Influencer discovery on TikTok in Thailand is typically a manual, time-intensive process:

* **Brand Context Disconnect**: Marketers must repeatedly define brand identity, product nuances, and positioning across ad-hoc searches.
* **Keyword Fragility**: Relying on generic hashtags (such as `#รีวิว` or `#ใช้ดีบอกต่อ`) fails to identify creators who discuss products using colloquial Thai, regional dialects, or natural conversational styles.
* **Opaque Scoring & Demographic Fabrication**: Many commercial influencer databases calculate proprietary scores without justification or fabricate unverifiable follower demographics (such as age, gender, or income) that cannot be retrieved from public APIs.
* **Opaque Data Sourcing & Silent Fallbacks**: Typical prototypes either use static mock fixtures or fail without explanation when external APIs time out. Marketers cannot tell what is observed data versus estimated guesses.
* **Screening Inefficiency**: Comparing multiple creators across engagement, content style, brand safety, and local relevance requires manually reviewing dozens of individual profiles.

ThaiKOL AI automates and structures this discovery and screening workflow into a transparent, repeatable, and live-data-backed decision-support system.

---

## 2. The Solution: Live-Data First Pipeline

ThaiKOL AI connects live brand intelligence directly to creator discovery and recommendation through an automated pipeline:

```mermaid
flowchart TD
    A[Public Brand Website] -->|SSRF-Protected HTTP| B[Brand Ingestion & Web Extractor]
    A2[Public Facebook Page] -->|Apify Facebook Provider| B
    B --> C[Brand Corpus & Rule-Based Profiler]
    C --> D[Targeted Query Generation Engine]
    D -->|Prioritized Thai/EN Queries| E[Apify TikTok Provider]
    E -->|Raw Video & Profile Data| F[Deduplication & Identity Normalizer]
    F --> G[Point-in-Time Metric Snapshots & Freshness]
    G --> H[Multilingual Dense Vector Matching]
    H --> I[Multi-Factor Weighted Scoring]
    I --> J[Deterministic Explainability Rationale]
    J --> K[Interactive Dashboard, Compare & Export]
```

1. **Brand Ingestion**: Extracts public text and metadata from a client's website (with strict SSRF defenses) and Facebook page (via Apify), tracking observed versus inferred evidence.
2. **Autonomous Query Formulation**: Generates prioritized, deduplicated Thai and English search queries based on brand products, content themes, and local cues.
3. **Live TikTok Discovery**: Ingests public video and author metadata via Apify (`clockworks/tiktok-scraper`) with exponential backoff retries, rate-limit detection, and pagination bounds.
4. **Creator Deduplication & URL Verification**: Merges creators discovered across multiple queries into a single normalized identity. Profile URLs are strictly validated; unverified profiles display as *"Profile unavailable"* rather than fabricating links.
5. **Snapshot Persistence & Freshness**: Records immutable point-in-time metrics (`kol_candidate_snapshots`) and evaluates data freshness (`Fresh`, `Aging`, `Stale`, `Unknown`).
6. **Semantic Matching**: Measures topical relevance between brand identity and creator content in a shared multilingual vector space (excluding numerical metrics to prevent popularity bias).
7. **Multi-Factor Ranking**: Ranks candidates using an audited formula balancing semantic relevance (45%), engagement quality (25%), local content signals (15%), brand safety (10%), and data completeness (5%).
8. **Transparent Review**: Delivers ranked recommendation cards with granular point contributions, deterministic rationale ("Why this KOL?"), caution notices, provenance badges (`OBSERVED`, `DERIVED`, `INFERRED`, `ESTIMATED / PROXY`), and direct links to public TikTok profiles.

---

## 3. How It Works

### 3.1 Brand Analysis

The brand profiling service synthesizes public website HTML and Facebook page context into a structured `BrandProfile`:

* **Industry / Category**: Identified vertical (e.g., *Natural Beauty & Herbal Personal Care*).
* **Products & Services**: Observed product offerings (e.g., *Butterfly Pea Shampoo*, *Aloe Vera Gel*).
* **Target Audience**: Customer personas derived conservatively from observable product benefits.
* **Content Themes & Brand Tone**: Dominant messaging angles and communication styles.
* **Keywords & Location Signals**: Thai and English keywords alongside explicit Thailand geographical cues.
* **Evidence & Provenance Tracking**: Every extracted attribute is linked to an `EvidenceItem` with source attribution and an explicit nature classification:
  * `OBSERVED`: Direct verbatim quote from the source channel.
  * `INFERRED`: Derived pattern synthesized from multiple observed signals.
  * `ESTIMATED`: Statistical proxy or numerical heuristic.

The system uses a deterministic rule-based profiler as its default baseline, with optional local LLM profiling (via Ollama) and automatic fallback.

### 3.2 Live TikTok Creator Discovery & Snapshots

Candidate discovery translates brand identity into live creator search operations:

* **Query Formulation**: `generate_structured_search_queries` derives prioritized, deduplicated Thai and English search terms (e.g., `แชมพูสมุนไพร`, `ผมร่วง`, `รีวิวดูแลเส้นผม`, `organic skincare thailand`), with origin tracking (`brand keyword + product concept`) and configurable caps (`TIKTOK_MAX_QUERIES=5`).
* **Legitimate Third-Party Provider Strategy**:
  * **Live Mode (`DEMO_MODE=false`)**: Invokes legitimate public scrapers on Apify (`clockworks/tiktok-scraper` and `apify/facebook-pages-scraper`).
  * **Bounded Retries & Error Handling**: Implements exponential backoff (up to 3 attempts with 1.5x backoff), detects HTTP 429 rate limits, and cleanly maps network timeouts without crashing.
  * **No Silent Fallback**: If `DEMO_MODE=false` and `APIFY_API_TOKEN` is unset, the system raises a clear `ProviderConfigurationError` (HTTP 503) explaining provider misconfiguration rather than silently faking live results with demo fixtures.
  * **Demo Mode (`DEMO_MODE=true`)**: Uses curated offline fixtures (`sample_kols.json`) for deterministic unit tests and offline evaluation.
* **Creator Identity & Deduplication**: Discovered creators across multiple search queries are deduplicated into a single unified record keyed by normalized username (`@handle`), preserving the list of originating queries.
* **Profile URL Verification**: URLs are strictly checked against canonical hostname and profile patterns. If unverified by provider data, the profile displays as *"Profile unavailable"* rather than fabricating clickable links.
* **Point-in-Time Snapshot Model**: Rather than overwriting historical numbers, each discovery run persists an immutable point-in-time snapshot (`KOLCandidateSnapshotModel`) capturing follower counts, sample video counts, aggregated views, likes, comments, shares, saves, and estimated engagement rates.
* **Data Freshness State**: Every external record maintains an explicit `collected_at` timestamp. Freshness is evaluated dynamically against configurable thresholds:
  * `Fresh`: Collected within $\le 6$ hours (`DATA_FRESHNESS_PROFILE_HOURS`).
  * `Aging`: Collected between $6$ and $18$ hours.
  * `Stale`: Collected $> 18$ hours ago.
  * `Unknown`: Timestamp missing or unparseable.
* **Estimated Engagement Rate ($\text{ER}$)**:
  $$\text{ER} = \frac{\overline{\text{likes}} + \overline{\text{comments}} + \overline{\text{shares}}}{\max(\text{followers}, 1)}$$
* **Thailand Locality Cues**: Captions and hashtags are scanned for Thai Unicode character ratio, explicit Thailand location mentions (Bangkok, Chiang Mai, Khaokho, Phuket, etc.), and local hashtags to produce a `local_signal_score`.

### 3.3 Semantic Matching

Relevance is evaluated in vector space rather than via exact keyword overlap:

* **Embedding Model**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384-dimensional dense vectors).
* **Multilingual Alignment**: Maps Thai and English vocabulary into a shared continuous geometric space without machine translation dependencies.
* **Brand Text Representation**: Structured synthesis of brand name, industry, products, audience, content themes, tone, keywords, location cues, and summary.
* **Creator Text Representation**: Structured synthesis of creator display name, handle, biography, top sampled video captions (up to 5), hashtags (up to 15), matched search queries, and local mentions.
* **Metric Exclusion Guardrail**: Creator embedding text **strictly excludes** numerical performance metrics (follower counts, views, likes, and engagement rates) to ensure semantic matching reflects content topic alignment rather than account popularity.
* **Similarity & Transformation Formula**:
  Raw cosine similarity $\cos(\mathbf{u}, \mathbf{v}) \in [-1.0, 1.0]$ is converted into a 0.0–100.0 Semantic Relevance Score:
  $$\text{Score}_{\text{semantic}} = \text{round}\left(\frac{\cos(\mathbf{u}, \mathbf{v}) + 1.0}{2.0} \times 100.0,\ 1\right)$$

### 3.4 Multi-Factor Scoring

Recommendations are ranked using an audited, configurable composite formula (`config/scoring.yaml`):

$$\text{Final Score} = \text{round}(0.45 \cdot S_{\text{semantic}} + 0.25 \cdot S_{\text{engagement}} + 0.15 \cdot S_{\text{local}} + 0.10 \cdot S_{\text{safety}} + 0.05 \cdot S_{\text{data}},\ 1)$$

| Factor | Weight | Evaluation Method |
|---|---:|---|
| **Semantic Relevance** | **45%** | Cosine similarity between brand profile and creator content embeddings ($0.0 - 100.0$) |
| **Engagement Quality** | **25%** | Pool-relative percentiles: 70% Estimated Engagement Rate percentile + 30% Reach Efficiency percentile ($\text{views} / \text{followers}$) |
| **Local Content Relevance** | **15%** | Thai character ratio (50%), geographic keywords (25%), regional hashtags (15%), and explicit city/province mentions (10%) |
| **Brand Safety** | **10%** | Content-level keyword screening against explicit adult content, illegal drugs/gambling, graphic violence, and harassment |
| **Data Quality** | **5%** | Profile completeness across 8 observable attributes (bio, followers, metrics, sample videos, captions, hashtags, links) |

### 3.5 Explainable Recommendations

Each recommendation provides full decision transparency:

* **Score Breakdown Grid**: Shows the raw score, configured weight, and exact point contribution for all five factors (e.g., `+39.78` pts semantic, `+20.30` pts engagement).
* **Deterministic Rationale ("Why this KOL?")**: Rule-based positive reasons derived from explicit thresholds (e.g., *Strong semantic overlap with clean beauty themes*; *Top-quartile engagement rate (6.4%)*).
* **Caution Flags**: Contextual notices when sample view counts are low, metrics are missing, or brand safety keywords require manual agency review.
* **Thematic Overlap Tags**: Explicit keywords and topics shared between the brand and creator content.

---

## 4. Responsible Data Interpretation

> [!IMPORTANT]
> **Data Boundaries & Ethical Safeguards**
>
> * **Public Data Only**: The system operates exclusively on publicly accessible web pages and public social media posts. No private accounts, direct messages, or non-public personal information are ingested.
> * **Point-in-Time Snapshots**: Public video metrics reflect a point-in-time snapshot and do not account for live streams or ephemeral stories.
> * **Zero Demographic Fabrication**: ThaiKOL AI **does not** fabricate unverifiable follower demographics (such as age, gender, household income, or location distributions) that cannot be retrieved from public APIs.
> * **Audience Fit Proxy Is Informational**: The `Audience Fit Proxy` is derived strictly from observable public signals (Thai language character ratio, regional location mentions, and content keywords). It is **not** verified audience data and carries **0% weight in the Final Score**.
> * **Brand Safety Scope**: Brand safety flags represent automated keyword screening of public text for commercial campaign suitability. They are **not** moral judgments of creators as individuals.
> * **Curated Demo Fixtures**: In demo mode, accounts are labeled with `is_demo_fixture: true` and unverified profile status to distinguish test benchmarks from live platform records.

---

## 5. Key Features

| Feature | Description |
|---|---|
| **Mobile-First Experience** | Responsive 390px iPhone layout with swipeable creator portrait deck (`snap-x`), mobile bottom nav, and 44px+ touch targets |
| **Image-Rich Discovery** | Full-bleed creator portraits, authentic Apify avatars, designated sample portraits (`รูปตัวอย่างจำลอง`), and vertical video thumbnails |
| **Resilient Media Fallback** | Automatic `onError` graceful degradation to brand-styled initial avatars with verified TikTok badges |
| **Dual-Source Brand Profiling** | Extracts industry, products, audience, and tone from website HTML and Facebook page data |
| **Evidence & Provenance Audit** | Tags extracted brand facts as `OBSERVED`, `INFERRED`, or `ESTIMATED` with source URLs |
| **Autonomous Query Generation** | Produces targeted Thai and English search keywords from brand characteristics |
| **TikTok Candidate Discovery** | Ingests public video metadata, deduplicates by handle, and aggregates author metrics |
| **Multilingual Vector Matching** | Evaluates semantic relevance using 384-dimensional dense sentence embeddings |
| **Audited Multi-Factor Scoring** | Combines semantic, engagement, locality, safety, and data completeness signals |
| **Explainable Recommendations** | Collapsible "Why this KOL?" panels with point contributions, reasons, and caution flags |
| **Creator Detail Drawer** | Deep dive into sample video captions, engagement distribution, and content tags |
| **Side-by-Side Comparison** | Direct multi-creator comparison across scores, metrics, and risk levels |
| **Shortlist & Export** | Campaign candidate shortlisting with one-click summary clipboard copy and CSV export |
| **Interactive Weight Tuner** | Dynamic UI controls to adjust scoring weights with instant client-side recalculation |
| **Zero-Fail Demo Mode** | Offline operation using the Khaokho Talaypu benchmark fixture with zero API keys |
| **Security & SSRF Defense** | URL scheme enforcement, DNS resolution checks, and private/loopback IP blocking |
| **Provider Abstraction** | Decoupled interfaces supporting mock fixtures and live Apify scraping actors |

---

## 6. Product Walkthrough & Mobile Experience

The application is architected mobile-first for rapid on-the-go influencer evaluation on iOS/Android smartphones, while adapting cleanly to desktop displays:

1. **Mobile Homepage & Top Matches Carousel**:
   - **Active Brand Context**: Highlights active brand identity (`เขาค้อทะเลภู`), product verticals, fast brand switcher, and category pills.
   - **Horizontal Portrait Deck (`snap-x`)**: Marketers swipe through top-matched creators featuring high-res vertical portrait cards, `#1 Top Match` rank badges, frosted-glass Fit Score pills (`96.4 Fit`), follower metrics, and instant detail drawer CTAs.
   - **Ranked Creator Feed**: Lists prioritized candidates with 9:16 vertical video thumbnails, views overlays, content tags, and shortlist bookmarks.
2. **Brand Analysis & Evidence Audit**: Enter a client website URL and Facebook page URL. The engine extracts the brand profile, displays the provenance-backed evidence table, and suggests generated TikTok search queries.
3. **Creator Discovery & Sandboxes**: Review discovered TikTok creator candidates, inspect aggregated metrics (average views, likes, shares, estimated engagement rate), and test queries in dedicated exploration sandboxes.
4. **Ranked Recommendations & Weight Tuning**: Explore ranked creators with composite scores. Adjust factor weight sliders in the interactive tuner to align recommendations with specific campaign priorities.
5. **Creator Deep Dive & Comparison**: Open the creator drawer to inspect sample video clips, compare shortlisted creators side-by-side, and export candidates to CSV.

---

## 7. Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Uvicorn |
| **AI / NLP** | `sentence-transformers` (`paraphrase-multilingual-MiniLM-L12-v2`), PyTorch, scikit-learn, optional Ollama (`qwen2.5-coder:7b`) |
| **Data Ingestion** | HTTPX, BeautifulSoup4 (web extraction), Apify Client (public TikTok and Facebook actors) |
| **Database & Cache** | PostgreSQL 16 (optional in demo, configured via Docker Compose), in-memory TTL cache |
| **Infrastructure** | Docker, Docker Compose |
| **Testing** | pytest, pytest-asyncio, TypeScript (`tsc`), Vite build |

---

## 8. System Architecture

```mermaid
graph TB
    subgraph Client Layer
        UI[React 18 + Vite SPA]
    end

    subgraph API & Routing Layer
        API[FastAPI REST API]
        CORS[CORS & Input Validation]
    end

    subgraph Service Layer
        BP[Brand Profiler & Corpus Builder]
        QG[Query Generator]
        TD[TikTok Discovery & Signal Aggregator]
        EM[SentenceTransformers Embedding Service]
        SM[Semantic Matcher]
        ES[Engagement Percentile Scorer]
        BS[Brand Safety Service]
        DQ[Data Quality Service]
        AF[Audience Fit Proxy Service]
        EXP[Explainability Service]
        SC[Multi-Factor KOL Scorer]
    end

    subgraph Provider & External Layer
        WP[Website Provider / SSRF Guard]
        FP[Facebook Provider: Mock / Apify]
        TP[TikTok Provider: Mock / Apify]
        HF[Local HuggingFace Model]
        DB[(PostgreSQL 16)]
    end

    UI --> API
    API --> CORS
    CORS --> BP & QG & TD & SM & SC
    BP --> WP & FP
    TD --> TP
    SM --> EM --> HF
    SC --> SM & ES & BS & DQ & AF & EXP
    API -.-> DB
```

* **Client Layer**: Single-page application built with React and Tailwind CSS featuring interactive score breakdown grids, drawer modals, and client-side weight tuning.
* **API Layer**: FastAPI endpoints enforcing strict Pydantic v2 data validation and structured JSON error responses.
* **Service Layer**: Decoupled domain services handling text representation, vector embeddings, statistical percentile ranking, keyword safety screening, and deterministic explainability.
* **Provider Layer**: Pluggable provider architecture allowing instant toggling between offline demo fixtures and live external scrapers.

---

## 9. Live Data vs. Demo Mode

ThaiKOL AI defaults to **LIVE MODE** (`DEMO_MODE=false`) for production and real-world evaluation, while preserving a deterministic, zero-fail **DEMO MODE** (`DEMO_MODE=true`) for automated tests, CI, and offline development.

```mermaid
graph TD
    User([User Request]) --> CheckMode{DEMO_MODE?}
    CheckMode -- "false (LIVE DEFAULT)" --> CheckToken{APIFY_API_TOKEN configured?}
    CheckToken -- "Yes" --> LiveApify[Apify TikTok & Facebook Scrapers]
    CheckToken -- "No" --> UnconfiguredErr[HTTP 503 ProviderConfigurationError<br/>No Silent Fallback]
    CheckMode -- "true (DEMO MODE)" --> MockFixtures[Curated Fixtures: sample_brands.json & sample_kols.json]
```

### Critical "No Silent Fallback" Principle
* When running in Live Mode (`DEMO_MODE=false`), the system **never silently falls back** to mock fixtures if external scrapers fail or credentials are unset. Instead, it returns an explicit `ProviderConfigurationError` (HTTP 503) or `ProviderRateLimitError` so users and engineers always know exactly what data they are looking at.
* In Demo Mode (`DEMO_MODE=true`), all candidate creators and brand profiles are clearly labeled with `is_demo_fixture: true` and `provenance: "demo_fixture"`.

### Data Provenance Taxonomy
Every metric and attribute exposed in the UI and API carries an audited data nature:
* `OBSERVED`: Raw public platform metrics (follower count, video views, likes, comments, shares, verified URLs).
* `DERIVED`: Computed analytical metrics (estimated engagement rate, reach efficiency, local content signal score).
* `INFERRED`: Synthesized topical alignments (brand industry, target customer personas, content themes).
* `ESTIMATED / PROXY`: Informational indicators outside scoring (e.g. `Audience Fit Proxy`, which carries **0% weight** in Final Score).
* `DEMO`: Offline fixture data used for deterministic benchmarks.

### Provider Health & Telemetry
A dedicated provider health check endpoint allows instant verification of provider readiness without leaking credentials:
* **Endpoint**: `GET /health/providers` and `GET /api/v1/health/providers`
* **Response**: Reports real-time status (`configured`, `unconfigured`, `mock`, `error`) for Website, TikTok, and Facebook extractors.

---

## 10. Asynchronous Matching Job Pipeline

For production workloads involving external scraping actors that may take 15–45 seconds, ThaiKOL AI provides an asynchronous background job pipeline:

* **Enqueue Run**: `POST /api/v1/matching/runs` (Accepts `website_url`, `facebook_page_url`, `weights`, `limit`; returns `202 Accepted` with `run_id`).
* **Poll Progress**: `GET /api/v1/matching/runs/{run_id}` (Returns progress percentage and current stage: `queued` → `brand_analysis` → `query_generation` → `tiktok_discovery` → `normalization` → `enrichment` → `embedding` → `scoring` → `completed`).
* **Fetch Results**: `GET /api/v1/matching/runs/{run_id}/results` (Returns full recommendation payload once status is `completed`).
* **List Runs**: `GET /api/v1/matching/runs` (Audit log of recent runs).

*(Synchronous endpoints like `POST /api/v1/matching/recommend-from-brand` remain fully functional for lightweight or demo runs).*

---

## 11. Quick Start

### Prerequisites

* **Python 3.12+**
* **Node.js 18+** and **npm**
* **Docker & Docker Compose** (optional, for containerized run)

### Option 1: Local Development

#### 1. Backend

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start FastAPI server on port 8000
uvicorn main:app --reload --port 8000
```

* **Swagger API Documentation**: `http://localhost:8000/docs`
* **Health Check**: `http://localhost:8000/health`
* **Provider Health Telemetry**: `http://localhost:8000/health/providers`

#### 2. Frontend

```bash
cd frontend
npm install

# Start Vite development server on port 5173
npm run dev
```

* **Web Application**: `http://localhost:5173`

---

### Option 2: Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:8000`
* **PostgreSQL**: `localhost:5432`

---

### Environment Variables

Configuration is managed via environment variables (`.env`):

| Variable | Description | Default | Behavior |
|---|---|---|---|
| `DEMO_MODE` | Live vs. Demo Mode toggle | `false` | When `false` (default), discovers real creators via Apify. When `true`, uses offline fixtures |
| `APIFY_API_TOKEN` | Apify API token for live scraping | `""` | Required for LIVE TikTok discovery and Facebook extraction |
| `APIFY_TIKTOK_ACTOR_ID` | Apify actor for TikTok discovery | `clockworks/tiktok-scraper` | Target Apify actor slug |
| `APIFY_FACEBOOK_ACTOR_ID` | Apify actor for Facebook extraction | `apify/facebook-pages-scraper` | Target Apify actor slug |
| `TIKTOK_MAX_QUERIES` | Max search queries per run | `5` | Controls API cost and query diversity |
| `TIKTOK_MAX_RESULTS_PER_QUERY` | Max raw results per query | `20` | Caps discovery sample per query |
| `TIKTOK_MAX_CANDIDATES` | Max aggregated candidate pool | `50` | Pool size sent to semantic matching |
| `TIKTOK_RETRY_ATTEMPTS` | External API retry attempts | `3` | Bounded retries with exponential backoff |
| `TIKTOK_RETRY_BACKOFF_BASE` | Retry multiplier | `1.5` | Exponential backoff growth factor |
| `DATA_FRESHNESS_PROFILE_HOURS` | Profile freshness threshold | `6` | Hours before profile is considered Aging |
| `DATA_FRESHNESS_VIDEO_HOURS` | Video freshness threshold | `24` | Hours before video metrics are considered Aging |
| `DATA_FRESHNESS_BRAND_HOURS` | Brand freshness threshold | `24` | Hours before brand analysis is considered Aging |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg2://...` | Database connection string for persistence |
| `EMBEDDING_MODEL_NAME` | SentenceTransformer model | `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | Hugging Face model identifier |
| `OLLAMA_BASE_URL` | Optional local Ollama endpoint | `http://localhost:11434` | Used for optional LLM brand profiling when live |

---

## 12. Manual Live Testing Guide

Follow this step-by-step verification protocol to validate Live Mode with real provider credentials:

1. **Configure Credentials**: In `.env`, ensure `DEMO_MODE=false` and provide your real `APIFY_API_TOKEN=apify_api_...`.
2. **Start Backend & Frontend**: Launch both servers locally.
3. **Verify Provider Health**: Open `http://localhost:8000/health/providers` in your browser. Verify that `tiktok.status` is `"configured"` and `mode` is `"live"`.
4. **Inspect Topbar Badge**: Open `http://localhost:5173`. The topbar displays a green badge: `LIVE DATA (Apify Connected)`.
5. **Run Live Brand Analysis**:
   * Navigate to Brand Analysis. Enter a real brand website URL (e.g., `https://khaokhotalaypu.com`).
   * Optionally enter a real Facebook page URL.
   * Click **"Analyze Brand & Match Creators"**.
6. **Observe Real Live Progress**:
   * Watch the asynchronous progress stages: *Brand Analysis (15%)* → *Query Generation (30%)* → *TikTok Discovery (50%)* → *Normalization (65%)* → *Enrichment (75%)* → *Embedding (85%)* → *Scoring (95%)* → *Completed (100%)*.
7. **Verify Real Creator Candidates**:
   * Ensure candidates originate from real TikTok search results matching brand queries.
   * Verify that creators found across multiple queries are merged into single unified profiles.
   * Check creator profile links: canonical URLs are verified by provider data; unverified profiles display *"Profile unavailable"*.
   * Check provenance chips: `OBSERVED` on raw counts, `DERIVED` on engagement rates, `INFERRED` on brand topics.
   * Check data freshness: Green `"Fresh"` indicator displaying collection age (`"Collected 2 minutes ago"`).
8. **Test Provider Error Handling (No Silent Fallback)**:
   * Temporarily clear `APIFY_API_TOKEN` in `.env` and restart the backend.
   * Attempt discovery: Verify the application returns a clear, actionable error: *"TikTok live data provider is not configured. Set APIFY_API_TOKEN in environment or enable DEMO_MODE=true for offline testing."*
   * Verify that no fake or demo data was silently substituted.

---

## 13. Testing

The project includes an automated test suite verifying business logic, scoring formulas, API endpoints, security controls, live provider adapters, snapshot models, freshness calculations, and async job workflows:

```bash
# Backend pytest suite
cd backend
source .venv/bin/activate
pytest -v
```

* **Backend Test Suite**: **117 tests passing** across 33 test suites (covering live provider adapters, rate-limit retries, unconfigured provider handling, snapshot persistence, freshness calculations, async job execution, brand profiling, cosine similarity, creator deduplication, engagement percentiles, brand safety, data quality, explainability, API routes, and SSRF security controls).
* **Test Isolation**: All automated tests run **100% offline** without calling external Apify endpoints or consuming actor credits (verified via automatic monkeypatched fixtures in `conftest.py`).

```bash
# Frontend TypeScript check and production build
cd frontend
npm run build
```

* **Frontend Build**: Verified production bundle compilation via `tsc && vite build` with **0 type errors**.

---

## 14. Security & Reliability

The application implements defensive engineering practices across its ingestion and processing layers:

* **URL Validation**: Strict scheme enforcement allowing only `http` and `https` protocols.
* **SSRF Protection & Private IP Blocking**: The URL validator resolves domain names via DNS and blocks requests targeting loopback addresses (`127.0.0.1`, `::1`), private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), Docker internals, and cloud metadata services (`metadata.google.internal`).
* **Redirect Safety Checks**: Verifies that HTTP redirect chains do not bounce to forbidden internal IP ranges.
* **Download Size Limits**: Limits HTTP response downloads to 2 MB to prevent memory exhaustion denial-of-service attacks.
* **Text Length Truncation**: Caps extracted HTML text at 15,000 characters to prevent memory and token explosion during profiling.
* **Request Timeouts**: Enforces a 10.0-second timeout on website extractions and a 60.0-second timeout on discovery operations.
* **Input Validation**: Uses strict Pydantic v2 schemas across all API endpoints with automatic rejection of malformed payloads.
* **Graceful Fallbacks**: Automatically falls back to rule-based profiling if an optional local LLM is unreachable, and redistributes engagement weights if specific follower counts are absent.

---

## 15. Limitations

* **Public Data Snapshots**: Ingestion captures point-in-time public videos and captions; it does not capture temporary stories or private live streams.
* **Text-Based Brand Safety**: Content screening evaluates video captions, bios, and hashtags; it does not perform computer vision scanning of raw video pixel frames or audio transcripts.
* **No Private Sales / Conversion Data**: Evaluates public engagement and content alignment, not private brand sales, voucher redemptions, or affiliate revenue.
* **Demographic Approximation**: Public APIs do not provide verified follower age, gender, or income; the system uses content-based proxies rather than claiming verified demographics.
* **Scraper Provider Dependency**: Live discovery relies on external scraping actors (Apify) whose availability depends on platform anti-scraping policies.
* **Static HTML Ingestion**: The default web extractor parses server-rendered HTML and OpenGraph metadata; client-side JavaScript-rendered SPAs may yield limited content without a headless browser.

---

## 16. Future Improvements

* **Official Creator Marketplace API**: Integrate certified TikTok Creator Marketplace APIs to access officially sanctioned metrics and authorized creator data.
* **Multimodal Embeddings**: Incorporate visual video frame embeddings (CLIP/SigLIP) and audio transcripts (Whisper) for holistic video understanding.
* **Vector Database Scaling**: Integrate pgvector or Qdrant for sub-millisecond similarity search across candidate pools of 100,000+ creators.
* **Verified Audience Insights**: Incorporate verified audience composition metrics where platform APIs and creator OAuth consent permit.
* **Campaign Performance Feedback Loop**: Connect post-campaign metrics (click-through rate, conversions, brand lift) to refine scoring weights via reinforcement.
* **Historical Velocity Tracking**: Monitor creator follower growth and engagement rate trends over 30-, 60-, and 90-day intervals.

---

## 17. Assessment Coverage

This project was built to address the technical and business requirements of the **Convert Cake AI Engineer Assessment**:

| Assessment Requirement | ThaiKOL AI Implementation | Implementation Details |
|---|---|---|
| **Analyze Client Website & Facebook** | Automated dual-source extraction with HTML parsing, metadata scraping, and social post ingestion | `ProductionWebsiteProvider`, `FacebookProvider`, `CorpusBuilder` (`POST /api/v1/brands/analyze`) |
| **Understand Brand Identity, Products & Tone** | Structured brand profiler extracting category, offerings, tone, and keywords with provenance tracking | `BrandProfile`, `EvidenceItem` (`OBSERVED`, `INFERRED`, `ESTIMATED`), `RuleBasedBrandProfiler` |
| **Identify Relevant Thai TikTok Creators** | Autonomous keyword query generation and candidate ingestion with author deduplication | `generate_kol_search_queries`, `TikTokDiscoveryService`, `MockTikTokProvider` / `ApifyTikTokProvider` |
| **Evaluate Relevance (AI Matching)** | Multilingual dense vector embeddings comparing brand profile against creator content in shared vector space | `SentenceTransformers` (`paraphrase-multilingual-MiniLM-L12-v2`), cosine similarity, `SemanticKOLMatcher` |
| **Evaluate Engagement Metrics** | Pool-relative percentile ranking combining engagement rate percentile and reach efficiency | `calculate_pool_engagement_scores` in `engagement_scorer.py` |
| **Audience & Local Fit Signals** | Thailand locality scoring (Thai script ratio, location keywords, regional hashtags) and informational audience proxy | `tiktok_signals.py`, `AudienceFitProxy` (strictly informational, 0% weight in final score) |
| **Brand Safety Screening** | Content-level keyword screening against explicit, illegal, gambling, and violent language | `brand_safety_service.py`, `brand_safety.yaml` |
| **Rank Potential Influencers** | Audited, configurable 5-factor weighted scoring formula | `MultiFactorKOLScorer`, `scoring.yaml` (45% Semantic, 25% Engagement, 15% Local, 10% Safety, 5% Data) |
| **Display Public Profile Information** | Structured creator profiles with verified profile links (`https://www.tiktok.com/@username`) and performance stats | `KOLRecommendation`, `TikTokProfileCTA.tsx`, `CreatorDetailDrawer.tsx` |
| **Explainable Recommendations** | Granular point contribution breakdown, deterministic rationale ("Why this KOL?"), and caution notices | `ScoreBreakdown`, `explanation_service.py`, `WhyThisCreator.tsx` |
| **Ethical & Privacy Considerations** | Strict anti-fabrication stance on demographics, public-data boundary, and SSRF security controls | `security.py`, `ethics.md`, `external_data_sources.md` |
| **Working Prototype** | Decoupled full-stack monorepo with React frontend, FastAPI backend, Docker setup, and 117 passing tests | Verified end-to-end workflow with Khaokho Talaypu benchmark |

---

## 18. Project Structure

```
thaikol-ai/
├── backend/
│   ├── alembic/                # Database migrations (KOL snapshots, matching runs, freshness)
│   ├── api/v1/endpoints/       # REST API endpoints (brands, tiktok, matching, health)
│   ├── config/                 # Declarative YAML configurations (scoring, brand safety, data quality)
│   ├── core/                   # Application settings, database session, structured logging
│   ├── models/                 # SQLAlchemy 2.0 ORM models (Brand, TikTokCandidate, Snapshots, Runs)
│   ├── schemas/                # Strict Pydantic v2 data validation schemas (with avatar_url & thumbnails)
│   ├── services/               # Business logic, embedding matcher, scoring, providers, and security
│   │   ├── website_provider.py         # Web extraction with SSRF and size defenses
│   │   ├── facebook_provider.py        # Facebook extraction (Mock & Apify)
│   │   ├── tiktok_provider.py          # TikTok candidate ingestion (Mock & Apify)
│   │   ├── embedding_service.py        # SentenceTransformers MiniLM local model
│   │   ├── semantic_matcher.py         # Cosine similarity and text representation
│   │   ├── engagement_scorer.py        # Pool-relative engagement percentiles
│   │   ├── brand_safety_service.py     # Content-level keyword screening
│   │   ├── audience_fit_service.py     # Informational audience fit proxy
│   │   ├── explainability_service.py   # Deterministic rationale and cautions
│   │   ├── matching_run_manager.py     # Asynchronous background job engine
│   │   ├── freshness.py                # Data freshness state evaluator
│   │   └── kol_scorer.py               # 5-factor weighted recommendation engine
│   └── tests/                  # 117 automated unit, integration, and E2E regression tests
├── frontend/
│   ├── public/                 # Static assets, favicon, and PWA manifest.json
│   ├── src/
│   │   ├── components/         # Modular UI components (KOL cards, score breakdown, comparison)
│   │   │   ├── brand/          # Evidence drawer, brand search strategy
│   │   │   ├── kol/            # CreatorCard, MobileCreatorCard, CreatorDetailDrawer, Deck
│   │   │   └── layout/         # AppShell, Topbar, Sidebar, MobileBottomNav
│   │   ├── lib/                # API client, creatorMedia (avatars & covers), format helpers
│   │   ├── pages/              # View pages (Dashboard, BrandAnalysis, Discovery, Recommendations)
│   │   ├── App.tsx             # Main React application shell and routing
│   │   └── index.css           # Tailwind CSS styles and design tokens
│   └── vite.config.ts          # Vite configuration with backend API proxy
├── data/
│   └── fixtures/               # Curated evaluation benchmarks (sample_brands.json, sample_kols.json)
├── docs/                       # Architectural specifications, ethics guidelines, and API references
│   └── screenshots/            # High-resolution mobile screenshots and showcase assets
├── docker-compose.yml          # Containerized multi-service deployment definition
└── README.md                   # Project documentation
```

---

## 19. Author

**Chalermsak Sinsok**  
GitHub: [@Chalermsak1](https://github.com/Chalermsak1)  
Repository: [https://github.com/Chalermsak1/Thaikol-ai](https://github.com/Chalermsak1/Thaikol-ai)

