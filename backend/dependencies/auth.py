"""
Authentication dependencies for FastAPI routes
"""
import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import get_db
from schemas.auth import UserResponse

logger = logging.getLogger(__name__)
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Validate JWT token and return current user information
    """
    token = credentials.credentials
    
    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email", "")
        name: str = payload.get("name", "")
        role: str = payload.get("role", "user")
        
        # CRITICAL LOGGING - See what user_id we're getting from token
        logger.info(f"🔍 AUTH DEBUG - Token decoded successfully")
        logger.info(f"🔍 AUTH DEBUG - user_id from token: {user_id}")
        logger.info(f"🔍 AUTH DEBUG - email from token: {email}")
        logger.info(f"🔍 AUTH DEBUG - role from token: {role}")
        logger.info(f"🔍 AUTH DEBUG - Full payload: {payload}")
        
        if user_id is None:
            logger.error("❌ AUTH ERROR - No 'sub' field in token payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token - missing user ID"
            )
        
        # Check if user_profile exists in database
        from models.user_profiles import UserProfile
        from sqlalchemy import select
        
        query = select(UserProfile).where(UserProfile.user_id == str(user_id))
        result = await db.execute(query)
        user_profile = result.scalar_one_or_none()
        
        if user_profile:
            logger.info(f"✅ AUTH DEBUG - Found user_profile in DB: id={user_profile.id}, organization_id={user_profile.organization_id}")
        else:
            logger.warning(f"⚠️ AUTH DEBUG - No user_profile found in DB for user_id={user_id}")
            logger.warning(f"⚠️ AUTH DEBUG - User can authenticate but has no profile record")
        
        return UserResponse(
            id=str(user_id),
            email=email,
            name=name,
            role=role,
            organization_id=str(user_profile.organization_id) if user_profile and user_profile.organization_id else None
        )
        
    except JWTError as e:
        logger.error(f"❌ JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    except Exception as e:
        logger.error(f"❌ Unexpected auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


async def get_current_active_user(
    current_user: UserResponse = Depends(get_current_user),
) -> UserResponse:
    """
    Ensure the current user is active (can be extended with more checks)
    """
    return current_user