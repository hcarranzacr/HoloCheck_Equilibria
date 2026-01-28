"""
Database initialization service
"""
import logging
from core.database import db_manager, engine

logger = logging.getLogger(__name__)


async def initialize_database():
    """Initialize database tables and check health"""
    try:
        logger.info("🔄 Starting database initialization...")
        
        # Initialize tables (non-blocking)
        await db_manager.init_db()
        
        # Health check (non-blocking)
        is_healthy = await db_manager.health_check()
        
        if is_healthy:
            logger.info("✅ Database initialized and healthy")
        else:
            logger.warning("⚠️ Database initialization completed but health check failed")
            
    except Exception as e:
        logger.error(f"❌ Database initialization error: {e}")
        # Don't raise - allow app to start
        logger.warning("⚠️ Application will continue without database")


async def close_database():
    """Close database connections"""
    try:
        logger.info("🔄 Closing database connections...")
        await engine.dispose()
        logger.info("✅ Database connections closed")
    except Exception as e:
        logger.error(f"❌ Error closing database: {e}")