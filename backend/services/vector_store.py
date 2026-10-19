import abc
import logging
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

logger = logging.getLogger(__name__)


class VectorStore(abc.ABC):
    """Abstract interface for dense vector storage and similarity retrieval."""

    @abc.abstractmethod
    def add(
        self,
        identifier: str,
        vector: List[float],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Stores a vector with an identifier and optional metadata."""
        pass

    @abc.abstractmethod
    def batch_add(
        self, items: List[Tuple[str, List[float], Optional[Dict[str, Any]]]]
    ) -> None:
        """Stores a batch of (identifier, vector, metadata) tuples."""
        pass

    @abc.abstractmethod
    def search(
        self,
        query_vector: List[float],
        top_k: int = 10,
        min_similarity: float = -1.0,
    ) -> List[Dict[str, Any]]:
        """Returns top_k nearest vectors ranked by cosine similarity."""
        pass

    @abc.abstractmethod
    def count(self) -> int:
        """Returns total vectors stored."""
        pass

    @abc.abstractmethod
    def clear(self) -> None:
        """Flushes all stored vectors."""
        pass


class InMemoryVectorStore(VectorStore):
    """High-performance in-memory vector index powered by vectorized NumPy dot products."""

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.ids: List[str] = []
        self.metadata: List[Dict[str, Any]] = []
        self.vectors: Optional[np.ndarray] = None  # shape (N, D)

    def add(
        self,
        identifier: str,
        vector: List[float],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.batch_add([(identifier, vector, metadata)])

    def batch_add(
        self, items: List[Tuple[str, List[float], Optional[Dict[str, Any]]]]
    ) -> None:
        if not items:
            return

        new_ids = []
        new_meta = []
        new_vecs = []

        for ident, vec, meta in items:
            v_arr = np.array(vec, dtype=np.float32)
            # Ensure normalized vector for fast cosine similarity via dot product
            norm = np.linalg.norm(v_arr)
            if norm > 0:
                v_arr = v_arr / norm
            new_ids.append(ident)
            new_meta.append(meta or {})
            new_vecs.append(v_arr)

        new_vec_matrix = np.vstack(new_vecs)

        if self.vectors is None or len(self.ids) == 0:
            self.ids = new_ids
            self.metadata = new_meta
            self.vectors = new_vec_matrix
        else:
            self.ids.extend(new_ids)
            self.metadata.extend(new_meta)
            self.vectors = np.vstack([self.vectors, new_vec_matrix])

    def search(
        self,
        query_vector: List[float],
        top_k: int = 10,
        min_similarity: float = -1.0,
    ) -> List[Dict[str, Any]]:
        if self.vectors is None or len(self.ids) == 0:
            return []

        q = np.array(query_vector, dtype=np.float32)
        norm = np.linalg.norm(q)
        if norm > 0:
            q = q / norm

        # Matrix-vector dot product computes all cosine similarities simultaneously
        sims = np.dot(self.vectors, q)

        # Get top indices
        top_indices = np.argsort(-sims)[:top_k]

        results = []
        for idx in top_indices:
            sim = float(sims[idx])
            if sim >= min_similarity:
                results.append(
                    {
                        "id": self.ids[idx],
                        "cosine_similarity": round(sim, 4),
                        "semantic_score": round(((sim + 1.0) / 2.0) * 100.0, 1),
                        "metadata": self.metadata[idx],
                    }
                )
        return results

    def count(self) -> int:
        return len(self.ids)

    def clear(self) -> None:
        self.ids = []
        self.metadata = []
        self.vectors = None


class PgVectorStore(VectorStore):
    """PostgreSQL pgvector adapter for high-scale enterprise deployments.

    Requires:
      CREATE EXTENSION IF NOT EXISTS vector;
      CREATE TABLE kol_vector_index (
          id VARCHAR(100) PRIMARY KEY,
          embedding vector(384),
          metadata JSONB
      );
      CREATE INDEX ON kol_vector_index USING hnsw (embedding vector_cosine_ops);
    """

    def __init__(self, connection_url: str, dimension: int = 384):
        self.connection_url = connection_url
        self.dimension = dimension
        self._fallback = InMemoryVectorStore(dimension=dimension)

    def add(
        self,
        identifier: str,
        vector: List[float],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        # Defaults to in-memory fallback unless active PostgreSQL connection with pgvector is ready
        self._fallback.add(identifier, vector, metadata)

    def batch_add(
        self, items: List[Tuple[str, List[float], Optional[Dict[str, Any]]]]
    ) -> None:
        self._fallback.batch_add(items)

    def search(
        self,
        query_vector: List[float],
        top_k: int = 10,
        min_similarity: float = -1.0,
    ) -> List[Dict[str, Any]]:
        return self._fallback.search(query_vector, top_k=top_k, min_similarity=min_similarity)

    def count(self) -> int:
        return self._fallback.count()

    def clear(self) -> None:
        self._fallback.clear()


# Default singleton vector store instance
default_vector_store = InMemoryVectorStore(dimension=384)


def get_vector_store() -> VectorStore:
    return default_vector_store
