# PRD: Página de Lobby/Landing - HoloCheck Equilibria

## 1. Resumen Ejecutivo

### 1.1 Visión del Producto
Crear una experiencia de bienvenida profesional y personalizada que sirva como punto de entrada para todos los usuarios de la plataforma HoloCheck Equilibria, reflejando la identidad corporativa de cada organización y facilitando la navegación según el rol del usuario.

### 1.2 Objetivos del Producto
- **P0**: Mostrar información de branding corporativo de forma atractiva y profesional
- **P0**: Proporcionar navegación intuitiva basada en roles de usuario
- **P1**: Crear una experiencia de bienvenida memorable y personalizada
- **P1**: Permitir personalización de preferencias de visualización
- **P2**: Mostrar contenido dinámico relevante (anuncios, estadísticas, eventos)

### 1.3 Métricas de Éxito
- Tiempo promedio en página de lobby < 5 segundos
- Tasa de "saltar lobby" en usuarios recurrentes > 60%
- Satisfacción de usuario con experiencia de bienvenida > 4.5/5
- Carga de página completa < 2 segundos

---

## 2. Contexto y Antecedentes

### 2.1 Problema a Resolver
Actualmente, los usuarios ingresan directamente a sus dashboards sin una experiencia de bienvenida que:
- Refuerce la identidad corporativa de su organización
- Proporcione contexto sobre la plataforma
- Ofrezca información relevante antes de comenzar a trabajar
- Cree un sentido de pertenencia organizacional

### 2.2 Usuarios Objetivo

#### Empleado (employee)
- **Necesidad**: Ver mensaje de bienvenida, beneficios disponibles, próximos eventos
- **Frecuencia de uso**: Diaria
- **Nivel técnico**: Básico a intermedio

#### Líder de Departamento (leader)
- **Necesidad**: Información del equipo, alertas importantes, acceso rápido a reportes
- **Frecuencia de uso**: Múltiple diaria
- **Nivel técnico**: Intermedio

#### Gerente de RRHH (hr_manager)
- **Necesidad**: Estadísticas generales, anuncios pendientes, acceso a gestión
- **Frecuencia de uso**: Múltiple diaria
- **Nivel técnico**: Intermedio a avanzado

#### Administrador de Organización (org_admin)
- **Necesidad**: Vista general del sistema, configuración rápida, alertas críticas
- **Frecuencia de uso**: Diaria
- **Nivel técnico**: Avanzado

---

## 3. Historias de Usuario

### 3.1 Historia de Usuario - Empleado
**Como** empleado de la organización  
**Quiero** ver una página de bienvenida con la identidad de mi empresa  
**Para** sentirme conectado con la organización y conocer información relevante antes de comenzar mi jornada

**Criterios de Aceptación:**
- Veo el logo y colores de mi organización
- Recibo un mensaje de bienvenida personalizado con mi nombre
- Puedo ver la misión y visión de la empresa
- Tengo acceso a enlaces de contacto y redes sociales
- Puedo continuar a mi dashboard con un solo clic
- Puedo optar por saltar esta página en futuras sesiones

### 3.2 Historia de Usuario - Líder de Departamento
**Como** líder de departamento  
**Quiero** ver un resumen rápido de mi equipo en la página de bienvenida  
**Para** estar al tanto de información crítica antes de acceder al dashboard completo

**Criterios de Aceptación:**
- Veo estadísticas rápidas de mi departamento
- Recibo alertas de bienestar de mi equipo si existen
- Puedo acceder rápidamente a reportes importantes
- La página refleja la identidad corporativa

### 3.3 Historia de Usuario - Gerente de RRHH
**Como** gerente de RRHH  
**Quiero** ver indicadores clave y anuncios pendientes en el lobby  
**Para** priorizar mis tareas del día eficientemente

**Criterios de Aceptación:**
- Veo métricas generales de bienestar organizacional
- Recibo notificaciones de tareas pendientes
- Puedo acceder a gestión de usuarios y departamentos
- Veo anuncios recientes o por publicar

### 3.4 Historia de Usuario - Administrador
**Como** administrador de la organización  
**Quiero** ver el estado general del sistema y accesos rápidos  
**Para** gestionar la plataforma eficientemente

**Criterios de Aceptación:**
- Veo estado del sistema y alertas críticas
- Tengo accesos rápidos a configuración
- Puedo ver estadísticas de uso de la plataforma
- Accedo a gestión de branding y personalización

### 3.5 Historia de Usuario - Usuario Recurrente
**Como** usuario que ingresa frecuentemente  
**Quiero** poder saltar la página de lobby automáticamente  
**Para** acceder directamente a mi dashboard y ahorrar tiempo

**Criterios de Aceptación:**
- Puedo activar opción "No mostrar nuevamente"
- Mi preferencia se guarda en localStorage
- Puedo reactivar el lobby desde configuración de perfil
- La preferencia es por dispositivo/navegador

---

## 4. Análisis de Datos

### 4.1 Tabla Principal: organization_branding

```sql
CREATE TABLE organization_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Colores Corporativos
    primary_color VARCHAR(7) DEFAULT '#0EA5E9',      -- Sky-600
    secondary_color VARCHAR(7) DEFAULT '#1E40AF',    -- Blue-800
    accent_color VARCHAR(7) DEFAULT '#F59E0B',       -- Amber-500
    
    -- Recursos Visuales
    logo_url TEXT,
    banner_url TEXT,
    favicon_url TEXT,
    
    -- Mensajes Corporativos
    company_tagline TEXT,
    welcome_message TEXT,
    mission_statement TEXT,
    vision_statement TEXT,
    
    -- Información de Contacto
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website_url TEXT,
    
    -- Redes Sociales (JSON)
    social_media_links JSONB DEFAULT '{}',
    
    -- Personalización Avanzada
    custom_css TEXT,
    custom_fonts JSONB DEFAULT '{}',
    theme_mode VARCHAR(20) DEFAULT 'light',
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id)
);
```

