"""
Autenticación simplificada usando Supabase Admin Client.

REGLA: No validar JWT tokens. El user_id viene del frontend como Bearer token.
Backend confía en el user_id y valida su existencia en user_profiles.
"""

import logging
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.supabase_client import get_supabase_admin
from schemas.auth import UserResponse

logger = logging.getLogger(__name__)
security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserResponse:
    """
    Obtiene el usuario actual desde user_profiles usando el user_id del Bearer token.
    
    NO valida JWT. Asume que el frontend envía user_id válido.
    Valida existencia en user_profiles usando Supabase Admin Client.
    """
    try:
        user_id = credentials.credentials
        logger.info(f"🔍 Buscando usuario: {user_id}")
        
        # Usar cliente admin centralizado
        supabase = get_supabase_admin()
        
        # Consultar user_profiles
        response = supabase.table('user_profiles').select('*').eq('user_id', user_id).execute()
        
        if not response.data or len(response.data) == 0:
            logger.error(f"❌ Usuario no encontrado: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        user_data = response.data[0]
        logger.info(f"✅ Usuario encontrado: {user_data['email']}")
        
        return UserResponse(
            id=user_data['user_id'],
            email=user_data['email'],
            name=user_data.get('full_name'),
            role=user_data.get('role', 'employee'),
            organization_id=user_data.get('organization_id'),
            created_at=user_data.get('created_at', '')
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error de autenticación: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)
) -> Optional[UserResponse]:
    """
    Autenticación opcional. Retorna usuario si existe, None si no.
    """
    if not credentials:
        return None
    
    try:
        user_id = credentials.credentials
        supabase = get_supabase_admin()
        
        response = supabase.table('user_profiles').select('*').eq('user_id', user_id).execute()
        
        if not response.data:
            return None
        
        user_data = response.data[0]
        
        return UserResponse(
            id=user_data['user_id'],
            email=user_data['email'],
            name=user_data.get('full_name'),
            role=user_data.get('role', 'employee'),
            organization_id=user_data.get('organization_id'),
            created_at=user_data.get('created_at', '')
        )
    except Exception as e:
        logger.warning(f"⚠️ Autenticación opcional falló: {e}")
        return None