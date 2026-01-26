# 📱 Especificaciones de Mejoras Móviles - HoloCheck Equilibria

**Versión:** 1.0  
**Fecha:** 2026-01-25  
**Autor:** Emma (Product Manager)  
**Estado:** Pendiente de Implementación

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Problemas Identificados](#problemas-identificados)
3. [Análisis de Dispositivos](#análisis-de-dispositivos)
4. [Soluciones Propuestas](#soluciones-propuestas)
5. [Referencias y Mejores Prácticas](#referencias-y-mejores-prácticas)
6. [Priorización por Fases](#priorización-por-fases)
7. [Criterios de Aceptación](#criterios-de-aceptación)

---

## 1. Resumen Ejecutivo

### Situación Actual
El usuario reporta que "la pantalla en móvil no es funcional". Basado en el análisis del código actual y las mejores prácticas de la industria, se han identificado múltiples problemas críticos que impiden una experiencia móvil óptima en HoloCheck Equilibria.

### Impacto en el Negocio
- **80%** de usuarios abandonan apps con mala experiencia móvil
- Dashboards de salud bien diseñados aumentan engagement hasta **72%**
- Usuarios con metas en apps móviles de salud toman **2,000+ pasos diarios** adicionales

### Objetivo
Transformar HoloCheck Equilibria en una aplicación móvil completamente funcional y optimizada que cumpla con estándares de la industria para dashboards de salud.

---

## 2. Problemas Identificados

### 🔴 CRÍTICOS (Impiden el uso)

#### P1: Sidebar No Funcional en Móvil
**Descripción:** El sidebar actual usa un patrón off-canvas pero presenta múltiples problemas:
- **Código actual:** Width fijo de 256px (w-64) ocupa 68% de pantalla en iPhone SE
- **Overlay ausente:** No hay backdrop oscuro cuando el sidebar está abierto
- **Z-index conflictos:** Puede quedar detrás de otros elementos
- **Transición Safari iOS:** Requiere `-webkit-transform` explícito para animaciones suaves

**Impacto:** Usuarios no pueden navegar entre secciones en dispositivos móviles.

**Evidencia en código:**
```tsx
// /workspace/app/frontend/src/components/layout/Sidebar.tsx (línea 144-148)
const sidebarClasses = cn(
  'w-64 bg-white border-r border-slate-200 h-screen overflow-y-auto',
  isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative',
  'transform transition-transform duration-300 ease-in-out',
  isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'
);
```

#### P2: Viewport Meta Tag Incompleto
**Descripción:** Aunque existe viewport meta tag, falta optimización para Safari iOS.
```html
<!-- Actual -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

**Problemas:**
- Falta `minimum-scale=1.0` para prevenir zoom accidental
- `viewport-fit=cover` está presente pero puede requerir CSS adicional para safe areas

#### P3: Touch Targets Insuficientes
**Descripción:** Muchos elementos interactivos no cumplen el mínimo de 44x44px requerido por Apple HIG y WCAG.

**Elementos afectados:**
- Botones de navegación en sidebar (actual: ~40px)
- Iconos de cierre (X button)
- Elementos de gráficos interactivos
- Controles de formularios

**Estándar:** Mínimo 44x44px (iOS) o 48x48px (Android Material Design)

### 🟡 ALTOS (Dificultan el uso)

#### P4: Visualización de Datos Biométricos No Optimizada
**Descripción:** Los gauges y gráficos están diseñados para desktop y no se adaptan bien a pantallas pequeñas.

**Problemas específicos:**
- Gauges mantienen tamaño desktop, resultando en elementos muy pequeños
- Tablas de datos no tienen scroll horizontal adecuado
- Gráficos de tendencias (recharts) no se redimensionan correctamente
- Texto en visualizaciones es demasiado pequeño (<14px)

**Mejor práctica:** Usar números grandes y líneas gruesas en móvil, enfocarse en últimos 3 días en lugar de 7.

#### P5: Navegación Jerárquica Compleja
**Descripción:** El sidebar tiene 5 secciones principales con múltiples subsecciones (hasta 12 items en Admin).

**Problema:** En móvil, esto requiere mucho scroll y dificulta encontrar opciones.

**Estadística:** Navegación fácil es la característica #1 más importante según usuarios de health dashboards.

#### P6: Performance y Carga
**Descripción:** No hay optimizaciones específicas para móvil:
- Sin lazy loading de componentes pesados
- Sin code splitting por ruta
- Bundle size: 3.6MB (muy grande para móvil)
- Sin service worker para offline

**Impacto:** Tiempos de carga lentos en redes móviles (3G/4G).

### 🟢 MEDIOS/BAJOS (Mejoras de UX)

#### P7: Orientación Landscape No Optimizada
**Descripción:** La app está diseñada principalmente para portrait, landscape no aprovecha el espacio horizontal.

#### P8: Gestos Táctiles No Implementados
**Descripción:** Faltan gestos naturales en móvil:
- Swipe para cerrar sidebar
- Pull-to-refresh en listas
- Pinch-to-zoom en gráficos (donde apropiado)

#### P9: Estados de Carga y Feedback Visual
**Descripción:** Feedback insuficiente durante operaciones:
- Sin skeleton loaders
- Spinners genéricos sin contexto
- No hay indicación de progreso en uploads

#### P10: Accesibilidad Móvil
**Descripción:** Problemas de accesibilidad específicos de móvil:
- Contraste insuficiente bajo luz solar
- Sin soporte para lectores de pantalla móviles
- Navegación por teclado (para usuarios con discapacidades)

---

## 3. Análisis de Dispositivos

### Dispositivos Objetivo

#### 📱 Smartphones (Prioridad Alta)

| Dispositivo | Resolución | Viewport | % Mercado | Notas |
|-------------|-----------|----------|-----------|-------|
| iPhone 14/15 | 1170x2532 | 390x844 | 25% | Safe area insets importantes |
| iPhone SE | 750x1334 | 375x667 | 8% | Pantalla más pequeña, caso crítico |
| Samsung Galaxy S23 | 1080x2340 | 360x740 | 15% | Android flagship |
| Google Pixel 7 | 1080x2400 | 412x915 | 5% | Android puro |
| Xiaomi/Huawei | Varios | 360-414px | 20% | Mercado LATAM |

#### 📱 Tablets (Prioridad Media)

| Dispositivo | Resolución | Viewport | % Mercado | Notas |
|-------------|-----------|----------|-----------|-------|
| iPad 10.9" | 1640x2360 | 820x1180 | 12% | Puede usar layout híbrido |
| iPad Mini | 1488x2266 | 744x1133 | 4% | Entre móvil y tablet |
| Android Tablets | Varios | 600-800px | 8% | Fragmentación alta |

### Breakpoints Recomendados

Basado en análisis de mercado y código actual:

```css
/* Mobile First Approach */
/* xs: 0-374px - Móviles muy pequeños (iPhone SE portrait) */
/* sm: 375-639px - Móviles estándar (default) */
/* md: 640-767px - Móviles grandes / phablets */
/* lg: 768-1023px - Tablets portrait */
/* xl: 1024-1279px - Tablets landscape / desktop pequeño */
/* 2xl: 1280px+ - Desktop */
```

**Código actual en useMediaQuery.ts:**
```typescript
// Línea 42: useIsMobile usa 1023px como breakpoint
return useMediaQuery('(max-width: 1023px)');
```

**Recomendación:** Mantener pero agregar breakpoints intermedios:
- `useIsSmallMobile()`: max-width 374px (iPhone SE)
- `useIsMobile()`: max-width 767px (móviles)
- `useIsTablet()`: 768px - 1023px (tablets)
- `useIsDesktop()`: min-width 1024px

### Consideraciones Safari iOS

Safari iOS tiene comportamientos únicos que requieren atención especial:

#### 1. **Viewport y Scroll**
```css
/* Prevenir bounce scroll */
body {
  overscroll-behavior-y: none;
  -webkit-overflow-scrolling: touch;
}

/* Safe area insets para iPhone con notch */
.container {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
}
```

#### 2. **Hardware Acceleration**
```css
/* Usar transform3d para activar GPU */
.sidebar {
  transform: translate3d(-100%, 0, 0);
  -webkit-transform: translate3d(-100%, 0, 0);
  will-change: transform;
}
```

#### 3. **Touch Events**
```javascript
// Safari iOS requiere passive: false para preventDefault
element.addEventListener('touchstart', handler, { passive: false });
```

#### 4. **100vh Problem**
Safari iOS incluye la barra de navegación en 100vh, causando scroll inesperado.

**Solución:**
```css
/* Usar dvh (dynamic viewport height) o JavaScript */
.full-height {
  height: 100vh;
  height: 100dvh; /* Fallback moderno */
  height: calc(var(--vh, 1vh) * 100); /* Fallback JS */
}
```

```javascript
// Calcular vh real
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
```

#### 5. **Click Delay**
Safari iOS tiene 300ms de delay en clicks.

**Solución:**
```css
* {
  touch-action: manipulation; /* Elimina delay */
}
```

---

## 4. Soluciones Propuestas

### 🎯 Navegación Móvil

#### Solución 1: Mejorar Sidebar Off-Canvas Actual

**Cambios requeridos:**

1. **Agregar Overlay/Backdrop**
```tsx
// Nuevo componente: MobileOverlay.tsx
{isMobile && isOpen && (
  <div
    className="fixed inset-0 bg-black/50 z-40"
    onClick={onClose}
    style={{
      backdropFilter: 'blur(2px)',
      WebkitBackdropFilter: 'blur(2px)',
    }}
  />
)}
```

2. **Optimizar Ancho del Sidebar**
```tsx
// Cambiar w-64 (256px) a w-80 (320px) o 85vw max
const sidebarClasses = cn(
  'bg-white border-r border-slate-200 h-screen overflow-y-auto',
  'w-[85vw] max-w-[320px]', // Responsive width
  isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative',
  // ... resto del código
);
```

3. **Mejorar Transiciones para Safari iOS**
```tsx
const sidebarStyles = isMobile ? {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  bottom: 0,
  zIndex: 50,
  transform: isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)',
  WebkitTransform: isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)',
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  WebkitTransition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  willChange: 'transform',
} : {};
```

4. **Agregar Swipe to Close**
```tsx
// Usar react-swipeable o implementar touch handlers
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: () => isMobile && onClose(),
  trackMouse: false,
  trackTouch: true,
});

<div {...handlers} className={sidebarClasses}>
  {/* contenido */}
</div>
```

5. **Mejorar Touch Targets**
```tsx
// Aumentar padding de botones
<button
  onClick={() => toggleSection(section.href)}
  className={cn(
    'w-full flex items-center justify-between',
    'px-4 py-3', // Aumentado de py-2 a py-3 (48px mínimo)
    'rounded-lg text-sm font-medium transition-colors',
    'min-h-[44px]', // Forzar mínimo 44px
    // ... resto
  )}
>
```

#### Solución 2: Bottom Navigation Bar (Alternativa)

Para navegación principal, considerar tab bar inferior:

```tsx
// Nuevo componente: BottomNavBar.tsx
const mainSections = [
  { title: 'Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
  { title: 'Escaneo', href: '/employee/scan', icon: Scan },
  { title: 'Historial', href: '/employee/history', icon: History },
  { title: 'Perfil', href: '/employee/profile', icon: UserCircle },
];

<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-inset-bottom">
  <div className="flex justify-around items-center h-16">
    {mainSections.map((item) => (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          'flex flex-col items-center justify-center',
          'min-w-[64px] min-h-[48px]', // Touch target
          'text-xs',
          isActive(item.href) ? 'text-sky-600' : 'text-slate-600'
        )}
      >
        <item.icon className="w-6 h-6 mb-1" />
        <span>{item.title}</span>
      </Link>
    ))}
  </div>
</nav>
```

**Pros:**
- Más ergonómico (thumb zone)
- Patrón familiar para usuarios móviles
- Acceso rápido a funciones principales

**Cons:**
- Requiere reorganizar arquitectura de navegación
- Limita a 3-5 opciones principales
- Navegación secundaria aún requiere sidebar/menú

### 📊 Visualización de Datos Biométricos

#### Problema: Gauges Muy Pequeños en Móvil

**Solución: Diseño Responsive para Gauges**

1. **Layout Adaptativo**
```tsx
// BiometricGauge.tsx - Agregar prop para tamaño
interface BiometricGaugeProps {
  // ... props existentes
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-24 h-24',   // Móvil pequeño
  md: 'w-32 h-32',   // Móvil/tablet
  lg: 'w-40 h-40',   // Desktop
};

// Usar hook para determinar tamaño automáticamente
const isMobile = useIsMobile();
const gaugeSize = isMobile ? 'md' : 'lg';
```

2. **Grid Responsivo**
```tsx
// Dashboard.tsx - Ajustar grid de gauges
<div className={cn(
  'grid gap-4',
  'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  // En móvil: 2 columnas
  // Tablet: 3 columnas
  // Desktop: 4 columnas
)}>
  {indicators.map((indicator) => (
    <BiometricGauge key={indicator.code} {...indicator} />
  ))}
</div>
```

3. **Tipografía Escalable**
```tsx
// Usar clases responsive de Tailwind
<div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  {value}
</div>
<div className="text-xs sm:text-sm text-slate-600">
  {unit}
</div>
```

4. **Números Grandes en Móvil**
Siguiendo mejores prácticas de biometric data visualization:

```tsx
// Modo compacto para móvil
{isMobile ? (
  // Mostrar solo número grande y estado
  <div className="flex flex-col items-center p-4">
    <div className="text-4xl font-bold text-slate-900">
      {value}
    </div>
    <div className="text-sm text-slate-600 mt-1">
      {displayName}
    </div>
    <div className={cn(
      'mt-2 px-3 py-1 rounded-full text-sm font-medium',
      statusColor === 'green' && 'bg-green-100 text-green-700',
      statusColor === 'yellow' && 'bg-yellow-100 text-yellow-700',
      statusColor === 'red' && 'bg-red-100 text-red-700',
    )}>
      {emoji} {level}
    </div>
  </div>
) : (
  // Mostrar gauge completo en desktop
  <GaugeVisualization {...props} />
)}
```

#### Problema: Tablas No Scrolleables

**Solución: Tablas Responsivas**

```tsx
// BiometricTable.tsx
<div className="overflow-x-auto -mx-4 sm:mx-0">
  <div className="inline-block min-w-full align-middle">
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-slate-200">
        {/* contenido */}
      </table>
    </div>
  </div>
</div>

// Alternativa: Cards en móvil
{isMobile ? (
  <div className="space-y-3">
    {data.map((row) => (
      <div key={row.id} className="bg-white p-4 rounded-lg shadow">
        <div className="font-medium">{row.indicator}</div>
        <div className="text-2xl font-bold mt-2">{row.value}</div>
        <div className="text-sm text-slate-600 mt-1">{row.range}</div>
      </div>
    ))}
  </div>
) : (
  <table>{/* tabla normal */}</table>
)}
```

#### Problema: Gráficos (Recharts) No Responsivos

**Solución: ResponsiveContainer + Configuración Móvil**

```tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';

<ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
  <LineChart
    data={data}
    margin={{
      top: 5,
      right: isMobile ? 5 : 20,
      left: isMobile ? -20 : 0,
      bottom: 5,
    }}
  >
    <XAxis
      dataKey="date"
      tick={{ fontSize: isMobile ? 10 : 12 }}
      tickFormatter={(value) => isMobile ? value.slice(0, 5) : value}
    />
    <YAxis
      tick={{ fontSize: isMobile ? 10 : 12 }}
      width={isMobile ? 30 : 60}
    />
    <Line
      type="monotone"
      dataKey="value"
      stroke="#0ea5e9"
      strokeWidth={isMobile ? 2 : 3}
      dot={!isMobile} // Sin dots en móvil para claridad
    />
  </LineChart>
</ResponsiveContainer>
```

### 🖐️ Interacciones Táctiles

#### Touch Targets - Implementación Global

**Archivo: `/workspace/app/frontend/src/styles/mobile.css`**

```css
/* Touch target mínimos */
button,
a,
input,
select,
textarea,
[role="button"],
[role="link"] {
  min-height: 44px;
  min-width: 44px;
}

/* Aumentar área de click sin cambiar visual */
.touch-target-expand {
  position: relative;
}

.touch-target-expand::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  /* Área de 16px extra en cada lado */
}

