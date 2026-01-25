import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.app_settings import App_settings

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class App_settingsService:
    """Service layer for App_settings operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[App_settings]:
        """Create a new app_settings"""
        try:
            obj = App_settings(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created app_settings with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating app_settings: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[App_settings]:
        """Get app_settings by ID"""
        try:
            query = select(App_settings).where(App_settings.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching app_settings {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of app_settingss"""
        try:
            query = select(App_settings)
            count_query = select(func.count(App_settings.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(App_settings, field):
                        query = query.where(getattr(App_settings, field) == value)
                        count_query = count_query.where(getattr(App_settings, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(App_settings, field_name):
                        query = query.order_by(getattr(App_settings, field_name).desc())
                else:
                    if hasattr(App_settings, sort):
                        query = query.order_by(getattr(App_settings, sort))
            else:
                query = query.order_by(App_settings.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching app_settings list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[App_settings]:
        """Update app_settings"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"App_settings {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated app_settings {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating app_settings {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete app_settings"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"App_settings {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted app_settings {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting app_settings {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[App_settings]:
        """Get app_settings by any field"""
        try:
            if not hasattr(App_settings, field_name):
                raise ValueError(f"Field {field_name} does not exist on App_settings")
            result = await self.db.execute(
                select(App_settings).where(getattr(App_settings, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching app_settings by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[App_settings]:
        """Get list of app_settingss filtered by field"""
        try:
            if not hasattr(App_settings, field_name):
                raise ValueError(f"Field {field_name} does not exist on App_settings")
            result = await self.db.execute(
                select(App_settings)
                .where(getattr(App_settings, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(App_settings.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching app_settingss by {field_name}: {str(e)}")
            raise