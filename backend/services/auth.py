import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta, timezone
import secrets
import jwt

from core.config import settings
from core.supabase_client import get_supabase_client
from sqlalchemy.ext.asyncio import AsyncSession
from models.auth import User

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication service for handling OIDC flows and token management"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.supabase = get_supabase_client()
    
    async def store_oidc_state(self, state: str, nonce: str, code_verifier: str) -> None:
        """Store OIDC state, nonce, and code verifier in database"""
        try:
            data = {
                'state': state,
                'nonce': nonce,
                'code_verifier': code_verifier,
                'created_at': datetime.now(timezone.utc).isoformat(),
                'expires_at': (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
            }
            self.supabase.table('oidc_states').insert(data).execute()
            logger.debug(f"Stored OIDC state: {state}")
        except Exception as e:
            logger.error(f"Error storing OIDC state: {e}")
            raise
    
    async def get_and_delete_oidc_state(self, state: str) -> Optional[Dict[str, Any]]:
        """Get and delete OIDC state from database"""
        try:
            # Get the state
            result = self.supabase.table('oidc_states').select('*').eq('state', state).execute()
            
            if not result.data or len(result.data) == 0:
                logger.warning(f"OIDC state not found: {state}")
                return None
            
            state_data = result.data[0]
            
            # Check if expired
            expires_at = datetime.fromisoformat(state_data['expires_at'].replace('Z', '+00:00'))
            if expires_at < datetime.now(timezone.utc):
                logger.warning(f"OIDC state expired: {state}")
                # Delete expired state
                self.supabase.table('oidc_states').delete().eq('state', state).execute()
                return None
            
            # Delete the state
            self.supabase.table('oidc_states').delete().eq('state', state).execute()
            
            return {
                'nonce': state_data['nonce'],
                'code_verifier': state_data.get('code_verifier')
            }
        except Exception as e:
            logger.error(f"Error getting OIDC state: {e}")
            return None
    
    async def get_or_create_user(
        self, 
        platform_sub: str, 
        email: str, 
        name: Optional[str] = None
    ) -> User:
        """Get or create user from OIDC claims using user_profiles table"""
        try:
            # Check if user exists by email in user_profiles table
            result = self.supabase.table('user_profiles').select('*').eq('email', email).execute()
            
            if result.data and len(result.data) > 0:
                user_data = result.data[0]
                logger.info(f"Found existing user: {email}")
                
                # Convert user_profiles data to User model
                return User(
                    id=str(user_data.get('user_id', user_data.get('id', platform_sub))),
                    email=user_data['email'],
                    name=user_data.get('full_name') or name or email.split('@')[0],
                    role=user_data.get('role', 'employee'),
                    platform_sub=platform_sub
                )
            else:
                # Create new user profile
                import uuid
                new_user_id = str(uuid.uuid4())
                
                new_user_data = {
                    'id': new_user_id,
                    'user_id': new_user_id,
                    'email': email,
                    'full_name': name or email.split('@')[0],
                    'role': 'employee',  # Default role
                    'status': 'active',
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
                
                result = self.supabase.table('user_profiles').insert(new_user_data).execute()
                user_data = result.data[0] if result.data else new_user_data
                logger.info(f"Created new user: {email}")
                
                # Convert to User model
                return User(
                    id=str(user_data.get('user_id', user_data.get('id'))),
                    email=user_data['email'],
                    name=user_data.get('full_name') or name or email.split('@')[0],
                    role=user_data.get('role', 'employee'),
                    platform_sub=platform_sub
                )
        except Exception as e:
            logger.error(f"Error getting/creating user: {e}")
            raise
    
    async def issue_app_token(self, user: User) -> tuple[str, datetime, str]:
        """Issue application JWT token for authenticated user"""
        try:
            expires_at = datetime.now(timezone.utc) + timedelta(days=7)
            
            payload = {
                'sub': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'exp': expires_at,
                'iat': datetime.now(timezone.utc),
                'iss': settings.backend_url,
            }
            
            # Use JWT secret from settings
            jwt_secret = getattr(settings, 'jwt_secret', settings.oidc_client_secret)
            token = jwt.encode(payload, jwt_secret, algorithm='HS256')
            
            logger.info(f"Issued app token for user: {user.email}")
            return token, expires_at, 'Bearer'
        except Exception as e:
            logger.error(f"Error issuing app token: {e}")
            raise


async def initialize_admin_user():
    """Initialize default admin user if not exists - using Supabase REST API"""
    try:
        logger.info("Checking for admin user initialization...")
        
        admin_email = settings.admin_email if hasattr(settings, 'admin_email') else "admin@holocheck.com"
        
        # Get Supabase client
        supabase = get_supabase_client()
        
        # Check if admin user exists in user_profiles
        result = supabase.table('user_profiles').select('*').eq('email', admin_email).execute()
        
        if result.data and len(result.data) > 0:
            logger.info(f"Admin user already exists: {admin_email}")
            return
        
        # Create default admin user
        import uuid
        admin_id = str(uuid.uuid4())
        
        admin_data = {
            'id': admin_id,
            'user_id': admin_id,
            'email': admin_email,
            'full_name': 'System Administrator',
            'role': 'admin',
            'status': 'active',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        supabase.table('user_profiles').insert(admin_data).execute()
        logger.info(f"✅ Created default admin user: {admin_email}")
        
    except Exception as e:
        logger.warning(f"Could not initialize admin user: {e}")
        # Don't raise - admin user creation is not critical for startup


async def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email using Supabase REST API"""
    try:
        supabase = get_supabase_client()
        result = supabase.table('user_profiles').select('*').eq('email', email).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None
    except Exception as e:
        logger.error(f"Error getting user by email: {e}")
        return None


async def create_or_update_user(
    email: str,
    name: Optional[str] = None,
    picture: Optional[str] = None,
) -> Optional[dict]:
    """Create or update user from OIDC data using Supabase REST API"""
    try:
        supabase = get_supabase_client()
        
        # Check if user exists
        user = await get_user_by_email(email)
        
        if user:
            # Update existing user
            update_data = {}
            if name:
                update_data['full_name'] = name
            # Note: user_profiles doesn't have a picture column
            
            if update_data:
                result = supabase.table('user_profiles').update(update_data).eq('id', user['id']).execute()
                return result.data[0] if result.data else user
            return user
        
        # Create new user
        import uuid
        new_user_id = str(uuid.uuid4())
        
        new_user_data = {
            'id': new_user_id,
            'user_id': new_user_id,
            'email': email,
            'full_name': name or email,
            'role': 'employee',  # Default role
            'status': 'active',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        result = supabase.table('user_profiles').insert(new_user_data).execute()
        return result.data[0] if result.data else None
        
    except Exception as e:
        logger.error(f"Error creating/updating user: {e}")
        return None