### 4.2 Tablas Relacionadas

#### user_profiles
- Obtener nombre completo del usuario
- Identificar rol del usuario
- Obtener organization_id

#### organizations
- Nombre de la organización
- Información adicional si no existe branding

#### announcements (opcional)
- Mostrar anuncios recientes
- Filtrar por rol de usuario

#### partner_benefits (opcional)
- Destacar beneficios principales
- Mostrar en sección de highlights

---

## 5. Requisitos Funcionales

### 5.1 Carga de Datos (P0)

**RF-001: Obtener Información de Branding**
- **Descripción**: Al cargar la página, obtener datos de `organization_branding` basado en el `organization_id` del usuario
- **Endpoint**: `GET /api/v1/organizations/{org_id}/branding`
- **Respuesta**:
```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "primary_color": "#0EA5E9",
  "secondary_color": "#1E40AF",
  "accent_color": "#F59E0B",
  "logo_url": "https://...",
  "banner_url": "https://...",
  "company_tagline": "Tu salud, nuestra prioridad",
  "welcome_message": "Bienvenido a HoloCheck Equilibria",
  "mission_statement": "Mejorar el bienestar...",
  "vision_statement": "Ser líderes en...",
  "contact_email": "contacto@empresa.com",
  "contact_phone": "+506 1234-5678",
  "website_url": "https://empresa.com",
  "social_media_links": {
    "facebook": "https://facebook.com/empresa",
    "linkedin": "https://linkedin.com/company/empresa",
    "instagram": "https://instagram.com/empresa"
  },
  "theme_mode": "light"
}
```

**RF-002: Obtener Perfil de Usuario**
- **Descripción**: Obtener nombre, rol y organización del usuario actual
- **Endpoint**: `GET /api/v1/users/me`
- **Uso**: Personalizar mensaje de bienvenida y determinar ruta de navegación

**RF-003: Aplicar Colores Corporativos**
- **Descripción**: Aplicar dinámicamente los colores corporativos usando CSS variables
- **Implementación**:
```typescript
const applyBrandingColors = (branding: OrganizationBranding) => {
  document.documentElement.style.setProperty('--brand-primary', branding.primary_color);
  document.documentElement.style.setProperty('--brand-secondary', branding.secondary_color);
  document.documentElement.style.setProperty('--brand-accent', branding.accent_color);
};
```

### 5.2 Navegación (P0)

**RF-004: Redirección Basada en Rol**
- **Descripción**: Al hacer clic en "Continuar", redirigir según rol del usuario
- **Mapeo de Roles**:
```typescript
const ROLE_ROUTES = {
  'org_admin': '/org/dashboard',
  'hr_manager': '/hr/dashboard',
  'leader': '/leader/dashboard',
  'employee': '/employee/dashboard'
};
```

**RF-005: Opción "Saltar Lobby"**
- **Descripción**: Checkbox para no mostrar lobby en futuras sesiones
- **Almacenamiento**: localStorage con key `holocheck_skip_lobby_{user_id}`
- **Valor**: boolean
- **Comportamiento**: Si true, redirigir automáticamente al dashboard correspondiente

**RF-006: Reactivar Lobby**
- **Descripción**: Desde configuración de perfil, permitir reactivar visualización del lobby
- **Ubicación**: Settings > Preferencias > "Mostrar página de bienvenida"

### 5.3 Contenido Dinámico (P1)

**RF-007: Estadísticas Rápidas (Opcional)**
- **Para Empleados**: Próximo escaneo, días desde último escaneo
- **Para Líderes**: Número de empleados, promedio de bienestar del equipo
- **Para HR**: Total empleados, departamentos, tasa de participación
- **Para Admin**: Usuarios activos, escaneos del mes, alertas del sistema

**RF-008: Anuncios Recientes (Opcional)**
- **Descripción**: Mostrar últimos 3 anuncios relevantes para el rol del usuario
- **Endpoint**: `GET /api/v1/announcements?role={role}&limit=3`
- **Visualización**: Cards compactas con título, fecha y preview

**RF-009: Beneficios Destacados (Opcional)**
- **Descripción**: Mostrar 3 beneficios principales disponibles
- **Endpoint**: `GET /api/v1/benefits/featured?limit=3`
- **Visualización**: Cards con imagen, título y descripción breve

### 5.4 Personalización (P1)

**RF-010: Modo Claro/Oscuro**
- **Descripción**: Respetar configuración de `theme_mode` de organization_branding
- **Valores**: 'light', 'dark', 'auto'
- **Auto**: Detectar preferencia del sistema operativo

**RF-011: Fuentes Personalizadas**
- **Descripción**: Cargar fuentes personalizadas desde `custom_fonts` si están configuradas
- **Formato JSON**:
```json
{
  "heading": "Montserrat",
  "body": "Open Sans",
  "url": "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap"
}
```

**RF-012: CSS Personalizado**
- **Descripción**: Aplicar estilos personalizados desde `custom_css` si están configurados
- **Seguridad**: Sanitizar CSS para prevenir inyección de código malicioso
- **Alcance**: Solo aplicar dentro del componente Lobby

