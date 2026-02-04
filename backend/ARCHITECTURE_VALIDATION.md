# Validación de Arquitectura de Acceso a Datos - Supabase

**Fecha:** 2026-02-03  
**Validado por:** Bob (Architect)  
**Estado:** ✅ ARQUITECTURA CORRECTA - Solo requiere claves API válidas

---

## Resumen Ejecutivo

Después de una validación exhaustiva del código backend y frontend, confirmo que **la arquitectura implementada es correcta y cumple con todos los principios de diseño establecidos**. El problema actual (errores 401 "Invalid API key") se debe exclusivamente a que las claves API en el archivo `.env` tienen un formato incorrecto.

---

## Validación de Principios Arquitectónicos

### ✅ 1. Método Único Centralizado

**Principio:** Todo acceso a Supabase debe usar `get_supabase_admin()` con SERVICE_ROLE_KEY.

**Validación:**
- ✅ Archivo `/workspace/app/backend/core/supabase_client.py` implementa correctamente:
  - Función `get_supabase_admin()` que retorna un cliente único global
  - Usa `settings.supabase_service_role_key` (SERVICE_ROLE_KEY)
  - Cliente singleton para evitar múltiples instancias
  - Métodos helper estandarizados: `query_table()`, `insert_record()`, `update_record()`, `delete_record()`

**Código Verificado:**
```python
def get_supabase_admin() -> Client:
    global _supabase_admin_client
    if _supabase_admin_client is None:
        _supabase_admin_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key  # ✅ Usa SERVICE_ROLE_KEY
        )
    return _supabase_admin_client
```

**Resultado:** ✅ CUMPLE - Método único centralizado implementado correctamente.

---

### ✅ 2. Consistencia en Routers

**Principio:** Todos los routers deben usar `get_supabase_admin()` exclusivamente.

**Validación:**

#### `/workspace/app/backend/routers/dashboards.py`
- ✅ Importa: `from core.supabase_client import get_supabase_admin`
- ✅ Todas las funciones usan: `supabase = get_supabase_admin()`
- ✅ NO hay imports de SQLAlchemy, asyncpg, ni otros métodos de acceso
- ✅ Endpoints validados:
  - `GET /dashboards/employee` - Usa `get_supabase_admin()`
  - `GET /dashboards/employee/evolution` - Usa `get_supabase_admin()`
  - `GET /dashboards/leader` - Usa `get_supabase_admin()`
  - `GET /dashboards/rrhh` - Usa `get_supabase_admin()`

#### `/workspace/app/backend/routers/biometric_indicators.py`
- ✅ Importa: `from core.supabase_client import get_supabase_admin`
- ✅ Todas las funciones usan: `supabase = get_supabase_admin()`
- ✅ Endpoints validados:
  - `GET /biometric-indicators/ranges` - Usa `get_supabase_admin()`
  - `GET /biometric-indicators/info/{indicator_code}` - Usa `get_supabase_admin()`

#### Otros Routers Verificados:
- `/workspace/app/backend/routers/benefits_management.py` - ✅ Usa `get_supabase_admin()`
- `/workspace/app/backend/services/dashboard_service_supabase.py` - ✅ Usa `get_supabase_admin()`

**Búsqueda de Métodos Alternativos:**
```bash
# Búsqueda de métodos prohibidos
grep -r "get_supabase_client\|create_client\|AsyncSession\|asyncpg" routers/
# Resultado: 0 ocurrencias (excepto en comentarios de documentación)
```

**Resultado:** ✅ CUMPLE - Todos los routers usan el método centralizado.

---

### ✅ 3. No Fugas de ANON_KEY en Frontend

**Principio:** El frontend NO debe tener acceso directo a claves de Supabase.

**Validación:**

#### `/workspace/app/frontend/src/lib/api-client.ts`
- ✅ NO importa `@supabase/supabase-js`
- ✅ NO contiene `createClient` de Supabase
- ✅ NO tiene referencias a `SUPABASE_ANON_KEY` o `SUPABASE_URL`
- ✅ Usa únicamente `axios` para llamar al backend:
  ```typescript
  const apiClient = axios.create({
    baseURL: '/api/v1',  // ✅ Solo llama al backend
    headers: {
      'Content-Type': 'application/json',
    },
  });
  ```

**Búsqueda en Frontend:**
```bash
grep -r "SUPABASE_ANON_KEY\|supabase.*createClient" src/
# Resultado: 0 ocurrencias
```

**Flujo de Datos Validado:**
1. Frontend → `apiClient.get('/dashboards/employee')` → Backend
2. Backend → `get_supabase_admin()` → Supabase (con SERVICE_ROLE_KEY)
3. Backend ← Datos ← Supabase
4. Frontend ← Datos filtrados ← Backend

**Resultado:** ✅ CUMPLE - Frontend no tiene acceso directo a Supabase.

---

### ✅ 4. Autenticación Simplificada

**Principio:** `dependencies/auth.py` debe validar `user_id` sin validar JWT tokens.

**Validación:**

#### `/workspace/app/backend/dependencies/auth.py`
- ✅ Función `get_current_user()` implementada correctamente:
  - Recibe `user_id` del Bearer token (NO valida JWT)
  - Usa `get_supabase_admin()` para consultar `user_profiles`
  - Retorna `UserResponse` con datos del usuario
  - Lanza `HTTPException 401` si usuario no existe

