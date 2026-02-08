"""
Configuration settings for the application
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # App Configuration
    app_name: str = "Equilibria HoloCheck API"
    app_version: str = "1.0.0"
    debug: bool = True
    port: int = 8000
    
    # Supabase Configuration
    # Try multiple environment variable names for compatibility
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    
    # Frontend/Backend URLs
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    
    # CORS Configuration
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # Environment
    environment: str = "development"
    
    # Database URL (direct PostgreSQL connection)
    database_url: str = ""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Fallback to ATOMS_ prefixed environment variables if standard ones are not set
        if not self.supabase_url:
            self.supabase_url = os.getenv('ATOMS_SUPABASE_URL', '')
        if not self.supabase_anon_key:
            self.supabase_anon_key = os.getenv('ATOMS_SUPABASE_ANON_KEY', '')
        if not self.supabase_service_role_key:
            self.supabase_service_role_key = os.getenv('ATOMS_SUPABASE_SERVICE_ROLE_KEY', '')
        if not self.database_url:
            self.database_url = os.getenv('ATOMS_DATABASE_URL', '')
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"


settings = Settings()