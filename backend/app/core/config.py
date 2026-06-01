from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path
from pydantic import field_validator


# Resolve .env path — works locally; silently ignored if file doesn't exist (e.g., on Render)
_BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend/
_ENV_FILE = _BASE_DIR / ".env"


class Settings(BaseSettings):
    # Database — defaults to SQLite for zero-config local dev
    # On Render: set DATABASE_URL env var in dashboard
    DATABASE_URL: str = "sqlite:///./inventory.db"

    @field_validator('DATABASE_URL', mode='before')
    @classmethod
    def val_db_url(cls, v: str) -> str:
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    # App metadata
    APP_NAME: str = "InvenFlow API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # CORS — comma-separated list of allowed frontend origins
    # On Render: set ALLOWED_ORIGINS env var to your Vercel URL
    ALLOWED_ORIGINS: str = (
        "https://frontend-theta-six-22.vercel.app,"
        "https://frontend-kxqw913xm-divyasingh969692-3471s-projects.vercel.app,"
        "http://localhost:5173,"
        "http://localhost:3000,"
        "http://127.0.0.1:5173"
    )

    model_config = {
        # Use env_file only if the file exists; ignored on cloud platforms
        "env_file": str(_ENV_FILE) if _ENV_FILE.exists() else None,
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",  # Silently ignore VITE_API_URL, POSTGRES_* etc.
    }

    @property
    def cors_origins(self) -> list[str]:
        origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        # Always allow all in development / if wildcard set
        if "*" in origins:
            return ["*"]
        return origins


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
