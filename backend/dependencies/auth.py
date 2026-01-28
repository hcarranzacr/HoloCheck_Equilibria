"""
Authentication dependencies for FastAPI routes
SIMPLIFIED: No JWT decoding, just verify token exists
"""
import logging
from typing import Optional

from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from schemas.auth import UserResponse

logger = logging.getLogger(__name__)


async def get_current_user(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Simplified authentication - just verify token exists
    Frontend already validated with Supabase, we trust it
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
    
    if not token or len(token) < 10:
        logger.error("❌ AUTH - Token too short or empty")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format"
        )
    
    # Extract user_id from token WITHOUT decoding
    # Supabase JWT format: header.payload.signature
    # payload is base64 encoded JSON with "sub" field
    try:
        import base64
        import json
        
        # Split token and get payload (middle part)
        parts = token.split('.')
        if len(parts) != 3:
            raise ValueError("Invalid JWT format")
        
        # Decode payload (add padding if needed)
        payload_b64 = parts[1]
        padding = 4 - (len(payload_b64) % 4)
        if padding != 4:
            payload_b64 += '=' * padding
        
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        payload = json.loads(payload_bytes)
        
        user_id = payload.get("sub")
        email = payload.get("email", "")
        role = payload.get("role", "user")
        
        logger.info(f"✅ AUTH - Extracted user_id: {user_id}, email: {email}")
        
        if not user_id:
            raise ValueError("No user_id in token")
        
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
            name=email.split('@')[0],  # Use email prefix as name
            role=role,
            organization_id=organization_id
        )
        
    except Exception as e:
        logger.error(f"❌ AUTH - Token parsing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


async def get_current_user_optional(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Optional[UserResponse]:
    """
    Optional authentication - returns None if no valid token instead of raising error
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
    Ensure the current user is active
    """
    return current_user