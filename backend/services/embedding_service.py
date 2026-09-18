import hashlib
import threading
from typing import Any, List, Optional
from core.config import settings
from core.logging import logger
from services.cache import cache_service
from services.interfaces import EmbeddingService


class LocalSentenceTransformerEmbeddingService(EmbeddingService):
    """Local embedding service powered by multilingual sentence-transformers.

    Loads the model lazily, caches embeddings by text hash in memory,
    and supports single and batch text encoding deterministically.
    """

    _model_instance = None
    _model_lock = threading.Lock()

    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name or settings.EMBEDDING_MODEL_NAME
        self.dimension = 384  # Standard dimension for paraphrase-multilingual-MiniLM-L12-v2

    def _get_model(self):
        if self._model_instance is None:
            with self._model_lock:
                if self._model_instance is None:
                    try:
                        from sentence_transformers import SentenceTransformer
                        logger.info("Loading local SentenceTransformer model: %s", self.model_name)
                        self._model_instance = SentenceTransformer(self.model_name)
                    except Exception as err:
                        logger.error("Failed to load SentenceTransformer model %s: %s", self.model_name, err)
                        raise RuntimeError(f"Embedding model unavailable: {str(err)}") from err
        return self._model_instance

    def _cache_key(self, text: str) -> str:
        text_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
        return f"emb:{self.model_name}:{text_hash}"

    def get_text_embedding(self, text: str) -> List[float]:
        """Generates dense vector embedding for a single text string."""
        norm_text = text.strip() if text else ""
        if not norm_text:
            return [0.0] * self.dimension

        cache_key = self._cache_key(norm_text)
        cached = cache_service.get(cache_key)
        if cached is not None:
            return cached

        model = self._get_model()
        vec = model.encode(norm_text, normalize_embeddings=True)
        vec_list: List[float] = [float(x) for x in vec]
        cache_service.set(cache_key, vec_list, ttl=settings.CACHE_TTL_SECONDS)
        return vec_list

    def get_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generates dense vector embeddings for a list of texts in batch."""
        if not texts:
            return []

        results: List[Optional[List[float]]] = [None] * len(texts)
        uncached_indices: List[int] = []
        uncached_texts: List[str] = []

        for idx, t in enumerate(texts):
            norm_text = t.strip() if t else ""
            if not norm_text:
                results[idx] = [0.0] * self.dimension
                continue

            cache_key = self._cache_key(norm_text)
            cached = cache_service.get(cache_key)
            if cached is not None:
                results[idx] = cached
            else:
                uncached_indices.append(idx)
                uncached_texts.append(norm_text)

        if uncached_texts:
            model = self._get_model()
            batch_size = getattr(settings, "EMBEDDING_BATCH_SIZE", 32)
            vectors = model.encode(
                uncached_texts,
                batch_size=batch_size,
                normalize_embeddings=True,
                show_progress_bar=False,
            )

            for idx, raw_vec in zip(uncached_indices, vectors):
                vec_list: List[float] = [float(x) for x in raw_vec]
                results[idx] = vec_list
                cache_key = self._cache_key(uncached_texts[uncached_indices.index(idx)])
                cache_service.set(cache_key, vec_list, ttl=settings.CACHE_TTL_SECONDS)

        # Fallback safeguard
        final_results: List[List[float]] = []
        for r in results:
            if r is None:
                final_results.append([0.0] * self.dimension)
            else:
                final_results.append(r)

        return final_results


local_embedding_service = LocalSentenceTransformerEmbeddingService()


def get_embedding_service() -> EmbeddingService:
    """Factory returning the active EmbeddingService instance."""
    return local_embedding_service
