# ✅ Checklist de Implementación: Multitenant Branding (Simplificado)

**Proyecto:** HoloCheck Equilibria  
**Versión:** 2.0 (Simplificada)  
**Fecha:** 2026-01-25  
**Asignado a:** Alex (Frontend Developer)  
**Tiempo estimado:** 3-4 días

---

## 📋 Resumen

Implementar personalización visual multitenant basada en slug. **Solo cambios frontend, sin tocar backend ni base de datos.**

**Principios:**
- Login = NEUTRAL (solo logo + color botón)
- App = BRANDED (personalización completa post-login)
- API existente (no modificar)
- Implementación rápida (3-4 días)

---

## 🗓️ DÍA 1: Setup y Context

### Task 1.1: Crear Type Definitions
**Archivo:** `/workspace/app/frontend/src/types/branding.ts`

```typescript
export interface BrandingConfig {
  slug: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string | null;
  slogan: string | null;
  dashboardWelcomeText: string | null;
}

export interface BrandingContextType {
  branding: BrandingConfig | null;
  loading: boolean;
}
```

**Checklist:**
- [ ] Crear archivo `types/branding.ts`
- [ ] Definir interface `BrandingConfig`
- [ ] Definir interface `BrandingContextType`
- [ ] Commit: "feat: add branding type definitions"

---

### Task 1.2: Crear BrandingContext
**Archivo:** `/workspace/app/frontend/src/contexts/BrandingContext.tsx`

**Funcionalidad:**
1. Cargar branding desde API: `GET /api/v1/entities/organization-branding?query={"slug":"holocheck"}`
2. Aplicar CSS variables: `--brand-primary`, `--brand-secondary`, `--brand-font`
3. Actualizar favicon dinámicamente
4. Actualizar document.title

**Código base:**
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { BrandingConfig, BrandingContextType } from '@/types/branding';

const BrandingContext = createContext<BrandingContextType>({
  branding: null,
  loading: true,
});