---

## 6. Requisitos No Funcionales

### 6.1 Rendimiento
- **RNF-001**: Tiempo de carga inicial < 2 segundos
- **RNF-002**: Imágenes optimizadas (logo, banner) con lazy loading
- **RNF-003**: Caché de datos de branding por 24 horas
- **RNF-004**: Transiciones y animaciones fluidas (60 FPS)

### 6.2 Seguridad
- **RNF-005**: Validar y sanitizar custom_css antes de aplicar
- **RNF-006**: Verificar autenticación del usuario antes de mostrar datos
- **RNF-007**: No exponer información sensible en localStorage
- **RNF-008**: Validar URLs de imágenes y enlaces externos

### 6.3 Accesibilidad
- **RNF-009**: Cumplir con WCAG 2.1 nivel AA
- **RNF-010**: Contraste de colores mínimo 4.5:1 para texto
- **RNF-011**: Navegación completa por teclado (Tab, Enter, Escape)
- **RNF-012**: Etiquetas ARIA apropiadas para lectores de pantalla
- **RNF-013**: Textos alternativos para todas las imágenes

### 6.4 Responsive Design
- **RNF-014**: Diseño adaptable para móvil (320px+), tablet (768px+) y desktop (1024px+)
- **RNF-015**: Touch-friendly en dispositivos móviles (botones mínimo 44x44px)
- **RNF-016**: Imágenes responsive con srcset para diferentes resoluciones

### 6.5 Compatibilidad
- **RNF-017**: Soporte para navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **RNF-018**: Degradación elegante en navegadores antiguos
- **RNF-019**: Funcionalidad básica sin JavaScript (fallback)

---

## 7. Diseño de UI/UX

### 7.1 Estructura de la Página

```
┌─────────────────────────────────────────────────────────┐
│                     BANNER HERO                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │         [LOGO]                                   │   │
│  │                                                   │   │
│  │     Bienvenido, [Nombre Usuario]                │   │
│  │     [Rol] en [Organización]                     │   │
│  │                                                   │   │
│  │     [Tagline de la Compañía]                    │   │
│  │                                                   │   │
│  │     [Botón: Continuar al Dashboard]             │   │
│  │     [Checkbox: No mostrar nuevamente]           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              SECCIÓN: NUESTRA MISIÓN                     │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │   📋 MISIÓN      │  │   🎯 VISIÓN      │            │
│  │                  │  │                  │            │
│  │  [Declaración]   │  │  [Declaración]   │            │
│  └──────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│         SECCIÓN: ESTADÍSTICAS RÁPIDAS (Opcional)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  [Stat1] │  │  [Stat2] │  │  [Stat3] │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│         SECCIÓN: ANUNCIOS RECIENTES (Opcional)           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  [Anuncio 1]                                     │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  [Anuncio 2]                                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    FOOTER                                │
│  📧 [Email]  📞 [Teléfono]  🌐 [Website]                │
│  [Facebook] [LinkedIn] [Instagram] [Twitter]            │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Componentes Principales

#### 7.2.1 HeroSection
**Propósito**: Sección principal de bienvenida con branding prominente

**Elementos**:
- Banner de fondo (banner_url) con overlay gradient
- Logo centrado (logo_url)
- Mensaje de bienvenida personalizado
- Nombre del usuario y rol
- Tagline de la compañía
- Botón CTA principal
- Checkbox "No mostrar nuevamente"

**Estilos**:
```css
.hero-section {
  min-height: 60vh;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
}

