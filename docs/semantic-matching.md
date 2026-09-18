# ThaiKOL AI — Vector Embeddings & Semantic Matching Engine (Phase 3)

## 1. Purpose
Phase 3 introduces the first artificial intelligence matching layer in **ThaiKOL AI**. Its purpose is to evaluate the semantic content fit between a client's structured `BrandProfile` (derived in Phase 1) and public TikTok creators' content (ingested in Phase 2).

By mapping both brand traits and creator content into a shared dense vector space, the system measures semantic similarity objectively using cosine similarity and derives an intuitive, bounded **Semantic Relevance Score** (0.0 to 100.0).

---

## 2. Why Embeddings Are Used
Traditional keyword search (e.g. SQL `LIKE` or basic string matching) suffers from severe limitations when matching brands with creators:
- **Synonym Blindness**: A brand selling "แชมพูสมุนไพรออร์แกนิก" (organic herbal shampoo) will fail to match a creator talking about "กู้ผมร่วงด้วยธรรมชาติ" (restoring hair loss naturally) or "ผลิตภัณฑ์ดูแลหนังศีรษะ" (scalp care products).
- **Cross-Lingual Asymmetry**: Thai consumers and creators routinely mix Thai script, English brand terms, and transliterated slang in captions (e.g., `#organic`, `สกินแคร์`, `clean beauty`, `review`).
- **Context Awareness**: Keyword counters do not understand contextual intent. Dense vector embeddings encode the semantic meaning, topical neighborhood, and holistic domain context of the text.

---

## 3. Embedding Model Specification
ThaiKOL AI utilizes:

- **Model**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- **Architecture**: 12-layer multilingual MiniLM transformer trained on 50+ languages using knowledge distillation.
- **Embedding Dimension**: 384 dimensions.
- **Execution**: Runs 100% locally on CPU or Apple Silicon Metal without external API dependencies or fees.
- **Language Coverage**: Broad Thai and English coverage, capable of aligning Thai and English conceptual representations into overlapping vector manifolds.

---

## 4. Brand Text Representation (`build_brand_embedding_text`)
To ensure high-fidelity embeddings, the system transforms the validated `BrandProfile` into a deterministic, structured textual document.

### Representation Format:
```text
Brand:
Khaokho Talaypu

Industry:
Natural Beauty & Herbal Personal Care

Products:
- Herbal Shampoo
- Organic Aloe Vera Gel

Audience:
- Eco-conscious Thai consumers
- Sensitive scalp individuals

Themes:
- Natural ingredients
- Hair loss prevention
- Clean beauty

Tone:
- Nature-inspired
- Educational

Keywords:
- แชมพูสมุนไพร
- clean beauty
- organic herbs

Location:
Phetchabun, Thailand

Summary:
Pioneer Thai natural personal care brand specializing in 100% natural butterfly pea, aloe vera, and ginger shampoos.
```

### Filtering Rules:
- Internal IDs (`id`), confidence scores, and raw database timestamps are excluded.
- Empty or null fields are omitted cleanly without emitting placeholder tokens.

---

## 5. Creator Text Representation (`build_creator_embedding_text`)
Each creator's content is condensed into a bounded, deterministic text representation.

### Representation Format:
```text
Creator:
Mookda รีวิวผิวสวย (@mookda_skincare)

Bio:
รีวิวสกินแคร์กู้ผิวแพ้ง่าย | สมุนไพรไทย & ออร์แกนิก | แชร์ทริคผมหนาไม่ร่วง 🌿✨

Captions:
- กู้ผมร่วงฉบับคนแพ้ง่าย! แชมพูอัญชันสมุนไพรแท้ไม่ผสมซิลิโคน ใช้แล้วลูกผมขึ้นจริง 💜🌿 #ผมร่วง #สมุนไพร #รีวิวบิวตี้
- ใครผิวแห้งแสบแดง ต้องลองเจลว่านหางออร์แกนิกตัวนี้ ปลอบประโลมผิวดีมากกก 🍃 #กู้ผิว #ผิวแพ้ง่าย #beautyreview

Hashtags:
#ผมร่วง #สมุนไพร #รีวิวบิวตี้ #กู้ผิว #ผิวแพ้ง่าย #beautyreview

Search Topics:
แชมพูสมุนไพร, ลดผมร่วง

Local mentions:
Thailand (General)
```

> [!CRITICAL]
> **Strict Metric Exclusion Rule**:
> Numerical statistics—such as **follower counts, view counts, likes, comments, shares, and engagement rates**—are **strictly excluded** from creator embedding text. Semantic relevance measures *content and thematic fit only*. Performance weighting is reserved for Phase 4.

---

## 6. Batch Encoding Policy
Creator discovery typically evaluates dozens of creators simultaneously. Calling the embedding model sequentially for each creator individually creates substantial latency overhead.

- **Batch Size**: Controlled via `settings.EMBEDDING_BATCH_SIZE` (default 32).
- **Cache-First Interception**: The batch processor first checks `cache_service` for each normalized text. Only uncached texts are sent to the transformer model.
- **Aligned Matrix Inference**: Uncached texts are encoded in a single batched PyTorch forward pass, normalized to unit length, and cached before being returned in exact input order.

---

## 7. Cosine Similarity Formula
Cosine similarity measures the cosine of the angle between two dense vectors in $\mathbb{R}^{384}$. Because sentence-transformers embeddings are L2-normalized ($\|A\|_2 = 1$), cosine similarity corresponds directly to the inner dot product:

$$\text{cosine\_similarity}(A, B) = \frac{A \cdot B}{\|A\|_2 \|B\|_2} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}$$

