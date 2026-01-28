"""
Configuration settings for the application
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Supabase Configuration
    supabase_url: str
    supabase_key: str
    supabase_service_role_key: Optional[str] = None
    
    # JWT Configuration
    jwt_secret: str = "your-secret-key-here"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 30
    
    # CORS Configuration
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # Environment
    environment: str = "development"
    
    # Database URL (if using direct PostgreSQL connection)
    database_url: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"  # Allow extra fields from .env


settings = Settings()