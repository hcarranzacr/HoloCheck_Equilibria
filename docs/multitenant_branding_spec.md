# 🎨 Especificaciones de Multitenant Branding - HoloCheck Equilibria

**Versión:** 1.0  
**Fecha:** 2026-01-25  
**Autor:** Emma (Product Manager)  
**Estado:** Pendiente de Revisión

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Análisis del Documento Técnico](#análisis-del-documento-técnico)
3. [Arquitectura Propuesta](#arquitectura-propuesta)
4. [Implementación Técnica](#implementación-técnica)
5. [Routing Strategy Detallado](#routing-strategy-detallado)
6. [Casos de Uso](#casos-de-uso)
7. [Impacto en Funcionalidad Actual](#impacto-en-funcionalidad-actual)
8. [Priorización en 3 Fases](#priorización-en-3-fases)
9. [Criterios de Aceptación](#criterios-de-aceptación)
10. [Riesgos y Mitigación](#riesgos-y-mitigación)
11. [Testing Strategy](#testing-strategy)

---

## 1. Resumen Ejecutivo

### Objetivo
Implementar funcionalidad multitenant con personalización de branding basada en slug, permitiendo que cada organización tenga su propia identidad visual (logo, colores, mensajes) sin afectar la funcionalidad core de la aplicación.

### Alcance

**✅ QUÉ SÍ SE IMPLEMENTA:**
- Detección de slug en URL (ej: `/holocheck/login`, `/factork/dashboard`)
- Carga dinámica de branding desde `organization_branding` table
- Personalización visual: logo, favicon, colores, fuentes, mensajes
- Layouts de login personalizados (centered, split, left-panel)
- Footer con información de contacto personalizada
- Meta tags dinámicos (title, description)

**❌ QUÉ NO SE AFECTA:**
- Menús de navegación (sidebar permanece igual)
- Funcionalidad de dashboards
- Roles y permisos
- Flujos de escaneo biométrico
- Análisis IA y reportes
- Lógica de negocio

### Beneficios del Negocio
- **White-label solution:** Permite vender la plataforma a múltiples clientes con su propia marca
- **Mejor experiencia:** Cada organización se siente en "su" plataforma
- **Escalabilidad:** Agregar nuevas organizaciones es solo configuración, no desarrollo
- **Diferenciación:** Competidores no ofrecen este nivel de personalización
- **Revenue:** Posibilidad de cobrar premium por branding personalizado

---

## 2. Análisis del Documento Técnico

### Requisitos Identificados

Basado en el análisis del documento técnico y la estructura de datos existente:

#### 2.1 Tabla `organization_branding`

**Campos existentes:**
```sql
CREATE TABLE organization_branding (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  slug VARCHAR UNIQUE NOT NULL,  -- Identificador único en URL
  
  -- Visual Branding
  logo_url TEXT,
  favicon_url TEXT,
  primary_color VARCHAR(7),      -- Hex color #RRGGBB
  secondary_color VARCHAR(7),
  font_family VARCHAR,
  background_image_url TEXT,
  
  -- Messaging
  slogan TEXT,
  message TEXT,
  login_message TEXT,
  dashboard_welcome_text TEXT,
  meta_description TEXT,
  
  -- Contact Info
  contact_email VARCHAR,
  contact_phone VARCHAR,
  social_links JSONB,            -- {"twitter": "url", "linkedin": "url"}
  
  -- Legal
  custom_terms_url TEXT,
  custom_privacy_url TEXT,
  
  -- Configuration
  login_layout_style VARCHAR,    -- 'centered', 'split', 'left-panel'
  branding_mode VARCHAR,         -- 'default', 'custom'
  
  created_at TIMESTAMP
);
```

#### 2.2 Organizaciones Configuradas

**1. HoloCheck (slug: `holocheck`)**
```json
{
  "slug": "holocheck",
  "primary_color": "#440088",
  "secondary_color": "#9900cc",
  "slogan": "Biointeligencia para Empresas Conscientes",
  "message": "HoloCheck - QuidIA integra tecnología biométrica...",
  "login_layout_style": "centered",
  "font_family": "Lato, sans-serif"
}
```

**2. Factor K (slug: `factork`)**
```json
{
  "slug": "factork",
  "primary_color": "#0066cc",
  "secondary_color": "#00cc99",
  "slogan": "Innovación sin límites",
  "message": "Bienvenido a Factor K...",
  "login_layout_style": "split",
  "font_family": "Roboto, sans-serif"
}
```

**3. Corporación Digital (slug: `corpdigital`)**
```json
{
  "slug": "corpdigital",
  "primary_color": "#004080",
  "secondary_color": "#3399cc",
  "slogan": "Innovación Digital con Propósito",
  "message": "Corporación Digital apuesta por tu salud...",
  "login_layout_style": "left-panel",
  "font_family": "Open Sans, sans-serif"
}
```

### Flujos de Usuario Propuestos

1. **Acceso con Slug:**
   - Usuario ingresa: `app.com/holocheck`
   - Sistema detecta slug "holocheck"
   - Carga branding de HoloCheck
   - Muestra login personalizado
   - Post-login: todas las rutas mantienen slug (`/holocheck/employee/dashboard`)

2. **Acceso sin Slug:**
   - Usuario ingresa: `app.com`
   - Sistema usa branding por defecto (HoloCheck como master brand)
   - Funcionalidad normal

3. **Cambio de Organización:**
   - Usuario cambia de `/holocheck` a `/factork`
   - Sistema recarga branding
   - Aplica nuevos colores/logo sin perder sesión

---

## 3. Arquitectura Propuesta

### 3.1 Routing Strategy: Slug-Based (Recomendado)

**Patrón:** `app.com/{slug}/route`

**Ejemplos:**
- `app.com/holocheck/login`
- `app.com/holocheck/employee/dashboard`
- `app.com/factork/login`
- `app.com/factork/leader/team`

**Justificación:**
- ✅ Más simple de implementar (no requiere DNS/SSL wildcard)
- ✅ Desarrollo local sin configuración adicional
- ✅ Menor costo operacional
- ✅ Usuarios pueden cambiar entre organizaciones fácilmente
- ✅ Mejor para fase inicial (MVP)

### 3.2 Branding Loading Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Accesses URL                        │
│              app.com/{slug}/login                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              App.tsx - Route Matching                       │
│   - Extract slug from URL path                              │
│   - Pass slug to BrandingProvider                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          BrandingContext - Load Branding                    │
│   - API call: GET /api/v1/branding/{slug}                   │
│   - Store branding config in context                        │
│   - Apply CSS variables                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Apply Branding to App                          │
│   - Update document.title                                   │
│   - Update favicon                                          │
│   - Inject CSS variables (colors, fonts)                   │
│   - Render branded components                               │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Data Model

#### TypeScript Interfaces (Frontend)

```typescript
// types/branding.ts
export interface BrandingConfig {
  id: string;
  organizationId: string;
  slug: string;
  
  // Visual
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string | null;
  backgroundImageUrl: string | null;
  
  // Messaging
  slogan: string | null;
  message: string | null;
  loginMessage: string | null;
  dashboardWelcomeText: string | null;
  metaDescription: string | null;
  
  // Contact
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: Record<string, string> | null;
  
  // Legal
  customTermsUrl: string | null;
  customPrivacyUrl: string | null;
  
  // Config
  loginLayoutStyle: 'centered' | 'split' | 'left-panel';
  brandingMode: 'default' | 'custom';
  
  createdAt: string;
}

export interface BrandingContextType {
  branding: BrandingConfig | null;
  loading: boolean;
  error: string | null;
  slug: string | null;
  loadBranding: (slug: string) => Promise<void>;
  applyBranding: (config: BrandingConfig) => void;
  resetBranding: () => void;
}
```

#### Python Models (Backend)

```python
# models/organization_branding.py
from sqlalchemy import Column, String, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from core.database import Base

class OrganizationBranding(Base):
    __tablename__ = "organization_branding"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    
    # Visual
    logo_url = Column(Text, nullable=True)
    favicon_url = Column(Text, nullable=True)
    primary_color = Column(String(7), nullable=False, default="#440088")
    secondary_color = Column(String(7), nullable=False, default="#9900cc")
    font_family = Column(String, nullable=True)
    background_image_url = Column(Text, nullable=True)
    
    # Messaging
    slogan = Column(Text, nullable=True)
    message = Column(Text, nullable=True)
    login_message = Column(Text, nullable=True)
    dashboard_welcome_text = Column(Text, nullable=True)
    meta_description = Column(Text, nullable=True)
    
    # Contact
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    social_links = Column(JSON, nullable=True)
    
    # Legal
    custom_terms_url = Column(Text, nullable=True)
    custom_privacy_url = Column(Text, nullable=True)
    
    # Config
    login_layout_style = Column(String, nullable=False, default="centered")
    branding_mode = Column(String, nullable=False, default="default")
    
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## 4. Implementación Técnica

### 4.1 Frontend Implementation

#### BrandingContext (React Context)

**Archivo:** `/workspace/app/frontend/src/contexts/BrandingContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { BrandingConfig, BrandingContextType } from '@/types/branding';

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ 
  children, 
  slug 
}: { 
  children: React.ReactNode; 
  slug: string | null;
}) {
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadBranding(slug);
    } else {
      // Load default branding
      loadBranding('holocheck'); // Master brand
    }
  }, [slug]);

  const loadBranding = async (slugValue: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/api/v1/branding/${slugValue}`);
      const config = response.data;
      
      setBranding(config);
      applyBranding(config);
    } catch (err: any) {
      console.error('Failed to load branding:', err);
      setError(err.message || 'Failed to load branding');
      
      // Fallback to default
      loadDefaultBranding();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultBranding = () => {
    const defaultConfig: BrandingConfig = {
      id: 'default',
      organizationId: 'default',
      slug: 'holocheck',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.ico',
      primaryColor: '#440088',
      secondaryColor: '#9900cc',
      fontFamily: 'Lato, sans-serif',
      backgroundImageUrl: null,
      slogan: 'Biointeligencia para Empresas Conscientes',
      message: 'HoloCheck Equilibria',
      loginMessage: 'Bienvenido a HoloCheck',
      dashboardWelcomeText: 'Tu salud y tu desempeño en un solo lugar',
      metaDescription: 'Plataforma de bienestar organizacional',
      contactEmail: 'info@holocheck.com',
      contactPhone: '+506-8888-0003',
      socialLinks: null,
      customTermsUrl: null,
      customPrivacyUrl: null,
      loginLayoutStyle: 'centered',
      brandingMode: 'default',
      createdAt: new Date().toISOString(),
    };
    
    setBranding(defaultConfig);
    applyBranding(defaultConfig);
  };

  const applyBranding = (config: BrandingConfig) => {
    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', config.primaryColor);
    root.style.setProperty('--brand-secondary', config.secondaryColor);
    
    if (config.fontFamily) {
      root.style.setProperty('--brand-font', config.fontFamily);
    }
    
    // Update document title
    document.title = config.slogan || 'HoloCheck Equilibria';
    
    // Update favicon
    if (config.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = config.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    // Update meta description
    if (config.metaDescription) {
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.getElementsByTagName('head')[0].appendChild(metaDesc);
      }
      metaDesc.content = config.metaDescription;
    }
  };

  const resetBranding = () => {
    loadDefaultBranding();
  };

  return (
    <BrandingContext.Provider 
      value={{ 
        branding, 
        loading, 
        error, 
        slug, 
        loadBranding, 
        applyBranding, 
        resetBranding 
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
};
```

#### Slug Detection in App.tsx

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
                {/* Slug-based routes */}
                <Route path="/:slug/login" element={<Login />} />
                <Route path="/:slug/employee/dashboard" element={<EmployeeDashboard />} />
                {/* ... more routes */}
                
                {/* Non-slug routes (use default branding) */}
                <Route path="/login" element={<Login />} />
                <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                {/* ... more routes */}
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </BrandingProvider>
    </QueryClientProvider>
  );
};
```

#### Branded Login Component

**Archivo:** `/workspace/app/frontend/src/pages/Login.tsx`

```typescript
import { useBranding } from '@/contexts/BrandingContext';
import { cn } from '@/lib/utils';

export default function Login() {
  const { branding, loading } = useBranding();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  const layoutStyle = branding?.loginLayoutStyle || 'centered';
  
  return (
    <div className={cn(
      'min-h-screen',
      layoutStyle === 'centered' && 'flex items-center justify-center',
      layoutStyle === 'split' && 'grid grid-cols-1 md:grid-cols-2',
      layoutStyle === 'left-panel' && 'grid grid-cols-1 md:grid-cols-[400px_1fr]'
    )}
    style={{
      backgroundImage: branding?.backgroundImageUrl 
        ? `url(${branding.backgroundImageUrl})` 
        : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
    >
      {/* Centered Layout */}
      {layoutStyle === 'centered' && (
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
          <LoginForm />
        </div>
      )}
      
      {/* Split Layout */}
      {layoutStyle === 'split' && (
        <>
          <div className="flex items-center justify-center bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] p-12">
            <div className="text-white">
              {branding?.logoUrl && (
                <img src={branding.logoUrl} alt="Logo" className="h-16 mb-6" />
              )}
              <h1 className="text-4xl font-bold mb-4">{branding?.slogan}</h1>
              <p className="text-lg opacity-90">{branding?.message}</p>
            </div>
          </div>
          <div className="flex items-center justify-center p-12">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
          </div>
        </>
      )}
      
      {/* Left Panel Layout */}
      {layoutStyle === 'left-panel' && (
        <>
          <div className="bg-gradient-to-b from-[var(--brand-primary)] to-[var(--brand-secondary)] p-8 flex flex-col justify-between">
            {branding?.logoUrl && (
              <img src={branding.logoUrl} alt="Logo" className="h-12" />
            )}
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-2">{branding?.slogan}</h2>
              <p className="opacity-90">{branding?.loginMessage}</p>
            </div>
          </div>
          <div className="flex items-center justify-center p-12">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LoginForm() {
  const { branding } = useBranding();
  
  return (
    <div>
      {branding?.logoUrl && (
        <img src={branding.logoUrl} alt="Logo" className="h-12 mb-6 mx-auto" />
      )}
      <h2 className="text-2xl font-bold mb-6 text-center">
        {branding?.loginMessage || 'Iniciar Sesión'}
      </h2>
      
      {/* Login form fields */}
      <button 
        className="w-full py-3 rounded-lg font-medium"
        style={{
          backgroundColor: 'var(--brand-primary)',
          color: 'white',
        }}
      >
        Ingresar
      </button>
      
      {/* Footer */}
      {branding?.contactEmail && (
        <p className="text-center text-sm text-gray-600 mt-6">
          ¿Necesitas ayuda? <a href={`mailto:${branding.contactEmail}`} className="text-[var(--brand-primary)]">{branding.contactEmail}</a>
        </p>
      )}
    </div>
  );
}
```

#### CSS Variables for Theming

**Archivo:** `/workspace/app/frontend/src/styles/branding.css`

```css
:root {
  /* Default colors (HoloCheck) */
  --brand-primary: #440088;
  --brand-secondary: #9900cc;
  --brand-font: 'Lato', sans-serif;
  
  /* Derived colors */
  --brand-primary-light: color-mix(in srgb, var(--brand-primary) 20%, white);
  --brand-primary-dark: color-mix(in srgb, var(--brand-primary) 80%, black);
  --brand-secondary-light: color-mix(in srgb, var(--brand-secondary) 20%, white);
  --brand-secondary-dark: color-mix(in srgb, var(--brand-secondary) 80%, black);
}

/* Apply brand font */
body {
  font-family: var(--brand-font);
}

/* Branded components */
.btn-primary {
  background-color: var(--brand-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--brand-primary-dark);
}

.btn-secondary {
  background-color: var(--brand-secondary);
  color: white;
}

.text-brand-primary {
  color: var(--brand-primary);
}

.text-brand-secondary {
  color: var(--brand-secondary);
}

.bg-brand-primary {
  background-color: var(--brand-primary);
}

.bg-brand-secondary {
  background-color: var(--brand-secondary);
}

.border-brand-primary {
  border-color: var(--brand-primary);
}

/* Gradient backgrounds */
.bg-brand-gradient {
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
}
```

### 4.2 Backend Implementation

#### API Endpoint for Branding

**Archivo:** `/workspace/app/backend/routers/branding.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.database import get_db
from models.organization_branding import OrganizationBranding
from schemas.branding import BrandingResponse

router = APIRouter(prefix="/api/v1/branding", tags=["branding"])

@router.get("/{slug}", response_model=BrandingResponse)
async def get_branding_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get branding configuration by organization slug.
    Public endpoint - no authentication required.
    """
    # Validate slug format
    if not slug.isalnum() or len(slug) > 50:
        raise HTTPException(status_code=400, detail="Invalid slug format")
    
    # Query branding
    stmt = select(OrganizationBranding).where(OrganizationBranding.slug == slug)
    result = await db.execute(stmt)
    branding = result.scalar_one_or_none()
    
    if not branding:
        raise HTTPException(status_code=404, detail=f"Branding not found for slug: {slug}")
    
    return branding
```

#### Branding Schema

**Archivo:** `/workspace/app/backend/schemas/branding.py`

```python
from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class BrandingResponse(BaseModel):
    id: str
    organization_id: str
    slug: str
    
    # Visual
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    primary_color: str = Field(default="#440088", pattern="^#[0-9A-Fa-f]{6}$")
    secondary_color: str = Field(default="#9900cc", pattern="^#[0-9A-Fa-f]{6}$")
    font_family: Optional[str] = None
    background_image_url: Optional[str] = None
    
    # Messaging
    slogan: Optional[str] = None
    message: Optional[str] = None
    login_message: Optional[str] = None
    dashboard_welcome_text: Optional[str] = None
    meta_description: Optional[str] = None
    
    # Contact
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    social_links: Optional[Dict[str, str]] = None
    
    # Legal
    custom_terms_url: Optional[str] = None
    custom_privacy_url: Optional[str] = None
    
    # Config
    login_layout_style: str = Field(default="centered", pattern="^(centered|split|left-panel)$")
    branding_mode: str = Field(default="default", pattern="^(default|custom)$")
    
    created_at: datetime
    
    class Config:
        from_attributes = True
```

---

## 5. Routing Strategy Detallado

### Opción A: Slug-Based Routing (RECOMENDADO)

**Patrón:** `app.com/{slug}/route`

#### Pros:
✅ **Simplicidad de implementación:** No requiere configuración de DNS ni certificados SSL wildcard  
✅ **Desarrollo local fácil:** Funciona inmediatamente en localhost sin configuración  
✅ **Menor costo operacional:** Un solo dominio, un solo certificado SSL  
✅ **Provisioning rápido:** Agregar nueva organización es solo un INSERT en DB  
✅ **Usuarios multi-tenant:** Usuarios que trabajan en múltiples organizaciones no necesitan recordar diferentes URLs  
✅ **Deployment simple:** Misma configuración en dev/staging/prod  

#### Cons:
❌ **Menos profesional:** No transmite la misma sensación de aislamiento  
❌ **Límites de seguridad más débiles:** Cookies y sesiones compartidas por defecto  
❌ **Branding limitado:** No se puede ofrecer custom domains sin trabajo adicional  
❌ **Complejidad en código:** Debe manejar tenant context en toda generación de URLs  

#### Implementación:

**React Router:**
```typescript
<Routes>
  {/* Slug-based routes */}
  <Route path="/:slug">
    <Route path="login" element={<Login />} />
    <Route path="employee/dashboard" element={<EmployeeDashboard />} />
    <Route path="leader/team" element={<LeaderTeam />} />
    {/* ... más rutas */}
  </Route>
  
  {/* Non-slug routes (fallback a default) */}
  <Route path="/login" element={<Login />} />
  <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
</Routes>
```

**URL Helper:**
```typescript
// utils/url-helper.ts
export function buildUrl(path: string, slug?: string): string {
  if (slug) {
    return `/${slug}${path}`;
  }
  return path;
}

// Usage
const dashboardUrl = buildUrl('/employee/dashboard', 'holocheck');
// Result: '/holocheck/employee/dashboard'
```

### Opción B: Subdomain-Based Routing (Futuro)

**Patrón:** `{slug}.app.com/route`

#### Pros:
✅ **Branding profesional:** Cada tenant siente que tiene su propia URL  
✅ **Mejor aislamiento de seguridad:** Subdomains proveen límites naturales para cookies/CORS  
✅ **Custom domains más fácil:** Progresión natural a BYOD (Bring Your Own Domain)  
✅ **Infraestructura flexible:** Puede asignar tenants específicos a diferentes servidores  

#### Cons:
❌ **Complejidad de infraestructura:** Requiere wildcard DNS y SSL certificates  
❌ **Desarrollo local difícil:** Necesita editar hosts file, configurar SSL local  
❌ **Mayor costo:** Gestión de certificados, DNS en cada ambiente  
❌ **Usuarios olvidan URLs:** Tenants deben recordar su subdomain específico  

#### Implementación (Futuro):

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name *.holochecke quilibria.com;
    
    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Tenant-Slug $subdomain;
    }
}
```

**Middleware:**
```typescript
export function middleware(req: Request) {
  const hostname = req.headers.get('host');
  const slug = hostname?.split('.')[0];
  
  req.headers.set('x-tenant-slug', slug);
  return next();
}
```

### Comparación Técnica

| Aspecto | Slug-Based | Subdomain-Based |
|---------|------------|-----------------|
| **Implementación** | Simple | Compleja |
| **Costo** | Bajo | Alto |
| **Desarrollo Local** | Fácil | Difícil |
| **Branding** | Limitado | Profesional |
| **Seguridad** | Compartida | Aislada |
| **Custom Domains** | Difícil | Fácil |
| **Provisioning** | Instantáneo | Requiere DNS |
| **Multi-tenant Users** | Fácil | Difícil |

### Recomendación

**Fase 1 (MVP):** Implementar **Slug-Based Routing**
- Más rápido de desarrollar
- Menor riesgo
- Suficiente para validar el concepto

**Fase 3 (Futuro):** Migrar a **Subdomain-Based** (opcional)
- Solo si clientes enterprise lo requieren
- Ofrecer como feature premium
- Mantener slug-based como opción

---

## 6. Casos de Uso

### Caso 1: Usuario Accede a HoloCheck

**Flujo:**
1. Usuario ingresa: `app.com/holocheck/login`
2. App.tsx detecta slug "holocheck"
3. BrandingContext carga branding de HoloCheck:
   - Logo: HoloCheck logo
   - Colores: #440088 (primary), #9900cc (secondary)
   - Layout: centered
4. Login page renderiza con branding de HoloCheck
5. Usuario inicia sesión
6. Redirige a: `app.com/holocheck/employee/dashboard`
7. Dashboard muestra welcome text: "Tu salud y tu desempeño en un solo lugar"

**Resultado:**
✅ Usuario ve branding de HoloCheck en toda la aplicación  
✅ Navegación mantiene slug en todas las rutas  
✅ Funcionalidad core no afectada  

### Caso 2: Usuario Accede a Factor K

**Flujo:**
1. Usuario ingresa: `app.com/factork/login`
2. App.tsx detecta slug "factork"
3. BrandingContext carga branding de Factor K:
   - Logo: Factor K logo
   - Colores: #0066cc (primary), #00cc99 (secondary)
   - Layout: split
4. Login page renderiza con:
   - Lado izquierdo: Gradient con logo y slogan
   - Lado derecho: Formulario de login
5. Usuario inicia sesión
6. Redirige a: `app.com/factork/employee/dashboard`

**Resultado:**
✅ Usuario ve branding completamente diferente  
✅ Layout de login diferente (split vs centered)  
✅ Colores y mensajes personalizados  

### Caso 3: Usuario Accede sin Slug

**Flujo:**
1. Usuario ingresa: `app.com/login` (sin slug)
2. App.tsx no detecta slug
3. BrandingContext carga branding por defecto (HoloCheck como master brand)
4. Login page renderiza con branding default
5. Usuario inicia sesión
6. Redirige a: `app.com/employee/dashboard` (sin slug)

**Resultado:**
✅ Aplicación funciona normalmente  
✅ Usa branding master (HoloCheck)  
✅ Backward compatible con URLs existentes  

### Caso 4: Usuario Cambia de Organización

**Flujo:**
1. Usuario está en: `app.com/holocheck/employee/dashboard`
2. Usuario navega a: `app.com/factork/employee/dashboard`
3. BrandingContext detecta cambio de slug
4. Recarga branding de Factor K
5. Aplica nuevos CSS variables
6. Página se re-renderiza con nuevo branding

**Resultado:**
✅ Cambio de branding sin perder sesión  
✅ Transición suave  
✅ Usuario puede trabajar en múltiples organizaciones  

### Caso 5: Slug Inválido

**Flujo:**
1. Usuario ingresa: `app.com/invalid-slug/login`
2. App.tsx detecta slug "invalid-slug"
3. BrandingContext intenta cargar branding
4. API retorna 404
5. BrandingContext carga branding por defecto
6. Muestra mensaje: "Organización no encontrada, usando branding por defecto"

**Resultado:**
✅ Aplicación no se rompe  
✅ Fallback graceful a default  
✅ Usuario puede continuar usando la app  

---

## 7. Impacto en Funcionalidad Actual

### ❌ NO SE AFECTA (CRÍTICO)

#### 7.1 Menús de Navegación
**Sidebar permanece idéntico:**
- Estructura de menús no cambia
- Opciones disponibles según rol
- Navegación entre secciones igual
- Iconos y labels iguales

**Código:**
```typescript
// Sidebar.tsx - NO CHANGES
const navigation = [
  { title: 'Empleado', href: '/employee', icon: UserCircle, children: [...] },
  { title: 'Líder', href: '/leader', icon: Target, children: [...] },
  // ... resto igual
];
```

#### 7.2 Funcionalidad de Dashboards
**Dashboards mantienen:**
- Gauges biométricos
- Gráficos de tendencias
- Tablas de datos
- Filtros y búsquedas
- Exportación de reportes

**Solo cambia:**
- Welcome message en header
- Colores de elementos UI (botones, badges)

#### 7.3 Roles y Permisos
**Sistema de autorización intacto:**
- Roles: employee, leader, hr, org_admin, admin
- Permisos por rol
- Validación de acceso
- Audit logs

#### 7.4 Flujos de Escaneo
**Escaneo biométrico igual:**
- DeepAffex SDK
- Captura de video
- Procesamiento de datos
- Almacenamiento de mediciones
- Generación de recomendaciones

#### 7.5 Análisis IA
**Funcionalidad IA no afectada:**
- Prompts a GPT/Claude
- Análisis de datos
- Generación de insights
- Reportes automáticos

### ✅ SE PERSONALIZA

#### 7.6 Elementos Visuales

**Logo:**
```typescript
// AppLayout.tsx
<div className="p-6">
  {branding?.logoUrl ? (
    <img src={branding.logoUrl} alt="Logo" className="h-8" />
  ) : (
    <h1 className="text-xl font-bold">HoloCheck</h1>
  )}
</div>
```

**Favicon:**
```typescript
// BrandingContext.tsx - applyBranding()
if (config.faviconUrl) {
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.href = config.faviconUrl;
  document.head.appendChild(link);
}
```

**Colores:**
```css
/* Aplicados via CSS variables */
.btn-primary {
  background-color: var(--brand-primary);
}

.text-primary {
  color: var(--brand-primary);
}
```

**Fuentes:**
```css
body {
  font-family: var(--brand-font);
}
```

#### 7.7 Mensajes Personalizados

**Login:**
```typescript
<h2>{branding?.loginMessage || 'Iniciar Sesión'}</h2>
```

**Dashboard Welcome:**
```typescript
<p className="text-lg text-gray-600">
  {branding?.dashboardWelcomeText || 'Bienvenido a tu dashboard'}
</p>
```

**Footer:**
```typescript
<footer className="mt-8 pt-4 border-t">
  <p>Contacto: {branding?.contactEmail}</p>
  <p>Teléfono: {branding?.contactPhone}</p>
  {branding?.socialLinks && (
    <div className="flex gap-4 mt-2">
      {Object.entries(branding.socialLinks).map(([platform, url]) => (
        <a key={platform} href={url} target="_blank">
          {platform}
        </a>
      ))}
    </div>
  )}
</footer>
```

#### 7.8 Layouts de Login

**Centered (HoloCheck):**
```
┌─────────────────────────────────────┐
│                                     │
│         ┌─────────────┐             │
│         │             │             │
│         │  Login Form │             │
│         │             │             │
│         └─────────────┘             │
│                                     │
└─────────────────────────────────────┘
```

**Split (Factor K):**
```
┌──────────────────┬──────────────────┐
│                  │                  │
│  Logo + Slogan   │   Login Form     │
│  (Gradient BG)   │                  │
│                  │                  │
└──────────────────┴──────────────────┘
```

**Left Panel (Corporación Digital):**
```
┌──────┬───────────────────────────────┐
│      │                               │
│ Logo │        Login Form             │
│      │                               │
│ Info │                               │
│      │                               │
└──────┴───────────────────────────────┘
```

---

## 8. Priorización en 3 Fases

### 🔴 FASE 1: MVP - Core Branding (Sprint 1 - 1 semana)

**Objetivo:** Implementar funcionalidad básica de branding con slug detection.

#### Backend Tasks:
1. **Crear modelo OrganizationBranding** (si no existe)
   - [ ] Definir modelo en `models/organization_branding.py`
   - [ ] Crear migración de base de datos
   - [ ] Verificar datos existentes en tabla

2. **Crear API endpoint**
   - [ ] Router: `routers/branding.py`
   - [ ] Endpoint: `GET /api/v1/branding/{slug}`
   - [ ] Schema: `schemas/branding.py`
   - [ ] Validación de slug
   - [ ] Manejo de errores (404, 400)

3. **Testing Backend**
   - [ ] Test unitario para endpoint
   - [ ] Test con slugs válidos: holocheck, factork, corpdigital
   - [ ] Test con slug inválido
   - [ ] Verificar respuesta JSON

#### Frontend Tasks:
1. **Crear BrandingContext**
   - [ ] Context: `contexts/BrandingContext.tsx`
   - [ ] Types: `types/branding.ts`
   - [ ] Hook: `useBranding()`
   - [ ] Load branding from API
   - [ ] Apply CSS variables

2. **Integrar en App.tsx**
   - [ ] Detectar slug desde URL
   - [ ] Wrap app con BrandingProvider
   - [ ] Pasar slug a provider

3. **CSS Variables**
   - [ ] Crear `styles/branding.css`
   - [ ] Definir variables: --brand-primary, --brand-secondary, --brand-font
   - [ ] Aplicar en componentes existentes

4. **Actualizar componentes clave**
   - [ ] Login: Aplicar logo y colores
   - [ ] AppLayout: Aplicar logo en sidebar
   - [ ] Botones: Usar colores de marca

5. **Testing Frontend**
   - [ ] Test con `/holocheck/login` - Ver branding HoloCheck
   - [ ] Test con `/factork/login` - Ver branding Factor K
   - [ ] Test con `/login` - Ver branding default
   - [ ] Verificar cambio de slug en runtime

#### Criterios de Aceptación Fase 1:
- ✅ API endpoint `/api/v1/branding/{slug}` funciona
- ✅ BrandingContext carga y aplica branding
- ✅ Logo se muestra correctamente
- ✅ Colores primario y secundario se aplican
- ✅ Slug detection funciona en App.tsx
- ✅ Fallback a default branding si slug no existe
- ✅ NO se afecta funcionalidad existente

---

### 🟡 FASE 2: Mejoras - Layouts y Mensajes (Sprint 2 - 1 semana)

**Objetivo:** Implementar layouts personalizados y mensajes de marca.

#### Frontend Tasks:
1. **Login Layouts**
   - [ ] Implementar layout "centered"
   - [ ] Implementar layout "split"
   - [ ] Implementar layout "left-panel"
   - [ ] Switch basado en `branding.loginLayoutStyle`

2. **Mensajes Personalizados**
   - [ ] Login message
   - [ ] Dashboard welcome text
   - [ ] Footer con contacto
   - [ ] Meta description

3. **Background Images**
   - [ ] Aplicar background_image_url en login
   - [ ] Responsive background
   - [ ] Fallback si no hay imagen

4. **Footer Personalizado**
   - [ ] Componente Footer
   - [ ] Mostrar contactEmail, contactPhone
   - [ ] Links a redes sociales (socialLinks)
   - [ ] Links a términos y privacidad personalizados

5. **Fuentes Personalizadas**
   - [ ] Cargar font_family dinámicamente
   - [ ] Aplicar a body
   - [ ] Fallback a fuente default

#### Testing Fase 2:
- [ ] Verificar 3 layouts diferentes (centered, split, left-panel)
- [ ] Verificar mensajes personalizados en login y dashboard
- [ ] Verificar background images
- [ ] Verificar footer con contacto
- [ ] Verificar fuentes personalizadas

#### Criterios de Aceptación Fase 2:
- ✅ 3 layouts de login funcionan correctamente
- ✅ Mensajes personalizados se muestran
- ✅ Background images se aplican
- ✅ Footer con contacto visible
- ✅ Fuentes personalizadas cargan
- ✅ Responsive en móvil y desktop

---

### 🟢 FASE 3: Avanzado - Admin Panel y Optimizaciones (Sprint 3 - 1 semana)

**Objetivo:** Panel de administración y optimizaciones de performance.

#### Backend Tasks:
1. **CRUD Endpoints para Branding**
   - [ ] POST `/api/v1/branding` - Crear branding
   - [ ] PUT `/api/v1/branding/{id}` - Actualizar branding
   - [ ] DELETE `/api/v1/branding/{id}` - Eliminar branding
   - [ ] Validación de permisos (solo admin)

2. **Validaciones**
   - [ ] Validar formato de colores (hex)
   - [ ] Validar URLs (logo, favicon, background)
   - [ ] Validar slug único
   - [ ] Validar layout_style enum

#### Frontend Tasks:
1. **Admin Panel - Branding Management**
   - [ ] Página: `pages/admin/branding-management.tsx`
   - [ ] Lista de brandings existentes
   - [ ] Formulario para crear/editar branding
   - [ ] Preview de branding
   - [ ] Upload de logo, favicon, background

2. **Optimizaciones**
   - [ ] Cache de branding en localStorage
   - [ ] Lazy load de fuentes personalizadas
   - [ ] Preload de imágenes críticas (logo, favicon)
   - [ ] Reducir re-renders innecesarios

3. **Meta Tags Dinámicos**
   - [ ] Actualizar document.title
   - [ ] Actualizar meta description
   - [ ] Actualizar og:image, og:title, og:description
   - [ ] Favicon dinámico

4. **Mejoras UX**
   - [ ] Loading state durante carga de branding
   - [ ] Error state si falla carga
   - [ ] Skeleton screens
   - [ ] Transiciones suaves al cambiar branding

#### Testing Fase 3:
- [ ] Admin puede crear nuevo branding
- [ ] Admin puede editar branding existente
- [ ] Validaciones funcionan correctamente
- [ ] Preview de branding funciona
- [ ] Cache mejora performance
- [ ] Meta tags se actualizan

#### Criterios de Aceptación Fase 3:
- ✅ Admin panel funcional
- ✅ CRUD completo de branding
- ✅ Validaciones robustas
- ✅ Performance optimizada (cache, lazy load)
- ✅ Meta tags dinámicos
- ✅ UX pulida (loading, errors, transitions)

---

## 9. Criterios de Aceptación

### Para Cada Fase

#### FASE 1: Core Branding

| Criterio | Cómo Verificar | Resultado Esperado |
|----------|----------------|-------------------|
| API endpoint funciona | `curl http://localhost:8000/api/v1/branding/holocheck` | JSON con branding de HoloCheck |
| Slug detection | Navegar a `/holocheck/login` | URL detecta slug "holocheck" |
| Logo se aplica | Inspeccionar elemento logo | `src` apunta a logo de HoloCheck |
| Colores se aplican | Inspeccionar CSS variables | `--brand-primary: #440088` |
| Fallback funciona | Navegar a `/invalid/login` | Usa branding default sin error |
| Funcionalidad intacta | Navegar sidebar, dashboards | Todo funciona igual que antes |

#### FASE 2: Layouts y Mensajes

| Criterio | Cómo Verificar | Resultado Esperado |
|----------|----------------|-------------------|
| Layout centered | `/holocheck/login` | Formulario centrado en pantalla |
| Layout split | `/factork/login` | Pantalla dividida: gradient + form |
| Layout left-panel | `/corpdigital/login` | Panel izquierdo + form derecha |
| Mensajes personalizados | Leer texto en login | "Bienvenido a HoloCheck" (HoloCheck) |
| Background image | Inspeccionar CSS background | Imagen de fondo aplicada |
| Footer contacto | Scroll a footer | Email y teléfono visibles |

#### FASE 3: Admin Panel

| Criterio | Cómo Verificar | Resultado Esperado |
|----------|----------------|-------------------|
| Admin puede crear branding | Usar formulario admin | Nuevo branding en DB |
| Validación de colores | Ingresar color inválido | Error: "Formato hex inválido" |
| Preview funciona | Cambiar colores en form | Preview actualiza en tiempo real |
| Cache funciona | Recargar página | Branding carga de cache (rápido) |
| Meta tags | Inspeccionar `<head>` | `<title>` y `<meta>` actualizados |

---

## 10. Riesgos y Mitigación

### Riesgo 1: Conflictos de Routing

**Descripción:** Slug puede coincidir con rutas existentes (ej: `/admin` como slug vs `/admin` como ruta).

**Probabilidad:** Media  
**Impacto:** Alto

**Mitigación:**
1. **Lista de slugs reservados:**
   ```typescript
   const RESERVED_SLUGS = [
     'login', 'logout', 'admin', 'api', 'auth', 
     'employee', 'leader', 'hr', 'org', 'user-manual'
   ];
   
   function isValidSlug(slug: string): boolean {
     return !RESERVED_SLUGS.includes(slug.toLowerCase());
   }
   ```

2. **Validación en backend:**
   ```python
   RESERVED_SLUGS = ['login', 'logout', 'admin', 'api', 'auth']
   
   if slug.lower() in RESERVED_SLUGS:
       raise HTTPException(400, "Slug is reserved")
   ```

3. **Documentación clara:** Informar a admins sobre slugs reservados.

### Riesgo 2: Performance Issues

**Descripción:** Cargar branding en cada navegación puede ser lento.

**Probabilidad:** Media  
**Impacto:** Medio

**Mitigación:**
1. **Cache en localStorage:**
   ```typescript
   const cachedBranding = localStorage.getItem(`branding_${slug}`);
   if (cachedBranding) {
     const config = JSON.parse(cachedBranding);
     // Verificar si está vigente (< 1 hora)
     if (Date.now() - config.timestamp < 3600000) {
       return config.data;
     }
   }
   ```

2. **React Query con stale time:**
   ```typescript
   const { data: branding } = useQuery({
     queryKey: ['branding', slug],
     queryFn: () => fetchBranding(slug),
     staleTime: 1000 * 60 * 60, // 1 hora
     cacheTime: 1000 * 60 * 60 * 24, // 24 horas
   });
   ```

3. **CDN para assets:** Servir logos, favicons desde CDN (S3 + CloudFront).

### Riesgo 3: Afectar Funcionalidad Actual

**Descripción:** Cambios en routing o componentes rompen features existentes.

**Probabilidad:** Media  
**Impacto:** Crítico

**Mitigación:**
1. **Testing exhaustivo:**
   - E2E tests para flujos críticos
   - Regression tests antes de cada deploy
   - Manual testing de todas las páginas

2. **Feature flags:**
   ```typescript
   const ENABLE_BRANDING = process.env.REACT_APP_ENABLE_BRANDING === 'true';
   
   if (ENABLE_BRANDING) {
     // Aplicar branding
   } else {
     // Usar default
   }
   ```

3. **Rollback plan:** Mantener versión anterior deployada, rollback en <5 min.

### Riesgo 4: CSS Conflicts

**Descripción:** CSS variables pueden conflictuar con estilos existentes.

**Probabilidad:** Baja  
**Impacto:** Medio

**Mitigación:**
1. **Namespace claro:**
   ```css
   /* Usar prefijo --brand- */
   --brand-primary: #440088;
   --brand-secondary: #9900cc;
   
   /* NO usar nombres genéricos */
   /* --primary: #440088;  ❌ */
   ```

2. **Scope limitado:**
   ```css
   /* Solo aplicar a componentes branded */
   .branded-component {
     color: var(--brand-primary);
   }
   ```

3. **Testing visual:** Screenshot testing con Percy o Chromatic.

### Riesgo 5: Seguridad - XSS via Branding

**Descripción:** Admin malicioso podría inyectar scripts via campos de texto.

**Probabilidad:** Baja  
**Impacto:** Crítico

**Mitigación:**
1. **Sanitización en backend:**
   ```python
   from bleach import clean
   
   def sanitize_text(text: str) -> str:
       return clean(text, tags=[], strip=True)
   
   branding.slogan = sanitize_text(data.slogan)
   ```

2. **Validación de URLs:**
   ```python
   from urllib.parse import urlparse
   
   def is_valid_url(url: str) -> bool:
       parsed = urlparse(url)
       return parsed.scheme in ['http', 'https']
   ```

3. **CSP headers:**
   ```python
   response.headers["Content-Security-Policy"] = (
       "default-src 'self'; "
       "img-src 'self' https://holocheckequilibria.s3.amazonaws.com; "
       "font-src 'self' https://fonts.googleapis.com;"
   )
   ```

---

## 11. Testing Strategy

### 11.1 Unit Tests

#### Backend:
```python
# tests/test_branding.py
import pytest
from fastapi.testclient import TestClient

def test_get_branding_by_slug_success(client: TestClient):
    response = client.get("/api/v1/branding/holocheck")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "holocheck"
    assert data["primary_color"] == "#440088"

def test_get_branding_by_slug_not_found(client: TestClient):
    response = client.get("/api/v1/branding/nonexistent")
    assert response.status_code == 404

def test_get_branding_invalid_slug(client: TestClient):
    response = client.get("/api/v1/branding/invalid-slug-with-special-chars!")
    assert response.status_code == 400
```

#### Frontend:
```typescript
// tests/BrandingContext.test.tsx
import { render, waitFor } from '@testing-library/react';
import { BrandingProvider, useBranding } from '@/contexts/BrandingContext';

describe('BrandingContext', () => {
  it('loads branding for valid slug', async () => {
    const { result } = renderHook(() => useBranding(), {
      wrapper: ({ children }) => (
        <BrandingProvider slug="holocheck">{children}</BrandingProvider>
      ),
    });
    
    await waitFor(() => {
      expect(result.current.branding).not.toBeNull();
      expect(result.current.branding?.slug).toBe('holocheck');
    });
  });
  
  it('falls back to default for invalid slug', async () => {
    const { result } = renderHook(() => useBranding(), {
      wrapper: ({ children }) => (
        <BrandingProvider slug="invalid">{children}</BrandingProvider>
      ),
    });
    
    await waitFor(() => {
      expect(result.current.branding?.slug).toBe('holocheck'); // default
    });
  });
});
```

### 11.2 Integration Tests

```typescript
// tests/integration/branding-flow.test.tsx
describe('Branding Integration', () => {
  it('applies branding throughout app navigation', async () => {
    // 1. Navigate to /holocheck/login
    render(<App />, { initialEntries: ['/holocheck/login'] });
    
    // 2. Verify branding loaded
    await waitFor(() => {
      expect(screen.getByAltText('Logo')).toHaveAttribute('src', expect.stringContaining('holocheck'));
    });
    
    // 3. Login
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    
    // 4. Navigate to dashboard
    await waitFor(() => {
      expect(window.location.pathname).toBe('/holocheck/employee/dashboard');
    });
    
    // 5. Verify branding persists
    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe('#440088');
  });
});
```

### 11.3 E2E Tests (Playwright)

```typescript
// e2e/branding.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Multitenant Branding', () => {
  test('HoloCheck branding', async ({ page }) => {
    await page.goto('/holocheck/login');
    
    // Verify logo
    const logo = page.locator('img[alt="Logo"]');
    await expect(logo).toHaveAttribute('src', /holocheck/);
    
    // Verify colors
    const primaryButton = page.locator('.btn-primary');
    const bgColor = await primaryButton.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBe('rgb(68, 0, 136)'); // #440088
  });
  
  test('Factor K branding', async ({ page }) => {
    await page.goto('/factork/login');
    
    // Verify split layout
    const leftPanel = page.locator('.bg-brand-gradient');
    await expect(leftPanel).toBeVisible();
    
    // Verify slogan
    await expect(page.locator('text=Innovación sin límites')).toBeVisible();
  });
  
  test('Switch between organizations', async ({ page }) => {
    // Start with HoloCheck
    await page.goto('/holocheck/employee/dashboard');
    let primaryColor = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--brand-primary')
    );
    expect(primaryColor.trim()).toBe('#440088');
    
    // Switch to Factor K
    await page.goto('/factork/employee/dashboard');
    primaryColor = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--brand-primary')
    );
    expect(primaryColor.trim()).toBe('#0066cc');
  });
});
```

### 11.4 Visual Regression Tests

```typescript
// tests/visual/branding.visual.test.ts
import { test } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('HoloCheck login page', async ({ page }) => {
    await page.goto('/holocheck/login');
    await expect(page).toHaveScreenshot('holocheck-login.png');
  });
  
  test('Factor K login page', async ({ page }) => {
    await page.goto('/factork/login');
    await expect(page).toHaveScreenshot('factork-login.png');
  });
  
  test('Corporación Digital login page', async ({ page }) => {
    await page.goto('/corpdigital/login');
    await expect(page).toHaveScreenshot('corpdigital-login.png');
  });
});
```

### 11.5 Manual Testing Checklist

#### Pre-Deployment Checklist:
- [ ] **Backend:**
  - [ ] API endpoint `/api/v1/branding/holocheck` retorna datos correctos
  - [ ] API endpoint `/api/v1/branding/factork` retorna datos correctos
  - [ ] API endpoint `/api/v1/branding/corpdigital` retorna datos correctos
  - [ ] API endpoint con slug inválido retorna 404
  - [ ] Validación de slug funciona

- [ ] **Frontend - HoloCheck:**
  - [ ] `/holocheck/login` muestra logo de HoloCheck
  - [ ] Colores #440088 y #9900cc aplicados
  - [ ] Layout centered
  - [ ] Login funciona
  - [ ] Redirect a `/holocheck/employee/dashboard`
  - [ ] Dashboard muestra welcome text

- [ ] **Frontend - Factor K:**
  - [ ] `/factork/login` muestra logo de Factor K
  - [ ] Colores #0066cc y #00cc99 aplicados
  - [ ] Layout split (gradient + form)
  - [ ] Slogan "Innovación sin límites" visible
  - [ ] Login funciona
  - [ ] Redirect a `/factork/employee/dashboard`

- [ ] **Frontend - Corporación Digital:**
  - [ ] `/corpdigital/login` muestra logo de Corporación Digital
  - [ ] Colores #004080 y #3399cc aplicados
  - [ ] Layout left-panel
  - [ ] Login funciona
  - [ ] Redirect a `/corpdigital/employee/dashboard`

- [ ] **Funcionalidad No Afectada:**
  - [ ] Sidebar funciona igual
  - [ ] Navegación entre páginas funciona
  - [ ] Dashboards muestran datos correctos
  - [ ] Escaneo biométrico funciona
  - [ ] Análisis IA funciona
  - [ ] Roles y permisos funcionan

- [ ] **Edge Cases:**
  - [ ] `/login` (sin slug) usa branding default
  - [ ] `/invalid-slug/login` fallback a default
  - [ ] Cambiar de `/holocheck` a `/factork` actualiza branding
  - [ ] Refresh de página mantiene branding

- [ ] **Performance:**
  - [ ] Branding carga en <500ms
  - [ ] No hay flickering al cargar
  - [ ] Cache funciona (segunda carga más rápida)

- [ ] **Mobile:**
  - [ ] Layouts responsive en móvil
  - [ ] Logo visible en móvil
  - [ ] Colores aplicados en móvil

---

## 📝 Resumen Ejecutivo para Stakeholders

### Inversión Requerida
- **Tiempo:** 3 sprints (3 semanas)
- **Recursos:** 
  - 1 desarrollador backend (Alex) - 40% tiempo
  - 1 desarrollador frontend (Alex) - 60% tiempo
  - 1 product manager (Emma) - 20% tiempo
  - 1 arquitecto (Bob) - revisión y diseño

### ROI Esperado
- **White-label capability:** Permite vender a múltiples clientes
- **Premium pricing:** Cobrar extra por branding personalizado
- **Escalabilidad:** Agregar organizaciones sin desarrollo adicional
- **Competitividad:** Feature que competidores no tienen

### Riesgos Mitigados
- ✅ No afecta funcionalidad actual (testing exhaustivo)
- ✅ Performance optimizada (cache, CDN)
- ✅ Seguridad validada (sanitización, CSP)
- ✅ Rollback plan en caso de issues

### Próximos Pasos
1. Aprobar especificaciones
2. Asignar Sprint 1 a Alex
3. Bob revisa arquitectura detallada
4. Kickoff Fase 1

---

**Documento creado por:** Emma (Product Manager)  
**Fecha:** 2026-01-25  
**Versión:** 1.0  
**Estado:** Listo para revisión de Bob (Architect)