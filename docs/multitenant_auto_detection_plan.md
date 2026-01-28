# Plan de Implementación: Detección Automática de Branding Post-Login

## 🎯 Objetivo
Implementar personalización multitenant mediante **detección automática** basada en la organización del usuario después del login, sin modificar URLs ni funcionalidad actual.

## 🔍 Estrategia: Detección Automática Post-Login

### Flujo de Usuario
```
1. Usuario accede a: https://holocheck.app/login
   → Login NEUTRAL (sin personalización, o mínima)

2. Usuario ingresa credenciales y hace login
   → Sistema obtiene user_profile del usuario
   → user_profile contiene: organization_id

3. Sistema carga branding automáticamente
   → GET /api/v1/organization-branding?organization_id={org_id}
   → Aplica branding en header, dashboard, footer

4. Usuario navega por la app
   → Branding se mantiene en toda la sesión
   → Guardado en BrandingContext (React Context)
```

### Ventajas
✅ **Transparente**: Usuario no ve slugs en URL
✅ **Simple**: No requiere cambios en routing
✅ **Robusto**: Branding basado en datos de usuario (no URL)
✅ **Seguro**: Usuario solo ve branding de su organización
✅ **Sin cambios**: Funcionalidad actual intacta

### Desventajas
❌ Login no puede mostrar branding personalizado (es neutral)
❌ Requiere login para ver branding

## 📊 Arquitectura

### 1. BrandingContext (React Context)
```typescript
interface BrandingContextType {
  branding: OrganizationBranding | null;
  loading: boolean;
  loadBrandingByOrgId: (orgId: string) => Promise<void>;
  clearBranding: () => void;
}
```

### 2. Flujo de Datos
```
AuthContext (user) 
    ↓
    user.organization_id
    ↓
BrandingContext.loadBrandingByOrgId(organization_id)
    ↓
    API: GET /api/v1/organization-branding?organization_id={id}
    ↓
    setBranding(data)
    ↓
AppLayout, Header, Dashboard (consume branding)
```

### 3. API Endpoint Existente
```
GET /api/v1/organization-branding/slug/{slug}
```

**Necesitamos agregar:**
```
GET /api/v1/organization-branding/by-organization/{organization_id}
```

O usar el endpoint existente si ya filtra por organization_id.

## 🛠️ Implementación (4 Días)

### Día 1: BrandingContext + API Integration
**Archivos a crear/modificar:**
- `frontend/src/contexts/BrandingContext.tsx` (NUEVO)
- `frontend/src/types/branding.ts` (NUEVO)
- `backend/routers/organization_branding.py` (MODIFICAR - agregar endpoint)

**Tareas:**
1. Crear BrandingContext con:
   - `loadBrandingByOrgId(orgId: string)`
   - `branding` state
   - `loading` state
2. Agregar endpoint backend (si no existe):
   - `GET /api/v1/organization-branding/by-organization/{org_id}`
3. Integrar BrandingContext en App.tsx

