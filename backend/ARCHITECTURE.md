# Arquitectura de Acceso a Datos - Supabase

## Regla Única de Acceso a Datos

**TODO acceso a datos DEBE usar `core/supabase_client.py` con SERVICE_ROLE_KEY.**

### ❌ NO HACER

```python
# NO usar SQLAlchemy directo
from sqlalchemy import create_engine
engine = create_engine(DATABASE_URL)

# NO usar asyncpg directo
import asyncpg
conn = await asyncpg.connect(DATABASE_URL)

# NO crear múltiples clientes Supabase
from supabase import create_client
supabase = create_client(url, key)  # ❌ PROHIBIDO

# NO validar JWT manualmente
supabase.auth.get_user(token)  # ❌ PROHIBIDO
```

### ✅ SÍ HACER

```python
# Importar cliente centralizado
from core.supabase_client import get_supabase_admin

# Usar en routers
@router.get("/data")
async def get_data(user_id: str):
    supabase = get_supabase_admin()
    response = supabase.table('table_name').select('*').eq('user_id', user_id).execute()
    return response.data
```

## Métodos Estandarizados

### 1. Consultar Datos

```python
from core.supabase_client import get_supabase_admin

supabase = get_supabase_admin()

# SELECT simple
data = supabase.table('user_profiles').select('*').execute().data

# SELECT con filtros
data = supabase.table('biometric_measurements')\
    .select('*')\
    .eq('user_id', user_id)\
    .order('created_at', desc=True)\
    .limit(10)\
    .execute().data

# SELECT con joins
data = supabase.table('user_profiles')\
    .select('*, departments(name)')\
    .eq('user_id', user_id)\
    .execute().data
```

### 2. Insertar Datos

```python
new_record = {
    'user_id': 'abc123',
    'name': 'Test User',
    'email': 'test@example.com'
}

result = supabase.table('user_profiles').insert(new_record).execute()
```

### 3. Actualizar Datos

```python
updates = {'name': 'Updated Name'}

result = supabase.table('user_profiles')\
    .update(updates)\
    .eq('user_id', user_id)\
    .execute()
```

### 4. Eliminar Datos

```python
result = supabase.table('user_profiles')\
    .delete()\
    .eq('user_id', user_id)\
    .execute()
```

## Autenticación

### Frontend → Backend

1. Frontend obtiene `user_id` de Supabase Auth
2. Frontend envía `user_id` como Bearer token
3. Backend valida existencia en `user_profiles`
4. Backend NO valida JWT tokens

```python
# En routers
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

@router.get("/protected")
async def protected_route(current_user: UserResponse = Depends(get_current_user)):
    # current_user contiene: id, email, name, role, organization_id
    return {"user": current_user.email}
```

## Estructura de Tablas Principales

### user_profiles
- user_id (PK)
- email
- full_name
- role (admin_global, admin_org, leader, rrhh, employee)
- organization_id (FK)
- department_id (FK)

### biometric_measurements
- id (PK)
- user_id (FK)
- heart_rate, sdnn, bmi, etc.
- created_at

### param_biometric_indicators_info
- id (PK)
- indicator_code (unique)
- display_name
- unit
- risk_ranges (JSON)

## Migración de Código Existente

### Antes (❌)
```python
from database import get_db
from sqlalchemy.orm import Session

@router.get("/users")
async def get_users(db: Session = Depends(get_db)):
    return db.query(UserProfile).all()
```

### Después (✅)
```python
from core.supabase_client import get_supabase_admin

@router.get("/users")
async def get_users():
    supabase = get_supabase_admin()
    response = supabase.table('user_profiles').select('*').execute()
    return response.data
```

## Checklist de Implementación

- [x] Crear `core/supabase_client.py` con SERVICE_ROLE_KEY
- [x] Actualizar `dependencies/auth.py` para usar cliente centralizado
- [ ] Migrar todos los routers a usar `get_supabase_admin()`
- [ ] Eliminar referencias a SQLAlchemy/asyncpg
- [ ] Eliminar múltiples instancias de clientes Supabase
- [ ] Probar endpoints de dashboard
- [ ] Probar endpoints de indicadores
- [ ] Probar endpoints de gráficos

## Variables de Entorno Requeridas

```env
SUPABASE_URL=https://nmwbfvvacilgyxbwvnqb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_vzUZjie6hy3CzoUUwq3muw_hX72Lhvu
```

## Soporte

Para cualquier duda sobre acceso a datos, referirse a este documento.
NO crear métodos alternativos de acceso.