.hero-logo {
  max-width: 200px;
  height: auto;
  margin-bottom: 2rem;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.hero-subtitle {
  font-size: 1.5rem;
  color: rgba(255,255,255,0.9);
  margin-bottom: 2rem;
}
```

#### 7.2.2 MissionVisionSection
**Propósito**: Mostrar declaraciones de misión y visión

**Elementos**:
- Dos cards lado a lado (responsive: stack en móvil)
- Iconos representativos
- Texto de misión y visión

**Diseño**:
```tsx
<div className="grid md:grid-cols-2 gap-6 p-8">
  <Card className="mission-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="w-6 h-6" />
        Nuestra Misión
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>{branding.mission_statement}</p>
    </CardContent>
  </Card>
  
  <Card className="vision-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="w-6 h-6" />
        Nuestra Visión
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>{branding.vision_statement}</p>
    </CardContent>
  </Card>
</div>
```

#### 7.2.3 QuickStatsSection (Opcional)
**Propósito**: Mostrar estadísticas relevantes según rol

**Variaciones por Rol**:

**Empleado**:
- Días desde último escaneo
- Próximo escaneo programado
- Beneficios disponibles

**Líder**:
- Empleados en departamento
- Promedio de bienestar del equipo
- Alertas pendientes

**HR Manager**:
- Total de empleados
- Departamentos activos
- Tasa de participación

**Org Admin**:
- Usuarios activos
- Escaneos del mes
- Estado del sistema

#### 7.2.4 AnnouncementsSection (Opcional)
**Propósito**: Mostrar anuncios recientes relevantes

**Elementos**:
- Lista de cards de anuncios
- Título, fecha, preview
- Link "Ver más"

#### 7.2.5 FooterSection
**Propósito**: Información de contacto y redes sociales

**Elementos**:
- Email, teléfono, website
- Iconos de redes sociales con enlaces
- Copyright y versión

### 7.3 Paleta de Colores

**Colores Base** (si no hay branding personalizado):
```css
:root {
  --brand-primary: #0EA5E9;    /* Sky-600 */
  --brand-secondary: #1E40AF;  /* Blue-800 */
  --brand-accent: #F59E0B;     /* Amber-500 */
  
  --text-primary: #1F2937;     /* Gray-800 */
  --text-secondary: #6B7280;   /* Gray-500 */
  --background: #F9FAFB;       /* Gray-50 */
  --surface: #FFFFFF;
}

[data-theme="dark"] {
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --background: #111827;
  --surface: #1F2937;
}
```

### 7.4 Tipografía

**Jerarquía**:
- H1 (Hero Title): 48px / 3rem, Bold
- H2 (Section Titles): 32px / 2rem, Semibold
- H3 (Card Titles): 24px / 1.5rem, Semibold
- Body: 16px / 1rem, Regular
- Small: 14px / 0.875rem, Regular

**Fuentes por Defecto**:
- Headings: 'Inter', sans-serif
- Body: 'Inter', sans-serif

### 7.5 Animaciones

**Entrada de Página**:
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-section {
  animation: fadeInUp 0.6s ease-out;
}

.mission-vision-section {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}
```

**Hover en Botones**:
```css
.cta-button {
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}
```

### 7.6 Responsive Breakpoints

```css
/* Mobile First */
.container {
  padding: 1rem;
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
  
  .hero-title {
    font-size: 3.5rem;
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem;
  }
  
  .hero-title {
    font-size: 4rem;
  }
}

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
}
```

---

## 8. Arquitectura Técnica

### 8.1 Estructura de Componentes

```
src/pages/
  └── Lobby.tsx                    # Página principal del lobby

src/components/lobby/
  ├── HeroSection.tsx              # Sección hero con branding
  ├── MissionVisionSection.tsx     # Misión y visión
  ├── QuickStatsSection.tsx        # Estadísticas rápidas
  ├── AnnouncementsSection.tsx     # Anuncios recientes
  ├── BenefitsHighlight.tsx        # Beneficios destacados
  └── FooterSection.tsx            # Footer con contacto

src/hooks/
  ├── useBranding.ts               # Hook para obtener branding
  ├── useUserProfile.ts            # Hook para perfil de usuario
  └── useLobbyPreference.ts        # Hook para preferencia de lobby

src/lib/
  └── lobby-utils.ts               # Utilidades (navegación, colores)

src/types/
  └── branding.ts                  # Tipos TypeScript
```

### 8.2 Tipos TypeScript

```typescript
// src/types/branding.ts

export interface OrganizationBranding {
  id: string;
  organization_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url: string | null;
  banner_url: string | null;
  favicon_url: string | null;
  company_tagline: string | null;
  welcome_message: string | null;
  mission_statement: string | null;
  vision_statement: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  social_media_links: SocialMediaLinks;
  custom_css: string | null;
  custom_fonts: CustomFonts | null;
  theme_mode: 'light' | 'dark' | 'auto';
  created_at: string;
  updated_at: string;
}

export interface SocialMediaLinks {
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

export interface CustomFonts {
  heading?: string;
  body?: string;
  url?: string;
}

export interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  role: 'org_admin' | 'hr_manager' | 'leader' | 'employee';
  organization_id: string;
  organization_name: string;
  department_name?: string;
}

export interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  priority: 'high' | 'medium' | 'low';
}
```

### 8.3 Custom Hooks

#### useBranding Hook
```typescript
// src/hooks/useBranding.ts

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { OrganizationBranding } from '@/types/branding';

export function useBranding(organizationId: string) {
  const [branding, setBranding] = useState<OrganizationBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBranding() {
      try {
        setLoading(true);
        
        const { data, error: fetchError } = await supabase
          .from('organization_branding')
          .select('*')
          .eq('organization_id', organizationId)
          .single();

        if (fetchError) throw fetchError;
        
        setBranding(data);
        
        // Aplicar colores corporativos
        if (data) {
          applyBrandingColors(data);
        }
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching branding:', err);
      } finally {
        setLoading(false);
      }
    }

    if (organizationId) {
      fetchBranding();
    }
  }, [organizationId]);

  return { branding, loading, error };
}

function applyBrandingColors(branding: OrganizationBranding) {
  document.documentElement.style.setProperty('--brand-primary', branding.primary_color);
  document.documentElement.style.setProperty('--brand-secondary', branding.secondary_color);
  document.documentElement.style.setProperty('--brand-accent', branding.accent_color);
}
```

#### useLobbyPreference Hook
```typescript
// src/hooks/useLobbyPreference.ts

import { useState, useEffect } from 'react';

export function useLobbyPreference(userId: string) {
  const [skipLobby, setSkipLobby] = useState(false);
  const storageKey = `holocheck_skip_lobby_${userId}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setSkipLobby(saved === 'true');
  }, [userId]);

  const updatePreference = (skip: boolean) => {
    setSkipLobby(skip);
    localStorage.setItem(storageKey, String(skip));
  };

  const resetPreference = () => {
    setSkipLobby(false);
    localStorage.removeItem(storageKey);
  };

  return { skipLobby, updatePreference, resetPreference };
}
```

### 8.4 API Endpoints

#### GET /api/v1/organizations/{org_id}/branding
**Descripción**: Obtener información de branding de la organización

**Respuesta**:
```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "primary_color": "#0EA5E9",
  "secondary_color": "#1E40AF",
  "accent_color": "#F59E0B",
  "logo_url": "https://...",
  "banner_url": "https://...",
  "company_tagline": "Tu salud, nuestra prioridad",
  "welcome_message": "Bienvenido a HoloCheck Equilibria",
  "mission_statement": "...",
  "vision_statement": "...",
  "contact_email": "contacto@empresa.com",
  "contact_phone": "+506 1234-5678",
  "website_url": "https://empresa.com",
  "social_media_links": {
    "facebook": "https://...",
    "linkedin": "https://..."
  },
  "theme_mode": "light"
}
```

#### GET /api/v1/users/me
**Descripción**: Obtener perfil del usuario actual

**Respuesta**:
```json
{
  "user_id": "uuid",
  "full_name": "Juan Pérez",
  "email": "juan.perez@empresa.com",
  "role": "employee",
  "organization_id": "uuid",
  "organization_name": "Empresa Demo S.A.",
  "department_name": "Tecnología"
}
```

#### GET /api/v1/lobby/stats (Opcional)
**Descripción**: Obtener estadísticas rápidas según rol del usuario

**Query Params**: `role` (employee, leader, hr_manager, org_admin)

**Respuesta para Employee**:
```json
{
  "stats": [
    {
      "label": "Último escaneo",
      "value": "Hace 3 días",
      "icon": "calendar"
    },
    {
      "label": "Próximo escaneo",
      "value": "En 4 días",
      "icon": "clock"
    },
    {
      "label": "Beneficios disponibles",
      "value": 6,
      "icon": "gift"
    }
  ]
}
```

---

## 9. Flujo de Navegación

### 9.1 Diagrama de Flujo

```
┌─────────────────┐
│  Usuario Login  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ ¿Skip Lobby = true?     │
└────┬───────────────┬────┘
     │ No            │ Yes
     ▼               ▼
