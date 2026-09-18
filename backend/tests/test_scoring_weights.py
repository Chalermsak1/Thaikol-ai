import pytest
from services.scoring_config import (
    validate_weights,
    get_scoring_weights,
    DEFAULT_WEIGHTS,
)


def test_default_weights_sum_and_keys():
    weights = get_scoring_weights()
    assert weights["semantic_relevance"] == 0.45
    assert weights["engagement_quality"] == 0.25
    assert weights["local_content_relevance"] == 0.15
    assert weights["brand_safety"] == 0.10
    assert weights["data_quality"] == 0.05
    assert round(sum(weights.values()), 4) == 1.0


def test_validate_weights_success_custom():
    custom = {
        "semantic_relevance": 0.50,
        "engagement_quality": 0.20,
        "local_content_relevance": 0.10,
        "brand_safety": 0.10,
        "data_quality": 0.10,
    }
    validated = validate_weights(custom)
    assert validated == custom
    assert sum(validated.values()) == 1.0


def test_validate_weights_missing_key():
    invalid = {
        "semantic_relevance": 0.50,
        "engagement_quality": 0.50,
    }
    with pytest.raises(ValueError) as exc:
        validate_weights(invalid)
    assert "Missing required weight keys" in str(exc.value)


def test_validate_weights_invalid_sum():
    invalid = {
        "semantic_relevance": 0.40,
        "engagement_quality": 0.20,
        "local_content_relevance": 0.10,
        "brand_safety": 0.10,
        "data_quality": 0.10,  # Sum = 0.90
    }
    with pytest.raises(ValueError) as exc:
        validate_weights(invalid)
    assert "Weights must sum to 1.0" in str(exc.value)


def test_validate_weights_out_of_bounds():
    invalid = {
        "semantic_relevance": 1.20,
        "engagement_quality": -0.20,
        "local_content_relevance": 0.0,
        "brand_safety": 0.0,
        "data_quality": 0.0,
    }
    with pytest.raises(ValueError) as exc:
        validate_weights(invalid)
    assert "must be between 0.0 and 1.0" in str(exc.value)
