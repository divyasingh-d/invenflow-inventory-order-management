from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path


# Resolve .env path — works whether uvicorn is run from backend/ or project root
_BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend/
_ENV_FILE = _BASE_DIR / ".env"


class Settings(BaseSettings):
    # Database — defaults to SQLite for zero-config local dev
    DATABASE_URL: str = "sqlite:///./inventory_dev.db"

    # App
    APP_NAME: str = "InvenFlow API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # Silently ignore any extra env vars (e.g. VITE_API_URL, POSTGRES_*)

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
