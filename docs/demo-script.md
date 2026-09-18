# ThaiKOL AI — 10-Minute Video Demonstration Script

**Target Duration**: 8–10 Minutes  
**Audience**: Technical Interviewers, Lead AI Engineers, Product Stakeholders  
**Tone**: Confident, articulate, technically grounded, and candid about limitations  

---

### [0:00 – 0:45] The Problem: Why Influencer Marketing in Thailand is Broken
> *"Hello everyone! Today, I’m excited to present **ThaiKOL AI**, an intelligent, explainable TikTok influencer matching system designed specifically for the Thai market.*
>
> *Influencer marketing in Southeast Asia, particularly Thailand, is booming on TikTok. However, brand marketing teams face three major bottlenecks:*
> 1. *Manual Discovery*: Sifting through hundreds of hashtags like `#รีวิว` or `#ใช้ดีบอกต่อ` is slow, subjective, and prone to human bias.
> 2. *Keyword Fragility*: Traditional search tools rely on exact keyword matches, completely missing creators who create relevant content using natural Thai colloquialisms, slang, or visual product demos without specific branded keywords.
> 3. *The Black-Box & Fake Demographics Problem*: Many commercial agency tools produce arbitrary scores or fabricate unverifiable demographic charts. Marketers are left wondering: *Why should we invest our budget in this specific creator?*
>
> *ThaiKOL AI was engineered to solve all three issues."*

---

### [0:45 – 1:30] The Solution: What ThaiKOL AI Does
> *"ThaiKOL AI is an automated, end-to-end decision-support prototype. It requires just two inputs: a client's public website URL and their public Facebook page URL.*
>
> *From those two public signals, the system:*
> 1. *Extracts a verified brand corpus with full evidence tracking.*
> 2. *Synthesizes targeted Thai search queries to discover active TikTok creators.*
> 3. *Uses a local multilingual dense embedding model to evaluate semantic content relevance.*
> 4. *Scores each creator across five transparent, configurable factors: semantic fit, engagement quality, local Thailand content signals, brand safety, and data completeness.*
> 5. *Ranks the candidates, provides an explainable 'Why this KOL?' breakdown, and outputs direct public TikTok profile links.*
>
> *Let's see it in action!"*

---

### [1:30 – 2:15] Step 1: Business Input & Demo Mode
*(Screen shows: `MainKOLMatcherApp` with website and Facebook input fields)*

> *"Here is the main application interface. A user can type in any public website and Facebook page. To ensure zero-fail reliability during stakeholder demonstrations, we've built an authentic offline benchmark: **Khaokho Talaypu (เขาค้อทะเลภู)**, a well-known pioneer of natural herbal haircare and personal care from Phetchabun, Thailand.*
>
> *I’ll click **'Try Demo (Khaokho Talaypu)'**. Notice the input fields populate with their official website and Facebook page, and we click **'Find TikTok KOLs'**."*

---

### [2:15 – 3:00] Step 2: The Multi-Stage Pipeline & Brand Analysis
*(Screen shows: 7-stage progress indicator executing, then displays Brand Analysis card)*

> *"As the pipeline runs, you can see our 7 deterministic execution stages in real time: from website HTML parsing and Facebook signal extraction to dense vector encoding and multi-factor scoring.*
>
> *Once complete, our **Brand Analysis View** appears. The system has automatically synthesized:*
> - *The brand industry: Natural Beauty & Herbal Personal Care.*
> - *Key products: 100% natural butterfly pea shampoo, aloe vera, and ginger scalp treatments.*
> - *Target audience: Eco-conscious Thai consumers, people experiencing hair fall.*
> - *Location signals: Phetchabun and nationwide Thailand.*
>
> *If I click **'How we understood this brand'**, you can see our factual evidence audit trail. Notice how we strictly distinguish between **OBSERVED** facts—direct verbatim quotes from their website—and **INFERRED** facts. We never hallucinate unsupported claims."*

---

### [3:00 – 4:00] Step 3: Autonomous Candidate Discovery
*(Screen shows: KOL Discovery Section with generated search queries and candidate pool)*

> *"Next, the system autonomously generated targeted TikTok search queries based on the extracted brand profile:*
> - *`แชมพูสมุนไพร` (Herbal shampoo)*
> - *`อัญชัน` (Butterfly pea)*
> - *`ลดผมร่วง` (Hair fall reduction)*
> - *`clean beauty` and `organic thai herbs`.*
>
> *These queries discovered a pool of 11 creator candidates. Notice the prominent **DEMO DATA** badge: we explicitly indicate that this is a curated benchmark fixture, maintaining total transparency about data provenance."*

