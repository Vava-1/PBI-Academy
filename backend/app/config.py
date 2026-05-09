"""Application configuration using Pydantic Settings."""
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Application
    app_name: str = "Pacemaker Business Institute"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True
    log_level: str = "INFO"
    
    # Database - supports both PostgreSQL and SQLite
    database_url: str = "sqlite+aiosqlite:///./pbi.db"
    database_url_sync: Optional[str] = None
    
    # Redis - optional, can be disabled for free tier
    redis_url: Optional[str] = None
    
    # Security
    secret_key: str
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    algorithm: str = "HS256"
    
    # AI/LLM
    openai_api_key: Optional[str] = None
    
    # File Storage
    upload_dir: str = "uploads"
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    
    # Email
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    
    # Payment
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    stripe_price_pro: Optional[str] = None
    stripe_price_premium: Optional[str] = None
    
    # CORS
    allowed_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"
    
    @property
    def sync_database_url(self) -> str:
        return self.database_url_sync or str(self.database_url).replace(
            "postgresql+asyncpg://", "postgresql://"
        )


settings = Settings()