### Numerical Stability Safeguards:
1. **Zero Vector Guard**: If either vector has zero magnitude ($\|A\| = 0$ or $\|B\| = 0$), the function returns `0.0` safely rather than raising a divide-by-zero error.
2. **Epsilon Clamping**: Floating-point precision inaccuracies are bounded strictly to $[-1.0, 1.0]$:
   $$\text{sim} = \max(-1.0, \min(1.0, \text{sim}))$$

---

## 8. Score Transformation to 0–100
Raw cosine similarity yields values in $[-1.0, 1.0]$. For intuitive user interpretation and downstream multi-factor weighting, raw similarity is scaled to a standard 0.0–100.0 percentage range:

$$\text{Semantic Relevance Score} = \text{round}\left(\frac{\text{cosine\_similarity} + 1.0}{2.0} \times 100.0, 1\right)$$

### Reference Calibration Table:
| Cosine Similarity | Angular Relationship | Semantic Relevance Score | Interpretation |
| :---: | :---: | :---: | :--- |
| **+1.000** | $0^\circ$ (Identical Direction) | **100.0%** | Exact semantic equivalence |
| **+0.828** | $\approx 34^\circ$ | **91.4%** | Highly aligned content (e.g. herbal shampoo vs. hair care reviews) |
| **+0.500** | $60^\circ$ | **75.0%** | Moderately related domain (e.g. herbal personal care vs. general wellness) |
| **0.000** | $90^\circ$ (Orthogonal) | **50.0%** | Uncorrelated domain (e.g. herbal shampoo vs. motorcycle racing) |
| **-1.000** | $180^\circ$ (Opposite) | **0.0%** | Diametrically opposed |

---

## 9. Deterministic Matching Topics Extraction
While vector embeddings evaluate similarity in continuous latent space, human evaluators need transparent explanations of *why* two profiles are semantically similar.

ThaiKOL AI extracts **Matching Topics** using deterministic lexical overlap:
1. Normalizes brand keywords, themes, product names, and industry strings.
2. Normalizes creator bio, captions, hashtags, and matched search queries.
3. Checks for exact word/phrase containment and common domain clusters (`ผมร่วง`, `สมุนไพร`, `แชมพู`, `สกินแคร์`, `ผิวแพ้ง่าย`, `ออร์แกนิก`, `บำรุงผม`, `ธรรมชาติ`).
4. **Zero Hallucination Guarantee**: Matching topics are never synthesized or guessed by an LLM in this phase; they reflect verified textual intersections between brand and creator content.

---

## 10. In-Memory Caching Architecture
Generating 384-dimensional embeddings incurs CPU/GPU cycles. ThaiKOL AI avoids redundant computations by hashing:

$$\text{cache\_key} = \text{"emb:"} + \text{model\_name} + \text{":"} + \text{SHA256}(\text{normalized\_text})$$

- Stored in `MemoryCacheService` (`cache_service`) with a default TTL of 3600 seconds.
- Re-running discovery or matching for unchanged brand profiles or creator captions executes in sub-millisecond time.

---

## 11. Demo Mode & Offline Execution
- Operates 100% offline when `DEMO_MODE=true`.
- Benchmark brand: Khaokho Talaypu from `data/fixtures/sample_brands.json`.
- Benchmark candidates: 11 authentic Thai creators from `data/fixtures/sample_kols.json`.
- **Anti-Fabrication Rule**: Even in demo mode, embedding vectors and cosine similarities are calculated in real time using local weights. No pre-canned or random numbers are substituted.
- Output records retain `is_demo_fixture=true` and `provenance="curated_demo_fixture"`.

---

## 12. Data Limitations
1. **Public Sample Horizon**: Creator embeddings reflect only recent sampled public video captions and bio text (typically 2–5 videos per creator). They do not represent an influencer's complete multi-year archive.
2. **Visual & Audio Absence**: Embeddings are currently derived from textual metadata (captions, hashtags, OCR/speech descriptions if available). Non-verbal video aesthetics and background music are not currently embedded.

---

## 13. Thai-Language Considerations
- **Script Characteristics**: Thai is an unspaced script (`แชมพูสมุนไพรลดผมร่วงสูตรธรรมชาติ`). The subword tokenizer in `paraphrase-multilingual-MiniLM-L12-v2` handles Thai byte-pair encoding (BPE) without requiring external dictionary-based segmenters (like PyThaiNLP) for dense retrieval.
- **Code-Switching**: Thai content creators frequently intersperse English loanwords (e.g. `hair care`, `organic`, `review`, `clean beauty`). The multilingual MiniLM model was specifically chosen for its capacity to align mixed-language syntactic patterns into cohesive latent vectors.

---

## 14. Why Semantic Relevance Is Not Final Recommendation Quality
A high Semantic Relevance Score indicates that a creator discusses topics closely aligned with the brand. However, **semantic similarity alone does not equal a good influencer recommendation**:
- A creator may have a 95% semantic match but an estimated engagement rate of 0.01% (inactive following).
- A creator may have an 88% semantic match but frequently post controversial or unsafe content.
- A creator may discuss natural living but possess only 500 followers when the brand needs mass reach.

Therefore, Semantic Relevance is the **foundational retrieval and content-fit layer**, which Phase 4 will combine with engagement metrics, audience locality fit, and brand safety into a balanced multi-factor score.

---

## 15. Ethical Considerations & Compliance
1. **No Demographic Stereotyping**: Candidates are never filtered or penalized based on assumed demographic attributes of the creator.
2. **Transparent Explainability**: Every match exposes the underlying `cosine_similarity`, `semantic_relevance_score`, and explicit `matching_topics`.
3. **No Private Scraping**: Only publicly shared video descriptions and profile bios are embedded.
