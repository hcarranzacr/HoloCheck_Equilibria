"""
Authentication dependencies for FastAPI
"""
import logging
import base64
import json
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
    
    # Validate JWT structure (3 parts separated by dots)
    token_parts = token.split('.')
    logger.info(f"🔍 [AUTH] Token parts count: {len(token_parts)} (expected: 3)")
    
    if len(token_parts) != 3:
        logger.error(f"❌ [AUTH] FAILED - Invalid JWT structure: {len(token_parts)} parts instead of 3")
        raise HTTPException(
            status_code=401,
            detail=f"Invalid JWT structure: token has {len(token_parts)} parts, expected 3"
        )
    
    # Try to decode JWT payload (without verification) to inspect claims
    try:
        # Add padding if needed for base64 decoding
        payload_b64 = token_parts[1]
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += '=' * padding
        
        payload_json = base64.urlsafe_b64decode(payload_b64)
        payload = json.loads(payload_json)
        
        logger.info(f"🔍 [AUTH] JWT Payload decoded (unverified):")
        logger.info(f"  - sub (user_id): {payload.get('sub', 'N/A')}")
        logger.info(f"  - email: {payload.get('email', 'N/A')}")
        logger.info(f"  - exp (expiration): {payload.get('exp', 'N/A')}")
        logger.info(f"  - iat (issued_at): {payload.get('iat', 'N/A')}")
        logger.info(f"  - aud (audience): {payload.get('aud', 'N/A')}")
        logger.info(f"  - iss (issuer): {payload.get('iss', 'N/A')}")
        
        # Check if token is expired (basic check before Supabase validation)
        import time
        current_time = int(time.time())
        exp_time = payload.get('exp', 0)
        
        if exp_time and current_time > exp_time:
            logger.error(f"❌ [AUTH] FAILED - Token expired")
            logger.error(f"  - Current time: {current_time}")
            logger.error(f"  - Expiration time: {exp_time}")
            logger.error(f"  - Expired {current_time - exp_time} seconds ago")
            raise HTTPException(
                status_code=401,
                detail=f"Token expired {current_time - exp_time} seconds ago"
            )
        
        logger.info(f"✅ [AUTH] Token not expired (expires in {exp_time - current_time} seconds)")
        
    except Exception as e:
        logger.warning(f"⚠️ [AUTH] Could not decode JWT payload: {str(e)}")
        logger.warning(f"⚠️ [AUTH] Proceeding with Supabase validation anyway...")
    
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