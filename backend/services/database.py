"""Database service for initialization and management"""
import logging
from core.database import db_manager

logger = logging.getLogger(__name__)


async def initialize_database():
    """Initialize database connection and create tables"""
    try:
        logger.info("🔧 Initializing database...")
        await db_manager.init_db()
        await db_manager.create_tables()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {e}")
        raise


async def close_database():
    """Close database connection"""
    try:
        logger.info("Closing database connection...")
        await db_manager.close_db()
        logger.info("✅ Database connection closed")
    except Exception as e:
        logger.error(f"Error closing database: {e}")