"""
ARQUITECTURA CENTRALIZADA DE ACCESO A DATOS
============================================

REGLA ÚNICA: Todo acceso a Supabase usa SERVICE_ROLE_KEY a través de este módulo.

NO usar:
- SQLAlchemy directo
- asyncpg directo  
- ANON_KEY para operaciones backend
- Validación JWT manual
- Múltiples clientes Supabase

SÍ usar:
- get_supabase_admin() para TODAS las operaciones de datos
- SERVICE_ROLE_KEY (bypass RLS, acceso completo)
- Métodos estandarizados: select(), insert(), update(), delete()

Ejemplo de uso en routers:
```python
from core.supabase_client import get_supabase_admin

async def get_user_data(user_id: str):
    supabase = get_supabase_admin()
    response = supabase.table('user_profiles').select('*').eq('user_id', user_id).execute()
    return response.data
```
"""

from supabase import create_client, Client
from core.config import settings
import logging

logger = logging.getLogger(__name__)

# Cliente único global con SERVICE_ROLE_KEY
_supabase_admin_client: Client | None = None


def get_supabase_admin() -> Client:
    """
    Retorna el cliente Supabase con SERVICE_ROLE_KEY.
    
    Este es el ÚNICO método autorizado para acceder a datos en backend.
    - Bypass completo de RLS
    - Acceso total a todas las tablas
    - No requiere validación de tokens
    
    Returns:
        Client: Cliente Supabase con permisos administrativos
    """
    global _supabase_admin_client
    
    if _supabase_admin_client is None:
        logger.info("🔧 Inicializando Supabase Admin Client con SERVICE_ROLE_KEY")
        _supabase_admin_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
        logger.info("✅ Supabase Admin Client inicializado correctamente")
    
    return _supabase_admin_client


def query_table(table_name: str, select_fields: str = "*", filters: dict = None) -> list:
    """
    Método estandarizado para consultar tablas.
    
    Args:
        table_name: Nombre de la tabla
        select_fields: Campos a seleccionar (default: "*")
        filters: Diccionario de filtros {campo: valor}
    
    Returns:
        list: Lista de registros
    
    Example:
        >>> data = query_table('user_profiles', filters={'user_id': 'abc123'})
    """
    supabase = get_supabase_admin()
    query = supabase.table(table_name).select(select_fields)
    
    if filters:
        for field, value in filters.items():
            query = query.eq(field, value)
    
    response = query.execute()
    return response.data


def insert_record(table_name: str, data: dict) -> dict:
    """
    Método estandarizado para insertar registros.
    
    Args:
        table_name: Nombre de la tabla
        data: Diccionario con los datos a insertar
    
    Returns:
        dict: Registro insertado
    """
    supabase = get_supabase_admin()
    response = supabase.table(table_name).insert(data).execute()
    return response.data[0] if response.data else None


def update_record(table_name: str, record_id: str, data: dict, id_field: str = 'id') -> dict:
    """
    Método estandarizado para actualizar registros.
    
    Args:
        table_name: Nombre de la tabla
        record_id: ID del registro
        data: Diccionario con los datos a actualizar
        id_field: Nombre del campo ID (default: 'id')
    
    Returns:
        dict: Registro actualizado
    """
    supabase = get_supabase_admin()
    response = supabase.table(table_name).update(data).eq(id_field, record_id).execute()
    return response.data[0] if response.data else None


def delete_record(table_name: str, record_id: str, id_field: str = 'id') -> bool:
    """
    Método estandarizado para eliminar registros.
    
    Args:
        table_name: Nombre de la tabla
        record_id: ID del registro
        id_field: Nombre del campo ID (default: 'id')
    
    Returns:
        bool: True si se eliminó correctamente
    """
    supabase = get_supabase_admin()
    response = supabase.table(table_name).delete().eq(id_field, record_id).execute()
    return len(response.data) > 0