import hashlib
import logging
from datetime import datetime
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from schemas.auth import UserResponse
from core.supabase_client import get_supabase_client_with_token

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)


async def get_bearer_token(
    request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> str:
    """Extract bearer token from Authorization header."""
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials

    logger.debug("Authentication required for request %s %s", request.method, request.url.path)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication credentials were not provided")


async def get_bearer_token_optional(
    request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> Optional[str]:
    """Extract bearer token from Authorization header (optional)."""
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials
    return None


async def get_current_user(token: str = Depends(get_bearer_token)) -> UserResponse:
    """Dependency to get current authenticated user via Supabase JWT token."""
    try:
        # Get Supabase client with user's token
        supabase = get_supabase_client_with_token(token)
        
        # Verify token with Supabase
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        
        user = user_response.user
        user_id = user.id
        email = user.email or ""
        
        # Get user metadata
        user_metadata = user.user_metadata or {}
        name = user_metadata.get("full_name") or user_metadata.get("name")
        
        # Get role from user_metadata or app_metadata
        app_metadata = user.app_metadata or {}
        role = user_metadata.get("role") or app_metadata.get("role", "user")
        
        # Parse last_login if available
        last_login = None
        last_login_raw = user_metadata.get("last_login")
        if isinstance(last_login_raw, str):
            try:
                last_login = datetime.fromisoformat(last_login_raw)
            except ValueError:
                user_hash = hashlib.sha256(str(user_id).encode()).hexdigest()[:8]
                logger.debug("Failed to parse last_login for user hash: %s", user_hash)
        
        return UserResponse(
            id=user_id,
            email=email,
            name=name,
            role=role,
            last_login=last_login,
        )
        
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error verifying token with Supabase: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )


async def get_current_user_optional(token: Optional[str] = Depends(get_bearer_token_optional)) -> Optional[UserResponse]:
    """Dependency to get current authenticated user via Supabase JWT token (optional)."""
    if not token:
        return None
    
    try:
        # Get Supabase client with user's token
        supabase = get_supabase_client_with_token(token)
        
        # Verify token with Supabase
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            return None
        
        user = user_response.user
        user_id = user.id
        email = user.email or ""
        
        # Get user metadata
        user_metadata = user.user_metadata or {}
        name = user_metadata.get("full_name") or user_metadata.get("name")
        
        # Get role from user_metadata or app_metadata
        app_metadata = user.app_metadata or {}
        role = user_metadata.get("role") or app_metadata.get("role", "user")
        
        # Parse last_login if available
        last_login = None
        last_login_raw = user_metadata.get("last_login")
        if isinstance(last_login_raw, str):
            try:
                last_login = datetime.fromisoformat(last_login_raw)
            except ValueError:
                user_hash = hashlib.sha256(str(user_id).encode()).hexdigest()[:8]
                logger.debug("Failed to parse last_login for user hash: %s", user_hash)
        
        return UserResponse(
            id=user_id,
            email=email,
            name=name,
            role=role,
            last_login=last_login,
        )
        
    except Exception as exc:
        logger.warning(f"Token validation failed: {exc}")
        return None


async def get_admin_user(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Dependency to ensure current user has admin role."""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user