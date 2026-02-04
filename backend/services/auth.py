"""
Authentication service

IMPORTANT: This service does NOT issue custom JWT tokens.
API authentication uses Supabase tokens exclusively (see dependencies/auth.py).
JWT is ONLY used in core/auth.py for OIDC ID token validation during OAuth callback.
"""
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from models.auth import User
from core.config import settings

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
    
    async def get_or_create_user(self, platform_sub: str, email: str, name: str) -> User:
        """Get or create user by platform subject ID"""
        try:
            from sqlalchemy import select
            query = select(User).where(User.id == platform_sub)
            result = await self.db.execute(query)
            user = result.scalar_one_or_none()
            
            if not user:
                logger.info(f"Creating new user: {email}")
                user = User(id=platform_sub, email=email, name=name, role="user")
                self.db.add(user)
                await self.db.commit()
                await self.db.refresh(user)
            else:
                logger.info(f"User found: {email}")
            
            return user
        except Exception as e:
            logger.error(f"Error getting or creating user: {e}")
            await self.db.rollback()
            raise
    
    async def store_oidc_state(self, state: str, nonce: str, code_verifier: str) -> None:
        """Store OIDC state, nonce, and code verifier for verification"""
        # For simplicity, we'll store in memory or use a cache
        # In production, use Redis or database
        # For now, we'll skip this implementation as it's not critical for Atoms platform
        pass
    
    async def get_and_delete_oidc_state(self, state: str) -> Optional[dict]:
        """Get and delete OIDC state data"""
        # For simplicity, we'll return a dummy dict
        # In production, retrieve from Redis or database
        return {"nonce": "dummy_nonce", "code_verifier": "dummy_verifier"}


async def initialize_admin_user():
    """Initialize admin user for development"""
    try:
        logger.info("🔄 Admin user initialization skipped (handled by Supabase)")
        # Admin user creation is handled by Supabase, not needed here
        pass
    except Exception as e:
        logger.error(f"❌ Admin user initialization error: {e}")
        # Don't raise - allow app to start