### Día 2: Integración con AuthContext
**Archivos a modificar:**
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/App.tsx`

**Tareas:**
1. Modificar AuthContext para obtener `organization_id` del user_profile
2. Cargar branding automáticamente después del login
3. Limpiar branding al logout

### Día 3: Aplicar Branding en UI
**Archivos a modificar:**
- `frontend/src/components/layout/AppLayout.tsx`
- `frontend/src/components/layout/Header.tsx` (si existe)
- `frontend/src/pages/employee/Dashboard.tsx`

**Tareas:**
1. Header: Logo, colores
2. Dashboard: Welcome text
3. Footer: Contacto (si existe)
4. CSS variables para colores dinámicos

### Día 4: Testing + Refinamiento
**Tareas:**
1. Testing con 3 organizaciones:
   - HoloCheck
   - Factor K
   - Corporación Digital
2. Verificar transiciones suaves
3. Loading states
4. Error handling
5. Fallback a default

## 📋 Checklist de Implementación

### Backend
- [ ] Verificar si endpoint `by-organization/{org_id}` existe
- [ ] Si no existe, agregar endpoint en `organization_branding.py`
- [ ] Testing del endpoint con Postman/curl

### Frontend - BrandingContext
- [ ] Crear `types/branding.ts` con interfaces
- [ ] Crear `contexts/BrandingContext.tsx`
- [ ] Implementar `loadBrandingByOrgId()`
- [ ] Implementar `clearBranding()`
- [ ] Agregar loading states

### Frontend - AuthContext Integration
- [ ] Modificar AuthContext para obtener `organization_id`
- [ ] Cargar branding después de login exitoso
- [ ] Limpiar branding en logout

### Frontend - UI Application
- [ ] AppLayout: Consumir BrandingContext
- [ ] Header: Logo dinámico
- [ ] Header: Colores dinámicos (CSS variables)
- [ ] Dashboard: Welcome text dinámico
- [ ] Footer: Contacto dinámico (si aplica)

### Testing
- [ ] Login como usuario de HoloCheck → Ver branding HoloCheck
- [ ] Login como usuario de Factor K → Ver branding Factor K
- [ ] Login como usuario de Corp Digital → Ver branding Corp Digital
- [ ] Logout → Branding se limpia
- [ ] Navegación entre páginas → Branding se mantiene
- [ ] Refresh de página → Branding se mantiene

## 🎨 Personalización por Área

### Login Page (NEUTRAL)
- Logo genérico o sin logo
- Colores neutros
- Sin personalización

### Header (POST-LOGIN)
- ✅ Logo de la organización
- ✅ Primary color en header background
- ✅ Secondary color en botones/accents

### Dashboard (POST-LOGIN)
- ✅ Welcome text personalizado
- ✅ Slogan de la organización
- ✅ Colores en cards/botones

### Footer (POST-LOGIN)
- ✅ Contacto (email, teléfono)
- ✅ Social links
- ✅ Custom terms/privacy URLs

## ⚠️ Consideraciones Importantes

### NO CAMBIAR
- ❌ Funcionalidad actual
- ❌ Menús de navegación
- ❌ Lógica de negocio
- ❌ Base de datos
- ❌ URLs/Routing

### SÍ IMPLEMENTAR
- ✅ BrandingContext
- ✅ Detección automática post-login
- ✅ Personalización visual
- ✅ CSS variables para theming
- ✅ Loading states
- ✅ Error handling

### UX Natural
- Transiciones suaves (fade-in)
- Loading spinners durante carga
- Fallback a branding default si falla
- No flickering
- No cambios bruscos

## 🚀 Próximos Pasos

1. **Verificar estructura de user_profile**
   - Confirmar que `user_profiles` tiene `organization_id`
   - Verificar relación con `organizations`

2. **Verificar API existente**
   - Revisar endpoints en `organization_branding.py`
   - Confirmar si existe endpoint by-organization

3. **Comenzar implementación**
   - Día 1: BrandingContext
   - Día 2: Auth integration
   - Día 3: UI application
   - Día 4: Testing

## 📝 Notas Técnicas

### Estructura de user_profiles
```sql
user_profiles:
  - id
  - user_id
  - organization_id  ← CLAVE para detección
  - full_name
  - email
  - role
```

### Estructura de organization_branding
```sql
organization_branding:
  - id
  - organization_id  ← Relación con user
  - slug
  - logo_url
  - primary_color
  - secondary_color
  - slogan
  - message
  - login_message
  - dashboard_welcome_text
  - contact_email
  - contact_phone
  - social_links
  - ...
```

### API Response Example
```json
{
  "id": "5aefc7c2-0d78-458b-83bf-10135d9c6f3b",
  "organization_id": "dd73e14a-8f43-4b74-8b9b-3bba48e57528",
  "organization_name": "HoloCheck - QuidIA",
  "logo_url": "https://holocheckequilibria.s3.us-east-1.amazonaws.com/Logo+Holocheck.jpg",
  "primary_color": "#440088",
  "secondary_color": "#9900cc",
  "slogan": "Biointeligencia para Empresas Conscientes",
  "dashboard_welcome_text": "Tu salud y tu desempeño en un solo lugar.",
  "contact_email": "info@holocheck.com",
  "contact_phone": "+506-8888-0003"
}
```

## ✅ Criterios de Aceptación

### Funcionalidad
- [ ] Usuario hace login → Branding se carga automáticamente
- [ ] Branding correcto según organization_id del usuario
- [ ] Branding se mantiene durante toda la sesión
- [ ] Logout limpia el branding
- [ ] Refresh de página mantiene branding

### UX
- [ ] Login page neutral (sin personalización)
- [ ] Transiciones suaves al cargar branding
- [ ] Loading states visibles
- [ ] No flickering ni cambios bruscos
- [ ] Fallback a default si falla

### No Regresiones
- [ ] Funcionalidad actual intacta
- [ ] Menús funcionan igual
- [ ] Navegación sin cambios
- [ ] Roles y permisos sin cambios
- [ ] Todas las páginas funcionan

## 🎯 Resultado Final

Usuario accede a `https://holocheck.app/login`:
1. Ve login neutral
2. Ingresa credenciales
3. Sistema detecta su organization_id
4. Carga branding automáticamente
5. Ve header, dashboard, footer personalizados
6. Navega por la app con branding consistente
7. Logout limpia el branding

**Todo sin cambiar URLs, funcionalidad, o base de datos.**