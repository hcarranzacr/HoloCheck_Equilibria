"""
Mock data initialization service
"""
import logging

logger = logging.getLogger(__name__)


async def initialize_mock_data():
    """Initialize mock data for development"""
    try:
        logger.info("🔄 Mock data initialization skipped (not needed for production)")
        # Mock data initialization is optional and should not block startup
        pass
    except Exception as e:
        logger.error(f"❌ Mock data initialization error: {e}")
        # Don't raise - allow app to start