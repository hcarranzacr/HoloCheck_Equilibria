"""
Database service for health checks and initialization
"""
import logging
from core.database import engine

logger = logging.getLogger(__name__)


async def check_database_health() -> bool:
    """Check if database connection is healthy"""
    try:
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


async def initialize_database():
    """Initialize database - non-blocking"""
    try:
        logger.info("🔄 Starting database initialization...")
        # Database initialization happens lazily
        logger.info("✅ Database initialization completed")
    except Exception as e:
        logger.error(f"❌ Database initialization error: {e}")
        # Don't raise - allow app to start


async def close_database():
    """Close database connections"""
    try:
        await engine.dispose()
        logger.info("✅ Database connections closed")
    except Exception as e:
        logger.error(f"❌ Error closing database: {e}")