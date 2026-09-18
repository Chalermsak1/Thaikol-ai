# ThaiKOL AI — Technical Interview Talking Points & Q&A

This reference guide provides concise, technically rigorous answers for common architectural and algorithmic questions during technical interview assessments.

---

### 1. Why embeddings instead of keyword matching?
> **Answer**: Exact keyword matching fails in social media because creators use colloquial phrases, slang, or synonym variations (e.g. *บำรุงผม*, *ผมไม่ร่วง*, *สมุนไพรสด* rather than the formal *แชมพูสมุนไพร*). Dense vector embeddings map semantic intent into continuous geometric space, enabling cosine similarity to capture conceptual alignment even when zero exact words overlap.

### 2. Why a multilingual model (`paraphrase-multilingual-MiniLM-L12-v2`)?
> **Answer**: Influencer content in Thailand is inherently multilingual: captions blend formal Thai script, English hashtags (e.g. `#cleanbeauty`, `#skincareroutine`), and transliterated brand names. `MiniLM-L12-v2` was pre-trained across 50+ languages, enabling cross-lingual vector alignment between an English website description and a Thai creator's video captions. It produces compact 384-dimensional vectors with sub-millisecond similarity calculations.

### 3. Why not fine-tune or train an LLM for ranking?
> **Answer**: Using a generative LLM for ranking introduces non-deterministic latency, token costs, hallucinated creators, and opaque reasoning. Dense embeddings paired with a deterministic, weighted mathematical scoring formula guarantee 100% reproducibility, zero hallucination, sub-second execution, and full auditability required by enterprise marketing teams.

### 4. How is engagement calculated?
> **Answer**: We calculate Estimated Engagement Rate ($\text{ER}$) across sampled public videos:
> $$\text{ER} = \frac{\overline{\text{likes}} + \overline{\text{comments}} + \overline{\text{shares}}}{\max(\text{followers}, \overline{\text{views}})} \times 100$$
> To prevent absolute scale bias (e.g. mega-influencers with millions of passive followers versus hyper-engaged micro-influencers), we evaluate engagement using relative pool percentiles (70% ER percentile, 30% reach efficiency percentile).

### 5. How are creators discovered?
> **Answer**: `generate_kol_search_queries` extracts high-signal Thai and English keywords directly from the synthesized `BrandProfile` (e.g. industry terms, key ingredients, pain points). These queries are dispatched to the `TikTokProvider` (Apify actor in live mode, mock in demo mode) to ingest public video results, which are deduplicated by normalized username handle.

### 6. What happens when data is missing?
> **Answer**: We use dynamic weight redistribution and safe fallbacks:
> - If follower count is hidden or null, `EngagementScorer` redistributes reach weight into engagement rate.
> - If website extraction fails, the pipeline continues with Facebook signals alone.
> - If external social APIs are blocked or credentials omitted, `DEMO_MODE=true` seamlessly loads curated benchmark fixtures so the application never crashes.

### 7. How do you prevent hallucination?
> **Answer**:
> 1. All candidates scored are strictly verified records from the candidate pool or database; the system never generates synthetic creator names.
> 2. The recommendation explanations (`reasons` and `cautions`) are generated via deterministic rule thresholds in `ExplainabilityService`, completely bypassing generative text models.

### 8. How do you handle brand safety?
> **Answer**: `BrandSafetyService` performs content-level keyword screening across video captions and hashtags using a configurable risk taxonomy (`config/brand_safety.yaml`) covering gambling, prohibited supplements, explicit content, and deceptive claims. Detections trigger transparent point deductions and categorize risk (`safe`, `review`, `high_risk`) with explicit disclaimers that this screens content, not human character.

### 9. How do you measure audience fit?
> **Answer**: Via `AudienceFitService`, which computes an `Audience Fit Proxy` (0–100) using observable public content signals: Thai language character ratio, Thailand geographic location mentions, and niche category hashtag alignment.

### 10. Why is audience fit only a proxy?
> **Answer**: Social platforms do not expose private follower demographics (age brackets, gender distributions, personal income) via public APIs without private creator OAuth authorization. Claiming to know follower demographics from public scraping is statistically ungrounded and dishonest. By explicitly calling it a *Proxy* and isolating it from the Final Score, we uphold strict scientific integrity.

### 11. How would you improve this system in production?
> **Answer**:
> 1. Multi-modal embeddings: Encode video thumbnail frames and audio transcripts (via Whisper) alongside caption text.
> 2. Vector indexing: Introduce pgvector or Qdrant for million-scale candidate similarity search.
> 3. Historical trend tracking: Periodic Celery workers tracking creator engagement velocity over 90 days.
> 4. Official TikTok Creator Marketplace API integration with creator OAuth permissions.

### 12. How does the architecture scale?
> **Answer**:
> - Embeddings are cached in memory using deterministic SHA-256 hashes.
> - Provider extraction jobs can be queued asynchronously via Redis/Celery.
> - Scoring is vectorized in NumPy, completing 1,000 creator evaluations in under 5 milliseconds.
> - Stateless FastAPI architecture allows horizontal scaling across multiple container replicas.

### 13. Why separate semantic relevance from performance metrics?
> **Answer**: Conflating topical relevance with follower counts creates severe popularity bias where large celebrity accounts dominate recommendations regardless of niche fit. Keeping semantic relevance strictly text-based and engagement strictly metric-based allows balanced, configurable multi-factor weighting (e.g. 45% semantic, 25% engagement).

### 14. What are the system's biggest limitations?
> **Answer**:
> 1. Point-in-time public sampling: Captures recent video snapshots, not real-time or private story feeds.
> 2. Lack of private conversion data: Cannot observe actual sales or affiliate link click-through rates.
> 3. Content screening boundaries: Text-based safety checks can miss visual-only or implicit brand risks.
