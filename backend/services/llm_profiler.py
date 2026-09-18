import json
import re
from typing import Any, Dict, List, Optional
import httpx
from pydantic import ValidationError

from core.config import settings
from core.logging import logger
from schemas.brand import BrandCorpus, BrandProfile, EvidenceItem
from .corpus_builder import corpus_builder
from .interfaces import BrandProfiler
from .rule_based_profiler import rule_based_profiler


class LLMBrandProfiler(BrandProfiler):
    """Optional local LLM-powered profiler via Ollama with strict JSON enforcement,

    conservative prompt engineering, and seamless fallback to RuleBasedBrandProfiler.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: float = 25.0,
    ):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL
        self.timeout = timeout

    def generate_brand_profile(
        self,
        raw_web_data: Optional[Dict[str, Any]] = None,
        raw_fb_data: Optional[Dict[str, Any]] = None,
        corpus: Optional[BrandCorpus] = None,
    ) -> Dict[str, Any]:
        if corpus is None:
            corpus = corpus_builder.build_corpus(raw_web_data, raw_fb_data)

        # Build clean, controlled text representation
        web_text_snippet = corpus.website_text[:4000]
        fb_about_snippet = corpus.facebook_about[:1500]
        fb_posts_snippet = "\n".join(corpus.facebook_post_texts[:4])[:2500]
        candidates = ", ".join(corpus.brand_name_candidates[:5])

        system_instruction = (
            "You are an expert brand analyst. Analyze the provided public brand corpus for a Thai business.\n"
            "STRICT RULES:\n"
            "1. USE ONLY THE SUPPLIED TEXT. Do NOT hallucinate or fabricate facts.\n"
            "2. Distinguish OBSERVED facts from INFERRED patterns.\n"
            "3. Target audience must be conservative; NEVER invent specific age numbers or gender percentages unless explicitly stated.\n"
            "4. Identify Thailand/local geographical signals only when explicitly mentioned in the text.\n"
            "5. OUTPUT ONLY VALID RAW JSON. Do not include markdown codeblocks, explanations, or preface."
        )

        user_prompt = f"""
BRAND CANDIDATES: {candidates}

WEBSITE EXTRACT:
{web_text_snippet}

FACEBOOK ABOUT:
{fb_about_snippet}

RECENT FACEBOOK POSTS:
{fb_posts_snippet}

Output a JSON object with EXACTLY this structure:
{{
  "brand_name": "String (Brand name)",
  "industry": "String (e.g. Natural Beauty & Herbal Personal Care, Food & Beverage, etc.)",
  "products_services": ["String", "String"],
  "target_audience": ["String", "String"],
  "content_themes": ["String", "String"],
  "brand_tone": ["String", "String"],
  "keywords": ["String", "String"],
  "location_signals": ["String"],
  "summary": "Concise summary of brand positioning",
  "confidence": 0.85,
  "evidence": [
    {{
      "field": "industry",
      "source": "website",
      "source_url": "{corpus.metadata.get('website_url') or ''}",
      "text": "Verbatim quote supporting the classification",
      "nature": "OBSERVED"
    }}
  ]
}}
"""

        try:
            raw_response = self._call_ollama(system_instruction, user_prompt)
            profile_dict = self._parse_and_validate(raw_response)
            profile_dict["is_demo_fixture"] = False
            profile_dict["provenance"] = "ollama_llm"
            return profile_dict

        except Exception as err:
            logger.warning("Ollama LLM profiling failed or produced invalid output: %s. Falling back to rule-based.", err)
            # Try 1 JSON repair attempt if error was JSON/Validation related and response exists
            if "raw_response" in locals() and raw_response:
                try:
                    logger.info("Attempting JSON repair retry with Ollama...")
                    repair_prompt = f"Fix this invalid output into valid JSON only without commentary:\n{raw_response}"
                    repaired_raw = self._call_ollama(system_instruction, repair_prompt)
                    repaired_dict = self._parse_and_validate(repaired_raw)
                    repaired_dict["is_demo_fixture"] = False
                    repaired_dict["provenance"] = "ollama_llm_repaired"
                    return repaired_dict
                except Exception as repair_err:
                    logger.warning("JSON repair failed: %s. Proceeding with rule-based profiler.", repair_err)

            # Fall back to RuleBasedBrandProfiler
            fallback_profile = rule_based_profiler.generate_brand_profile(corpus=corpus)
            return fallback_profile

    def _call_ollama(self, system: str, prompt: str) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "system": system,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.1,  # Low temperature for deterministic output
                "top_p": 0.9,
            },
        }
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", "").strip()

    def _parse_and_validate(self, text: str) -> Dict[str, Any]:
        # Strip potential markdown codefence
        cleaned = re.sub(r"^```(json)?", "", text.strip(), flags=re.IGNORECASE)
        cleaned = re.sub(r"```$", "", cleaned.strip())

        # Extract outer JSON object
        match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
        if not match:
            raise ValueError(f"No JSON object found in response: {text[:200]}")

        json_str = match.group(1)
        parsed = json.loads(json_str)

        # Validate with Pydantic
        validated = BrandProfile.model_validate(parsed)
        return validated.model_dump()


def get_brand_profiler() -> BrandProfiler:
    """Factory selecting LLMBrandProfiler if enabled and Ollama is reachable,

    otherwise RuleBasedBrandProfiler.
    """
    if settings.LLM_PROVIDER == "ollama" and not settings.DEMO_MODE:
        return LLMBrandProfiler()
    return rule_based_profiler
