# 🔄 Recovery Point: v2026.02.08-recovery-point-alpha

**Fecha de creación:** 2026-02-08 10:56:36 UTC  
**Tag:** `recovery-point-2026-02-08-pre-regression`  
**Branch:** `main`  
**Estado:** Pre-regresión total

---

## 📋 Estado del Sistema

### Backend
- **Framework:** FastAPI 0.115.5
- **Base de datos:** PostgreSQL (Supabase hosted)
- **ORM:** SQLAlchemy 2.0.36 + AsyncPG 0.30.0
- **Autenticación:** Supabase Auth
- **Puerto:** 8000
- **Estado:** ✅ Operacional (con issues conocidos)

### Frontend
- **Framework:** React 18.3.1 + Vite
- **UI Library:** Shadcn-UI + Tailwind CSS
- **i18n:** i18next 23.17.4
- **Puerto:** 5173
- **Estado:** ✅ Operacional

### Base de Datos
- **Provider:** Supabase
- **URL:** https://nmwbfvvacilgyxbwvnqb.supabase.co
- **Tablas principales:**
  - `i18n_namespaces` (4 registros)
  - `i18n_keys` (23 registros)
  - `i18n_translations` (6 registros)
  - `i18n_overrides` (9 registros)
  - `i18n_translation_logs` (vacía)

---

## ⚠️ Issues Conocidos

### ISSUE-001: Incompatibilidad de versiones Supabase
**Severidad:** 🔴 Alta  
**Estado:** Identificado

**Descripción:**
```
TypeError: Client.__init__() got an unexpected keyword argument 'proxy'
```

- `supabase==2.3.4` es incompatible con `httpx==0.25.2`
- El cliente Supabase antiguo intenta pasar argumento `proxy` que httpx no acepta
- Causa fallas en autenticación cuando se inicializa el admin client

**Workaround temporal:**
- Backend health endpoints funcionan
- Auth endpoints básicos funcionan
- Endpoints que requieren Supabase admin client fallan

### ISSUE-002: Error de conexión a base de datos
**Severidad:** 🔴 Alta  
**Estado:** Bajo investigación

**Descripción:**
```
asyncpg.exceptions.InternalServerError: Tenant or user not found
```

- Ocurre en endpoints i18n al consultar traducciones
- Posible problema de configuración de Supabase pooler
- DATABASE_URL usa pooler en puerto 6543

**Impacto:**
- Traducciones no cargan desde base de datos
- Frontend muestra fallbacks hardcoded

### ISSUE-003: Traducciones faltantes
**Severidad:** 🟡 Media  
**Estado:** Identificado

**Descripción:**
- Claves `lobby.*` existen en `i18n_keys` (ids 19-28)
- NO tienen registros en `i18n_translations`
- Solo hay 6 traducciones base (button.save, menu.home, etc.)

**Claves faltantes:**
- lobby.slogan
- lobby.main_message
- lobby.login_welcome
- lobby.dashboard_welcome
- lobby.meta_description
- lobby.footer_contact
- lobby.tagline_health
- lobby.login_hint
- lobby.security_note
- lobby.powered_by

---

## 📦 Dependencias Críticas

### Backend (`requirements.txt`)
```
fastapi==0.115.5
uvicorn[standard]==0.32.1
pydantic==2.10.3
pydantic-settings==2.6.1
python-dotenv==1.0.1
sqlalchemy==2.0.36
asyncpg==0.30.0
python-multipart==0.0.20
httpx==0.28.1
supabase==2.10.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
```

### Frontend (`package.json`)
```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.28.0",
  "i18next": "^23.17.4",
  "react-i18next": "^15.1.3",
  "@metagptx/web-sdk": "latest"
}
```

---

## 🔧 Archivos Críticos Modificados

### Backend
1. **`core/config.py`** - Enhanced configuration loader con fallbacks
2. **`core/supabase_client.py`** - Cliente Supabase con admin access
3. **`routers/i18n.py`** - Endpoints de traducciones (reescrito para tablas base)
4. **`routers/auth.py`** - Endpoints de autenticación
5. **`dependencies/auth.py`** - Dependency injection para auth

