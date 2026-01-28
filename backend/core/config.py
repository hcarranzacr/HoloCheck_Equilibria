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
    debug: bool = True
    
    # Database - Direct PostgreSQL connection
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres.nmwbfvvacilgyxbwvnqb:jicdag-8wusWi-xickam@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
    )
    
    # Supabase (frontend only - for auth)
    supabase_url: str = os.getenv("SUPABASE_URL", "https://nmwbfvvacilgyxbwvnqb.supabase.co")
    supabase_key: str = os.getenv("SUPABASE_KEY", "sb_publishable_bv9N5FWT448fasDBMBD8Og_jM3cc4pj")
    
    # JWT Secret for token validation
    jwt_secret: str = os.getenv("JWT_SECRET", "your-secret-key-here")
    jwt_algorithm: str = "HS256"
    
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