export function BrandingProvider({ children, slug }: { children: React.ReactNode; slug: string | null }) {
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranding(slug || 'holocheck');
  }, [slug]);

  const loadBranding = async (slugValue: string) => {
    // TODO: Implementar carga desde API
    // TODO: Aplicar CSS variables
    // TODO: Actualizar favicon
    // TODO: Actualizar title
  };

  return (
    <BrandingContext.Provider value={{ branding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
```

**Checklist:**
- [ ] Crear archivo `contexts/BrandingContext.tsx`
- [ ] Implementar `loadBranding()` con llamada a API
- [ ] Implementar `applyBranding()` para CSS variables
- [ ] Actualizar favicon dinámicamente
- [ ] Actualizar document.title
- [ ] Manejar errores (fallback a holocheck)
- [ ] Test: Cargar branding de holocheck
- [ ] Test: Cargar branding de factork
- [ ] Test: Cargar branding de corpdigital
- [ ] Commit: "feat: add BrandingContext with API integration"

**Endpoint API:**
```javascript
const query = JSON.stringify({ slug: slugValue });
const response = await apiClient.get(
  `/api/v1/entities/organization-branding?query=${encodeURIComponent(query)}`
);
```

**Aplicar CSS variables:**
```javascript
const applyBranding = (config: BrandingConfig) => {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', config.primaryColor);
  root.style.setProperty('--brand-secondary', config.secondaryColor);
  if (config.fontFamily) {
    root.style.setProperty('--brand-font', config.fontFamily);
  }
};
```

---

### Task 1.3: Crear CSS Variables
**Archivo:** `/workspace/app/frontend/src/styles/branding.css`

```css
:root {
  --brand-primary: #440088;
  --brand-secondary: #9900cc;
  --brand-font: 'Lato', sans-serif;
}

body {
  font-family: var(--brand-font);
}

.btn-primary {
  background-color: var(--brand-primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.text-brand-primary {
  color: var(--brand-primary);
}

.bg-brand-primary {
  background-color: var(--brand-primary);
}

.border-brand-primary {
  border-color: var(--brand-primary);
}

input:focus,
textarea:focus,
select:focus {
  border-color: var(--brand-primary);
  ring-color: var(--brand-primary);
}
```

**Checklist:**
- [ ] Crear archivo `styles/branding.css`
- [ ] Definir CSS variables
- [ ] Importar en `App.tsx` o `index.tsx`
- [ ] Commit: "feat: add branding CSS variables"

---

### Task 1.4: Integrar en App.tsx
**Archivo:** `/workspace/app/frontend/src/App.tsx`

**Cambios:**
1. Importar `BrandingProvider`
2. Detectar slug desde URL
3. Wrap app con `BrandingProvider`

```typescript
import { BrandingProvider } from '@/contexts/BrandingContext';
import { useLocation } from 'react-router-dom';

const App = () => {
  const location = useLocation();
  
  // Detectar slug desde URL
  const slug = React.useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const knownSlugs = ['holocheck', 'factork', 'corpdigital'];
    if (pathSegments.length > 0 && knownSlugs.includes(pathSegments[0])) {
      return pathSegments[0];
    }
    return null;
  }, [location.pathname]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrandingProvider slug={slug}>
        <AuthProvider>
          {/* ... resto del app */}
        </AuthProvider>
      </BrandingProvider>
    </QueryClientProvider>
  );
};
```

**Checklist:**
- [ ] Importar `BrandingProvider` y `useBranding`
- [ ] Implementar slug detection
- [ ] Wrap app con `BrandingProvider`
- [ ] Test: URL `/holocheck/login` detecta slug "holocheck"
- [ ] Test: URL `/factork/login` detecta slug "factork"
- [ ] Test: URL `/login` detecta slug null (usa default)
- [ ] Commit: "feat: integrate BrandingProvider in App.tsx"

---

## 🗓️ DÍA 2: Login Neutral

### Task 2.1: Modificar Login.tsx
**Archivo:** `/workspace/app/frontend/src/pages/Login.tsx`

**Cambios:**
1. Importar `useBranding()`
2. Mostrar logo si existe
3. Aplicar color primario en botón
4. Mantener diseño neutral

**Código:**
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
        
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
          Iniciar Sesión
        </h2>
        
        <form className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
          </div>
          
          {/* Password input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
          </div>
          
          {/* Botón con color primario */}
          <button 
            type="submit"
            className="w-full py-3 rounded-lg font-medium text-white"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] Importar `useBranding()`
- [ ] Agregar loading state
- [ ] Mostrar logo si existe
- [ ] Aplicar color primario en botón (inline style)
- [ ] Aplicar focus ring con color primario en inputs
- [ ] Test: `/holocheck/login` muestra logo de HoloCheck
- [ ] Test: Botón tiene color #440088
- [ ] Test: `/factork/login` muestra logo de Factor K
- [ ] Test: Botón tiene color #0066cc
- [ ] Test: Login funciona correctamente
- [ ] Commit: "feat: add minimal branding to Login page"

---

### Task 2.2: Testing Login
**Tests manuales:**

**HoloCheck:**
- [ ] Navegar a `/holocheck/login`
- [ ] Verificar logo: `Logo+Holocheck.jpg`
- [ ] Verificar color botón: #440088 (morado)
- [ ] Verificar favicon: `favicon_holocheck.ico`
- [ ] Verificar title: "Biointeligencia para Empresas Conscientes"
- [ ] Login funciona

**Factor K:**
- [ ] Navegar a `/factork/login`
- [ ] Verificar logo: `FactorK.png`
- [ ] Verificar color botón: #0066cc (azul)
- [ ] Verificar favicon: `favicon_factork.ico`
- [ ] Verificar title: "Innovación sin límites"
- [ ] Login funciona

**Corporación Digital:**
- [ ] Navegar a `/corpdigital/login`
- [ ] Verificar logo: `CorpDigital.jpg`
- [ ] Verificar color botón: #004080 (azul oscuro)
- [ ] Verificar favicon: `favicon_corpdigital.ico`
- [ ] Verificar title: "Innovación Digital con Propósito"
- [ ] Login funciona

**Sin slug:**
- [ ] Navegar a `/login`
- [ ] Verificar usa branding default (HoloCheck)
- [ ] Login funciona

---

## 🗓️ DÍA 3: App Personalizado

### Task 3.1: Modificar AppLayout.tsx
**Archivo:** `/workspace/app/frontend/src/components/layout/AppLayout.tsx`

**Cambios:**
1. Importar `useBranding()`
2. Mostrar logo en header
3. Aplicar colores de marca

```typescript
import { useBranding } from '@/contexts/BrandingContext';

export default function AppLayout() {
  const { branding } = useBranding();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo personalizado */}
          {branding?.logoUrl ? (
            <img 
              src={branding.logoUrl} 
              alt="Logo" 
              className="h-8 object-contain"
            />
          ) : (
            <h1 className="text-xl font-bold text-brand-primary">
              HoloCheck Equilibria
            </h1>
          )}
          
          {/* User menu, etc. */}
        </div>
      </header>
      
      {/* Resto del layout sin cambios */}
    </div>
  );
}
```

**Checklist:**
- [ ] Importar `useBranding()`
- [ ] Mostrar logo en header
- [ ] Aplicar colores de marca en elementos UI
- [ ] Test: Post-login, header muestra logo correcto
- [ ] Commit: "feat: add branding to AppLayout header"

---

### Task 3.2: Modificar Sidebar.tsx (Opcional)
**Archivo:** `/workspace/app/frontend/src/components/layout/Sidebar.tsx`

**Cambios:**
1. Mostrar logo en sidebar (si aplica)
2. Aplicar colores de marca en elementos activos

```typescript
import { useBranding } from '@/contexts/BrandingContext';

export default function Sidebar() {
  const { branding } = useBranding();
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      {/* Logo en sidebar */}
      <div className="p-6">
        {branding?.logoUrl ? (
          <img src={branding.logoUrl} alt="Logo" className="h-8" />
        ) : (
          <h1 className="text-xl font-bold text-brand-primary">HoloCheck</h1>
        )}
      </div>
      
      {/* Menú sin cambios estructurales */}
    </aside>
  );
}
```

**Checklist:**
- [ ] Importar `useBranding()`
- [ ] Mostrar logo en sidebar
- [ ] Aplicar color primario en items activos
- [ ] Test: Logo visible en sidebar
- [ ] Commit: "feat: add branding to Sidebar"

---

### Task 3.3: Aplicar CSS Variables en Componentes
**Archivos a modificar:**
- Botones primarios
- Links
- Badges
- Headers

**Ejemplo:**
```typescript
// Antes
<button className="bg-purple-600 text-white">Guardar</button>

