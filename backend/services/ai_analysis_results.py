import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.ai_analysis_results import Ai_analysis_results

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Ai_analysis_resultsService:
    """Service layer for Ai_analysis_results operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Ai_analysis_results]:
        """Create a new ai_analysis_results"""
        try:
            if user_id:
                data['user_id'] = user_id
            obj = Ai_analysis_results(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created ai_analysis_results with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating ai_analysis_results: {str(e)}")
            raise

    async def check_ownership(self, obj_id: int, user_id: str) -> bool:
        """Check if user owns this record"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            return obj is not None
        except Exception as e:
            logger.error(f"Error checking ownership for ai_analysis_results {obj_id}: {str(e)}")
            return False

    async def get_by_id(self, obj_id: int, user_id: Optional[str] = None) -> Optional[Ai_analysis_results]:
        """Get ai_analysis_results by ID (user can only see their own records)"""
        try:
            query = select(Ai_analysis_results).where(Ai_analysis_results.id == obj_id)
            if user_id:
                query = query.where(Ai_analysis_results.user_id == user_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching ai_analysis_results {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        user_id: Optional[str] = None,
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of ai_analysis_resultss (user can only see their own records)"""
        try:
            query = select(Ai_analysis_results)
            count_query = select(func.count(Ai_analysis_results.id))
            
            if user_id:
                query = query.where(Ai_analysis_results.user_id == user_id)
                count_query = count_query.where(Ai_analysis_results.user_id == user_id)
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Ai_analysis_results, field):
                        query = query.where(getattr(Ai_analysis_results, field) == value)
                        count_query = count_query.where(getattr(Ai_analysis_results, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Ai_analysis_results, field_name):
                        query = query.order_by(getattr(Ai_analysis_results, field_name).desc())
                else:
                    if hasattr(Ai_analysis_results, sort):
                        query = query.order_by(getattr(Ai_analysis_results, sort))
            else:
                query = query.order_by(Ai_analysis_results.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching ai_analysis_results list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Ai_analysis_results]:
        """Update ai_analysis_results (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Ai_analysis_results {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key) and key != 'user_id':
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated ai_analysis_results {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating ai_analysis_results {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int, user_id: Optional[str] = None) -> bool:
        """Delete ai_analysis_results (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Ai_analysis_results {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted ai_analysis_results {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting ai_analysis_results {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Ai_analysis_results]:
        """Get ai_analysis_results by any field"""
        try:
            if not hasattr(Ai_analysis_results, field_name):
                raise ValueError(f"Field {field_name} does not exist on Ai_analysis_results")
            result = await self.db.execute(
                select(Ai_analysis_results).where(getattr(Ai_analysis_results, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching ai_analysis_results by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Ai_analysis_results]:
        """Get list of ai_analysis_resultss filtered by field"""
        try:
            if not hasattr(Ai_analysis_results, field_name):
                raise ValueError(f"Field {field_name} does not exist on Ai_analysis_results")
            result = await self.db.execute(
                select(Ai_analysis_results)
                .where(getattr(Ai_analysis_results, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Ai_analysis_results.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching ai_analysis_resultss by {field_name}: {str(e)}")
            raise