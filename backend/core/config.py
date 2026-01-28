"""
Application configuration
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # App info
    app_name: str = "Equilibria HoloCheck API"
    app_version: str = "1.0.0"
    debug: bool = False  # Added missing debug field
    port: int = 8000  # Added missing port field
    
    # Database - Direct PostgreSQL connection
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres.nmwbfvvacilgyxbwvnqb:jicdag-8wusWi-xickam@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
    )
    
    # Supabase (for frontend auth)
    supabase_url: str = os.getenv("SUPABASE_URL", "https://nmwbfvvacilgyxbwvnqb.supabase.co")
    supabase_key: str = os.getenv("SUPABASE_KEY", "sb_secret_vzUZjie6hy3CzoUUwq3muw_hX72Lhvu")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_vzUZjie6hy3CzoUUwq3muw_hX72Lhvu")
    
    # JWT Secret for token validation
    jwt_secret: str = os.getenv("JWT_SECRET", "your-secret-key-here")
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 30
    
    # CORS
    cors_origins: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.atoms.dev",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()