"""
Supabase client wrapper for database operations
This module is deprecated - use SQLAlchemy ORM instead
"""
import logging
from typing import Optional
from supabase import create_client, Client
from core.config import settings

logger = logging.getLogger(__name__)

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """
    Get or create Supabase client instance
    DEPRECATED: Use SQLAlchemy ORM with get_db() instead
    """
    global _supabase_client
    
    if _supabase_client is None:
        try:
            _supabase_client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
            logger.info("✅ Supabase client initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {e}")
            raise
    
    return _supabase_client


async def close_supabase_client():
    """Close Supabase client connections"""
    global _supabase_client
    if _supabase_client:
        # Supabase client doesn't need explicit closing
        _supabase_client = None
        logger.info("✅ Supabase client closed")