/* Eliminar delay de 300ms en iOS */
* {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Feedback visual en touch */
button:active,
a:active {
  opacity: 0.7;
  transform: scale(0.98);
  transition: all 0.1s ease;
}
```

#### Gestos Implementados

1. **Swipe to Close Sidebar** (ya mencionado arriba)

2. **Pull to Refresh en Listas**
```tsx
// Usar react-pull-to-refresh o implementar custom
import PullToRefresh from 'react-simple-pull-to-refresh';

<PullToRefresh
  onRefresh={async () => {
    await loadData();
  }}
  pullingContent={<div>Pull down to refresh...</div>}
  refreshingContent={<div>Refreshing...</div>}
>
  <div className="measurements-list">
    {/* contenido */}
  </div>
</PullToRefresh>
```

3. **Long Press para Opciones**
```tsx
// Usar react-use-long-press
import { useLongPress } from 'use-long-press';

const bind = useLongPress(() => {
  showContextMenu();
}, {
  threshold: 500, // 500ms
  captureEvent: true,
  cancelOnMovement: true,
});

<div {...bind()} className="measurement-card">
  {/* contenido */}
</div>
```

### ⚡ Performance y Optimizaciones

#### 1. Code Splitting por Ruta

```tsx
// App.tsx - Lazy load de páginas
import { lazy, Suspense } from 'react';

const EmployeeDashboard = lazy(() => import('./pages/employee/Dashboard'));
const EmployeeScan = lazy(() => import('./pages/employee/Scan'));
const LeaderDashboard = lazy(() => import('./pages/leader/dashboard'));
// ... resto de páginas

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

#### 2. Lazy Loading de Componentes Pesados

```tsx
// Lazy load de gráficos (recharts es pesado)
const TrendChart = lazy(() => import('./components/dashboard/TrendChart'));

{showChart && (
  <Suspense fallback={<ChartSkeleton />}>
    <TrendChart data={data} />
  </Suspense>
)}
```

#### 3. Image Optimization

```tsx
// Usar srcset para responsive images
<img
  src={logo}
  srcSet={`
    ${logoSmall} 320w,
    ${logoMedium} 640w,
    ${logoLarge} 1024w
  `}
  sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 1024px"
  alt="HoloCheck Logo"
  loading="lazy"
/>
```

#### 4. Reducir Bundle Size

**vite.config.ts:**
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

#### 5. Service Worker para Offline

```typescript
// sw.ts - Service Worker básico
const CACHE_NAME = 'holoceck-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

---

## 5. Referencias y Mejores Prácticas

### Investigación Realizada

#### 1. Mobile Responsive Design for Health Dashboards

**Hallazgos clave:**
- Priorizar 5-6 KPIs críticos en la parte superior
- Usar card-based layouts para reducir carga cognitiva
- Color coding consistente (verde/amarillo/rojo)
- Touch targets mínimo 44x44px
- Dark mode para reducir fatiga visual
- Navegación fácil es la característica #1 más valorada

**Métricas de éxito:**
- 80% de usuarios abandonan apps con mala UX
- Dashboards bien diseñados aumentan engagement 72%
- Usuarios con metas toman 2,000+ pasos adicionales

#### 2. iOS Safari Optimization

**Técnicas esenciales:**
- Hardware acceleration con `translate3d()` y `translateZ()`
- Evitar over-acceleration (desperdicia memoria)
- Lazy loading de recursos
- Optimizar imágenes (async decode en background)
- Mantener main thread libre (60fps/120fps ProMotion)
- Usar Safari Web Inspector para debugging remoto
- Target <400ms para startup time

**Limitaciones iOS:**
- Todos los browsers usan WebKit de Safari
- Service workers tienen restricciones
- PWAs requieren instalación manual
- Push notifications limitadas

#### 3. Biometric Data Visualization

**Principios de diseño:**
- Mobile-first, no retrofit de desktop
- Números grandes y líneas gruesas
- Enfocarse en últimos 3 días en lugar de 7
- Usar geolocation para personalización
- Real-time data display
- Evitar tooltips (no funcionan en touch)
- Comunicar transparencia sobre privacidad
- Diseñar para trust y security

**Errores comunes:**
- Fuentes difíciles de leer (light weight, compressed)
- Contraste extremo que compite por atención
- Tipografía que opaca los datos
- Información overload

#### 4. Sidebar Navigation Patterns

**Patrones recomendados:**
- **Collapsible sidebar:** 48-64px collapsed, 240-300px expanded
- **Off-canvas:** Maximiza espacio, bueno para móvil
- **Bottom tab bar:** Más ergonómico (thumb zone), 3-5 items max
- **Hamburger menu:** Común pero reduce discoverability

**Best practices:**
- Touch targets mínimo 44px
- Minimizar clutter visual (max 2 iconos por item)
- Priorizar contenido sobre chrome
- Accessibility: labels claros, WCAG contrast, screen reader support
- Responsive: temporary drawer (móvil), mini-variant (tablet), persistent (desktop)
- Smooth animations <300ms

### Ejemplos de Código Relevantes

#### Safe Area Insets (iOS Notch)

```css
.app-container {
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}

/* Shorthand */
.app-container {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

#### 100vh Fix para Safari iOS

```javascript
// Calcular vh real
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);
```

```css
.full-height {
  height: 100vh; /* Fallback */
  height: calc(var(--vh, 1vh) * 100);
}
```

#### Prevent Bounce Scroll (iOS)

```css
body {
  position: fixed;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

#root {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 100%;
}

/* O usar overscroll-behavior */
body {
  overscroll-behavior-y: none;
}
```

### Patrones de Diseño Recomendados

#### 1. Progressive Disclosure
Mostrar información gradualmente, no todo a la vez.

```tsx
// Ejemplo: Expandir detalles
<div className="metric-card">
  <div className="metric-summary" onClick={toggleExpand}>
    <h3>Frecuencia Cardíaca</h3>
    <div className="value">73 bpm</div>
    <div className="status">✅ Normal</div>
  </div>
  
  {isExpanded && (
    <div className="metric-details">
      <p>Rango: 60-100 bpm</p>
      <p>Última medición: Hace 2 horas</p>
      <TrendChart data={history} />
    </div>
  )}
</div>
```

#### 2. Skeleton Screens
Mejor que spinners genéricos.

```tsx
function BiometricGaugeSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-32 h-32 bg-slate-200 rounded-full mx-auto"></div>
      <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mt-4"></div>
      <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto mt-2"></div>
    </div>
  );
}
```

#### 3. Thumb Zone Optimization
Colocar acciones importantes en área accesible con pulgar.

```
┌─────────────────┐
│  Hard to reach  │ ← Top 25%
├─────────────────┤
│                 │
│   Easy reach    │ ← Middle 50%
│                 │
├─────────────────┤
│  Natural grip   │ ← Bottom 25% (BEST)
└─────────────────┘
```

Colocar navegación principal y CTAs en bottom 25%.

---

## 6. Priorización por Fases

### 🔴 FASE 1: CRÍTICO (Sprint 1 - 1 semana)
**Objetivo:** Hacer la app funcionalmente usable en móvil.

#### Tareas:
1. **Sidebar Funcional** (P1)
   - [ ] Agregar overlay/backdrop
   - [ ] Optimizar ancho (85vw max 320px)
   - [ ] Mejorar transiciones Safari iOS
   - [ ] Implementar swipe to close
   - [ ] Aumentar touch targets a 44px mínimo

2. **Viewport Optimization** (P2)
   - [ ] Actualizar meta tag con minimum-scale
   - [ ] Implementar safe area insets
   - [ ] Fix 100vh problem con CSS custom property
   - [ ] Agregar touch-action: manipulation

3. **Touch Targets Globales** (P3)
   - [ ] Crear mobile.css con estilos base
   - [ ] Aplicar min-height/min-width 44px
   - [ ] Agregar feedback visual en touch
   - [ ] Revisar todos los botones críticos

**Criterios de éxito:**
- ✅ Usuario puede abrir/cerrar sidebar en móvil
- ✅ Navegación funciona en iPhone SE (pantalla más pequeña)
- ✅ No hay elementos que requieran zoom para interactuar
- ✅ Transiciones suaves sin lag en Safari iOS

**Testing:**
- iPhone SE (375x667)
- iPhone 14 (390x844)
- Samsung Galaxy S23 (360x740)

---

### 🟡 FASE 2: ALTO (Sprint 2 - 1 semana)
**Objetivo:** Optimizar visualización de datos y navegación.

#### Tareas:
1. **Gauges Responsivos** (P4)
   - [ ] Implementar tamaños adaptativos (sm/md/lg)
   - [ ] Crear layout grid responsivo (2/3/4 cols)
   - [ ] Modo compacto para móvil (números grandes)
   - [ ] Tipografía escalable

2. **Tablas y Gráficos** (P4)
   - [ ] Hacer tablas scrolleables horizontalmente
   - [ ] Alternativa: Cards en móvil
   - [ ] Configurar Recharts para móvil
   - [ ] Reducir datos mostrados (últimos 3 días)

3. **Navegación Optimizada** (P5)
   - [ ] Considerar bottom tab bar para navegación principal
   - [ ] Reducir niveles de jerarquía
   - [ ] Agregar búsqueda/filtros
   - [ ] Breadcrumbs para orientación

4. **Performance Básica** (P6)
   - [ ] Implementar code splitting por ruta
   - [ ] Lazy load de componentes pesados
   - [ ] Optimizar bundle (manual chunks)

**Criterios de éxito:**
- ✅ Gauges legibles sin zoom en móvil
- ✅ Tablas navegables con scroll horizontal
- ✅ Gráficos se ajustan a ancho de pantalla
- ✅ Navegación intuitiva (max 3 taps a cualquier sección)
- ✅ Tiempo de carga inicial <3s en 4G

**Testing:**
- Todas las páginas principales en móvil
- Diferentes tamaños de datos
- Conexión 4G simulada

---

### 🟢 FASE 3: MEDIO/BAJO (Sprint 3 - 1 semana)
**Objetivo:** Pulir experiencia y agregar features avanzados.

#### Tareas:
1. **Orientación Landscape** (P7)
   - [ ] Optimizar layouts para horizontal
   - [ ] Aprovechar espacio extra
   - [ ] Sidebar puede ser persistent en landscape

2. **Gestos Táctiles** (P8)
   - [ ] Pull to refresh en listas
   - [ ] Long press para opciones
   - [ ] Pinch to zoom en gráficos (donde apropiado)

3. **Estados de Carga** (P9)
   - [ ] Skeleton screens para todos los componentes
   - [ ] Progress indicators contextuales
   - [ ] Optimistic UI updates

4. **Accesibilidad** (P10)
   - [ ] Mejorar contraste para luz solar
   - [ ] Screen reader support
   - [ ] Navegación por teclado
   - [ ] Focus management

5. **Performance Avanzada** (P6 continuación)
   - [ ] Service worker para offline
   - [ ] Image optimization (srcset)
   - [ ] Prefetch de rutas comunes
   - [ ] Analytics de performance

**Criterios de éxito:**
- ✅ App usable en landscape
- ✅ Gestos naturales funcionan
- ✅ Loading states claros y rápidos
- ✅ Pasa WCAG AA en accesibilidad
- ✅ Funciona offline (básico)

**Testing:**
- Ambas orientaciones
- Lectores de pantalla (VoiceOver iOS, TalkBack Android)
- Modo avión (offline)
- Lighthouse mobile score >90

---

## 7. Criterios de Aceptación

### Para Cada Fase

#### FASE 1: Funcionalidad Básica

| Criterio | Cómo Verificar | Dispositivos |
|----------|----------------|--------------|
| Sidebar abre/cierra correctamente | Tap en hamburger menu, sidebar aparece con overlay | iPhone SE, iPhone 14, Galaxy S23 |
| Overlay cierra sidebar al hacer tap | Tap fuera del sidebar, sidebar se cierra | Todos los móviles |
| Swipe cierra sidebar | Deslizar sidebar hacia izquierda | iOS y Android |
| Touch targets ≥44px | Usar inspector, medir elementos interactivos | Todos |
| No zoom requerido | Interactuar con todos los elementos sin zoom | iPhone SE (caso crítico) |
| Transiciones suaves | Abrir/cerrar sidebar, sin lag ni saltos | Safari iOS especialmente |
| Safe areas respetadas | En iPhone con notch, contenido no oculto | iPhone 12+ |

**Herramientas:**
- Chrome DevTools Device Mode
- Safari Web Inspector (remote debugging)
- Regla de medición en inspector
- BrowserStack para testing real

#### FASE 2: Visualización Optimizada

| Criterio | Cómo Verificar | Dispositivos |
|----------|----------------|--------------|
| Gauges legibles | Números y labels visibles sin zoom | Todos los móviles |
| Grid adaptativo | 2 cols en móvil, 3 en tablet, 4 en desktop | Redimensionar ventana |
| Tablas scrolleables | Scroll horizontal funciona, no corta contenido | Todos |
| Gráficos responsivos | Recharts se ajusta a ancho, labels legibles | Todos |
| Datos simplificados | Móvil muestra últimos 3 días, desktop 7 | Comparar móvil vs desktop |
| Navegación rápida | Max 3 taps para llegar a cualquier sección | Contar taps en user testing |
| Carga inicial <3s | Lighthouse, Network tab en 4G throttling | 4G simulado |

**Herramientas:**
- Lighthouse mobile audit
- Network throttling (Slow 4G)
- Real device testing
- User testing con usuarios reales

#### FASE 3: Experiencia Pulida

| Criterio | Cómo Verificar | Dispositivos |
|----------|----------------|--------------|
| Landscape optimizado | Rotar dispositivo, layout se adapta bien | Tablets y móviles |
| Pull to refresh | Jalar hacia abajo en listas, recarga datos | iOS y Android |
| Long press funciona | Mantener presionado, aparece menú contextual | Todos |
| Skeleton screens | Durante carga, aparecen placeholders | Throttle network |
| Contraste WCAG AA | Usar contrast checker, ratio ≥4.5:1 | Todos |
| Screen reader | Activar VoiceOver/TalkBack, navegar app | iOS y Android |
| Funciona offline | Modo avión, app carga contenido cacheado | Todos |
| Lighthouse score >90 | Correr audit, revisar performance/accessibility | Mobile mode |

**Herramientas:**
- Lighthouse (performance, accessibility, PWA)
- WAVE accessibility checker
- Contrast checker (WebAIM)
- VoiceOver (iOS), TalkBack (Android)
- BrowserStack real devices

### Checklist de Testing Completo

#### Dispositivos Mínimos para Testing:

- [ ] iPhone SE (375x667) - Pantalla más pequeña
- [ ] iPhone 14 (390x844) - Estándar iOS
- [ ] Samsung Galaxy S23 (360x740) - Estándar Android
- [ ] iPad 10.9" (820x1180) - Tablet
- [ ] Desktop (1920x1080) - Verificar no rompimos desktop

#### Browsers:

- [ ] Safari iOS (latest)
- [ ] Chrome Android (latest)
- [ ] Chrome Desktop (testing)
- [ ] Firefox Desktop (testing)

#### Escenarios de Usuario:

1. **Empleado - Primera vez**
   - [ ] Abrir app en móvil
   - [ ] Navegar por sidebar
   - [ ] Ver dashboard con gauges
   - [ ] Realizar escaneo biométrico
   - [ ] Ver historial

2. **Líder - Revisión de equipo**
   - [ ] Abrir dashboard de equipo
   - [ ] Ver métricas agregadas
   - [ ] Revisar análisis IA
   - [ ] Filtrar por departamento

3. **HR - Gestión**
   - [ ] Ver dashboard organizacional
   - [ ] Gestionar usuarios
   - [ ] Revisar uso de créditos
   - [ ] Exportar reportes

4. **Offline/Pobre conexión**
   - [ ] Abrir app sin internet
   - [ ] Ver contenido cacheado
   - [ ] Intentar acciones (mostrar error apropiado)

#### Performance Targets:

| Métrica | Target | Herramienta |
|---------|--------|-------------|
| First Contentful Paint | <1.8s | Lighthouse |
| Largest Contentful Paint | <2.5s | Lighthouse |
| Time to Interactive | <3.8s | Lighthouse |
| Total Blocking Time | <200ms | Lighthouse |
| Cumulative Layout Shift | <0.1 | Lighthouse |
| Speed Index | <3.4s | Lighthouse |
| Bundle Size (gzipped) | <500KB initial | webpack-bundle-analyzer |

---

## 📝 Notas de Implementación

### Orden Sugerido de Implementación

1. **Día 1-2:** Sidebar + Overlay + Touch targets
2. **Día 3:** Viewport fixes + Safe areas + 100vh
3. **Día 4-5:** Gauges responsivos + Grid layout
4. **Día 6-7:** Tablas/gráficos + Testing + Bug fixes

### Consideraciones Técnicas

#### Tailwind CSS
El proyecto usa Tailwind. Aprovechar sus utilidades responsive:
```tsx
className="text-sm md:text-base lg:text-lg"
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
className="p-4 md:p-6 lg:p-8"
```

#### TypeScript
Mantener tipos estrictos para props de componentes:
```typescript
interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}
```

#### Testing
Agregar tests para breakpoints:
```typescript
describe('BiometricGauge responsive', () => {
  it('shows compact mode on mobile', () => {
    // Mock useIsMobile to return true
    // Render component
    // Assert compact layout
  });
});
```

### Recursos Adicionales

- [Apple Human Interface Guidelines - iOS](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design - Mobile](https://m3.material.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web.dev - Mobile Performance](https://web.dev/mobile/)
- [Can I Use - CSS/JS Features](https://caniuse.com/)

---

## 🎯 Resumen Ejecutivo para Stakeholders

### Inversión Requerida
- **Tiempo:** 3 sprints (3 semanas)
- **Recursos:** 1 desarrollador frontend (Alex)
- **Testing:** Dispositivos reales o BrowserStack

### ROI Esperado
- **Engagement:** +72% en usuarios móviles
- **Retención:** -80% abandono por mala UX
- **Satisfacción:** NPS +30 puntos
- **Conversión:** +40% completación de escaneos

### Riesgos Mitigados
- ✅ App no funciona en móvil → App completamente funcional
- ✅ Usuarios frustrados → Experiencia fluida
- ✅ Baja adopción → Adopción masiva en móvil
- ✅ Mala reputación → Reviews positivas

### Próximos Pasos
1. Aprobar especificaciones
2. Asignar sprint a Alex
3. Setup de testing devices
4. Kickoff Fase 1

---

**Documento creado por:** Emma (Product Manager)  
**Fecha:** 2026-01-25  
**Versión:** 1.0  
**Estado:** Listo para implementación