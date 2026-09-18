import pytest
from services.embedding_service import LocalSentenceTransformerEmbeddingService, get_embedding_service
from services.cache import cache_service


def test_embedding_service_empty_or_whitespace_text():
    service = LocalSentenceTransformerEmbeddingService()
    # Empty string should immediately return zero vector without calling the model
    vec_empty = service.get_text_embedding("")
    assert len(vec_empty) == 384
    assert all(x == 0.0 for x in vec_empty)

    vec_ws = service.get_text_embedding("     \n\t  ")
    assert len(vec_ws) == 384
    assert all(x == 0.0 for x in vec_ws)


def test_embedding_service_batch_empty_list():
    service = LocalSentenceTransformerEmbeddingService()
    results = service.get_batch_embeddings([])
    assert results == []


def test_embedding_service_caching_and_determinism(monkeypatch):
    service = LocalSentenceTransformerEmbeddingService()

    # Create dummy mock model
    call_count = {"count": 0}

    class DummyModel:
        def encode(self, texts, **kwargs):
            call_count["count"] += 1
            if isinstance(texts, str):
                return [0.1] * 384
            return [[0.1] * 384 for _ in texts]

    dummy = DummyModel()
    monkeypatch.setattr(service, "_model_instance", dummy)

    text = "รีวิวแชมพูสมุนไพรไทยแท้ 100%"
    # First call: computes and caches
    vec1 = service.get_text_embedding(text)
    assert len(vec1) == 384
    assert call_count["count"] == 1

    # Second call with identical text: must hit cache and NOT invoke model encode
    vec2 = service.get_text_embedding(text)
    assert vec1 == vec2
    assert call_count["count"] == 1

    # Batch call with cached text
    batch_res = service.get_batch_embeddings([text, ""])
    assert len(batch_res) == 2
    assert batch_res[0] == vec1
    assert all(x == 0.0 for x in batch_res[1])
    assert call_count["count"] == 1  # Still 1 because both are cached or empty!


def test_embedding_service_unavailable_handling(monkeypatch):
    """When sentence-transformers cannot be loaded, service raises clean RuntimeError."""
    service = LocalSentenceTransformerEmbeddingService(model_name="nonexistent/fake-model")
    monkeypatch.setattr(service, "_model_instance", None)

    def failing_import():
        raise ImportError("No module named 'sentence_transformers'")

    monkeypatch.setattr("builtins.__import__", lambda name, *args, **kwargs: (failing_import() if name == "sentence_transformers" else __import__(name, *args, **kwargs)))

    with pytest.raises(RuntimeError) as exc_info:
        service.get_text_embedding("Some text")

    assert "Embedding model unavailable" in str(exc_info.value)
