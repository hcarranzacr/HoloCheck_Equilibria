"""
Database configuration and connection management
"""
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from core.config import settings

logger = logging.getLogger(__name__)

# Create async engine
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


class DatabaseManager:
    """Database manager for handling connections"""
    
    def __init__(self):
        self.engine = engine
        self.session_factory = AsyncSessionLocal
    
    async def init_db(self):
        """Initialize database - create tables if they don't exist"""
        try:
            async with self.engine.begin() as conn:
                # Import all models here to ensure they're registered
                from models import (
                    user, organization, department, biometric_measurement,
                    biometric_indicator, ai_analysis_result, ai_analysis_log,
                    system_audit_log, app_setting, organization_subscription,
                    subscription_usage_log, organization_usage_summary,
                    param_subscription_plan, param_industry, param_sector,
                    benefit_category, benefit_type, benefit, benefit_eligibility_rule,
                    benefit_assignment, benefit_claim
                )
                
                # Create all tables
                await conn.run_sync(Base.metadata.create_all)
                logger.info("✅ Database tables created/verified successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize database: {str(e)}")
            raise
    
    async def get_session(self) -> AsyncSession:
        """Get a database session"""
        async with self.session_factory() as session:
            try:
                yield session
            finally:
                await session.close()
    
    async def close(self):
        """Close database connections"""
        await self.engine.dispose()
        logger.info("Database connections closed")


# Global database manager instance
db_manager = DatabaseManager()


async def get_db():
    """Dependency for getting database sessions"""
    async with db_manager.session_factory() as session:
        try:
            yield session
        finally:
            await session.close()