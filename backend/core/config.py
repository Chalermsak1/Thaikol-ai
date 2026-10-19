import json
from typing import List, Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application Info
    PROJECT_NAME: str = "ThaiKOL AI"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "insecure-default-change-in-production-thaikol-ai-secret"

    # Mode Flag: False = LIVE mode (default in production), True = deterministic DEMO mode
    DEMO_MODE: bool = False

    # Database Configuration (PostgreSQL)
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "thaikol_db"
    DATABASE_URL: Optional[str] = None

    @field_validator("DATABASE_URL", mode="before")
    def assemble_db_connection(cls, v: Optional[str], info) -> str:
        if isinstance(v, str) and v.strip():
            return v
        # Assemble standard PostgreSQL connection string if not provided
        server = info.data.get("POSTGRES_SERVER", "localhost")
        port = info.data.get("POSTGRES_PORT", 5432)
        user = info.data.get("POSTGRES_USER", "postgres")
        password = info.data.get("POSTGRES_PASSWORD", "postgres")
        db = info.data.get("POSTGRES_DB", "thaikol_db")
        return f"postgresql+psycopg2://{user}:{password}@{server}:{port}/{db}"

    # AI & LLM Configuration
    LLM_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5-coder:7b"
    EMBEDDING_PROVIDER: str = "sentence_transformers"
    EMBEDDING_MODEL_NAME: str = (
        "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )
    EMBEDDING_BATCH_SIZE: int = 32

    # External Scraper Providers (Apify for Public Scraping)
    APIFY_API_TOKEN: Optional[str] = None
    APIFY_FACEBOOK_ACTOR_ID: str = "apify/facebook-pages-scraper"
    APIFY_TIKTOK_ACTOR_ID: str = "clockworks/tiktok-scraper"

    # TikTok Discovery Limits & Controls
    TIKTOK_MAX_QUERIES: int = 5
    TIKTOK_MAX_RESULTS_PER_QUERY: int = 20
    TIKTOK_MAX_CANDIDATES: int = 50
    TIKTOK_TIMEOUT: float = 60.0
    TIKTOK_RETRY_ATTEMPTS: int = 3
    TIKTOK_RETRY_BACKOFF_BASE: float = 1.5

    # Data Freshness Thresholds (Hours)
    DATA_FRESHNESS_PROFILE_HOURS: int = 6
    DATA_FRESHNESS_VIDEO_HOURS: int = 24
    DATA_FRESHNESS_BRAND_HOURS: int = 24

    # Website Extraction Limits & Security
    WEBSITE_EXTRACT_TIMEOUT: float = 10.0
    WEBSITE_MAX_RESPONSE_SIZE: int = 2 * 1024 * 1024  # 2 MB max page download
    WEBSITE_MAX_TEXT_LENGTH: int = 15000  # truncate visible text to prevent token explosion

    # Caching & Distributed Cache
    ENABLE_CACHE: bool = True
    CACHE_TTL_SECONDS: int = 3600
    REDIS_URL: Optional[str] = None
    CACHE_MAX_MEMORY_ITEMS: int = 10000

    # CORS Origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v: Union[List[str], str]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Logging
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
