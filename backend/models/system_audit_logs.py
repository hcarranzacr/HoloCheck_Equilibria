from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON, Text
from core.database import Base

class SystemAuditLog(Base):
    __tablename__ = "system_audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    actor_user_id = Column(String(255), nullable=False, comment="ID of the user who performed the action")
    action = Column(String(50), nullable=False, comment="Action type: create, update, delete")
    entity_type = Column(String(100), nullable=False, comment="Type of entity affected (e.g., 'user', 'organization')")
    entity_id = Column(String(255), nullable=False, comment="ID of the affected entity")
    old_data = Column(JSON, nullable=True, comment="Data before the change (for update/delete)")
    new_data = Column(JSON, nullable=True, comment="Data after the change (for create/update)")
    organization_id = Column(String(255), nullable=True, comment="Organization context")
    department_id = Column(String(255), nullable=True, comment="Department context")
    role = Column(String(50), nullable=True, comment="Role of the actor")
    ip_address = Column(String(45), nullable=True, comment="IP address of the actor")
    user_agent = Column(Text, nullable=True, comment="User agent string")
    audit_metadata = Column(JSON, nullable=True, comment="Additional audit metadata")
    created_at = Column(DateTime, default=datetime.now, nullable=False, comment="Timestamp of the action")

    def __repr__(self):
        return f"<SystemAuditLog(id={self.id}, action={self.action}, entity_type={self.entity_type}, entity_id={self.entity_id})>"