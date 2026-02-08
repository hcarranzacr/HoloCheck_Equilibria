from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from typing import Optional
import logging

from core.database import get_db

router = APIRouter(prefix="/api/v1/i18n", tags=["i18n"])
logger = logging.getLogger(__name__)


@router.get("/translations")
async def get_translations(
    screen_code: str = Query(..., description="Screen code (e.g., 'lobby', 'dashboard')"),
    locale: str = Query(..., description="Locale code (e.g., 'es', 'es-CR', 'en')"),
    organization_id: Optional[str] = Query(None, description="Organization ID for custom overrides"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get translations for a specific screen and locale.
    
    Returns a flat dictionary of key-value pairs:
    {
        "lobby.login_welcome": "Bienvenido",
        "lobby.main_message": "Continuar al Dashboard",
        ...
    }
    
    Priority order:
    1. Organization-specific overrides (i18n_overrides)
    2. Base translations (i18n_translations)
    3. Fallback to base locale (e.g., es-CR -> es)
    """
    try:
        logger.info(f"Loading translations: screen_code={screen_code}, locale={locale}, org={organization_id}")
        
        # Query to get translations with organization overrides
        # Join: i18n_namespaces -> i18n_keys -> i18n_translations
        # Left join: i18n_overrides (if organization_id provided)
        query = text("""
            WITH base_translations AS (
                SELECT 
                    k.key as translation_key,
                    t.text as translation_text,
                    t.locale,
                    1 as priority
                FROM i18n_keys k
                JOIN i18n_namespaces n ON k.namespace_id = n.id
                JOIN i18n_translations t ON t.key_id = k.id
                WHERE n.screen_code = :screen_code
                AND t.locale = :locale
            ),
            override_translations AS (
                SELECT 
                    k.key as translation_key,
                    o.text as translation_text,
                    o.locale,
                    2 as priority
                FROM i18n_keys k
                JOIN i18n_namespaces n ON k.namespace_id = n.id
                LEFT JOIN i18n_overrides o ON o.key_id = k.id
                WHERE n.screen_code = :screen_code
                AND o.locale = :locale
                AND (:organization_id IS NULL OR o.organization_id = :organization_id)
            ),
            fallback_translations AS (
                SELECT 
                    k.key as translation_key,
                    t.text as translation_text,
                    t.locale,
                    0 as priority
                FROM i18n_keys k
                JOIN i18n_namespaces n ON k.namespace_id = n.id
                JOIN i18n_translations t ON t.key_id = k.id
                WHERE n.screen_code = :screen_code
                AND t.locale = :base_locale
                AND NOT EXISTS (
                    SELECT 1 FROM base_translations bt 
                    WHERE bt.translation_key = k.key
                )
            )
            SELECT DISTINCT ON (translation_key)
                translation_key,
                translation_text
            FROM (
                SELECT * FROM override_translations
                UNION ALL
                SELECT * FROM base_translations
                UNION ALL
                SELECT * FROM fallback_translations
            ) combined
            ORDER BY translation_key, priority DESC
        """)
        
        # Extract base locale for fallback (e.g., es-CR -> es)
        base_locale = locale.split('-')[0] if '-' in locale else locale
        
        result = await db.execute(
            query,
            {
                "screen_code": screen_code,
                "locale": locale,
                "base_locale": base_locale,
                "organization_id": organization_id,
            }
        )
        
        rows = result.fetchall()
        
        # Convert to flat dictionary
        translations = {row.translation_key: row.translation_text for row in rows}
        
        logger.info(f"✓ Loaded {len(translations)} translations for {screen_code} ({locale})")
        
        return translations
        
    except Exception as e:
        logger.error(f"Failed to load translations: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load translations: {str(e)}"
        )


@router.get("/locales")
async def get_available_locales(
    screen_code: Optional[str] = Query(None, description="Filter by screen code"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get list of available locales (language variants).
    
    Returns:
    {
        "locales": ["es", "es-CR", "es-MX", "en", "en-US"]
    }
    """
    try:
        logger.info(f"Loading available locales for screen_code={screen_code}")
        
        query = text("""
            SELECT DISTINCT t.locale
            FROM i18n_translations t
            JOIN i18n_keys k ON t.key_id = k.id
            JOIN i18n_namespaces n ON k.namespace_id = n.id
            WHERE :screen_code IS NULL OR n.screen_code = :screen_code
            ORDER BY t.locale
        """)
        
        result = await db.execute(query, {"screen_code": screen_code})
        rows = result.fetchall()
        
        locales = [row.locale for row in rows]
        
        logger.info(f"✓ Found {len(locales)} locales")
        
        return {"locales": locales}
        
    except Exception as e:
        logger.error(f"Failed to load locales: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load locales: {str(e)}"
        )


@router.get("/keys")
async def get_translation_keys(
    screen_code: str = Query(..., description="Screen code"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all translation keys for a specific screen.
    
    Returns:
    {
        "keys": ["lobby.login_welcome", "lobby.main_message", ...]
    }
    """
    try:
        logger.info(f"Loading translation keys for screen_code={screen_code}")
        
        query = text("""
            SELECT k.key
            FROM i18n_keys k
            JOIN i18n_namespaces n ON k.namespace_id = n.id
            WHERE n.screen_code = :screen_code
            ORDER BY k.key
        """)
        
        result = await db.execute(query, {"screen_code": screen_code})
        rows = result.fetchall()
        
        keys = [row.key for row in rows]
        
        logger.info(f"✓ Found {len(keys)} keys for {screen_code}")
        
        return {"keys": keys}
        
    except Exception as e:
        logger.error(f"Failed to load keys: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load keys: {str(e)}"
        )