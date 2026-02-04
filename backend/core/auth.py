"""
Authentication utilities for OIDC flow.

IMPORTANT: JWT is ONLY used for OIDC ID token validation during OAuth callback.
API authentication uses Supabase tokens exclusively (see dependencies/auth.py).
DO NOT use JWT for API endpoint authentication.

For token validation in API endpoints, use dependencies/auth.py instead.
"""
import logging
from typing import Dict, Optional
import httpx
from jose import jwt, jwk
from jose.exceptions import JWTError

logger = logging.getLogger(__name__)


def validate_id_token(id_token: str, jwks_uri: str, issuer: str, client_id: str) -> Optional[Dict]:
    """
    Validate OIDC ID token with proper JWT signature verification using JWKS.
    
    This function is ONLY for OIDC callback validation, NOT for API authentication.
    
    Args:
        id_token: The OIDC ID token to validate
        jwks_uri: URI to fetch JSON Web Key Set
        issuer: Expected token issuer
        client_id: Expected audience (client ID)
        
    Returns:
        Dict containing token payload if valid, None otherwise
    """
    try:
        # Get the key ID from token header
        header = jwt.get_unverified_header(id_token)
        kid = header.get("kid")
        
        if not kid:
            logger.error("No 'kid' found in token header")
            return None
        
        # Fetch JWKS
        response = httpx.get(jwks_uri)
        response.raise_for_status()
        jwks = response.json()
        
        # Find the matching key
        key = None
        for jwk_key in jwks.get("keys", []):
            if jwk_key.get("kid") == kid:
                key = jwk_key
                break
        
        if not key:
            logger.error(f"No matching key found for kid: {kid}")
            return None
        
        # Convert JWK to PEM
        try:
            from cryptography.hazmat.primitives import serialization
            from cryptography.hazmat.backends import default_backend
            
            # Use jose's jwk module to construct the key
            public_key = jwk.construct(key)
            pem_key = public_key.to_pem().decode('utf-8')
        except Exception as e:
            logger.error(f"Error converting JWK to PEM: {e}")
            return None
        
        # Validate and decode the token
        payload = jwt.decode(
            id_token,
            pem_key,
            algorithms=["RS256"],
            issuer=issuer,
            audience=client_id,
        )
        
        logger.info("✅ ID token validated successfully")
        return payload
        
    except JWTError as e:
        logger.error(f"JWT validation error: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error validating ID token: {e}")
        return None


def extract_user_info(id_token_payload: Dict) -> Dict:
    """
    Extract user information from validated ID token payload.
    
    Args:
        id_token_payload: Validated ID token payload
        
    Returns:
        Dict containing user info (sub, email, name, etc.)
    """
    return {
        "sub": id_token_payload.get("sub"),
        "email": id_token_payload.get("email"),
        "name": id_token_payload.get("name"),
        "given_name": id_token_payload.get("given_name"),
        "family_name": id_token_payload.get("family_name"),
        "picture": id_token_payload.get("picture"),
    }