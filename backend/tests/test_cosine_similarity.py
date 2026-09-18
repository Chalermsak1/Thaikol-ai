import pytest
from services.semantic_matcher import (
    calculate_cosine_similarity,
    transform_similarity_to_score,
)


def test_cosine_similarity_identical_vectors():
    vec_a = [0.5, 0.5, 0.5, 0.5]
    vec_b = [0.5, 0.5, 0.5, 0.5]
    sim = calculate_cosine_similarity(vec_a, vec_b)
    assert abs(sim - 1.0) < 1e-5


def test_cosine_similarity_orthogonal_vectors():
    vec_a = [1.0, 0.0]
    vec_b = [0.0, 1.0]
    sim = calculate_cosine_similarity(vec_a, vec_b)
    assert abs(sim - 0.0) < 1e-5


def test_cosine_similarity_opposite_vectors():
    vec_a = [1.0, 2.0]
    vec_b = [-1.0, -2.0]
    sim = calculate_cosine_similarity(vec_a, vec_b)
    assert abs(sim - (-1.0)) < 1e-5


def test_cosine_similarity_zero_vectors_handled_safely():
    """Zero vectors must return 0.0 safely without divide-by-zero errors."""
    zero_vec = [0.0, 0.0, 0.0]
    normal_vec = [1.0, 2.0, 3.0]

    assert calculate_cosine_similarity(zero_vec, normal_vec) == 0.0
    assert calculate_cosine_similarity(normal_vec, zero_vec) == 0.0
    assert calculate_cosine_similarity(zero_vec, zero_vec) == 0.0


def test_cosine_similarity_mismatched_or_empty_lengths():
    assert calculate_cosine_similarity([], [1.0]) == 0.0
    assert calculate_cosine_similarity([1.0, 2.0], [1.0]) == 0.0


def test_transform_similarity_to_score():
    # +1.0 -> 100.0
    assert transform_similarity_to_score(1.0) == 100.0

    # 0.0 -> 50.0
    assert transform_similarity_to_score(0.0) == 50.0

    # -1.0 -> 0.0
    assert transform_similarity_to_score(-1.0) == 0.0

    # Example: 0.828 -> ((0.828 + 1)/2)*100 = 91.4
    assert transform_similarity_to_score(0.828) == 91.4

    # Out of bounds clamping check
    assert transform_similarity_to_score(1.2) == 100.0
    assert transform_similarity_to_score(-1.5) == 0.0
