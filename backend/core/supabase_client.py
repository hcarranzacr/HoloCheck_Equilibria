"""
Supabase REST API Client for database operations
This replaces direct PostgreSQL connections with Supabase REST API
"""
import logging
from typing import Any, Dict, List, Optional
from supabase import create_client, Client
import os

logger = logging.getLogger(__name__)


class SupabaseManager:
    """Manager for Supabase REST API connections"""
    
    def __init__(self):
        self.client: Optional[Client] = None
        self._initialized = False
    
    def init_client(self):
        """Initialize Supabase client"""
        if self._initialized and self.client:
            logger.info("Supabase client already initialized")
            return
        
        try:
            supabase_url = os.getenv("SUPABASE_URL", "https://nmwbfvvacilgyxbwvnqb.supabase.co")
            supabase_key = os.getenv("SUPABASE_KEY", "sb_publishable_bv9N5FWT448fasDBMBD8Og_jM3cc4pj")
            
            if not supabase_url or not supabase_key:
                raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
            
            self.client = create_client(supabase_url, supabase_key)
            self._initialized = True
            logger.info("✅ Supabase REST API client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise
    
    def get_client(self) -> Client:
        """Get Supabase client instance"""
        if not self.client:
            self.init_client()
        return self.client
    
    async def health_check(self) -> bool:
        """Check if Supabase connection is healthy"""
        try:
            client = self.get_client()
            # Try a simple query to verify connection
            result = client.table('organizations').select('id').limit(1).execute()
            logger.info("✅ Supabase health check passed")
            return True
        except Exception as e:
            logger.error(f"❌ Supabase health check failed: {e}")
            return False


# Global Supabase manager instance
supabase_manager = SupabaseManager()


def get_supabase_client() -> Client:
    """Dependency for getting Supabase client"""
    return supabase_manager.get_client()