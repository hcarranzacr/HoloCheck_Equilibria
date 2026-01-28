# 🎨 Especificaciones Simplificadas: Multitenant Branding - HoloCheck Equilibria

**Versión:** 2.0 (Simplificada)  
**Fecha:** 2026-01-25  
**Autor:** Emma (Product Manager)  
**Estado:** Listo para Implementación

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Alcance Simplificado](#alcance-simplificado)
3. [Arquitectura Simplificada](#arquitectura-simplificada)
4. [Implementación Frontend](#implementación-frontend)
5. [Priorización Simplificada](#priorización-simplificada)
6. [Criterios de Aceptación](#criterios-de-aceptación)
7. [Testing Checklist](#testing-checklist)

---

## 1. Resumen Ejecutivo

### Objetivo
Implementar personalización visual multitenant basada en slug usando la tabla `organization_branding` existente. **Enfoque 100% frontend, sin cambios en backend ni base de datos.**

### Alcance Ultra-Simplificado

**❌ NO SE CAMBIA:**
- ❌ Base de datos (tabla `organization_branding` ya existe)
- ❌ Backend (API ya existe)
- ❌ Funcionalidad actual
- ❌ Menús de navegación
- ❌ Lógica de negocio
- ❌ Roles y permisos

**✅ SÍ SE IMPLEMENTA (Solo Frontend):**
- ✅ Detección de slug en URL (`/holocheck`, `/factork`, `/corpdigital`)
- ✅ **Login neutral** con personalización MÍNIMA (logo + color botón)
- ✅ **Header/App personalizado** con branding COMPLETO (post-login)
- ✅ CSS variables dinámicas

### Principios de Diseño

1. **Login = NEUTRAL:** Solo logo + color botón. Nada más.
2. **App = BRANDED:** Personalización completa después del login.
3. **Usuario debe existir:** No se puede logear si no está creado.
4. **API existente:** Usar endpoint actual sin modificaciones.
5. **Implementación rápida:** 3-4 días máximo.

### Datos Existentes

La tabla `organization_branding` ya tiene 3 organizaciones configuradas:

#### HoloCheck (slug: `holocheck`)
```json
{
  "slug": "holocheck",
  "logo_url": "https://holocheckequilibria.s3.us-east-1.amazonaws.com/Logo+Holocheck.jpg",
  "favicon_url": "https://holocheckequilibria.s3.us-east-1.amazonaws.com/favicon_holocheck.ico",
  "primary_color": "#440088",
  "secondary_color": "#9900cc",
  "font_family": "Lato, sans-serif",
  "slogan": "Biointeligencia para Empresas Conscientes",
  "login_message": "Bienvenido al panel de bienestar de HoloCheck.",
  "dashboard_welcome_text": "Tu salud y tu desempeño en un solo lugar."
}
```

#### Factor K (slug: `factork`)
```json
{
  "slug": "factork",
  "logo_url": "https://holocheckequilibria.s3.us-east-1.amazonaws.com/FactorK.png",
  "favicon_url": "https://holocheckequilibria.s3.us-east-1.amazonaws.com/favicon_factork.ico",
  "primary_color": "#0066cc",
  "secondary_color": "#00cc99",
  "font_family": "Roboto, sans-serif",
  "slogan": "Innovación sin límites"
}
```

#### Corporación Digital (slug: `corpdigital`)
```json
{
  "slug": "corpdigital",
  "logo_url": "https://holocheckequilibria.s3.us-east-1.amazonaws.com/CorpDigital.jpg",
  "favicon_url": "https://holocheckequilibria.s3.us-east-1.amazonaws.com/favicon_corpdigital.ico",
  "primary_color": "#004080",
  "secondary_color": "#3399cc",
  "font_family": "Open Sans, sans-serif",
  "slogan": "Innovación Digital con Propósito"
}
```

---

## 2. Alcance Simplificado

### 2.1 Login - Personalización MÍNIMA

**Elementos personalizados:**
- ✅ Logo (centrado, si existe)
- ✅ Color primario en botón de login
- ✅ Favicon
- ✅ Meta title

**Elementos NO personalizados:**
- ❌ Background images
- ❌ Layouts diferentes (centered/split/left-panel)
- ❌ Mensajes extensos
- ❌ Footer
- ❌ Slogan

**Diseño:**
```
┌─────────────────────────────────────┐
│                                     │
│         ┌─────────────┐             │
│         │    LOGO     │             │
│         └─────────────┘             │
│                                     │
│         ┌─────────────┐             │
│         │   Email     │             │
│         └─────────────┘             │
│         ┌─────────────┐             │
│         │  Password   │             │
│         └─────────────┘             │
│         ┌─────────────┐             │
│         │   [LOGIN]   │ ← Color primario
│         └─────────────┘             │
│                                     │
└─────────────────────────────────────┘
```

### 2.2 Header/App - Personalización COMPLETA (Post-Login)

**Elementos personalizados:**
- ✅ Logo en header/sidebar
- ✅ Colores primario y secundario en toda la UI
- ✅ Fuentes personalizadas
- ✅ Welcome message en dashboard
- ✅ Favicon
- ✅ Meta title y description

**Elementos NO personalizados:**
- ❌ Estructura de menús
- ❌ Opciones de navegación
- ❌ Funcionalidad de páginas
- ❌ Dashboards (solo colores)

**Aplicación de colores:**
```css
/* Botones primarios */
.btn-primary { background: var(--brand-primary); }

/* Links y textos destacados */
.text-primary { color: var(--brand-primary); }

/* Badges y tags */
.badge-primary { background: var(--brand-primary); }

/* Headers */
.header-bg { background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary)); }
```

---

## 3. Arquitectura Simplificada

### 3.1 API Existente (NO MODIFICAR)

**Endpoint actual:**
```
GET /api/v1/entities/organization-branding?query={"slug":"holocheck"}
```

**Respuesta:**
```json
{
  "items": [{
    "id": "5aefc7c2-0d78-458b-83bf-10135d9c6f3b",
    "organization_id": "dd73e14a-8f43-4b74-8b9b-3bba48e57528",
    "slug": "holocheck",
    "logo_url": "https://...",
    "primary_color": "#440088",
    "secondary_color": "#9900cc",
    "font_family": "Lato, sans-serif",
    "slogan": "...",
    "login_message": "...",
    "dashboard_welcome_text": "..."
  }],
  "total": 1
}
```

### 3.2 Flujo Simplificado

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuario accede: app.com/holocheck                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. App.tsx detecta slug "holocheck"                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. BrandingContext carga branding via API                  │
│     GET /api/v1/entities/organization-branding?query=...    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Aplica CSS variables:                                   │
│     --brand-primary: #440088                                │
│     --brand-secondary: #9900cc                              │
│     --brand-font: Lato, sans-serif                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Login muestra: Logo + Botón con color primario         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Post-login: App muestra branding completo              │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Detección de Slug

**Opción 1: Path-based (Recomendado)**
```
URL: app.com/holocheck/login
Slug: "holocheck"

URL: app.com/factork/employee/dashboard
Slug: "factork"
```

**Opción 2: Query parameter (Alternativa)**
```
URL: app.com/login?org=holocheck
Slug: "holocheck"
```

**Opción 3: Subdomain (Futuro)**
```
URL: holocheck.app.com/login
Slug: "holocheck"
```

**Recomendación:** Usar **Opción 1 (Path-based)** por simplicidad.

---

## 4. Implementación Frontend

### 4.1 Estructura de Archivos

```
/workspace/app/frontend/src/
├── contexts/
│   └── BrandingContext.tsx          ← Nuevo (simplificado)
├── types/
│   └── branding.ts                  ← Nuevo
├── styles/
│   └── branding.css                 ← Nuevo (CSS variables)
├── pages/
│   └── Login.tsx                    ← Modificar (mínimo)
├── components/
│   └── layout/
│       ├── AppLayout.tsx            ← Modificar (header)
│       └── Sidebar.tsx              ← Modificar (logo)
└── App.tsx                          ← Modificar (slug detection)
```

### 4.2 BrandingContext (Simplificado)

**Archivo:** `/workspace/app/frontend/src/contexts/BrandingContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface BrandingConfig {
  slug: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string | null;
  slogan: string | null;
  dashboardWelcomeText: string | null;
}

interface BrandingContextType {
  branding: BrandingConfig | null;
  loading: boolean;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: null,
  loading: true,
});

export function BrandingProvider({ 
  children, 
  slug 
}: { 
  children: React.ReactNode; 
  slug: string | null;
}) {
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranding(slug || 'holocheck'); // Default to holocheck
  }, [slug]);

  const loadBranding = async (slugValue: string) => {
    setLoading(true);
    
    try {
      const query = JSON.stringify({ slug: slugValue });
      const response = await apiClient.get(
        `/api/v1/entities/organization-branding?query=${encodeURIComponent(query)}`
      );
      
      if (response.data.items && response.data.items.length > 0) {
        const data = response.data.items[0];
        
        const config: BrandingConfig = {
          slug: data.slug,
          logoUrl: data.logo_url,
          faviconUrl: data.favicon_url,
          primaryColor: data.primary_color,
          secondaryColor: data.secondary_color,
          fontFamily: data.font_family,
          slogan: data.slogan,
          dashboardWelcomeText: data.dashboard_welcome_text,
        };
        
        setBranding(config);
        applyBranding(config);
      } else {
        // Fallback to default (holocheck)
        loadBranding('holocheck');
      }
    } catch (error) {
      console.error('Failed to load branding:', error);
      // Use hardcoded default
      const defaultConfig: BrandingConfig = {
        slug: 'holocheck',
        logoUrl: 'https://holocheckequilibria.s3.us-east-1.amazonaws.com/Logo+Holocheck.jpg',
        faviconUrl: 'https://holocheckequilibria.s3.us-east-1.amazonaws.com/favicon_holocheck.ico',
        primaryColor: '#440088',
        secondaryColor: '#9900cc',
        fontFamily: 'Lato, sans-serif',
        slogan: 'Biointeligencia para Empresas Conscientes',
        dashboardWelcomeText: 'Tu salud y tu desempeño en un solo lugar.',
      };
      setBranding(defaultConfig);
      applyBranding(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const applyBranding = (config: BrandingConfig) => {
    const root = document.documentElement;
    
    // Apply CSS variables
    root.style.setProperty('--brand-primary', config.primaryColor);
    root.style.setProperty('--brand-secondary', config.secondaryColor);
    
    if (config.fontFamily) {
      root.style.setProperty('--brand-font', config.fontFamily);
    }
    
    // Update favicon
    if (config.faviconUrl) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.href = config.faviconUrl;
    }
    
    // Update title
    document.title = config.slogan || 'HoloCheck Equilibria';
  };

  return (
    <BrandingContext.Provider value={{ branding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
```

### 4.3 Slug Detection en App.tsx

**Archivo:** `/workspace/app/frontend/src/App.tsx`

```typescript
import { BrandingProvider } from '@/contexts/BrandingContext';
import { useLocation } from 'react-router-dom';

const App = () => {
  const location = useLocation();
  
  // Extract slug from URL path
  const slug = React.useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Check if first segment is a known slug
    const knownSlugs = ['holocheck', 'factork', 'corpdigital'];
    if (pathSegments.length > 0 && knownSlugs.includes(pathSegments[0])) {
      return pathSegments[0];
    }
    
    return null; // Use default branding
  }, [location.pathname]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrandingProvider slug={slug}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                {/* Existing routes remain unchanged */}
                <Route path="/login" element={<Login />} />
                <Route path="/:slug/login" element={<Login />} />
                {/* ... rest of routes */}
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </BrandingProvider>
    </QueryClientProvider>
  );
};
```

### 4.4 Login (Personalización Mínima)

**Archivo:** `/workspace/app/frontend/src/pages/Login.tsx`

```typescript
import { useBranding } from '@/contexts/BrandingContext';

export default function Login() {
  const { branding, loading } = useBranding();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        {/* Logo - ÚNICO elemento personalizado */}
        {branding?.logoUrl && (
          <div className="flex justify-center mb-8">
            <img 
              src={branding.logoUrl} 
              alt="Logo" 
              className="h-16 object-contain"
            />
          </div>
        )}
        
        {/* Título estándar */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
          Iniciar Sesión
        </h2>
        
        {/* Formulario estándar */}
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            />
          </div>
          
          {/* Botón - Color primario personalizado */}
          <button 
            type="submit"
            className="w-full py-3 rounded-lg font-medium text-white transition-colors"
            style={{
              backgroundColor: 'var(--brand-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 4.5 AppLayout (Personalización Completa)

**Archivo:** `/workspace/app/frontend/src/components/layout/AppLayout.tsx`

```typescript
import { useBranding } from '@/contexts/BrandingContext';

export default function AppLayout() {
  const { branding } = useBranding();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con logo personalizado */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {branding?.logoUrl ? (
            <img 
              src={branding.logoUrl} 
              alt="Logo" 
              className="h-8 object-contain"
            />
          ) : (
            <h1 className="text-xl font-bold" style={{ color: 'var(--brand-primary)' }}>
              HoloCheck Equilibria
            </h1>
          )}
          
          {/* User menu, notifications, etc. */}
        </div>
      </header>
      
      <div className="flex">
        {/* Sidebar (sin cambios estructurales) */}
        <Sidebar />
        
        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### 4.6 CSS Variables

**Archivo:** `/workspace/app/frontend/src/styles/branding.css`

```css
:root {
  /* Default colors (HoloCheck) */
  --brand-primary: #440088;
  --brand-secondary: #9900cc;
  --brand-font: 'Lato', sans-serif;
}

/* Apply brand font */
body {
  font-family: var(--brand-font);
}

/* Branded buttons */
.btn-primary {
  background-color: var(--brand-primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

/* Branded text */
.text-brand-primary {
  color: var(--brand-primary);
}

.text-brand-secondary {
  color: var(--brand-secondary);
}

/* Branded backgrounds */
.bg-brand-primary {
  background-color: var(--brand-primary);
}

.bg-brand-secondary {
  background-color: var(--brand-secondary);
}

/* Branded borders */
.border-brand-primary {
  border-color: var(--brand-primary);
}

/* Focus states */
input:focus,
textarea:focus,
select:focus {
  border-color: var(--brand-primary);
  ring-color: var(--brand-primary);
}
```

---

## 5. Priorización Simplificada

### 🔴 FASE 1: MVP (3-4 días)

**Objetivo:** Implementar lo mínimo necesario para tener branding funcional.

#### Día 1: Setup y Context
- [ ] Crear `types/branding.ts`
- [ ] Crear `BrandingContext.tsx` (simplificado)
- [ ] Integrar en `App.tsx` con slug detection
- [ ] Crear `branding.css` con CSS variables

#### Día 2: Login Neutral
- [ ] Modificar `Login.tsx` para mostrar logo
- [ ] Aplicar color primario en botón
- [ ] Aplicar favicon dinámico
- [ ] Test con 3 slugs: holocheck, factork, corpdigital

#### Día 3: App Personalizado
- [ ] Modificar `AppLayout.tsx` para mostrar logo en header
- [ ] Aplicar CSS variables en componentes principales
- [ ] Modificar `Sidebar.tsx` para mostrar logo
- [ ] Test navegación con branding aplicado

#### Día 4: Testing y Refinamiento
- [ ] Test completo con 3 organizaciones
- [ ] Verificar que funcionalidad no se afectó
- [ ] Ajustes de UX
- [ ] Documentación

**Criterios de Aceptación Fase 1:**
- ✅ `/holocheck/login` muestra logo de HoloCheck y botón morado
- ✅ `/factork/login` muestra logo de Factor K y botón azul
- ✅ `/corpdigital/login` muestra logo de Corporación Digital y botón azul oscuro
- ✅ Post-login, header muestra logo correcto
- ✅ Colores se aplican en toda la UI
- ✅ Funcionalidad actual NO afectada

---

### 🟡 FASE 2: Mejoras (Opcional - 1-2 días)

**Solo si se requiere después de Fase 1:**

- [ ] Welcome message personalizado en dashboard
- [ ] Footer con información de contacto
- [ ] Meta description dinámica
- [ ] Optimización de performance (cache)

---

## 6. Criterios de Aceptación

### Login - Personalización Mínima

| Criterio | Cómo Verificar | Resultado Esperado |
|----------|----------------|-------------------|
| Logo visible | Navegar a `/holocheck/login` | Logo de HoloCheck centrado |
| Color botón | Inspeccionar botón "Ingresar" | Background color #440088 |
| Favicon | Inspeccionar pestaña del navegador | Favicon de HoloCheck |
| Sin layouts complejos | Verificar estructura HTML | Solo formulario centrado |

### App - Personalización Completa

| Criterio | Cómo Verificar | Resultado Esperado |
|----------|----------------|-------------------|
| Logo en header | Post-login, ver header | Logo de organización visible |
| Colores aplicados | Inspeccionar CSS variables | `--brand-primary: #440088` |
| Fuente aplicada | Inspeccionar body font | `font-family: Lato, sans-serif` |
| Funcionalidad intacta | Navegar dashboards | Todo funciona igual |

### Cambio de Organización

| Criterio | Cómo Verificar | Resultado Esperado |
|----------|----------------|-------------------|
| Cambio de slug | De `/holocheck` a `/factork` | Branding actualiza |
| Sin errores | Console del navegador | 0 errores |
| Performance | Tiempo de carga | <500ms |

---

## 7. Testing Checklist

### Pre-Deployment

#### Backend (NO MODIFICAR)
- [ ] Endpoint `/api/v1/entities/organization-branding` funciona
- [ ] Query con slug "holocheck" retorna datos
- [ ] Query con slug "factork" retorna datos
- [ ] Query con slug "corpdigital" retorna datos

#### Frontend - HoloCheck
- [ ] `/holocheck/login` muestra logo correcto
- [ ] Botón login tiene color #440088
- [ ] Favicon es de HoloCheck
- [ ] Login funciona
- [ ] Post-login, header muestra logo de HoloCheck
- [ ] Colores #440088 y #9900cc aplicados
- [ ] Fuente Lato aplicada

#### Frontend - Factor K
- [ ] `/factork/login` muestra logo correcto
- [ ] Botón login tiene color #0066cc
- [ ] Favicon es de Factor K
- [ ] Login funciona
- [ ] Post-login, header muestra logo de Factor K
- [ ] Colores #0066cc y #00cc99 aplicados
- [ ] Fuente Roboto aplicada

#### Frontend - Corporación Digital
- [ ] `/corpdigital/login` muestra logo correcto
- [ ] Botón login tiene color #004080
- [ ] Favicon es de Corporación Digital
- [ ] Login funciona
- [ ] Post-login, header muestra logo de Corporación Digital
- [ ] Colores #004080 y #3399cc aplicados
- [ ] Fuente Open Sans aplicada

#### Funcionalidad NO Afectada
- [ ] Sidebar funciona igual
- [ ] Navegación entre páginas funciona
- [ ] Dashboards muestran datos correctos
- [ ] Menús no cambiaron
- [ ] Roles y permisos funcionan
- [ ] Escaneo biométrico funciona
- [ ] Análisis IA funciona

#### Edge Cases
- [ ] `/login` (sin slug) usa branding default (HoloCheck)
- [ ] `/invalid-slug/login` fallback a HoloCheck
- [ ] Refresh de página mantiene branding
- [ ] Cambiar de `/holocheck` a `/factork` actualiza branding

#### Performance
- [ ] Branding carga en <500ms
- [ ] No hay flickering
- [ ] Console sin errores

#### Mobile
- [ ] Logo visible en móvil
- [ ] Botón funciona en móvil
- [ ] Colores aplicados en móvil

---

## 📝 Resumen para Alex

### Lo que debes hacer:

1. **Crear 3 archivos nuevos:**
   - `contexts/BrandingContext.tsx` (100 líneas)
   - `types/branding.ts` (20 líneas)
   - `styles/branding.css` (50 líneas)

2. **Modificar 3 archivos existentes:**
   - `App.tsx` (agregar BrandingProvider + slug detection)
   - `pages/Login.tsx` (mostrar logo + color botón)
   - `components/layout/AppLayout.tsx` (mostrar logo en header)

3. **NO modificar:**
   - Backend
   - Base de datos
   - Funcionalidad actual
   - Menús

### Tiempo estimado: 3-4 días

### API a usar:
```
GET /api/v1/entities/organization-branding?query={"slug":"holocheck"}
```

### Resultado esperado:
- Login neutral con logo + color botón
- App con branding completo post-login
- 3 organizaciones funcionando: holocheck, factork, corpdigital

---

**Documento creado por:** Emma (Product Manager)  
**Fecha:** 2026-01-25  
**Versión:** 2.0 (Simplificada)  
**Estado:** Listo para Alex