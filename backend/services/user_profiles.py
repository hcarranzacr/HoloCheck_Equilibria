from datetime import datetime
from typing import List, Optional
from uuid import UUID

from models.user_profiles import UserProfile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class UserProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_profile(self, user_id: UUID) -> Optional[UserProfile]:
        """Get a user profile by ID"""
        result = await self.db.execute(select(UserProfile).where(UserProfile.id == user_id))
        return result.scalar_one_or_none()

    async def get_user_profile_by_email(self, email: str) -> Optional[UserProfile]:
        """Get a user profile by email"""
        result = await self.db.execute(select(UserProfile).where(UserProfile.email == email))
        return result.scalar_one_or_none()

    async def list_user_profiles(
        self,
        organization_id: Optional[UUID] = None,
        department_id: Optional[UUID] = None,
        role: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[UserProfile]:
        """List user profiles with optional filters"""
        query = select(UserProfile)

        if organization_id:
            query = query.where(UserProfile.organization_id == organization_id)
        if department_id:
            query = query.where(UserProfile.department_id == department_id)
        if role:
            query = query.where(UserProfile.role == role)

        query = query.offset(skip).limit(limit).order_by(UserProfile.created_at.desc())

        result = await self.db.execute(query)
        return result.scalars().all()

    async def create_user_profile(self, profile_data: dict) -> UserProfile:
        """Create a new user profile"""
        profile = UserProfile(**profile_data)
        profile.created_at = datetime.utcnow()
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def update_user_profile(self, user_id: UUID, profile_data: dict) -> Optional[UserProfile]:
        """Update a user profile"""
        profile = await self.get_user_profile(user_id)
        if not profile:
            return None

        for key, value in profile_data.items():
            if hasattr(profile, key):
                setattr(profile, key, value)

        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def delete_user_profile(self, user_id: UUID) -> bool:
        """Delete a user profile"""
        profile = await self.get_user_profile(user_id)
        if not profile:
            return False

        await self.db.delete(profile)
        await self.db.commit()
        return True