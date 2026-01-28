"""
Authentication service
"""
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from models.auth import User

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication service for user management"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email address"""
        try:
            from sqlalchemy import select
            query = select(User).where(User.email == email)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    async def create_user(self, email: str, **kwargs) -> Optional[User]:
        """Create a new user"""
        try:
            user = User(email=email, **kwargs)
            self.db.add(user)
            await self.db.commit()
            await self.db.refresh(user)
            return user
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            await self.db.rollback()
            return None
    
    async def update_user(self, user_id: str, **kwargs) -> Optional[User]:
        """Update user information"""
        try:
            from sqlalchemy import select
            query = select(User).where(User.id == user_id)
            result = await self.db.execute(query)
            user = result.scalar_one_or_none()
            
            if user:
                for key, value in kwargs.items():
                    setattr(user, key, value)
                await self.db.commit()
                await self.db.refresh(user)
            return user
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            await self.db.rollback()
            return None


async def initialize_admin_user():
    """Initialize admin user for development"""
    try:
        logger.info("🔄 Admin user initialization skipped (handled by Supabase)")
        # Admin user creation is handled by Supabase, not needed here
        pass
    except Exception as e:
        logger.error(f"❌ Admin user initialization error: {e}")
        # Don't raise - allow app to start