---

### [4:00 – 5:30] Step 4: AI Semantic Relevance Matching
*(Screen opens the 'Semantic Relevance' breakdown and explains embeddings)*

> *"Now, how do we match Khaokho Talaypu to creators who talk about natural remedies?*
>
> *Instead of fragile string matching, we use a local SentenceTransformer model: **`paraphrase-multilingual-MiniLM-L12-v2`**.*
> *We encode the brand's identity into a 384-dimensional vector space. Then, we encode each creator's public bio, recent video captions, and hashtags into the exact same space, strictly excluding performance metrics from the text to prevent popularity bias.*
>
> *By calculating the cosine similarity between the brand vector and creator vectors, we obtain a normalized **Semantic Relevance Score** from 0 to 100. Creators like `@mook_organic` and `@greenbeauty_th` receive high semantic scores because their organic lifestyle and scalp-care themes closely align with Khaokho Talaypu's natural ethos."*

---

### [5:30 – 7:00] Step 5: Multi-Factor Scoring & Ranking
*(Screen scrolls to the Ranked Recommendations cards)*

> *"A great KOL recommendation isn't just about semantic fit. A creator might talk about herbs but have abysmal engagement or post spammy content.*
>
> *That’s why ThaiKOL AI applies an audited, 5-factor weighted formula:*
> - *45% Semantic Relevance*
> - *25% Engagement Quality (pool-relative percentile of interaction rates)*
> - *15% Local Content Relevance (Thai language ratio and location signals)*
> - *10% Brand Safety (content-level keyword screening)*
> - *5% Data Completeness (profile attributes)*
>
> *Here are our Top Recommendations! Notice that our #1 ranked creator, `@mook_organic`, achieved a composite **Final Score of 87.8/100**.*
> *Beside each card, we have direct **'View TikTok'** links that open their actual public profile (`https://www.tiktok.com/@mook_organic`)."*

---

### [7:00 – 8:00] Step 6: Explainability — "Why this KOL?"
*(Screen clicks "Why this KOL?" on the #1 recommendation)*

> *"Let’s click **'Why this KOL?'**. This is where ThaiKOL AI sets itself apart from black-box recommendation tools.*
>
> *The marketing manager sees:*
> 1. *The exact mathematical contribution of each factor: Semantic (+39.78 pts), Engagement (+20.30 pts), Local Fit (+12.75 pts), Safety (+10.00 pts), and Data (+5.00 pts)—summing precisely to 87.8.*
> 2. *A deterministic **Recommendation Rationale**: High semantic affinity with clean beauty themes, top-tier interaction rate, and strong Thailand local resonance.*
> 3. *A **Caution & Campaign Review** section: If an influencer had low views or commercial review flags, it would appear right here.*
>
> *Notice also our **Audience Fit Proxy**. We prominently state that this is an informational proxy derived from public content cues—it is **not verified follower demographics**, and it does not distort the final score."*

---

### [8:00 – 9:00] Technical Architecture & Engineering Decisions
*(Screen toggles "Technical Architecture Details" and shows summary)*

> *"Under the hood, ThaiKOL AI was designed with clean software engineering principles:*
> - *FastAPI & Python 3.12: High-performance asynchronous REST endpoints with Pydantic v2 data validation.*
> - *Isolated Provider Pattern: Scraping services for TikTok, Facebook, and Websites are isolated behind abstract interfaces, allowing seamless swapping between Apify live scrapers and offline fixtures.*
> - *Local AI Inference: SentenceTransformers runs directly in Python memory—no external LLM bills, no token latency, and zero data leakage.*
> - *PostgreSQL & Docker: Containerized stack with Alembic migrations, with automatic graceful local fallback.*
> - *Comprehensive Testing: 94 automated unit and integration tests passing in under 1 second, with 0 TypeScript compilation errors in our React/Vite frontend."*

---

### [9:00 – 10:00] Business Impact & Limitations
*(Screen scrolls to filters, CSV export, and concludes)*

> *"To wrap up:*
> *ThaiKOL AI transforms what used to be a 4-hour manual discovery spreadsheet into a 5-second explainable recommendation report. Marketers can filter by score or niche, copy a formatted summary to their clipboard, or download a structured CSV for their campaign workflow.*
>
> *We are honest about our current limitations:*
> - *It evaluates point-in-time public snapshots, not real-time feeds.*
> - *Brand safety is content screening, not a character judgment.*
> - *We do not execute automated outreach or negotiate talent fees.*
>
> *ThaiKOL AI demonstrates how practical, explainable AI engineering can solve real commercial workflows in Thailand. Thank you for your time, and I welcome any questions!"*
