# Multi-Factor KOL Scoring & Explainable Recommendation Engine
## ThaiKOL AI — Technical Specification

---

### 1. Purpose
The Multi-Factor KOL Scoring and Recommendation Engine transforms raw content vectors and public creator signals into an interpretable, calibrated recommendation score for influencer marketing campaigns in Thailand. It bridges qualitative brand requirements with quantitative creator metrics, providing full mathematical transparency, deterministic explainability, and explicit boundary disclaimers regarding audience demographics.

---

### 2. Scoring Architecture

The recommendation pipeline evaluates creator candidates across five distinct, non-overlapping dimensions:

```
                  ┌─────────────────────────────────────────┐
                  │          Input Candidate Pool           │
                  └────────────────────┬────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│ Semantic Fit     │          │ Engagement       │          │ Local Content    │
│ (sentence-       │          │ Quality          │          │ Relevance        │
│ transformers)    │          │ (relative        │          │ (Thai language,  │
│ 45% Weight       │          │  percentiles)    │          │  cues, keywords) │
│                  │          │ 25% Weight       │          │ 15% Weight       │
└────────┬─────────┘          └────────┬─────────┘          └────────┬─────────┘
         │                             │                             │
         └───────────────────────┐     │     ┌───────────────────────┘
                                 │     │     │
                                 ▼     ▼     ▼
                      ┌─────────────────────────────────┐
                      │  Brand Safety Screening (10%)   │
                      │  (content-level keyword check)  │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │  Data Quality Score (5%)        │
                      │  (completeness percentage)      │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │ Composite Weighted Sum          │
                      │ Final Score ∈ [0.0, 100.0]      │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │ Explainability & Tie-Breaking   │
                      │ (Deterministic Reasons & Flags) │
                      └─────────────────────────────────┘
```

---

### 3. Score Weights

All weights are configured external to Python code in [`config/scoring.yaml`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/config/scoring.yaml):

| Factor | Key | Default Weight | Range | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Semantic Relevance** | `semantic_relevance` | **0.45** (45%) | $[0.0, 1.0]$ | Primary determinant of brand-creator alignment |
| **Engagement Quality** | `engagement_quality` | **0.25** (25%) | $[0.0, 1.0]$ | Assesses interaction depth relative to pool peers |
| **Local Content Fit** | `local_content_relevance`| **0.15** (15%) | $[0.0, 1.0]$ | Ensures relevance to Thai domestic consumers |
| **Brand Safety** | `brand_safety` | **0.10** (10%) | $[0.0, 1.0]$ | Screens for public controversy / campaign risk |
| **Data Quality** | `data_quality` | **0.05** (5%) | $[0.0, 1.0]$ | Rewards profile completeness without metric bias |

**Validation Rule:**
$$\sum_{i=1}^5 w_i = 0.45 + 0.25 + 0.15 + 0.10 + 0.05 = 1.00$$
Weights are validated dynamically on service initialization. Any set of custom weights that does not sum to $1.00 \pm 0.0001$ is rejected with HTTP 422.

---

### 4. Semantic Relevance (Phase 3 Integration)

Semantic relevance evaluates the conceptual similarity between the client's `BrandProfile` and the creator candidate's public content:
- **Model**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384 dimensions).
- **Text Representations**:
  - `build_brand_embedding_text(brand_profile)`
  - `build_creator_embedding_text(candidate)` — strictly excluding metrics.
- **Formulation**:
  $$S_{\text{semantic}} = \text{clamp}\left(\text{round}\left(\frac{S_C(u, v) + 1.0}{2.0} \times 100.0, 1\right), 0.0, 100.0\right)$$
- Embeddings are computed lazily, cached by SHA-256 hash in memory, and never recalculated during recommendation scoring.

---

### 5. Engagement Quality

Unlike naive systems that rank creators purely by gross follower counts, ThaiKOL AI calculates engagement **relative to the candidate pool**:

