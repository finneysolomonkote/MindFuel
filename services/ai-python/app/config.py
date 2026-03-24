"""Application configuration management."""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"

    # Supabase Configuration
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    # OpenAI Configuration
    openai_api_key: str
    openai_model: str = "gpt-4-turbo-preview"
    openai_embedding_model: str = "text-embedding-3-small"

    # Redis Configuration
    redis_url: str = "redis://localhost:6379/0"

    # Application Settings
    max_tokens: int = 4096
    temperature: float = 0.7
    chunk_size: int = 1000
    chunk_overlap: int = 200
    top_k_results: int = 5

    # CORS Settings
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