// Después
<button className="bg-brand-primary text-white">Guardar</button>
```

**Checklist:**
- [ ] Identificar componentes con colores hardcoded
- [ ] Reemplazar con clases `bg-brand-primary`, `text-brand-primary`, etc.
- [ ] Test: Colores se aplican correctamente
- [ ] Commit: "feat: apply brand colors to UI components"

---

### Task 3.4: Testing App Personalizado
**Tests manuales post-login:**

**HoloCheck:**
- [ ] Login con `/holocheck/login`
- [ ] Header muestra logo de HoloCheck
- [ ] Sidebar muestra logo de HoloCheck
- [ ] Botones tienen color #440088
- [ ] Fuente Lato aplicada
- [ ] Navegación funciona
- [ ] Dashboards funcionan

**Factor K:**
- [ ] Login con `/factork/login`
- [ ] Header muestra logo de Factor K
- [ ] Botones tienen color #0066cc
- [ ] Fuente Roboto aplicada
- [ ] Todo funciona

**Corporación Digital:**
- [ ] Login con `/corpdigital/login`
- [ ] Header muestra logo de Corporación Digital
- [ ] Botones tienen color #004080
- [ ] Fuente Open Sans aplicada
- [ ] Todo funciona

---

## 🗓️ DÍA 4: Testing y Refinamiento

### Task 4.1: Testing Completo

#### Funcionalidad NO Afectada
- [ ] Sidebar: Estructura y opciones iguales
- [ ] Navegación: Todas las rutas funcionan
- [ ] Dashboards: Datos se muestran correctamente
- [ ] Escaneo biométrico: Funciona igual
- [ ] Análisis IA: Funciona igual
- [ ] Roles y permisos: Sin cambios
- [ ] Menús: Sin cambios estructurales

#### Edge Cases
- [ ] URL sin slug (`/login`) usa branding default
- [ ] URL con slug inválido (`/invalid/login`) fallback a default
- [ ] Cambiar de `/holocheck` a `/factork` actualiza branding
- [ ] Refresh de página mantiene branding
- [ ] Console sin errores

#### Performance
- [ ] Branding carga en <500ms
- [ ] No hay flickering al cargar
- [ ] Transiciones suaves

#### Mobile
- [ ] Logo visible en móvil
- [ ] Botón funciona en móvil
- [ ] Colores aplicados en móvil
- [ ] Responsive design intacto

---

### Task 4.2: Refinamiento UX

**Mejoras opcionales:**
- [ ] Loading state más elegante
- [ ] Transiciones suaves al cambiar branding
- [ ] Error handling mejorado
- [ ] Cache de branding (localStorage)

---

### Task 4.3: Documentación

**Crear README:**
- [ ] Cómo funciona el sistema de branding
- [ ] Cómo agregar nueva organización
- [ ] Cómo testear localmente
- [ ] Troubleshooting común

**Archivo:** `/workspace/app/docs/BRANDING_README.md`

```markdown
# Multitenant Branding