#### Sub-Signals
1. **Estimated Engagement Rate Percentile** ($w_{\text{er}} = 0.70$):
   $$\text{ER} = \frac{\text{average\_likes} + \text{average\_comments} + \text{average\_shares}}{\max(\text{follower\_count}, 1)}$$
   Evaluated as empirical percentile rank across the candidate pool:
   $$\text{Pct}_{\text{ER}} = \frac{\text{count}(\text{ER}_j < \text{ER}_i) + 0.5 \cdot \text{count}(\text{ER}_j == \text{ER}_i)}{N} \times 100$$
2. **Reach Efficiency Percentile** ($w_{\text{reach}} = 0.30$):
   $$\text{Efficiency} = \frac{\text{average\_views}}{\text{follower\_count}}$$

#### Missing Metric Handling & Redistribution
- If `follower_count` is missing, reach efficiency cannot be computed safely without fabricating numbers.
- In this scenario, the system **redistributes 100% of nominal weight** to the observed engagement rate or view count percentile.
- The missing follower count is reflected as a deduction in the **Data Quality Score** and tagged with an informative caution.
- Zero values are never silently substituted for missing fields.

---

### 6. Local Content Relevance

Reuses the Phase 2 Thailand Locality Signals:
$$S_{\text{local}} = \text{round}(\text{local\_signal\_score} \times 100.0, 1)$$

- **Components**:
  - Thai script character ratio ($0.0 - 0.50$)
  - Explicit Thailand geographic keywords ($0.0 - 0.25$)
  - Thai hashtags ($0.0 - 0.15$)
  - Province / city mentions ($0.0 - 0.10$)
- **Labeling Standard**: Labeled strictly as **"Local Content Relevance"**.
- **Disclaimer**: *"This score reflects Thailand/local content signals from public content. It is not verified audience demographic data."*

---

### 7. Audience Fit Proxy

> [!WARNING]
> **CRITICAL BOUNDARY DISCLAIMER**
> 
> **Audience Fit Proxy is NOT verified demographic data.**
> It does NOT measure or claim verified follower age brackets, gender distribution, household income, or verified follower GPS locations. Public TikTok scraping does not expose authenticated audience analytics.

> [!NOTE]
> Audience Fit Proxy is an informational supporting signal based on observable public-content cues. It is not verified audience demographic data and is not directly included in the current Final Score.

The `audience_fit_proxy` is an optional $[0.0, 100.0]$ heuristic based exclusively on observable content markers:
- **Local Content Weight (40%)**: `local_signal_score * 40.0`
- **Language Weight (30%)**: `thai_language_ratio * 30.0`
- **Topic Overlap Weight (30%)**: Lexical intersection between brand keywords/themes and creator hashtags/queries.
- If public content is completely empty, the proxy returns `null` rather than a fabricated guess.

---

### 8. Brand Safety Screening