### Frontend
1. **`src/i18n/config.ts`** - Configuración i18next con backend dinámico
2. **`src/pages/Lobby.tsx`** - Página lobby con namespace 'lobby'
3. **`src/components/lobby/HeroSection.tsx`** - Usa claves oficiales
4. **`src/components/lobby/FooterSection.tsx`** - Usa claves oficiales
5. **`src/lib/api-client.ts`** - Cliente API con logging

---

## 🚀 Instrucciones de Recuperación

### 1. Clonar Repositorio
```bash
git clone https://github.com/hcarranzacr/HoloCheck_Equilibria.git
cd HoloCheck_Equilibria
```

### 2. Checkout Recovery Tag
```bash
git checkout recovery-point-2026-02-08-pre-regression
```

### 3. Configurar Backend
```bash
cd backend

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env
cat > .env << EOF
SUPABASE_URL=https://nmwbfvvacilgyxbwvnqb.supabase.co
SUPABASE_ANON_KEY=<tu_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<tu_service_role_key>
DATABASE_URL=postgresql+asyncpg://postgres.<project>:<password>@aws-0-us-west-1.pooler.supabase.com:6543/postgres
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
ENVIRONMENT=development
DEBUG=True
EOF

# Iniciar backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Configurar Frontend
```bash
cd frontend

# Instalar dependencias
pnpm install

# Iniciar frontend
pnpm run dev
```

### 5. Verificar Sistema
```bash
# Backend health
curl http://localhost:8000/health

# Auth health
curl http://localhost:8000/api/v1/auth/health

# Frontend
open http://localhost:5173
```

---

## 📊 Estado de Endpoints

### ✅ Funcionando
- `GET /health` - Health check general
- `GET /api/v1/auth/health` - Auth service health

### ⚠️ Con Issues
- `GET /api/v1/auth/me` - Requiere Supabase admin client (proxy error)
- `POST /api/v1/auth/token/exchange` - Endpoint no encontrado
- `GET /api/v1/i18n/translations` - Database connection error
- `GET /api/v1/i18n/locales` - Database connection error

---

## 🔐 Credenciales Requeridas

**NO incluidas en el repositorio** (crear manualmente en `.env`):

```env
SUPABASE_URL=https://nmwbfvvacilgyxbwvnqb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql+asyncpg://postgres.nmwbfvvacilgyxbwvnqb:...
```

---

## 📝 Notas Adicionales

### Estructura del Proyecto
```
HoloCheck_Equilibria/
├── backend/
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── supabase_client.py
│   ├── routers/
│   │   ├── auth.py
│   │   └── i18n.py
│   ├── dependencies/
│   │   └── auth.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Lobby.tsx
│   │   ├── components/
│   │   │   └── lobby/
│   │   ├── i18n/
│   │   │   └── config.ts
│   │   └── lib/
│   │       └── api-client.ts
│   └── package.json
├── .gitignore
├── VERSION.txt
├── RECOVERY_POINT.md
└── SYSTEM_STATE_SNAPSHOT.json
```

### Próximos Pasos Recomendados

1. **Resolver incompatibilidad Supabase:**
   - Opción A: Upgrade a `supabase==2.10.0` + `httpx==0.27.x`
   - Opción B: Downgrade `httpx` a versión compatible con `supabase==2.3.4`
   - Opción C: Modificar código para no usar argumento `proxy`

2. **Solucionar database connection:**
   - Verificar configuración de Supabase pooler
   - Revisar permisos de usuario PostgreSQL
   - Considerar conexión directa sin pooler

3. **Poblar traducciones:**
   - Ejecutar script SQL para insertar traducciones `lobby.*`
   - Agregar traducciones en español (es, es-CR, es-MX)
   - Agregar traducciones en inglés (en, en-US)

---

## 🆘 Soporte

Para rollback a este punto:
```bash
git checkout recovery-point-2026-02-08-pre-regression
```

Para crear nueva rama desde este punto:
```bash
git checkout -b feature/nueva-funcionalidad recovery-point-2026-02-08-pre-regression
```

---

**Creado por:** Alex (Engineer)  
**Solicitado por:** Mike (Team Leader)  
**Usuario:** hcarranzacr@gmail.com  
**Propósito:** Punto de recuperación antes de regresión total