## Cómo funciona
1. Usuario accede con slug: `/holocheck/login`
2. BrandingContext carga branding desde API
3. Aplica CSS variables
4. Login muestra logo + color botón
5. Post-login, app muestra branding completo

## Agregar nueva organización
1. Insertar en tabla `organization_branding`
2. Agregar slug a lista en `App.tsx`
3. Test con URL `/{slug}/login`

## Testing local
```bash
npm run dev
# Navegar a:
# http://localhost:3000/holocheck/login
# http://localhost:3000/factork/login
# http://localhost:3000/corpdigital/login
```
```

**Checklist:**
- [ ] Crear `BRANDING_README.md`
- [ ] Documentar flujo completo
- [ ] Documentar cómo agregar organización
- [ ] Documentar testing
- [ ] Commit: "docs: add branding documentation"

---

### Task 4.4: Final Review

**Checklist final:**
- [ ] Código limpio y comentado
- [ ] No hay console.errors
- [ ] No hay warnings en build
- [ ] TypeScript sin errores
- [ ] ESLint sin errores
- [ ] Todos los tests manuales pasados
- [ ] Documentación completa
- [ ] Commit: "feat: complete multitenant branding implementation"

---

## 📊 Resumen de Archivos

### Nuevos (3)
1. `/workspace/app/frontend/src/types/branding.ts` (20 líneas)
2. `/workspace/app/frontend/src/contexts/BrandingContext.tsx` (100 líneas)
3. `/workspace/app/frontend/src/styles/branding.css` (50 líneas)

### Modificados (3)
1. `/workspace/app/frontend/src/App.tsx` (+20 líneas)
2. `/workspace/app/frontend/src/pages/Login.tsx` (+30 líneas)
3. `/workspace/app/frontend/src/components/layout/AppLayout.tsx` (+15 líneas)

### Total: ~235 líneas de código

---

## ⚠️ Recordatorios Importantes

1. **NO modificar backend** - API ya existe
2. **NO modificar base de datos** - Tabla ya existe con datos
3. **Login = NEUTRAL** - Solo logo + color botón
4. **App = BRANDED** - Personalización completa post-login
5. **Funcionalidad intacta** - Nada debe romperse
6. **Implementación rápida** - 3-4 días máximo

---

## 🎯 Resultado Esperado

Al finalizar:
- ✅ `/holocheck/login` → Logo HoloCheck + Botón morado
- ✅ `/factork/login` → Logo Factor K + Botón azul
- ✅ `/corpdigital/login` → Logo Corporación Digital + Botón azul oscuro
- ✅ Post-login → Header con logo correcto
- ✅ Colores aplicados en toda la UI
- ✅ Fuentes personalizadas
- ✅ Funcionalidad actual NO afectada

---

**Creado por:** Emma (Product Manager)  
**Para:** Alex (Frontend Developer)  
**Fecha:** 2026-01-25  
**Versión:** 2.0 (Simplificada)