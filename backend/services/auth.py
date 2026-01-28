"""
Authentication service
"""
import logging

logger = logging.getLogger(__name__)


async def initialize_admin_user():
    """Initialize admin user for development"""
    try:
        logger.info("🔄 Admin user initialization skipped (handled by Supabase)")
        # Admin user creation is handled by Supabase, not needed here
        pass
    except Exception as e:
        logger.error(f"❌ Admin user initialization error: {e}")
        # Don't raise - allow app to start