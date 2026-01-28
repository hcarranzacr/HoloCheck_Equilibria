"""
Database configuration and connection management
Direct PostgreSQL connection (no Supabase SDK)
"""
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from core.config import settings

logger = logging.getLogger(__name__)

# Create async engine
engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """
    Dependency for getting database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


class DatabaseManager:
    """Manager for database operations"""
    
    def __init__(self):
        self.engine = engine
        self.session_factory = AsyncSessionLocal
    
    async def init_db(self):
        """Initialize database tables"""
        try:
            async with self.engine.begin() as conn:
                # Import all models to register them
                from models import (
                    organizations, users, user_profiles, departments,
                    biometric_data, biometric_indicator_ranges,
                    ai_analysis_results, recommendations
                )
                
                # Create all tables
                await conn.run_sync(Base.metadata.create_all)
                logger.info("✅ Database tables initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    async def health_check(self) -> bool:
        """Check if database connection is healthy"""
        try:
            async with self.engine.connect() as conn:
                await conn.execute("SELECT 1")
                logger.info("✅ Database health check passed")
                return True
        except Exception as e:
            logger.error(f"❌ Database health check failed: {e}")
            return False


# Global database manager instance
db_manager = DatabaseManager()