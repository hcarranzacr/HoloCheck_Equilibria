"""
Authentication dependencies for FastAPI
Handles JWT token validation and user authentication
"""
import logging
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
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
    Validate JWT token and return current user
    Raises HTTPException if token is invalid
    """
    try:
        token = credentials.credentials
        
        # Decode JWT token with proper key parameter
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role", "user")
        
        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user information"
            )
        
        return UserResponse(
            id=user_id,
            email=email,
            role=role
        )
        
    except jwt.ExpiredSignatureError:
        logger.error("❌ AUTH - Token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        logger.error(f"❌ AUTH - Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        logger.error(f"❌ AUTH - Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_db),
) -> Optional[UserResponse]:
    """
    Validate JWT token and return current user, or None if no token provided
    Does not raise exception if token is missing
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        
        # Decode JWT token with proper key parameter
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role", "user")
        
        if not user_id or not email:
            return None
        
        return UserResponse(
            id=user_id,
            email=email,
            role=role
        )
        
    except Exception as e:
        logger.warning(f"⚠️ AUTH - Optional auth failed: {e}")
        return None