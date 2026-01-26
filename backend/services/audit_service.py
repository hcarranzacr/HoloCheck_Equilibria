"""
Audit Service for HoloCheck Equilibria
Handles system_logs and system_audit_logs according to audit documentation
"""
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert
from models.system_logs import SystemLog
from models.system_audit_logs import SystemAuditLog
import uuid


class AuditService:
    """Service for managing audit logs and system logs"""
    
    @staticmethod
    async def log_system_event(
        db: AsyncSession,
        log_type: str,  # info, warning, error, access, debug
        description: str,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        department_id: Optional[str] = None,
        role: Optional[str] = None,
        severity: Optional[str] = "low",  # low, medium, high, critical
        source: Optional[str] = "backend",  # frontend, backend, api, job
        module: Optional[str] = None,
        action: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None,
        route: Optional[str] = None,
        browser: Optional[str] = None,
        device: Optional[str] = None,
        ip_address: Optional[str] = None,
        environment: str = "production",
        correlation_id: Optional[str] = None,
    ) -> str:
        """
        Log a system event to system_logs table
        
        Returns: log_id (UUID as string)
        """
        log_id = str(uuid.uuid4())
        
        log_data = {
            "id": log_id,
            "log_type": log_type,
            "description": description,
            "user_id": user_id,
            "organization_id": organization_id,
            "department_id": department_id,
            "role": role,
            "severity": severity,
            "source": source,
            "module": module,
            "action": action,
            "payload": payload,
            "route": route,
            "browser": browser,
            "device": device,
            "ip_address": ip_address,
            "environment": environment,
            "correlation_id": correlation_id,
            "created_at": datetime.utcnow(),
        }
        
        # Remove None values
        log_data = {k: v for k, v in log_data.items() if v is not None}
        
        stmt = insert(SystemLog).values(**log_data)
        await db.execute(stmt)
        await db.commit()
        
        return log_id
    
    @staticmethod
    async def log_audit_event(
        db: AsyncSession,
        actor_user_id: str,
        action: str,  # create, update, delete
        entity_type: str,
        entity_id: Optional[str] = None,
        old_data: Optional[Dict[str, Any]] = None,
        new_data: Optional[Dict[str, Any]] = None,
        organization_id: Optional[str] = None,
        department_id: Optional[str] = None,
        role: Optional[str] = None,
        action_scope: Optional[str] = None,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        source: Optional[str] = "backend",
        module: Optional[str] = None,
        ip_address: Optional[str] = None,
        device_info: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        correlation_id: Optional[str] = None,
        environment: str = "production",
    ) -> str:
        """
        Log an audit event to system_audit_logs table
        Captures CRUD operations with old/new data
        
        Returns: audit_log_id (UUID as string)
        """
        audit_id = str(uuid.uuid4())
        
        audit_data = {
            "id": audit_id,
            "actor_user_id": actor_user_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "organization_id": organization_id,
            "department_id": department_id,
            "role": role,
            "action_scope": action_scope,
            "description": description,
            "metadata": metadata,
            "source": source,
            "module": module,
            "ip_address": ip_address,
            "device_info": device_info,
            "user_agent": user_agent,
            "success": success,
            "error_message": error_message,
            "correlation_id": correlation_id,
            "environment": environment,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        # Add old_data and new_data to metadata if not already there
        if metadata is None:
            metadata = {}
        
        if old_data is not None:
            metadata["old_data"] = old_data
        if new_data is not None:
            metadata["new_data"] = new_data
            
        audit_data["metadata"] = metadata
        
        # Remove None values
        audit_data = {k: v for k, v in audit_data.items() if v is not None}
        
        stmt = insert(SystemAuditLog).values(**audit_data)
        await db.execute(stmt)
        await db.commit()
        
        return audit_id
    
    @staticmethod
    async def log_page_view(
        db: AsyncSession,
        user_id: str,
        route: str,
        organization_id: Optional[str] = None,
        role: Optional[str] = None,
        ip_address: Optional[str] = None,
        browser: Optional[str] = None,
        device: Optional[str] = None,
    ) -> str:
        """Convenience method for logging page views"""
        return await AuditService.log_system_event(
            db=db,
            log_type="access",
            description=f"User accessed {route}",
            user_id=user_id,
            organization_id=organization_id,
            role=role,
            severity="low",
            source="frontend",
            action="access",
            route=route,
            browser=browser,
            device=device,
            ip_address=ip_address,
        )
    
    @staticmethod
    async def log_error(
        db: AsyncSession,
        error_message: str,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        module: Optional[str] = None,
        route: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None,
        severity: str = "high",
    ) -> str:
        """Convenience method for logging errors"""
        return await AuditService.log_system_event(
            db=db,
            log_type="error",
            description=error_message,
            user_id=user_id,
            organization_id=organization_id,
            severity=severity,
            source="backend",
            module=module,
            action="error",
            route=route,
            payload=payload,
        )
    
    @staticmethod
    async def log_crud_operation(
        db: AsyncSession,
        actor_user_id: str,
        action: str,  # create, update, delete
        entity_type: str,
        entity_id: str,
        old_data: Optional[Dict[str, Any]] = None,
        new_data: Optional[Dict[str, Any]] = None,
        organization_id: Optional[str] = None,
        role: Optional[str] = None,
        ip_address: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None,
    ) -> str:
        """Convenience method for logging CRUD operations"""
        
        # Generate description
        action_text = {
            "create": "created",
            "update": "updated",
            "delete": "deleted",
        }.get(action, action)
        
        description = f"{entity_type} {entity_id} was {action_text}"
        
        return await AuditService.log_audit_event(
            db=db,
            actor_user_id=actor_user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_data=old_data,
            new_data=new_data,
            organization_id=organization_id,
            role=role,
            description=description,
            source="backend",
            module=entity_type.lower(),
            ip_address=ip_address,
            success=success,
            error_message=error_message,
        )