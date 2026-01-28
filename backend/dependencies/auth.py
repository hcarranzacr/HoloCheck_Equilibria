import base64
import json
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from schemas.auth import UserResponse
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserResponse:
    """
    Extract user info from JWT token without decoding/verification.
    Parses the payload manually from base64.
    """
    try:
        token = credentials.credentials
        
        # Split JWT: header.payload.signature
        parts = token.split('.')
        if len(parts) != 3:
            raise HTTPException(status_code=401, detail="Invalid token format")
        
        # Decode payload from base64
        payload_encoded = parts[1]
        # Add padding if needed
        padding = 4 - len(payload_encoded) % 4
        if padding != 4:
            payload_encoded += '=' * padding
        
        payload_bytes = base64.urlsafe_b64decode(payload_encoded)
        payload = json.loads(payload_bytes)
        
        # Extract user info from payload
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Missing user ID in token")
        
        return UserResponse(
            id=user_id,
            email=payload.get("email", ""),
            role=payload.get("user_metadata", {}).get("role", "employee"),
            organization_id=payload.get("user_metadata", {}).get("organization_id")
        )
    except json.JSONDecodeError as e:
        logger.error(f"JWT payload decode error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token payload")
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserResponse | None:
    """
    Optional authentication - returns None if token is invalid.
    """
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None