# External Data Sources, Services & Integration Reference

ThaiKOL AI integrates multiple external data services, machine learning models, and public web interfaces to analyze brands and discover creators. This document details each external integration, its specific role, data attributes collected, operational boundaries, and official references.

---

## 1. Summary Matrix of External Services

| Service / Tool | Primary Purpose | Mode Availability | Data Collected | Official Reference / Documentation |
|---|---|---|---|---|
| **Sentence Transformers** (`paraphrase-multilingual-MiniLM-L12-v2`) | Multilingual dense vector representations for semantic matching | Live & Demo (Local Model) | Tokenized brand corpus and creator content; yields 384-dimensional dense embeddings | [HuggingFace Model Hub](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2) |
| **Apify TikTok Scraper** (`clockworks/tiktok-scraper`) | Discovers public TikTok videos and creators matching brand queries | Live Mode (requires `APIFY_API_TOKEN`); Mock fallback in Demo Mode | Public video captions, hashtags, play counts, like counts, share counts, comment counts, author handle, bio | [Apify TikTok Scraper Actor](https://apify.com/clockworks/tiktok-scraper) |
| **Apify Facebook Scraper** (`apify/facebook-pages-scraper`) | Extracts public page context and category metadata from Facebook | Live Mode (requires `APIFY_API_TOKEN`); Mock fallback in Demo Mode | Public page name, category, follower counts, about description, recent public post text | [Apify Facebook Pages Scraper](https://apify.com/apify/facebook-pages-scraper) |
| **Public Website HTML Parser** (BeautifulSoup4 + HTTP client) | Extracts client brand identity, meta tags, and products from public website | Live Mode (Direct HTTP); Curated fixture in Demo Mode | Page title, meta descriptions, OpenGraph tags, HTML headings (H1–H3), visible body text | [BeautifulSoup4 Documentation](https://www.crummy.com/software/BeautifulSoup/) |
| **Ollama Local LLM** (Optional Profiler) | Advanced zero-shot brand entity extraction from raw text corpus | Optional Enhancement (defaults to deterministic rule-based profiler) | Prompted brand corpus; outputs structured JSON profile | [Ollama Project](https://ollama.com/) |

---

## 2. Detailed Service Specifications

### A. Sentence Transformers (`paraphrase-multilingual-MiniLM-L12-v2`)
- **Role in ThaiKOL AI**: Powers the AI Semantic Relevance Matching Engine.
- **Why Chosen**:
  1. Multilingual pre-training across 50+ languages including Thai, English, and transliterated scripts.
  2. Compact 384-dimensional vector space provides optimal balance between dense semantic expressiveness and ultra-fast sub-millisecond cosine distance computation.
  3. Fully self-contained local model: runs completely on-device without incurring API latency, per-token billing, or data transmission to third-party proprietary LLM clouds.
- **Limitations**:
  - Max sequence length is 128 tokens (handled via intelligent text truncation in `text_representation.py`).
  - Does not generate text; strictly maps textual meaning into geometric vector space.

### B. Apify TikTok Scraper (`TikTokProvider`)
- **Role in ThaiKOL AI**: Ingests public video records and creator accounts matching synthesized search queries (e.g. `แชมพูสมุนไพร`, `organic skincare`).
- **Data Attributes Collected**:
  - Author handle (`uniqueId`), author display name (`nickname`), avatar URL, profile bio.
  - Video play count (`diggCount`), view count (`playCount`), comment count, share count.
  - Caption text (`desc`), recognized hashtags (`challenges`).
- **Boundaries & Safeguards**:
  - **Isolated Provider Architecture**: Wrapped in the `TikTokProvider` abstract interface. If Apify tokens are missing, or if the network is unavailable, the application immediately switches to `MockTikTokProvider` or local demo fixtures.
  - **No Private Data**: Only publicly listed videos returned by search queries are parsed. No private accounts, friends lists, or private messages are queried.
- **Limitations**:
  - Dependent on third-party actor availability and social network layout stability.
  - Point-in-time public sampling (recent 10–30 videos).

### C. Apify Facebook Scraper (`FacebookProvider`)
- **Role in ThaiKOL AI**: Captures public brand positioning, category, and community engagement cues from official brand Facebook pages.
- **Data Attributes Collected**:
  - Page name, verified status, official category (e.g. "Health & Beauty", "Cafe").
  - Public follower / like tally.
  - Public "About" overview and recent public status updates.
- **Boundaries & Safeguards**:
  - Wrapped behind `FacebookProvider` interface.
  - Completely skips closed groups or personal user profiles.
- **Limitations**:
  - Facebook public pages frequently update layout; fallback to website signals or demo fixtures prevents breaking the pipeline.

### D. Production Website Provider
- **Role in ThaiKOL AI**: Scrapes client business websites to establish foundational brand identity.
- **Data Attributes Collected**:
  - Page Title, `<meta name="description">`, `<meta property="og:description">`.
  - Content headings (`<h1>`, `<h2>`, `<h3>`), paragraph text bodies.
- **Security Protections**:
  - URL safety validator rejects private IP addresses, `localhost`, `127.0.0.1`, AWS metadata endpoints (`169.254.169.254`), and non-HTTP(S) schemes to eliminate Server-Side Request Forgery (SSRF) vulnerabilities.
  - Strict 8-second HTTP timeout and response size clamping (max 2 MB).

---

## 3. Demo Mode vs. Live Mode Behavior

| Capability | In `DEMO_MODE=true` | In `DEMO_MODE=false` (Live Mode) |
|---|---|---|
| **Website Extraction** | Loads curated Khaokho Talaypu fixture with authentic observed evidence | Direct HTTP extraction with SSRF security filtering |
| **Facebook Extraction** | Uses authentic public page fixture data | Executes Apify Facebook Page Actor via token |
| **TikTok Discovery** | Discovers curated Thai creator fixture pool with authentic video metrics | Queries Apify TikTok Actor for live public video snapshots |
| **Embeddings & Scoring** | Real local SentenceTransformer embeddings executed on fixture text | Real local SentenceTransformer embeddings executed on live text |
| **Data Provenance Badge** | Displays `DEMO DATA — Curated Benchmark Fixture` | Displays `LIVE — Public TikTok Snapshot` |
| **Network Dependency** | 100% Offline (zero internet required) | Requires internet and valid `APIFY_API_TOKEN` |
