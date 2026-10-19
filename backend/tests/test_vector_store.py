import numpy as np
from services.vector_store import InMemoryVectorStore


def test_in_memory_vector_store_basic():
    store = InMemoryVectorStore(dimension=3)

    # Add 3 unit vectors
    v1 = [1.0, 0.0, 0.0]  # x-axis
    v2 = [0.0, 1.0, 0.0]  # y-axis
    v3 = [0.7071, 0.7071, 0.0]  # 45 deg between x and y

    store.add("cand_x", v1, {"name": "Candidate X"})
    store.add("cand_y", v2, {"name": "Candidate Y"})
    store.add("cand_xy", v3, {"name": "Candidate XY"})

    assert store.count() == 3

    # Query with x-axis vector
    results = store.search(query_vector=[1.0, 0.0, 0.0], top_k=2)
    assert len(results) == 2
    # cand_x should be first (cosine ~ 1.0)
    assert results[0]["id"] == "cand_x"
    assert results[0]["cosine_similarity"] > 0.99
    assert results[0]["semantic_score"] > 99.0

    # cand_xy should be second (cosine ~ 0.707)
    assert results[1]["id"] == "cand_xy"
    assert 0.70 < results[1]["cosine_similarity"] < 0.72


def test_vector_store_batch_add_and_clear():
    store = InMemoryVectorStore(dimension=4)

    items = [
        ("c1", [0.5, 0.5, 0.5, 0.5], {"role": "beauty"}),
        ("c2", [-0.5, 0.5, 0.5, 0.5], {"role": "lifestyle"}),
    ]
    store.batch_add(items)
    assert store.count() == 2

    store.clear()
    assert store.count() == 0
    assert store.search([1.0, 0.0, 0.0, 0.0]) == []