┌─────────────┐  ┌──────────────────┐
│ Mostrar     │  │ Redirigir según  │
│ Lobby Page  │  │ rol a dashboard  │
└──────┬──────┘  └──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Usuario ve contenido:   │
│ - Hero con branding     │
│ - Misión/Visión         │
│ - Stats (opcional)      │
│ - Anuncios (opcional)   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Usuario hace clic en        │
│ "Continuar al Dashboard"    │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ ¿Marcó "No mostrar más"?    │
└────┬───────────────────┬────┘
     │ Sí                │ No
     ▼                   ▼
┌─────────────────┐  ┌──────────────────┐
│ Guardar en      │  │ No guardar       │
│ localStorage    │  │ preferencia      │
└────┬────────────┘  └────┬─────────────┘
     │                    │
     └────────┬───────────┘
              ▼
┌──────────────────────────────┐
│ Redirigir según rol:         │
│ - org_admin → /org/dashboard │
│ - hr_manager → /hr/dashboard │
│ - leader → /leader/dashboard │
│ - employee → /employee/...   │
└──────────────────────────────┘
```

### 9.2 Lógica de Redirección

```typescript
// src/lib/lobby-utils.ts

export const ROLE_ROUTES: Record<string, string> = {
  'org_admin': '/org/dashboard',
  'hr_manager': '/hr/dashboard',
  'leader': '/leader/dashboard',
  'employee': '/employee/dashboard'
};

export function getDashboardRoute(role: string): string {
  return ROLE_ROUTES[role] || '/employee/dashboard';
}

export function shouldShowLobby(userId: string): boolean {
  const storageKey = `holocheck_skip_lobby_${userId}`;
  const skipLobby = localStorage.getItem(storageKey);
  return skipLobby !== 'true';
}
```

### 9.3 Implementación en Página Principal

```typescript
// src/pages/Lobby.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@/hooks/useBranding';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useLobbyPreference } from '@/hooks/useLobbyPreference';
import { getDashboardRoute } from '@/lib/lobby-utils';

export default function LobbyPage() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { branding, loading: brandingLoading } = useBranding(profile?.organization_id);
  const { skipLobby, updatePreference } = useLobbyPreference(profile?.user_id);

  // Auto-redirect si el usuario tiene skipLobby activado
  useEffect(() => {
    if (!profileLoading && profile && skipLobby) {
      const route = getDashboardRoute(profile.role);
      navigate(route, { replace: true });
    }
  }, [profile, skipLobby, profileLoading, navigate]);

  const handleContinue = () => {
    if (profile) {
      const route = getDashboardRoute(profile.role);
      navigate(route);
    }
  };

  if (profileLoading || brandingLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="lobby-page">
      <HeroSection 
        branding={branding}
        profile={profile}
        onContinue={handleContinue}
        onSkipChange={updatePreference}
      />
      <MissionVisionSection branding={branding} />
      <QuickStatsSection role={profile?.role} />
      <FooterSection branding={branding} />
    </div>
  );
}
```

---

## 10. Consideraciones de Seguridad

### 10.1 Validación de CSS Personalizado

**Problema**: El campo `custom_css` permite a administradores inyectar CSS personalizado, lo que podría ser un vector de ataque.

**Solución**:
```typescript
// src/lib/css-sanitizer.ts

