import os
from pathlib import Path
from typing import Any, Dict, Optional
import yaml
from core.logging import logger

DEFAULT_WEIGHTS = {
    "semantic_relevance": 0.45,
    "engagement_quality": 0.25,
    "local_content_relevance": 0.15,
    "brand_safety": 0.10,
    "data_quality": 0.05,
}

CONFIG_DIR_CANDIDATES = [
    Path("config"),
    Path(__file__).resolve().parent.parent / "config",
    Path(__file__).resolve().parent.parent.parent / "config",
]


def _find_config_file(filename: str) -> Optional[Path]:
    for base in CONFIG_DIR_CANDIDATES:
        cand = base / filename
        if cand.is_file():
            return cand
    return None


def validate_weights(weights: Dict[str, float]) -> Dict[str, float]:
    """Validates scoring weights ensuring all expected keys are present, in [0, 1], and sum to 1.0."""
    required_keys = {
        "semantic_relevance",
        "engagement_quality",
        "local_content_relevance",
        "brand_safety",
        "data_quality",
    }
    missing = required_keys - set(weights.keys())
    if missing:
        raise ValueError(f"Missing required weight keys: {sorted(missing)}")

    total = 0.0
    validated: Dict[str, float] = {}
    for k in required_keys:
        val = float(weights[k])
        if val < 0.0 or val > 1.0:
            raise ValueError(f"Weight '{k}' must be between 0.0 and 1.0, got {val}")
        total += val
        validated[k] = val

    if abs(total - 1.0) > 1e-4:
        raise ValueError(f"Weights must sum to 1.0, got {round(total, 4)}")

    return validated


def load_scoring_config() -> Dict[str, Any]:
    """Loads scoring.yaml configuration from disk, falling back to built-in defaults."""
    cfg_path = _find_config_file("scoring.yaml")
    if cfg_path and cfg_path.is_file():
        try:
            with open(cfg_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f) or {}
                raw_weights = data.get("weights", DEFAULT_WEIGHTS)
                validated_weights = validate_weights(raw_weights)
                return {
                    "weights": validated_weights,
                    "explainability_thresholds": data.get("explainability_thresholds", {}),
                }
        except Exception as e:
            logger.warning("Failed to load scoring.yaml (%s), using defaults: %s", cfg_path, e)

    return {
        "weights": DEFAULT_WEIGHTS.copy(),
        "explainability_thresholds": {},
    }


def get_scoring_weights(custom_weights: Optional[Dict[str, float]] = None) -> Dict[str, float]:
    """Returns validated scoring weights, applying custom overrides if provided."""
    if custom_weights is not None:
        return validate_weights(custom_weights)
    cfg = load_scoring_config()
    return cfg["weights"]


def get_explainability_thresholds() -> Dict[str, Any]:
    cfg = load_scoring_config()
    return cfg.get("explainability_thresholds", {})


def load_brand_safety_config() -> Dict[str, Any]:
    """Loads brand_safety.yaml from disk."""
    cfg_path = _find_config_file("brand_safety.yaml")
    if cfg_path and cfg_path.is_file():
        try:
            with open(cfg_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f) or {}
        except Exception as e:
            logger.warning("Failed to load brand_safety.yaml, using defaults: %s", e)
    return {"default_score": 100.0, "categories": {}}


def load_data_quality_config() -> Dict[str, Any]:
    """Loads data_quality.yaml from disk."""
    cfg_path = _find_config_file("data_quality.yaml")
    if cfg_path and cfg_path.is_file():
        try:
            with open(cfg_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f) or {}
        except Exception as e:
            logger.warning("Failed to load data_quality.yaml, using defaults: %s", e)
    return {"expected_fields": {}}
