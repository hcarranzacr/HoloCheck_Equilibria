import asyncio
import logging
import os
from typing import AsyncGenerator

from core.config import settings
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    pass


class DatabaseManager:
    """Database manager with Supabase REST API support"""
    
    def __init__(self):
        self.engine = None
        self._initialized = False
        self.async_session_maker = None
        self._init_lock = asyncio.Lock()
        self.use_rest_api = True  # Flag to indicate using REST API instead of direct connection
    
    async def init_db(self):
        """Initialize database connection - now using Supabase REST API"""
        logger.info("🔧 Starting database initialization with Supabase REST API...")
        
        async with self._init_lock:
            if self._initialized:
                logger.info("Database already initialized")
                return
            
            try:
                # Import Supabase manager
                from core.supabase_client import supabase_manager
                
                # Initialize Supabase REST API client
                supabase_manager.init_client()
                
                # Verify connection
                is_healthy = await supabase_manager.health_check()
                if not is_healthy:
                    logger.warning("Supabase health check failed, but continuing...")
                
                self._initialized = True
                logger.info("✅ Database initialization completed successfully using Supabase REST API")
                
            except Exception as e:
                logger.error(f"Failed to initialize database: {e}")
                raise
    
    async def close_db(self):
        """Close database connection"""
        if not self._initialized:
            return
        
        try:
            logger.info("Database connection closed")
            self._initialized = False
        except Exception as e:
            logger.warning(f"Error closing database: {e}")
    
    async def create_tables(self):
        """Create tables - not needed with Supabase REST API (tables managed in Supabase dashboard)"""
        logger.info("✅ Using Supabase REST API - tables are managed in Supabase dashboard")
        return


# Global database manager instance
db_manager = DatabaseManager()


async def get_db() -> AsyncGenerator[None, None]:
    """
    FastAPI dependency for database session
    With Supabase REST API, this is a no-op but kept for compatibility
    """
    try:
        yield None
    finally:
        pass


# For backward compatibility with existing code
async def get_async_session() -> AsyncGenerator[None, None]:
    """Alias for get_db"""
    async for session in get_db():
        yield session