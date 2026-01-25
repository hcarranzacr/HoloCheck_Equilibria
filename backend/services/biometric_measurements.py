import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.biometric_measurements import Biometric_measurements

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Biometric_measurementsService:
    """Service layer for Biometric_measurements operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Biometric_measurements]:
        """Create a new biometric_measurements"""
        try:
            if user_id:
                data['user_id'] = user_id
            obj = Biometric_measurements(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created biometric_measurements with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating biometric_measurements: {str(e)}")
            raise

    async def check_ownership(self, obj_id: int, user_id: str) -> bool:
        """Check if user owns this record"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            return obj is not None
        except Exception as e:
            logger.error(f"Error checking ownership for biometric_measurements {obj_id}: {str(e)}")
            return False

    async def get_by_id(self, obj_id: int, user_id: Optional[str] = None) -> Optional[Biometric_measurements]:
        """Get biometric_measurements by ID (user can only see their own records)"""
        try:
            query = select(Biometric_measurements).where(Biometric_measurements.id == obj_id)
            if user_id:
                query = query.where(Biometric_measurements.user_id == user_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching biometric_measurements {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        user_id: Optional[str] = None,
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of biometric_measurementss (user can only see their own records)"""
        try:
            query = select(Biometric_measurements)
            count_query = select(func.count(Biometric_measurements.id))
            
            if user_id:
                query = query.where(Biometric_measurements.user_id == user_id)
                count_query = count_query.where(Biometric_measurements.user_id == user_id)
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Biometric_measurements, field):
                        query = query.where(getattr(Biometric_measurements, field) == value)
                        count_query = count_query.where(getattr(Biometric_measurements, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Biometric_measurements, field_name):
                        query = query.order_by(getattr(Biometric_measurements, field_name).desc())
                else:
                    if hasattr(Biometric_measurements, sort):
                        query = query.order_by(getattr(Biometric_measurements, sort))
            else:
                query = query.order_by(Biometric_measurements.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching biometric_measurements list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Biometric_measurements]:
        """Update biometric_measurements (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Biometric_measurements {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key) and key != 'user_id':
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated biometric_measurements {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating biometric_measurements {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int, user_id: Optional[str] = None) -> bool:
        """Delete biometric_measurements (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Biometric_measurements {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted biometric_measurements {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting biometric_measurements {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Biometric_measurements]:
        """Get biometric_measurements by any field"""
        try:
            if not hasattr(Biometric_measurements, field_name):
                raise ValueError(f"Field {field_name} does not exist on Biometric_measurements")
            result = await self.db.execute(
                select(Biometric_measurements).where(getattr(Biometric_measurements, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching biometric_measurements by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Biometric_measurements]:
        """Get list of biometric_measurementss filtered by field"""
        try:
            if not hasattr(Biometric_measurements, field_name):
                raise ValueError(f"Field {field_name} does not exist on Biometric_measurements")
            result = await self.db.execute(
                select(Biometric_measurements)
                .where(getattr(Biometric_measurements, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Biometric_measurements.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching biometric_measurementss by {field_name}: {str(e)}")
            raise