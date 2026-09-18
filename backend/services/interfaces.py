from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class WebsiteProvider(ABC):
    """Provider interface for extracting brand data from public client websites."""

    @abstractmethod
    def extract_brand_content(self, url: str) -> Dict[str, Any]:
        """Extracts textual and metadata signals from a public website URL.

        Returns a dictionary with keys: meta_description, title, about_text, products, keywords.
        """
        pass


class FacebookProvider(ABC):
    """Provider interface for extracting public brand signals from Facebook pages."""

    @abstractmethod
    def extract_page_content(self, page_url: str) -> Dict[str, Any]:
        """Extracts public about info, category, and recent public post captions."""
        pass


class TikTokProvider(ABC):
    """Provider interface for querying public TikTok creators and metrics.

    Isolates external actor / scraper implementations (e.g. Apify actors)
    so they can be swapped or updated without affecting matching logic.
    """

    @abstractmethod
    def discover_kols_by_keywords(
        self, keywords: List[str], limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Discovers public TikTok creator profiles matching Thai niche keywords."""
        pass

    @abstractmethod
    def get_profile_details(self, handle: str) -> Dict[str, Any]:
        """Fetches public profile metadata, recent video captions, and baseline metrics."""
        pass


class BrandProfiler(ABC):
    """Synthesizes raw web and social content into structured brand traits."""

    @abstractmethod
    def generate_brand_profile(
        self,
        raw_web_data: Optional[Dict[str, Any]] = None,
        raw_fb_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Analyzes brand identity, tone, audience demographics, and core product categories."""
        pass


class EmbeddingService(ABC):
    """Vector embedding interface using multilingual sentence-transformers."""

    @abstractmethod
    def get_text_embedding(self, text: str) -> List[float]:
        """Generates dense vector embedding for single text string."""
        pass

    @abstractmethod
    def get_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generates dense vector embeddings for a list of texts."""
        pass


class KOLMatcher(ABC):
    """Computes semantic relevance between brand profile and KOL profiles."""

    @abstractmethod
    def match_kols(
        self,
        brand_vector: List[float],
        kol_vectors: List[List[float]],
        top_k: int = 10,
    ) -> List[Dict[str, Any]]:
        """Calculates cosine similarity rankings between brand and KOL candidate vectors."""
        pass


class KOLScorer(ABC):
    """Multi-factor explainable scoring engine for ranking KOLs."""

    @abstractmethod
    def score_kol(
        self,
        semantic_similarity: float,
        metrics: Dict[str, Any],
        weights: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """Computes composite explainable score and rationales."""
        pass