- **Nature**: Public content-level screening mechanism for campaign suitability.
- **Default Score**: 100.0 (clean).
- **Configuration**: Defined in [`config/brand_safety.yaml`](file:///Users/chalermsak/Desktop/Project%20For%20Convert%20Cake/thaikol-ai/backend/config/brand_safety.yaml).
- **Categories**:
  - `explicit_sexual_content` (-25 pts)
  - `illegal_drugs_and_gambling` (-30 pts)
  - `violent_graphic_content` (-25 pts)
  - `hateful_harassing_language` (-20 pts)
  - `dangerous_activities` (-15 pts)
- **Risk Categorization**:
  - **`safe`**: Score $\ge 90.0$
  - **`review`**: $70.0 \le \text{Score} < 90.0$
  - **`high_risk`**: Score $< 70.0$
- **Ethical Safeguard**: Operates strictly on public caption/hashtag string matches. Never infers personal character, private life, or off-platform actions.

---

### 9. Data Quality Score

Evaluates profile completeness across 8 configurable attributes:
- `profile_url` (15%)
- `bio` (10%)
- `follower_count` (15%)
- `sample_videos` (15%)
- `sample_captions` (15%)
- `hashtags` (10%)
- `engagement_metrics` (10%)
- `local_signals` (10%)

$$S_{\text{data}} = \frac{\sum_{\text{available}} w_k}{\sum_{\text{expected}} w_k} \times 100.0$$

---

### 10. Final Scoring Formula

$$\begin{aligned}
\text{Final Score} = \text{round}\Big(
  & 0.45 \times S_{\text{semantic}} \\
+ & 0.25 \times S_{\text{engagement}} \\
+ & 0.15 \times S_{\text{local}} \\
+ & 0.10 \times S_{\text{safety}} \\
+ & 0.05 \times S_{\text{data}}, \quad 1 \Big)
\end{aligned}$$

Every component is bounded in $[0.0, 100.0]$, ensuring the final composite score is bounded in $[0.0, 100.0]$.

#### Worked Calculation Example
Given the following observed creator component scores:
- Semantic Relevance ($S_{\text{semantic}}$) = **88.4**
- Engagement Quality ($S_{\text{engagement}}$) = **81.2**
- Local Content Relevance ($S_{\text{local}}$) = **85.0**
- Brand Safety ($S_{\text{safety}}$) = **100.0**
- Data Quality ($S_{\text{data}}$) = **100.0**

The weighted contribution points and final composite score are:
$$\begin{aligned}
& 88.4 \times 0.45 = 39.78 \\
+ & 81.2 \times 0.25 = 20.30 \\
+ & 85.0 \times 0.15 = 12.75 \\
+ & 100.0 \times 0.10 = 10.00 \\
+ & 100.0 \times 0.05 = 5.00 \\
= & 39.78 + 20.30 + 12.75 + 10.00 + 5.00 = 87.83 \implies \mathbf{87.8}
\end{aligned}$$

---

### 11. Explainability Engine

Implemented deterministically in `RecommendationExplanationService` without LLM calls to ensure instant response times ($< 0.1$ms) and zero hallucinations:

| Trigger Condition | Generated Statement |
| :--- | :--- |
| $S_{\text{semantic}} \ge 85.0$ | *"Strong content relevance to the brand."* |
| $70.0 \le S_{\text{semantic}} < 85.0$ | *"Good semantic alignment with the brand's content themes."* |
| $S_{\text{semantic}} < 50.0$ | *"Lower content overlap with brand core themes."* (Caution) |
| $S_{\text{engagement}} \ge 80.0$ | *"Strong engagement compared with the current candidate pool."* |
| $S_{\text{engagement}} < 40.0$ | *"Engagement metrics are lower than median candidate pool performance."* (Caution) |
| $S_{\text{local}} \ge 80.0$ | *"Strong Thailand/local content signals."* |
| $S_{\text{safety}} < 100.0$ | *"Contains public-content signals that may require campaign review ({flags})."* (Caution) |
| $S_{\text{data}} < 70.0$ | *"Some creator metrics or profile information are incomplete."* (Caution) |
| `follower_count is None` | *"Follower count is missing; engagement is estimated from sampled video metrics."* (Caution) |

---

### 12. Ranking & Tie-Breaking

Candidates are sorted using deterministic multi-attribute lexicographical sorting:
1. `final_score DESC`
2. `semantic_relevance_score DESC`
3. `engagement_quality_score DESC`
4. `data_quality_score DESC`
5. `username ASC`

Ranks are assigned 1-indexed (`#1, #2, #3, ...`).

---

### 13. Known Limitations

1. **Relative Engagement Normalization**: Percentiles depend on the candidate pool. A creator's engagement score will be higher in a pool of low-engagement peers than in a pool of viral megastars.
2. **Public Data Sparsity**: If a creator has only 1 sample video collected, engagement metrics reflect a small sample size. This is surfaced honestly via the Data Quality Score and caution flags.
3. **Keyword Safety Screening**: Keyword-based brand safety can produce false positives (e.g. reviewing a movie with violent words). For this reason, flag items are labeled as "campaign review" rather than definitive judgments.

---

### 14. Ethical Considerations

1. **No Sensitive Personal Data**: The system processes only publicly posted TikTok video descriptions, hashtags, and public bio text.
2. **No Demographic Fabrication**: Unlike commercial influencer tools that fabricate exact audience age or gender distributions without API access, ThaiKOL AI explicitly disclaims demographic claims.
3. **Transparent Audit Trail**: Every score displays its component weights, raw scores, weighted contribution points, and evidence tags.
