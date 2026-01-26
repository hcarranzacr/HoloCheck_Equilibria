import logging
from typing import Optional
from datetime import datetime, timedelta, timezone

from core.config import settings
from core.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)


async def initialize_admin_user():
    """Initialize default admin user if not exists - using Supabase REST API"""
    try:
        logger.info("Checking for admin user initialization...")
        
        admin_email = settings.admin_email if hasattr(settings, 'admin_email') else "admin@holocheck.com"
        
        # Get Supabase client
        supabase = get_supabase_client()
        
        # Check if admin user exists
        result = supabase.table('users').select('*').eq('email', admin_email).execute()
        
        if result.data and len(result.data) > 0:
            logger.info(f"Admin user already exists: {admin_email}")
            return
        
        # Create default admin user
        admin_data = {
            'email': admin_email,
            'name': 'System Administrator',
            'role': 'admin',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        supabase.table('users').insert(admin_data).execute()
        logger.info(f"✅ Created default admin user: {admin_email}")
        
    except Exception as e:
        logger.warning(f"Could not initialize admin user: {e}")
        # Don't raise - admin user creation is not critical for startup


async def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email using Supabase REST API"""
    try:
        supabase = get_supabase_client()
        result = supabase.table('users').select('*').eq('email', email).execute()
        
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
                update_data['name'] = name
            if picture:
                update_data['picture'] = picture
            
            if update_data:
                result = supabase.table('users').update(update_data).eq('id', user['id']).execute()
                return result.data[0] if result.data else user
            return user
        
        # Create new user
        new_user_data = {
            'email': email,
            'name': name or email,
            'picture': picture,
            'role': 'employee',  # Default role
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        result = supabase.table('users').insert(new_user_data).execute()
        return result.data[0] if result.data else None
        
    except Exception as e:
        logger.error(f"Error creating/updating user: {e}")
        return None