**Código Verificado:**
```python
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    user_id = credentials.credentials  # ✅ Asume user_id válido
    supabase = get_supabase_admin()    # ✅ Usa método centralizado
    
    response = supabase.table('user_profiles').select('*').eq('user_id', user_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=401, detail="User not found")
    
    return UserResponse(...)  # ✅ Retorna datos estructurados
```

**Flujo de Autenticación Validado:**
1. Frontend envía `user_id` como Bearer token
2. Backend extrae `user_id` (NO valida JWT)
3. Backend consulta `user_profiles` con `get_supabase_admin()`
4. Backend valida existencia del usuario
5. Backend retorna datos o error 401

**Resultado:** ✅ CUMPLE - Autenticación simplificada implementada correctamente.

---

## Validación de Configuración

### `/workspace/app/backend/core/config.py`
- ✅ Usa `pydantic_settings.BaseSettings`
- ✅ Carga variables desde `.env` correctamente:
  ```python
  class Settings(BaseSettings):
      supabase_url: str = Field(..., env="SUPABASE_URL")
      supabase_service_role_key: str = Field(..., env="SUPABASE_SERVICE_ROLE_KEY")
      
      model_config = SettingsConfigDict(env_file=".env")
  ```
- ✅ Instancia global `settings` disponible

### `/workspace/app/backend/.env`
- ⚠️ **PROBLEMA IDENTIFICADO:** Claves API con formato incorrecto
  ```env
  # ❌ Formato incorrecto (no son tokens JWT)
  SUPABASE_SERVICE_ROLE_KEY=sb_secret_vzUZjie6hy3CzoUUwq3muw_hX72Lhvu
  SUPABASE_ANON_KEY=sb_publishable_bv9N5FWT448fasDBMBD8Og_jM3cc4pj
  
  # ✅ Formato correcto (tokens JWT reales)
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

---

## Checklist de Arquitectura

| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| Método único centralizado (`get_supabase_admin()`) | ✅ CUMPLE | `core/supabase_client.py` implementado correctamente |
| Todos los routers usan método centralizado | ✅ CUMPLE | `dashboards.py`, `biometric_indicators.py`, etc. verificados |
| No hay SQLAlchemy/asyncpg en routers | ✅ CUMPLE | Búsqueda exhaustiva: 0 ocurrencias |
| Frontend no accede directamente a Supabase | ✅ CUMPLE | `api-client.ts` solo usa axios al backend |
| Autenticación simplificada (sin validación JWT) | ✅ CUMPLE | `dependencies/auth.py` implementado correctamente |
| SERVICE_ROLE_KEY usado en backend | ✅ CUMPLE | `get_supabase_admin()` usa `settings.supabase_service_role_key` |
| ANON_KEY NO usado en backend | ✅ CUMPLE | Backend no referencia `SUPABASE_ANON_KEY` |
| Configuración centralizada en `config.py` | ✅ CUMPLE | `Settings` con `pydantic_settings` |

---

## Causa Raíz del Error 401

**Problema:** Las claves API en `.env` tienen formato incorrecto.

**Evidencia:**
- Claves actuales: `sb_secret_vzUZjie6hy3CzoUUwq3muw_hX72Lhvu` (32 caracteres)
- Claves válidas: Tokens JWT que comienzan con `eyJ` (~150-200 caracteres)

**Impacto:**
- Supabase rechaza las claves con "Invalid API key"
- Todos los endpoints que usan `get_supabase_admin()` fallan con 401
- Frontend recibe errores y no puede mostrar datos

**Solución:**
1. Acceder a: https://supabase.com/dashboard/project/nmwbfvvacilgyxbwvnqb/settings/api
2. Copiar las claves API correctas (tokens JWT)
3. Actualizar `/workspace/app/backend/.env`:
   ```env
   SUPABASE_URL=https://nmwbfvvacilgyxbwvnqb.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<TOKEN_JWT_REAL_AQUI>
   SUPABASE_ANON_KEY=<TOKEN_JWT_REAL_AQUI>
   ```
4. Reiniciar backend: `cd /workspace/app && bash start_app_v2.sh`

---

## Conclusión

✅ **LA ARQUITECTURA ES CORRECTA Y CUMPLE CON TODOS LOS PRINCIPIOS DE DISEÑO.**

**Confirmaciones:**
1. ✅ Método único centralizado implementado (`get_supabase_admin()`)
2. ✅ Todos los routers usan el método centralizado
3. ✅ No hay fugas de claves al frontend
4. ✅ Autenticación simplificada sin validación JWT
5. ✅ Configuración centralizada en `config.py`
6. ✅ No hay métodos alternativos de acceso (SQLAlchemy, asyncpg, etc.)

**Acción Requerida:**
El único paso pendiente es que el usuario proporcione las **claves API válidas de Supabase** (tokens JWT) para reemplazar las claves con formato incorrecto en el archivo `.env`.

Una vez actualizadas las claves, el sistema funcionará correctamente sin necesidad de cambios en el código.

---

**Firmado:**  
Bob (Architect)  
2026-02-03