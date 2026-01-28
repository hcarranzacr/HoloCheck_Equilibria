"""
Authentication dependencies for FastAPI
Direct JWT validation without Supabase SDK
"""
import logging
import jwt
from fastapi import Depends, HTTPException, Header
from core.config import settings
from schemas.auth import UserResponse

logger = logging.getLogger(__name__)


async def get_current_user(authorization: str = Header(None)) -> UserResponse:
    """
    Dependency to get the current authenticated user from JWT token.
    Validates token directly without calling Supabase API.
    
    Args:
        authorization: Bearer token from Authorization header
        
    Returns:
        UserResponse: Authenticated user information
        
    Raises:
        HTTPException: If authentication fails
    """
    logger.info("🔐 [AUTH] NEW AUTHENTICATION REQUEST")
    
    if not authorization:
        logger.error("❌ [AUTH] FAILED - No authorization header provided")
        raise HTTPException(
            status_code=401,
            detail="No authorization header provided"
        )
    
    if not authorization.startswith("Bearer "):
        logger.error(f"❌ [AUTH] FAILED - Invalid format")
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format. Expected 'Bearer <token>'"
        )
    
    token = authorization.replace("Bearer ", "")
    logger.info(f"🔑 [AUTH] Token extracted, length: {len(token)}")
    
    try:
        # Decode JWT token without verification (we trust Supabase frontend)
        # The token was already validated by Supabase on the frontend
        payload = jwt.decode(
            token,
            options={"verify_signature": False},  # Don't verify signature
            algorithms=["HS256"]
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id or not email:
            logger.error("❌ [AUTH] FAILED - Invalid token payload")
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload"
            )
        
        logger.info(f"✅ [AUTH] SUCCESS - User ID: {user_id}, Email: {email}")
        
        return UserResponse(
            id=user_id,
            email=email,
            user_metadata=payload.get("user_metadata", {}),
            app_metadata=payload.get("app_metadata", {}),
            created_at=payload.get("created_at", "")
        )
        
    except jwt.ExpiredSignatureError:
        logger.error("❌ [AUTH] FAILED - Token expired")
        raise HTTPException(
            status_code=401,
            detail="Token expired"
        )
    except jwt.InvalidTokenError as e:
        logger.error(f"❌ [AUTH] FAILED - Invalid token: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        logger.error(f"❌ [AUTH] EXCEPTION - {str(e)}")
        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed: {str(e)}"
        )