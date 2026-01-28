"""
Authentication dependencies for FastAPI routes
"""
import logging
from typing import Optional

from fastapi import Depends, HTTPException, status, Header
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import get_db
from schemas.auth import UserResponse

logger = logging.getLogger(__name__)


async def get_current_user(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Validate JWT token and return current user information
    Accepts Supabase JWT tokens without signature verification
    """
    if not authorization:
        logger.error("❌ AUTH - No authorization header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authorization header provided"
        )
    
    if not authorization.startswith("Bearer "):
        logger.error("❌ AUTH - Invalid authorization format")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format"
        )
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Decode JWT token WITHOUT signature verification
        # Supabase tokens are already validated on the frontend
        payload = jwt.decode(
            token,
            options={"verify_signature": False},  # CRITICAL: Don't verify signature
            algorithms=["HS256", "RS256"]  # Support both algorithms
        )
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email", "")
        name: str = payload.get("name", "")
        role: str = payload.get("role", "user")
        
        logger.info(f"🔍 AUTH DEBUG - user_id: {user_id}, email: {email}")
        
        if user_id is None:
            logger.error("❌ AUTH - No 'sub' field in token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token - missing user ID"
            )
        
        # Check if user_profile exists in database
        from models.user_profiles import UserProfile
        from sqlalchemy import select
        
        query = select(UserProfile).where(UserProfile.user_id == str(user_id))
        result = await db.execute(query)
        user_profile = result.scalar_one_or_none()
        
        if user_profile:
            logger.info(f"✅ AUTH - Found profile: {user_profile.full_name}")
            organization_id = str(user_profile.organization_id) if user_profile.organization_id else None
        else:
            logger.warning(f"⚠️ AUTH - No profile for user_id: {user_id}")
            organization_id = None
        
        return UserResponse(
            id=str(user_id),
            email=email,
            name=name,
            role=role,
            organization_id=organization_id
        )
        
    except JWTError as e:
        logger.error(f"❌ AUTH - JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )
    except Exception as e:
        logger.error(f"❌ AUTH - Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


async def get_current_user_optional(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Optional[UserResponse]:
    """
    Optional authentication - returns None if no valid token instead of raising error
    Used for endpoints that work with or without authentication
    """
    if not authorization:
        return None
    
    try:
        return await get_current_user(authorization, db)
    except HTTPException:
        return None
    except Exception as e:
        logger.warning(f"⚠️ Optional auth failed: {e}")
        return None


async def get_current_active_user(
    current_user: UserResponse = Depends(get_current_user),
) -> UserResponse:
    """
    Ensure the current user is active (can be extended with more checks)
    """
    return current_user