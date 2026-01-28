"""
Database initialization service
"""
import logging
from core.database import db_manager

logger = logging.getLogger(__name__)


async def initialize_database():
    """Initialize database tables and check health"""
    try:
        logger.info("🔄 Initializing database...")
        
        # Initialize tables
        await db_manager.init_db()
        
        # Health check
        is_healthy = await db_manager.health_check()
        
        if is_healthy:
            logger.info("✅ Database initialized successfully")
        else:
            logger.error("❌ Database health check failed")
            raise Exception("Database health check failed")
            
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {e}")
        raise