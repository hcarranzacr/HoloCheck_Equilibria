"""
Database configuration and session management
Lazy initialization - no blocking on import
"""
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

from core.config import settings

logger = logging.getLogger(__name__)

# Create base class for models
Base = declarative_base()

# Create async engine - NO BLOCKING OPERATIONS HERE
engine = create_async_engine(
    settings.database_url,
    echo=False,  # Disable SQL logging for performance
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,  # 30 second timeout
    connect_args={
        "timeout": 10,  # 10 second connection timeout
        "command_timeout": 10,  # 10 second command timeout
    }
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

logger.info("✅ Database engine created successfully")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get database session
    Creates session lazily on first request
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """
    Initialize database tables
    Called lazily, not on startup
    """
    try:
        logger.info("Initializing database tables...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables initialized")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        # Don't raise - allow app to start even if DB init fails