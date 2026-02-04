"""
Configuration settings for the application
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # App Configuration
    app_name: str = "Equilibria HoloCheck API"
    app_version: str = "1.0.0"
    debug: bool = True
    port: int = 8000
    
    # Supabase Configuration - Using the exact keys provided by user
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    
    # Frontend/Backend URLs
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    
    # CORS Configuration
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # Environment
    environment: str = "development"
    
    # Database URL (direct PostgreSQL connection)
    database_url: str
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"


settings = Settings()