export function sanitizeCSS(css: string): string {
  // Remover comentarios
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Bloquear imports externos
  css = css.replace(/@import\s+url\([^)]*\);?/gi, '');
  
  // Bloquear expresiones JavaScript
  css = css.replace(/expression\s*\([^)]*\)/gi, '');
  css = css.replace(/javascript:/gi, '');
  
  // Bloquear behavior (IE)
  css = css.replace(/behavior\s*:/gi, '');
  
  // Limitar a selectores seguros dentro de .lobby-page
  const safeCSS = `.lobby-page { ${css} }`;
  
  return safeCSS;
}
```

### 10.2 Validación de URLs

**Problema**: URLs de imágenes y enlaces externos podrían ser maliciosas.

**Solución**:
```typescript
// src/lib/url-validator.ts

export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeImageURL(url: string | null): string {
  if (!url || !isValidURL(url)) {
    return '/default-image.png';
  }
  return url;
}
```

### 10.3 Protección de Datos en localStorage

**Problema**: No almacenar información sensible en localStorage.

**Solución**:
- Solo guardar preferencia booleana de "skip lobby"
- No guardar tokens, emails, o información personal
- Usar user_id como key (no información identificable)

---

## 11. Plan de Implementación

### 11.1 Fase 1: Fundamentos (Semana 1)
**Objetivo**: Implementar estructura básica y funcionalidad core

**Tareas**:
- [ ] Crear tabla `organization_branding` en base de datos
- [ ] Implementar endpoint GET `/api/v1/organizations/{org_id}/branding`
- [ ] Crear estructura de componentes en frontend
- [ ] Implementar hooks: `useBranding`, `useUserProfile`, `useLobbyPreference`
- [ ] Desarrollar HeroSection con branding básico
- [ ] Implementar lógica de navegación basada en roles
- [ ] Implementar preferencia "skip lobby" con localStorage

**Criterios de Aceptación**:
- Usuario ve página de lobby con logo y colores corporativos
- Botón "Continuar" redirige correctamente según rol
- Checkbox "No mostrar más" funciona correctamente

### 11.2 Fase 2: Contenido y Diseño (Semana 2)
**Objetivo**: Completar diseño visual y secciones de contenido

**Tareas**:
- [ ] Implementar MissionVisionSection
- [ ] Implementar FooterSection con contacto y redes sociales
- [ ] Aplicar sistema de colores corporativos dinámicos
- [ ] Implementar modo claro/oscuro
- [ ] Agregar animaciones y transiciones
- [ ] Optimizar imágenes y rendimiento
- [ ] Implementar diseño responsive

**Criterios de Aceptación**:
- Página muestra misión, visión y footer completo
- Colores corporativos se aplican correctamente
- Diseño responsive funciona en móvil, tablet y desktop
- Animaciones son fluidas (60 FPS)

### 11.3 Fase 3: Características Avanzadas (Semana 3)
**Objetivo**: Agregar funcionalidades opcionales

**Tareas**:
- [ ] Implementar QuickStatsSection con datos por rol
- [ ] Crear endpoint GET `/api/v1/lobby/stats`
- [ ] Implementar AnnouncementsSection (opcional)
- [ ] Implementar BenefitsHighlight (opcional)
- [ ] Agregar soporte para fuentes personalizadas
- [ ] Implementar aplicación segura de custom_css
- [ ] Agregar caché de datos de branding

**Criterios de Aceptación**:
- Estadísticas rápidas se muestran según rol
- Anuncios recientes aparecen correctamente
- Custom CSS se aplica de forma segura
- Datos se cachean apropiadamente

### 11.4 Fase 4: Testing y Optimización (Semana 4)
**Objetivo**: Asegurar calidad y rendimiento

**Tareas**:
- [ ] Testing de accesibilidad (WCAG 2.1 AA)
- [ ] Testing de rendimiento (Lighthouse)
- [ ] Testing cross-browser
- [ ] Testing responsive en dispositivos reales
- [ ] Optimización de imágenes y assets
- [ ] Implementar lazy loading
- [ ] Testing de seguridad (sanitización CSS, URLs)
- [ ] Documentación de usuario

**Criterios de Aceptación**:
- Score de Lighthouse > 90 en todas las categorías
- Cumplimiento WCAG 2.1 AA
- Funciona correctamente en Chrome, Firefox, Safari, Edge
- Tiempo de carga < 2 segundos

---

## 12. Métricas y KPIs

### 12.1 Métricas de Uso
- **Tasa de visualización del lobby**: % de usuarios que ven el lobby vs. los que lo saltan
- **Tiempo promedio en lobby**: Duración promedio de permanencia en la página
- **Tasa de "skip lobby"**: % de usuarios que activan "No mostrar más"
- **Tasa de conversión**: % de usuarios que hacen clic en "Continuar"

### 12.2 Métricas de Rendimiento
- **Tiempo de carga inicial**: Tiempo hasta First Contentful Paint
- **Tiempo de interactividad**: Time to Interactive (TTI)
- **Largest Contentful Paint (LCP)**: < 2.5 segundos
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### 12.3 Métricas de Calidad
- **Score de accesibilidad**: Lighthouse Accessibility Score > 90
- **Tasa de errores**: Errores de JavaScript < 0.1%
- **Compatibilidad de navegadores**: Funcionalidad completa en 95%+ de navegadores

### 12.4 Métricas de Satisfacción
- **Net Promoter Score (NPS)**: Encuesta post-lobby
- **Feedback cualitativo**: Comentarios de usuarios
- **Tasa de rebote**: % de usuarios que abandonan inmediatamente

---

## 13. Riesgos y Mitigaciones

### 13.1 Riesgo: Imágenes de branding no cargan
**Probabilidad**: Media  
**Impacto**: Alto  
**Mitigación**:
- Implementar imágenes placeholder por defecto
- Validar URLs antes de renderizar
- Mostrar logo de HoloCheck si no hay logo corporativo
- Usar lazy loading y optimización de imágenes

### 13.2 Riesgo: CSS personalizado rompe el diseño
**Probabilidad**: Media  
**Impacto**: Alto  
**Mitigación**:
- Sanitizar CSS antes de aplicar
- Limitar alcance de CSS a contenedor específico
- Validar CSS en backend antes de guardar
- Proporcionar preview en configuración de branding

### 13.3 Riesgo: Rendimiento lento en conexiones lentas
**Probabilidad**: Alta  
**Impacto**: Medio  
**Mitigación**:
- Optimizar y comprimir imágenes
- Implementar lazy loading
- Cachear datos de branding
- Proporcionar versión ligera para conexiones lentas

### 13.4 Riesgo: Usuarios confundidos por nueva página
**Probabilidad**: Baja  
**Impacto**: Medio  
**Mitigación**:
- Botón "Continuar" prominente y claro
- Opción de saltar lobby fácilmente visible
- Onboarding tooltip en primera visita
- Documentación y ayuda disponible

### 13.5 Riesgo: Datos de branding no configurados
**Probabilidad**: Alta (nuevas organizaciones)  
**Impacto**: Medio  
**Mitigación**:
- Valores por defecto atractivos
- Wizard de configuración inicial para admins
- Mensaje amigable si falta información
- Usar branding de HoloCheck como fallback

---

## 14. Preguntas Abiertas

### 14.1 Diseño
- ¿Deberíamos permitir video de fondo en el hero section?
- ¿Cuántos anuncios máximo mostrar en el lobby?
- ¿Incluir carrusel de imágenes/testimonios?

### 14.2 Funcionalidad
- ¿Permitir a usuarios personalizar qué secciones ver?
- ¿Implementar modo "tour guiado" para nuevos usuarios?
- ¿Agregar widget de clima/hora local?

### 14.3 Datos
- ¿Cachear branding en frontend o siempre fetch?
- ¿Trackear analytics de uso del lobby?
- ¿Permitir múltiples configuraciones de branding por organización?

### 14.4 Seguridad
- ¿Nivel de sanitización de custom_css?
- ¿Permitir iframes en custom_css?
- ¿Validar tamaño máximo de imágenes?

---

## 15. Anexos

### 15.1 Ejemplo de Datos de Branding

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "organization_id": "123e4567-e89b-12d3-a456-426614174000",
  "primary_color": "#0EA5E9",
  "secondary_color": "#1E40AF",
  "accent_color": "#F59E0B",
  "logo_url": "https://cdn.holocheck.app/orgs/demo/logo.png",
  "banner_url": "https://cdn.holocheck.app/orgs/demo/banner.jpg",
  "favicon_url": "https://cdn.holocheck.app/orgs/demo/favicon.ico",
  "company_tagline": "Tu salud, nuestra prioridad",
  "welcome_message": "Bienvenido a HoloCheck Equilibria - Juntos por tu bienestar",
  "mission_statement": "Mejorar la calidad de vida de nuestros colaboradores a través de tecnología innovadora y programas de bienestar integral.",
  "vision_statement": "Ser la empresa líder en bienestar organizacional en América Latina, reconocida por nuestro compromiso con la salud y felicidad de nuestros equipos.",
  "contact_email": "contacto@empresademo.com",
  "contact_phone": "+506 2222-3333",
  "website_url": "https://www.empresademo.com",
  "social_media_links": {
    "facebook": "https://facebook.com/empresademo",
    "linkedin": "https://linkedin.com/company/empresademo",
    "instagram": "https://instagram.com/empresademo",
    "twitter": "https://twitter.com/empresademo"
  },
  "custom_css": ".hero-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }",
  "custom_fonts": {
    "heading": "Montserrat",
    "body": "Open Sans",
    "url": "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap"
  },
  "theme_mode": "light",
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-20T14:30:00Z"
}
```

