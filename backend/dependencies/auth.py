"""
Authentication dependencies for FastAPI
"""
import logging
from fastapi import Depends, HTTPException, Header
from core.supabase_client import get_supabase_client
from schemas.auth import UserResponse

logger = logging.getLogger(__name__)


async def get_current_user(authorization: str = Header(None)) -> UserResponse:
    """
    Dependency to get the current authenticated user from Supabase token.
    
    Args:
        authorization: Bearer token from Authorization header
        
    Returns:
        UserResponse: Authenticated user information
        
    Raises:
        HTTPException: If authentication fails
    """
    # Log the incoming request
    logger.info("=" * 80)
    logger.info("🔐 [AUTH] NEW AUTHENTICATION REQUEST")
    logger.info(f"🔐 [AUTH] Authorization header received: {authorization[:50] if authorization else 'NONE'}...")
    
    if not authorization:
        logger.error("❌ [AUTH] FAILED - No authorization header provided")
        raise HTTPException(
            status_code=401,
            detail="No authorization header provided"
        )
    
    if not authorization.startswith("Bearer "):
        logger.error(f"❌ [AUTH] FAILED - Invalid format: {authorization[:20]}")
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format. Expected 'Bearer <token>'"
        )
    
    token = authorization.replace("Bearer ", "")
    logger.info(f"🔑 [AUTH] Token extracted, length: {len(token)}")
    logger.info(f"🔑 [AUTH] Token preview: {token[:20]}...{token[-20:]}")
    
    try:
        supabase = get_supabase_client()
        logger.info("📡 [AUTH] Calling Supabase auth.get_user()...")
        
        # Get user from Supabase
        user_response = supabase.auth.get_user(token)
        logger.info(f"📡 [AUTH] Supabase response received: {type(user_response)}")
        
        if not user_response or not user_response.user:
            logger.error("❌ [AUTH] FAILED - Invalid token, no user returned from Supabase")
            logger.error(f"❌ [AUTH] Response: {user_response}")
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token - user not found"
            )
        
        user = user_response.user
        logger.info(f"✅ [AUTH] SUCCESS - Token validated")
        logger.info(f"✅ [AUTH] User ID: {user.id}")
        logger.info(f"✅ [AUTH] User Email: {user.email}")
        logger.info(f"✅ [AUTH] User Metadata: {user.user_metadata}")
        logger.info("=" * 80)
        
        return UserResponse(
            id=user.id,
            email=user.email,
            user_metadata=user.user_metadata or {},
            app_metadata=user.app_metadata or {},
            created_at=user.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("=" * 80)
        logger.error(f"❌ [AUTH] EXCEPTION - Token validation failed")
        logger.error(f"❌ [AUTH] Exception type: {type(e).__name__}")
        logger.error(f"❌ [AUTH] Exception message: {str(e)}")
        logger.error(f"❌ [AUTH] Exception details: {repr(e)}")
        logger.error("=" * 80)
        raise HTTPException(
            status_code=401,
            detail=f"Token validation failed: {str(e)}"
        )