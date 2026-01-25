import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.tenants import Tenants

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class TenantsService:
    """Service layer for Tenants operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Tenants]:
        """Create a new tenants"""
        try:
            obj = Tenants(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created tenants with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating tenants: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Tenants]:
        """Get tenants by ID"""
        try:
            query = select(Tenants).where(Tenants.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching tenants {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of tenantss"""
        try:
            query = select(Tenants)
            count_query = select(func.count(Tenants.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Tenants, field):
                        query = query.where(getattr(Tenants, field) == value)
                        count_query = count_query.where(getattr(Tenants, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Tenants, field_name):
                        query = query.order_by(getattr(Tenants, field_name).desc())
                else:
                    if hasattr(Tenants, sort):
                        query = query.order_by(getattr(Tenants, sort))
            else:
                query = query.order_by(Tenants.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching tenants list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Tenants]:
        """Update tenants"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Tenants {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated tenants {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating tenants {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete tenants"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Tenants {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted tenants {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting tenants {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Tenants]:
        """Get tenants by any field"""
        try:
            if not hasattr(Tenants, field_name):
                raise ValueError(f"Field {field_name} does not exist on Tenants")
            result = await self.db.execute(
                select(Tenants).where(getattr(Tenants, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching tenants by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Tenants]:
        """Get list of tenantss filtered by field"""
        try:
            if not hasattr(Tenants, field_name):
                raise ValueError(f"Field {field_name} does not exist on Tenants")
            result = await self.db.execute(
                select(Tenants)
                .where(getattr(Tenants, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Tenants.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching tenantss by {field_name}: {str(e)}")
            raise