### 15.2 Wireframes ASCII

#### Desktop View
```
┌────────────────────────────────────────────────────────────────┐
│                         HEADER BAR                              │
│  [Logo HoloCheck]                          [User Menu] [Logout] │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│                       HERO SECTION                              │
│                    [Banner Background]                          │
│                                                                 │
│                      [Company Logo]                             │
│                                                                 │
│              Bienvenido, Juan Pérez                            │
│              Empleado en Empresa Demo S.A.                     │
│                                                                 │
│           "Tu salud, nuestra prioridad"                        │
│                                                                 │
│           [Continuar al Dashboard →]                           │
│           ☐ No mostrar esta página nuevamente                  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    MISIÓN Y VISIÓN                              │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐         │
│  │   📋 NUESTRA MISIÓN  │    │   🎯 NUESTRA VISIÓN  │         │
│  │                      │    │                      │         │
│  │  Mejorar la calidad  │    │  Ser la empresa      │         │
│  │  de vida de nuestros │    │  líder en bienestar  │         │
│  │  colaboradores...    │    │  organizacional...   │         │
│  │                      │    │                      │         │
│  └──────────────────────┘    └──────────────────────┘         │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                  ESTADÍSTICAS RÁPIDAS                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ 📅 Último    │  │ ⏰ Próximo   │  │ 🎁 Beneficios│        │
│  │    Escaneo   │  │    Escaneo   │  │  Disponibles │        │
│  │              │  │              │  │              │        │
│  │  Hace 3 días │  │  En 4 días   │  │      6       │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                         FOOTER                                  │
│                                                                 │
│  📧 contacto@empresa.com  📞 +506 2222-3333  🌐 empresa.com   │
│                                                                 │
│  [Facebook] [LinkedIn] [Instagram] [Twitter]                   │
│                                                                 │
│  © 2026 HoloCheck Equilibria - Todos los derechos reservados  │
└────────────────────────────────────────────────────────────────┘
```

#### Mobile View
```
┌─────────────────────────┐
│    [☰]  [Logo]  [User]  │
└─────────────────────────┘

┌─────────────────────────┐
│                         │
│    HERO SECTION         │
│   [Banner Image]        │
│                         │
│   [Company Logo]        │
│                         │
│  Bienvenido,            │
│  Juan Pérez             │
│                         │
│  Empleado en            │
│  Empresa Demo S.A.      │
│                         │
│  "Tu salud, nuestra     │
│   prioridad"            │
│                         │
│  [Continuar →]          │
│  ☐ No mostrar más       │
│                         │
└─────────────────────────┘

┌─────────────────────────┐
│  📋 NUESTRA MISIÓN      │
│                         │
│  Mejorar la calidad     │
│  de vida...             │
└─────────────────────────┘

┌─────────────────────────┐
│  🎯 NUESTRA VISIÓN      │
│                         │
│  Ser la empresa         │
│  líder...               │
└─────────────────────────┘

┌─────────────────────────┐
│  📅 Último Escaneo      │
│     Hace 3 días         │
└─────────────────────────┘

┌─────────────────────────┐
│  ⏰ Próximo Escaneo     │
│     En 4 días           │
└─────────────────────────┘

┌─────────────────────────┐
│  🎁 Beneficios          │
│        6                │
└─────────────────────────┘

┌─────────────────────────┐
│       FOOTER            │
│                         │
│  📧 contacto@...        │
│  📞 +506 2222-3333      │
│  🌐 empresa.com         │
│                         │
│  [F] [L] [I] [T]        │
└─────────────────────────┘
```

### 15.3 Checklist de Accesibilidad

- [ ] Contraste de colores cumple WCAG AA (4.5:1 para texto normal, 3:1 para texto grande)
- [ ] Todas las imágenes tienen atributos `alt` descriptivos
- [ ] Navegación completa por teclado (Tab, Shift+Tab, Enter, Escape)
- [ ] Focus visible en todos los elementos interactivos
- [ ] Etiquetas ARIA apropiadas (`role`, `aria-label`, `aria-describedby`)
- [ ] Headings en orden jerárquico (h1 → h2 → h3)
- [ ] Links descriptivos (no "click aquí")
- [ ] Formularios con labels asociados
- [ ] Mensajes de error accesibles
- [ ] Compatible con lectores de pantalla (NVDA, JAWS, VoiceOver)
- [ ] Soporte para modo de alto contraste
- [ ] Texto redimensionable hasta 200% sin pérdida de funcionalidad
- [ ] No depender únicamente de color para transmitir información
- [ ] Animaciones respetan `prefers-reduced-motion`

### 15.4 Checklist de Testing

#### Funcionalidad
- [ ] Página carga correctamente con datos de branding
- [ ] Página carga correctamente sin datos de branding (fallback)
- [ ] Botón "Continuar" redirige correctamente según rol
- [ ] Checkbox "No mostrar más" guarda preferencia
- [ ] Preferencia "skip lobby" funciona en siguiente login
- [ ] Colores corporativos se aplican correctamente
- [ ] Logo y banner se muestran correctamente
- [ ] Enlaces de redes sociales funcionan
- [ ] Información de contacto se muestra correctamente
- [ ] Modo claro/oscuro funciona

#### Responsive
- [ ] Diseño funciona en móvil (320px - 767px)
- [ ] Diseño funciona en tablet (768px - 1023px)
- [ ] Diseño funciona en desktop (1024px+)
- [ ] Imágenes responsive (srcset)
- [ ] Touch-friendly en dispositivos móviles
- [ ] Orientación portrait y landscape

#### Navegadores
- [ ] Chrome (última versión)
- [ ] Firefox (última versión)
- [ ] Safari (última versión)
- [ ] Edge (última versión)
- [ ] Chrome Mobile
- [ ] Safari iOS

#### Rendimiento
- [ ] Lighthouse Performance Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Imágenes optimizadas y comprimidas
- [ ] Lazy loading implementado

#### Seguridad
- [ ] Custom CSS sanitizado
- [ ] URLs validadas
- [ ] No XSS vulnerabilities
- [ ] No información sensible en localStorage
- [ ] HTTPS enforced

---

## 16. Conclusión

La página de Lobby/Landing de HoloCheck Equilibria representa una oportunidad única para:

1. **Reforzar la Identidad Corporativa**: Cada organización puede mostrar su marca, valores y cultura desde el primer momento
2. **Mejorar la Experiencia de Usuario**: Proporcionar contexto y bienvenida personalizada antes de acceder al dashboard
3. **Aumentar el Engagement**: Contenido relevante y atractivo que conecta a los usuarios con la plataforma
4. **Facilitar la Navegación**: Punto de entrada claro y organizado según roles

Este PRD proporciona una guía completa para implementar una solución profesional, escalable y centrada en el usuario que cumple con los más altos estándares de calidad, accesibilidad y rendimiento.

---

**Versión**: 1.0  
**Fecha**: 2026-02-02  
**Autor**: Emma (Product Manager)  
**Estado**: Aprobado para Implementación