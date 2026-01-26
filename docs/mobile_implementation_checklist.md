# 📱 Checklist de Implementación - Mejoras Móviles HoloCheck Equilibria

**Para:** Alex (Engineer)  
**De:** Emma (Product Manager)  
**Fecha:** 2026-01-25  
**Versión:** 1.0

---

## 🎯 Objetivo

Implementar mejoras móviles en 3 fases (sprints) para hacer HoloCheck Equilibria completamente funcional y optimizada en dispositivos móviles.

---

## 🔴 FASE 1: CRÍTICO - Funcionalidad Básica (Sprint 1)

**Duración:** 5 días laborables  
**Objetivo:** Hacer la app funcionalmente usable en móvil

### Día 1: Sidebar Funcional (Parte 1)

#### ✅ Tarea 1.1: Crear Componente de Overlay
**Archivo:** `/workspace/app/frontend/src/components/layout/MobileOverlay.tsx`

```tsx
interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileOverlay({ isOpen, onClose }: MobileOverlayProps) {
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
      onClick={onClose}
      style={{
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
      aria-label="Close menu"
    />
  );
}
```

**Testing:**
- [ ] Overlay aparece cuando sidebar está abierto
- [ ] Click en overlay cierra sidebar
- [ ] Blur effect funciona en Safari iOS
- [ ] Z-index correcto (40, debajo de sidebar z-50)

---

#### ✅ Tarea 1.2: Optimizar Ancho del Sidebar
**Archivo:** `/workspace/app/frontend/src/components/layout/Sidebar.tsx`

**Cambios:**
```tsx
// Línea 144: Reemplazar
const sidebarClasses = cn(
  'bg-white border-r border-slate-200 h-screen overflow-y-auto',
  'w-[85vw] max-w-[320px]', // CAMBIO: de w-64 a responsive
  isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative',
  'transform transition-transform duration-300 ease-in-out',
  isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'
);
```

**Testing:**
- [ ] Sidebar no ocupa toda la pantalla en móvil
- [ ] Max width 320px en pantallas grandes
- [ ] 85% del viewport en pantallas pequeñas (iPhone SE)

---

#### ✅ Tarea 1.3: Mejorar Transiciones Safari iOS
**Archivo:** `/workspace/app/frontend/src/components/layout/Sidebar.tsx`

**Cambios:**
```tsx
// Línea 150-158: Reemplazar sidebarStyles
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

**Testing:**
- [ ] Transición suave en Safari iOS (sin lag)
- [ ] Hardware acceleration activo (usar Safari Inspector)
- [ ] No hay flickering durante animación

---

### Día 2: Sidebar Funcional (Parte 2) + Touch Targets

#### ✅ Tarea 2.1: Implementar Swipe to Close
**Archivo:** `/workspace/app/frontend/src/components/layout/Sidebar.tsx`

**Paso 1:** Instalar dependencia
```bash
cd /workspace/app/frontend
pnpm add react-swipeable
```

**Paso 2:** Implementar en Sidebar
```tsx
// Agregar import
import { useSwipeable } from 'react-swipeable';

// Dentro del componente Sidebar, antes del return
const swipeHandlers = useSwipeable({
  onSwipedLeft: () => {
    if (isMobile && isOpen) {
      onClose();
    }
  },
  trackMouse: false,
  trackTouch: true,
  delta: 10, // Mínimo 10px para activar
  preventScrollOnSwipe: true,
});

// En el div principal del sidebar
<div
  {...swipeHandlers}
  className={sidebarClasses}
  style={sidebarStyles}
>
```

**Testing:**
- [ ] Swipe left cierra sidebar en móvil
- [ ] No interfiere con scroll vertical
- [ ] Funciona en iOS y Android
- [ ] Threshold apropiado (no muy sensible)

---

#### ✅ Tarea 2.2: Aumentar Touch Targets en Sidebar
**Archivo:** `/workspace/app/frontend/src/components/layout/Sidebar.tsx`

**Cambios:**
```tsx
// Línea 192-210: Botones de sección
<button
  onClick={() => toggleSection(section.href)}
  className={cn(
    'w-full flex items-center justify-between',
    'px-4 py-3', // CAMBIO: de py-2 a py-3
    'rounded-lg text-sm font-medium transition-colors',
    'min-h-[44px]', // NUEVO: Forzar mínimo 44px
    isActive(section.href)
      ? 'bg-sky-50 text-sky-700'
      : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100' // NUEVO: active state
  )}
>

// Línea 215-234: Links de items
<Link
  key={item.href}
  to={item.href}
  onClick={handleLinkClick}
  className={cn(
    'flex items-center gap-3',
    'px-4 py-3', // CAMBIO: de py-2 a py-3
    'rounded-lg text-sm transition-colors',
    'min-h-[44px]', // NUEVO: Forzar mínimo 44px
    isActive(item.href)
      ? 'bg-sky-50 text-sky-700 font-medium'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100' // NUEVO: active state
  )}
>

// Línea 168-181: Botón de cierre (X)
<button
  onClick={onClose}
  className="p-3 rounded-lg hover:bg-slate-100 transition-colors min-w-[44px] min-h-[44px]" // CAMBIO: p-2 a p-3, agregar min-w/h
  style={{
    position: 'absolute',
    top: 0,
    right: 0,
  }}
  aria-label="Cerrar menú"
>
  <X className="w-6 h-6 text-slate-600" /> {/* CAMBIO: w-5 h-5 a w-6 h-6 */}
</button>
```

**Testing:**
- [ ] Medir altura de botones (Inspector): ≥44px
- [ ] Fácil hacer tap sin zoom
- [ ] Active state visible al tocar
- [ ] No hay taps accidentales entre elementos

---

#### ✅ Tarea 2.3: Integrar Overlay en AppLayout
**Archivo:** `/workspace/app/frontend/src/components/layout/AppLayout.tsx`

**Cambios:**
```tsx
// Agregar import
import MobileOverlay from './MobileOverlay';

// En el return, agregar overlay antes del Sidebar
return (
  <div className="flex h-screen bg-slate-50">
    {/* Mobile Overlay */}
    <MobileOverlay isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    
    {/* Sidebar */}
    <Sidebar
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      isMobile={isMobile}
    />
    
    {/* ... resto del código */}
  </div>
);
```

**Testing:**
- [ ] Overlay aparece cuando sidebar abre
- [ ] Click en overlay cierra sidebar
- [ ] Orden correcto: Overlay (z-40) < Sidebar (z-50)

---

### Día 3: Viewport Fixes + Safe Areas

#### ✅ Tarea 3.1: Actualizar Viewport Meta Tag
**Archivo:** `/workspace/app/frontend/index.html`

**Cambios:**
```html
<!-- Línea 6: Reemplazar -->
<meta 
  name="viewport" 
  content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover"
/>
```

**Cambios explicados:**
- `minimum-scale=1.0`: Previene zoom out accidental
- `maximum-scale=5.0`: Permite zoom para accesibilidad (WCAG)
- `user-scalable=yes`: Permite zoom (cambio de no a yes para accesibilidad)

**Testing:**
- [ ] No hay zoom accidental al rotar
- [ ] Usuario puede hacer zoom si necesita (accesibilidad)
- [ ] Viewport se ajusta correctamente

---

#### ✅ Tarea 3.2: Implementar Safe Area Insets
**Archivo:** `/workspace/app/frontend/src/styles/mobile.css` (NUEVO)

**Crear archivo:**
```css
/* Safe Area Insets para iPhone con notch */
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
}

/* Aplicar a contenedor principal */
#root {
  padding-top: var(--safe-area-inset-top);
  padding-right: var(--safe-area-inset-right);
  padding-bottom: var(--safe-area-inset-bottom);
  padding-left: var(--safe-area-inset-left);
}

/* Sidebar debe extenderse hasta los bordes */
.sidebar-mobile {
  margin-left: calc(-1 * var(--safe-area-inset-left));
  padding-left: var(--safe-area-inset-left);
}

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

/* Eliminar delay de 300ms en iOS */
* {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Feedback visual en touch */
button:active,
a:active {
  opacity: 0.8;
  transform: scale(0.98);
  transition: opacity 0.1s ease, transform 0.1s ease;
}

/* Prevenir bounce scroll en iOS */
body {
  overscroll-behavior-y: none;
  -webkit-overflow-scrolling: touch;
}

/* Fix para 100vh en Safari iOS */
.full-height {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height */
  height: calc(var(--vh, 1vh) * 100);
}
```

**Importar en main.tsx:**
```tsx
// /workspace/app/frontend/src/main.tsx
import './styles/mobile.css';
```

**Testing:**
- [ ] En iPhone con notch, contenido no oculto
- [ ] Safe areas respetadas en todas las orientaciones
- [ ] Sidebar llega hasta el borde izquierdo

---

#### ✅ Tarea 3.3: Fix 100vh Problem
**Archivo:** `/workspace/app/frontend/src/main.tsx`

**Agregar al final del archivo:**
```tsx
// Fix para 100vh en Safari iOS
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);
```

**Aplicar en componentes que usan h-screen:**
```tsx
// Ejemplo: Sidebar.tsx
<div className="h-screen"> {/* Mantener como fallback */}
  {/* O usar: */}
  <div className="full-height">
```

**Testing:**
- [ ] Altura correcta en Safari iOS portrait
- [ ] Altura correcta en Safari iOS landscape
- [ ] No hay scroll inesperado
- [ ] Funciona al rotar dispositivo

---

### Día 4: Testing Fase 1 + Bug Fixes

#### ✅ Tarea 4.1: Testing Manual en Dispositivos Reales

**Dispositivos mínimos:**
- [ ] iPhone SE (375x667) - Safari
- [ ] iPhone 14 (390x844) - Safari
- [ ] Samsung Galaxy S23 (360x740) - Chrome

**Escenarios de prueba:**

1. **Abrir/Cerrar Sidebar**
   - [ ] Tap en hamburger menu abre sidebar
   - [ ] Overlay aparece con blur
   - [ ] Tap en overlay cierra sidebar
   - [ ] Botón X cierra sidebar
   - [ ] Swipe left cierra sidebar
   - [ ] Transición suave sin lag

2. **Navegación**
   - [ ] Tap en sección expande/colapsa
   - [ ] Tap en item navega y cierra sidebar
   - [ ] Todos los botones fáciles de tocar (≥44px)
   - [ ] Active states visibles

3. **Viewport**
   - [ ] No zoom accidental
   - [ ] Safe areas respetadas (iPhone con notch)
   - [ ] Altura correcta (no scroll inesperado)
   - [ ] Funciona en portrait y landscape

4. **Performance**
   - [ ] Animaciones a 60fps
   - [ ] No hay flickering
   - [ ] Responde inmediatamente a touch

---

#### ✅ Tarea 4.2: Testing con Chrome DevTools

**Pasos:**
1. Abrir Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Seleccionar dispositivos:
   - iPhone SE
   - iPhone 12 Pro
   - Samsung Galaxy S8+
   - iPad

**Verificar:**
- [ ] Sidebar funciona en todos los tamaños
- [ ] Overlay visible
- [ ] Touch targets adecuados (usar ruler)
- [ ] No hay overflow horizontal

---

#### ✅ Tarea 4.3: Lighthouse Mobile Audit

**Pasos:**
```bash
# En Chrome DevTools
1. Ir a Lighthouse tab
2. Seleccionar "Mobile"
3. Seleccionar categorías: Performance, Accessibility, Best Practices
4. Click "Analyze page load"
```

**Targets Fase 1:**
- [ ] Performance: ≥70
- [ ] Accessibility: ≥80
- [ ] Best Practices: ≥80

**Si no se cumplen, revisar sugerencias y fix.**

---

#### ✅ Tarea 4.4: Fix Bugs Encontrados

**Crear issues para cada bug:**
```markdown
## Bug: [Descripción corta]

**Dispositivo:** iPhone SE / Safari iOS 17
**Pasos para reproducir:**
1. ...
2. ...

**Resultado esperado:** ...
**Resultado actual:** ...

**Screenshot:** [adjuntar]

**Prioridad:** Alta/Media/Baja
```

**Fix y re-test hasta que todos los criterios pasen.**

---

### Día 5: Build, Commit, Push

#### ✅ Tarea 5.1: Build de Producción

```bash
cd /workspace/app/frontend
pnpm run build
```

**Verificar:**
- [ ] Build completa sin errores
- [ ] Bundle size razonable (<2MB gzipped)
- [ ] No warnings críticos

---

#### ✅ Tarea 5.2: Lint

```bash
cd /workspace/app/frontend
pnpm run lint
```

**Verificar:**
- [ ] 0 errores (warnings OK)
- [ ] Fix errores si los hay

---

#### ✅ Tarea 5.3: Actualizar Versión

**Archivo:** `/workspace/app/frontend/package.json`

```json
{
  "version": "1.0.70", // Incrementar de 1.0.69 a 1.0.70
}
```

---

#### ✅ Tarea 5.4: Commit y Push

```bash
cd /workspace/app
git add .
git commit -m "feat: Phase 1 mobile improvements - Functional sidebar and touch optimization

- Added mobile overlay with blur effect
- Optimized sidebar width (85vw max 320px)
- Improved Safari iOS transitions with hardware acceleration
- Implemented swipe-to-close gesture
- Increased touch targets to 44px minimum
- Updated viewport meta tag
- Implemented safe area insets for iPhone notch
- Fixed 100vh problem in Safari iOS
- Added mobile.css with touch optimizations
- Version bump to 1.0.70

Testing completed on:
- iPhone SE (375x667)
- iPhone 14 (390x844)
- Samsung Galaxy S23 (360x740)

Lighthouse scores:
- Performance: [score]
- Accessibility: [score]
- Best Practices: [score]"

git push origin main
```

---

#### ✅ Tarea 5.5: Verificar Deploy en Atoms

1. Esperar a que Atoms detecte la versión 70
2. Verificar que build es exitoso
3. Publicar versión
4. Probar en dispositivos reales

**Si hay error de build:**
- Revisar logs
- Fix issue
- Repetir proceso

---

## 🟡 FASE 2: ALTO - Visualización Optimizada (Sprint 2)

**Duración:** 5 días laborables  
**Objetivo:** Optimizar visualización de datos y navegación

### Día 1: Gauges Responsivos (Parte 1)

#### ✅ Tarea 1.1: Agregar Prop de Tamaño a BiometricGauge
**Archivo:** `/workspace/app/frontend/src/components/dashboard/BiometricGauge.tsx`

**Cambios:**
```tsx
interface BiometricGaugeProps {
  // ... props existentes
  size?: 'sm' | 'md' | 'lg';
  displayMode?: 'gauge' | 'compact'; // Nuevo: modo compacto para móvil
}

export default function BiometricGauge({
  // ... props existentes
  size = 'md',
  displayMode = 'gauge',
}: BiometricGaugeProps) {
  const isMobile = useIsMobile();
  
  // Determinar tamaño automáticamente si no se especifica
  const actualSize = size;
  const actualMode = isMobile ? 'compact' : displayMode;
  
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };
  
  // Modo compacto: solo números grandes
  if (actualMode === 'compact') {
    return (
      <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow">
        <div className="text-4xl font-bold text-slate-900">
          {value}
        </div>
        <div className="text-sm text-slate-600 mt-1 text-center">
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
    );
  }
  
  // Modo gauge normal (desktop)
  return (
    <div className={cn('flex flex-col items-center', sizeClasses[actualSize])}>
      {/* ... gauge existente */}
    </div>
  );
}
```

**Testing:**
- [ ] Modo compacto se activa en móvil
- [ ] Números grandes legibles
- [ ] Status badge visible
- [ ] Modo gauge en desktop

---

#### ✅ Tarea 1.2: Grid Responsivo en Dashboard
**Archivo:** `/workspace/app/frontend/src/pages/employee/Dashboard.tsx`

**Cambios:**
```tsx
// Buscar el grid de gauges (aproximadamente línea 200-250)
<div className={cn(
  'grid gap-4',
  'grid-cols-2',           // Móvil: 2 columnas
  'sm:grid-cols-2',        // Móvil grande: 2 columnas
  'md:grid-cols-3',        // Tablet: 3 columnas
  'lg:grid-cols-4',        // Desktop: 4 columnas
  'xl:grid-cols-5',        // Desktop grande: 5 columnas
)}>
  {indicators.map((indicator) => (
    <BiometricGauge
      key={indicator.code}
      {...indicator}
      size={isMobile ? 'md' : 'lg'}
    />
  ))}
</div>
```

**Aplicar mismo patrón en:**
- [ ] `/workspace/app/frontend/src/pages/leader/dashboard.tsx`
- [ ] `/workspace/app/frontend/src/pages/hr/dashboard.tsx`
- [ ] `/workspace/app/frontend/src/pages/org/dashboard.tsx`

**Testing:**
- [ ] 2 columnas en móvil (375px)
- [ ] 3 columnas en tablet (768px)
- [ ] 4 columnas en desktop (1024px)
- [ ] Gauges no se ven aplastados

---

### Día 2: Gauges Responsivos (Parte 2) + Tipografía

#### ✅ Tarea 2.1: Tipografía Escalable en Gauges

**Archivo:** `/workspace/app/frontend/src/components/dashboard/BiometricGauge.tsx`

**Cambios en modo gauge:**
```tsx
// Valor principal
<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
  {value}
</div>

// Unidad
<div className="text-xs sm:text-sm text-slate-600">
  {unit}
</div>

// Nombre del indicador
<div className="text-sm sm:text-base font-medium text-slate-700 mt-2 text-center">
  {displayName}
</div>

// Range label
<div className="text-xs sm:text-sm text-slate-500 mt-1">
  {rangeLabel}
</div>
```

**Testing:**
- [ ] Texto legible en iPhone SE sin zoom
- [ ] Escala apropiadamente en tablet
- [ ] No hay overflow de texto

---

#### ✅ Tarea 2.2: Optimizar BiometricGaugeWithInfo para Móvil

**Archivo:** `/workspace/app/frontend/src/components/dashboard/BiometricGaugeWithInfo.tsx`

**Cambios:**
```tsx
// Modal debe ser full-screen en móvil
const isMobile = useIsMobile();

<Dialog>
  <DialogContent className={cn(
    isMobile ? 'w-screen h-screen max-w-none m-0 rounded-none' : 'max-w-2xl'
  )}>
    {/* Contenido del modal */}
  </DialogContent>
</Dialog>
```

**Testing:**
- [ ] Modal full-screen en móvil
- [ ] Scrolleable si contenido es largo
- [ ] Botón de cerrar accesible

---

### Día 3: Tablas y Listas Responsivas

#### ✅ Tarea 3.1: Hacer Tablas Scrolleables

**Archivo:** `/workspace/app/frontend/src/components/dashboard/BiometricTable.tsx`

**Cambios:**
```tsx
const isMobile = useIsMobile();

return (
  <div className="w-full">
    {isMobile ? (
      // Vista de cards en móvil
      <div className="space-y-3">
        {data.map((row) => (
          <div key={row.id} className="bg-white p-4 rounded-lg shadow border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-slate-900">{row.indicator}</div>
              <div className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                row.statusColor === 'green' && 'bg-green-100 text-green-700',
                row.statusColor === 'yellow' && 'bg-yellow-100 text-yellow-700',
                row.statusColor === 'red' && 'bg-red-100 text-red-700',
              )}>
                {row.emoji} {row.level}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 my-2">
              {row.value} {row.unit}
            </div>
            <div className="text-sm text-slate-600">
              Rango: {row.range}
            </div>
          </div>
        ))}
      </div>
    ) : (
      // Tabla normal en desktop con scroll horizontal
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Indicador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Rango
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {data.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {row.indicator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {row.value} {row.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {row.range}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        row.statusColor === 'green' && 'bg-green-100 text-green-700',
                        row.statusColor === 'yellow' && 'bg-yellow-100 text-yellow-700',
                        row.statusColor === 'red' && 'bg-red-100 text-red-700',
                      )}>
                        {row.emoji} {row.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </div>
);
```

**Testing:**
- [ ] Cards legibles en móvil
- [ ] Tabla scrolleable horizontalmente en tablet
- [ ] Tabla completa visible en desktop
- [ ] Datos importantes visibles sin scroll

---

#### ✅ Tarea 3.2: Optimizar Listas de Historial

**Archivo:** `/workspace/app/frontend/src/pages/employee/History.tsx`

**Cambios similares:** Cards en móvil, tabla en desktop.

**Testing:**
- [ ] Lista de mediciones legible en móvil
- [ ] Fácil identificar fecha y valores
- [ ] Tap en item muestra detalles

---

### Día 4: Gráficos Responsivos (Recharts)

#### ✅ Tarea 4.1: Configurar Recharts para Móvil

**Archivo:** `/workspace/app/frontend/src/components/dashboard/TrendChart.tsx`

**Cambios:**
```tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useIsMobile } from '@/hooks/useMediaQuery';

export default function TrendChart({ data, dataKey, title }: TrendChartProps) {
  const isMobile = useIsMobile();
  
  // Reducir datos en móvil (últimos 3 días en lugar de 7)
  const displayData = isMobile ? data.slice(-3) : data;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
        <LineChart
          data={displayData}
          margin={{
            top: 5,
            right: isMobile ? 5 : 20,
            left: isMobile ? -20 : 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            tickFormatter={(value) => {
              // Formato corto en móvil
              if (isMobile) {
                return value.slice(5); // "01-25" en lugar de "2026-01-25"
              }
              return value;
            }}
          />
          <YAxis
            tick={{ fontSize: isMobile ? 10 : 12 }}
            width={isMobile ? 30 : 60}
          />
          <Tooltip
            contentStyle={{
              fontSize: isMobile ? '12px' : '14px',
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#0ea5e9"
            strokeWidth={isMobile ? 2 : 3}
            dot={!isMobile} // Sin dots en móvil para claridad
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Testing:**
- [ ] Gráfico se ajusta a ancho de pantalla
- [ ] Labels legibles en móvil
- [ ] Tooltip funciona con touch
- [ ] Performance aceptable (no lag)

---

### Día 5: Performance Básica + Testing Fase 2

#### ✅ Tarea 5.1: Implementar Code Splitting por Ruta

**Archivo:** `/workspace/app/frontend/src/App.tsx`

**Cambios:**
```tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load de páginas
const EmployeeDashboard = lazy(() => import('./pages/employee/Dashboard'));
const EmployeeScan = lazy(() => import('./pages/employee/Scan'));
const EmployeeHistory = lazy(() => import('./pages/employee/History'));
const EmployeeProfile = lazy(() => import('./pages/employee/Profile'));
const EmployeeRecommendations = lazy(() => import('./pages/employee/Recommendations'));

const LeaderDashboard = lazy(() => import('./pages/leader/dashboard'));
const LeaderTeam = lazy(() => import('./pages/leader/team'));
const LeaderAIAnalyses = lazy(() => import('./pages/leader/ai-analyses'));
const LeaderInsights = lazy(() => import('./pages/leader/insights'));
const LeaderMeasurements = lazy(() => import('./pages/leader/measurements'));

// ... resto de páginas

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/scan" element={<EmployeeScan />} />
        {/* ... resto de rutas */}
      </Routes>
    </Suspense>
  );
}
```

**Testing:**
- [ ] Páginas cargan con lazy loading
- [ ] Loader aparece durante carga
- [ ] No hay flash de contenido
- [ ] Bundle size reducido (verificar en build)

---

#### ✅ Tarea 5.2: Lazy Load de Componentes Pesados

**Ejemplo: TrendChart (Recharts es pesado)**

```tsx
// En Dashboard.tsx
const TrendChart = lazy(() => import('@/components/dashboard/TrendChart'));

{showChart && (
  <Suspense fallback={<ChartSkeleton />}>
    <TrendChart data={data} dataKey="value" title="Tendencia" />
  </Suspense>
)}

// ChartSkeleton.tsx
function ChartSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg shadow animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
      <div className="h-48 bg-slate-200 rounded"></div>
    </div>
  );
}
```

**Testing:**
- [ ] Skeleton aparece mientras carga chart
- [ ] Chart se renderiza correctamente
- [ ] Performance mejorada (verificar Network tab)

---

#### ✅ Tarea 5.3: Optimizar Bundle con Manual Chunks

**Archivo:** `/workspace/app/frontend/vite.config.ts`

**Agregar:**
```typescript
export default defineConfig({
  // ... configuración existente
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

**Testing:**
- [ ] Build genera múltiples chunks
- [ ] Chunk sizes razonables (<500KB cada uno)
- [ ] Carga inicial más rápida

---

#### ✅ Tarea 5.4: Testing Completo Fase 2

**Lighthouse Audit:**
```bash
# En Chrome DevTools > Lighthouse
- Device: Mobile
- Categories: Performance, Accessibility, Best Practices
- Run audit
```

**Targets Fase 2:**
- [ ] Performance: ≥80
- [ ] Accessibility: ≥85
- [ ] Best Practices: ≥85
- [ ] First Contentful Paint: <2s
- [ ] Largest Contentful Paint: <2.5s

**Testing Manual:**
- [ ] Gauges legibles en móvil
- [ ] Tablas/listas navegables
- [ ] Gráficos responsivos
- [ ] Navegación rápida (<3 taps a cualquier sección)
- [ ] Carga inicial <3s en 4G

---

#### ✅ Tarea 5.5: Build, Commit, Push Fase 2

```bash
cd /workspace/app/frontend
pnpm run build
pnpm run lint

# Actualizar versión
# package.json: "version": "1.0.71"

cd /workspace/app
git add .
git commit -m "feat: Phase 2 mobile improvements - Optimized data visualization

- Implemented responsive gauges with compact mode for mobile
- Added responsive grid layouts (2/3/4 columns)
- Optimized typography scaling across breakpoints
- Converted tables to cards on mobile
- Configured Recharts for mobile (reduced data, smaller fonts)
- Implemented code splitting by route
- Lazy loading of heavy components (charts)
- Optimized bundle with manual chunks
- Version bump to 1.0.71

Performance improvements:
- Bundle size reduced by [X]%
- Initial load time: [X]s → [Y]s
- Lighthouse Performance: [score]

Testing completed on:
- iPhone SE, iPhone 14, Galaxy S23
- Verified data visualization clarity
- Confirmed navigation efficiency"

git push origin main
```

---

## 🟢 FASE 3: MEDIO/BAJO - Experiencia Pulida (Sprint 3)

**Duración:** 5 días laborables  
**Objetivo:** Pulir experiencia y agregar features avanzados

### Día 1: Orientación Landscape

#### ✅ Tarea 1.1: Detectar Orientación

**Archivo:** `/workspace/app/frontend/src/hooks/useMediaQuery.ts`

**Agregar:**
```typescript
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}
```

---

#### ✅ Tarea 1.2: Optimizar Layouts para Landscape

**Ejemplo: Dashboard.tsx**

```tsx
const orientation = useOrientation();
const isLandscape = orientation === 'landscape';

<div className={cn(
  'grid gap-4',
  isLandscape && isMobile 
    ? 'grid-cols-4' // 4 columnas en móvil landscape
    : 'grid-cols-2', // 2 columnas en móvil portrait
  'md:grid-cols-3 lg:grid-cols-4'
)}>
  {/* gauges */}
</div>
```

**Testing:**
- [ ] Layout se adapta al rotar
- [ ] Aprovecha espacio horizontal
- [ ] No hay elementos cortados

---

### Día 2: Gestos Táctiles Avanzados

#### ✅ Tarea 2.1: Pull to Refresh

**Instalar dependencia:**
```bash
cd /workspace/app/frontend
pnpm add react-simple-pull-to-refresh
```

**Implementar en History.tsx:**
```tsx
import PullToRefresh from 'react-simple-pull-to-refresh';

<PullToRefresh
  onRefresh={async () => {
    await loadMeasurements();
  }}
  pullingContent={
    <div className="flex justify-center py-4">
      <span className="text-sm text-slate-600">Jala para actualizar...</span>
    </div>
  }
  refreshingContent={
    <div className="flex justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
    </div>
  }
>
  <div className="measurements-list">
    {/* contenido */}
  </div>
</PullToRefresh>
```

**Testing:**
- [ ] Pull down activa refresh
- [ ] Spinner aparece durante carga
- [ ] Lista se actualiza correctamente

---

#### ✅ Tarea 2.2: Long Press para Opciones

**Instalar dependencia:**
```bash
pnpm add use-long-press
```

**Implementar en measurement cards:**
```tsx
import { useLongPress } from 'use-long-press';

const bind = useLongPress((event, { context }) => {
  showContextMenu(context);
}, {
  threshold: 500,
  captureEvent: true,
  cancelOnMovement: true,
  detect: 'touch', // Solo en touch, no en mouse
});

<div
  {...bind(measurement.id)}
  className="measurement-card"
>
  {/* contenido */}
</div>
```

**Testing:**
- [ ] Long press muestra menú contextual
- [ ] No interfiere con scroll
- [ ] Funciona solo en touch (no en desktop)

---

### Día 3: Estados de Carga y Feedback

#### ✅ Tarea 3.1: Crear Skeleton Components

**Archivo:** `/workspace/app/frontend/src/components/ui/skeletons.tsx` (NUEVO)

```tsx
export function BiometricGaugeSkeleton() {
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow animate-pulse">
      <div className="w-32 h-32 bg-slate-200 rounded-full"></div>
      <div className="h-4 bg-slate-200 rounded w-3/4 mt-4"></div>
      <div className="h-3 bg-slate-200 rounded w-1/2 mt-2"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-lg shadow">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg shadow animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
      <div className="h-48 bg-slate-200 rounded"></div>
    </div>
  );
}
```

---

#### ✅ Tarea 3.2: Usar Skeletons en Lugar de Spinners

**Ejemplo: Dashboard.tsx**

```tsx
{isLoading ? (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <BiometricGaugeSkeleton key={i} />
    ))}
  </div>
) : (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {indicators.map((indicator) => (
      <BiometricGauge key={indicator.code} {...indicator} />
    ))}
  </div>
)}
```

**Testing:**
- [ ] Skeletons aparecen durante carga
- [ ] Layout no salta cuando carga contenido real
- [ ] Mejor percepción de velocidad

---

### Día 4: Accesibilidad

#### ✅ Tarea 4.1: Mejorar Contraste para Luz Solar

**Archivo:** `/workspace/app/frontend/src/styles/mobile.css`

**Agregar:**
```css
/* High contrast mode para luz solar */
@media (prefers-contrast: high) {
  body {
    --slate-50: #f8fafc;
    --slate-600: #475569;
    --slate-900: #0f172a;
  }
  
  .text-slate-600 {
    color: #334155; /* Más oscuro */
  }
  
  .bg-white {
    background-color: #ffffff;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.2); /* Sombra más fuerte */
  }
}

/* Asegurar contraste mínimo WCAG AA */
.text-primary {
  color: #0369a1; /* Ratio 4.5:1 con blanco */
}

.text-secondary {
  color: #475569; /* Ratio 7:1 con blanco */
}
```

**Testing:**
- [ ] Usar WebAIM Contrast Checker
- [ ] Verificar ratios ≥4.5:1 para texto normal
- [ ] Verificar ratios ≥3:1 para texto grande
- [ ] Probar en luz solar real

---

#### ✅ Tarea 4.2: Screen Reader Support

**Agregar ARIA labels:**

```tsx
// Sidebar.tsx
<button
  onClick={() => toggleSection(section.href)}
  aria-expanded={expandedSections.includes(section.href)}
  aria-label={`${section.title} section`}
>

// BiometricGauge.tsx
<div
  role="img"
  aria-label={`${displayName}: ${value} ${unit}, ${level}`}
>

// Modal close button
<button
  onClick={onClose}
  aria-label="Close dialog"
>
```

**Testing:**
- [ ] Activar VoiceOver (iOS): Settings > Accessibility > VoiceOver
- [ ] Activar TalkBack (Android): Settings > Accessibility > TalkBack
- [ ] Navegar app completa con screen reader
- [ ] Verificar que todos los elementos interactivos son anunciados

---

#### ✅ Tarea 4.3: Navegación por Teclado (Accesibilidad)

**Asegurar focus management:**

```tsx
// Sidebar.tsx - Trap focus cuando está abierto
import { useEffect, useRef } from 'react';

const sidebarRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isMobile && isOpen && sidebarRef.current) {
    // Focus primer elemento interactivo
    const firstButton = sidebarRef.current.querySelector('button');
    firstButton?.focus();
    
    // Trap focus dentro del sidebar
    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = sidebarRef.current?.querySelectorAll(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0] as HTMLElement;
        const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }
}, [isMobile, isOpen]);

<div ref={sidebarRef} className={sidebarClasses}>
```

**Testing:**
- [ ] Tab navega entre elementos interactivos
- [ ] Shift+Tab navega hacia atrás
- [ ] Enter/Space activa botones
- [ ] Escape cierra modales
- [ ] Focus visible (outline)

---

### Día 5: Performance Avanzada + Testing Final

#### ✅ Tarea 5.1: Service Worker para Offline Básico

**Archivo:** `/workspace/app/frontend/public/sw.js` (NUEVO)

```javascript
const CACHE_NAME = 'holoceck-v1';
const urlsToCache = [
  '/',
  '/index.html',
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
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});
```

**Registrar en main.tsx:**
```tsx
// main.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
```

**Testing:**
- [ ] Service worker se registra correctamente
- [ ] Contenido se cachea
- [ ] App funciona offline (básico)
- [ ] Lighthouse PWA score mejora

---

#### ✅ Tarea 5.2: Image Optimization

**Implementar lazy loading:**

```tsx
// Cualquier imagen
<img
  src={imageUrl}
  alt={altText}
  loading="lazy"
  decoding="async"
/>

// Con srcset para responsive
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

---

#### ✅ Tarea 5.3: Testing Completo Fase 3

**Lighthouse Audit Final:**

**Targets Fase 3:**
- [ ] Performance: ≥90
- [ ] Accessibility: ≥90
- [ ] Best Practices: ≥90
- [ ] SEO: ≥90
- [ ] PWA: ≥80

**Accessibility Testing:**
- [ ] WAVE accessibility checker: 0 errores
- [ ] Contrast ratios WCAG AA compliant
- [ ] Screen reader compatible (VoiceOver, TalkBack)
- [ ] Keyboard navigation funcional

**Performance Testing:**
- [ ] First Contentful Paint: <1.8s
- [ ] Largest Contentful Paint: <2.5s
- [ ] Time to Interactive: <3.8s
- [ ] Total Blocking Time: <200ms
- [ ] Cumulative Layout Shift: <0.1

**User Testing:**
- [ ] 5 usuarios reales prueban app en móvil
- [ ] Completar tareas comunes (escaneo, ver historial, etc.)
- [ ] Recoger feedback
- [ ] Fix issues críticos

---

#### ✅ Tarea 5.4: Build, Commit, Push Final

```bash
cd /workspace/app/frontend
pnpm run build
pnpm run lint

# Actualizar versión
# package.json: "version": "1.0.72"

cd /workspace/app
git add .
git commit -m "feat: Phase 3 mobile improvements - Polished experience

- Optimized layouts for landscape orientation
- Implemented pull-to-refresh gesture
- Added long-press context menus
- Created skeleton loading components
- Improved contrast for outdoor visibility
- Enhanced screen reader support (ARIA labels)
- Implemented keyboard navigation and focus management
- Added service worker for basic offline support
- Optimized images with lazy loading and srcset
- Version bump to 1.0.72

Accessibility improvements:
- WCAG AA compliant contrast ratios
- VoiceOver/TalkBack compatible
- Keyboard navigation functional
- WAVE accessibility: 0 errors

Performance metrics:
- Lighthouse Performance: [score]
- Lighthouse Accessibility: [score]
- Lighthouse PWA: [score]
- FCP: [time]s
- LCP: [time]s
- TTI: [time]s

User testing completed with 5 users:
- [Summary of feedback]
- [Issues fixed]

All 3 phases complete. Mobile experience fully optimized."

git push origin main
```

---

## 📊 Métricas de Éxito

### Antes vs Después

| Métrica | Antes | Después (Target) |
|---------|-------|------------------|
| Lighthouse Performance | ~60 | ≥90 |
| Lighthouse Accessibility | ~70 | ≥90 |
| First Contentful Paint | >3s | <1.8s |
| Largest Contentful Paint | >4s | <2.5s |
| Bundle Size (gzipped) | ~1.5MB | <800KB |
| Touch Target Compliance | ~40% | 100% |
| Mobile Usability Issues | 15+ | 0 |
| User Satisfaction (NPS) | -20 | +50 |

---

## 🐛 Troubleshooting

### Problema: Sidebar no se cierra en iOS
**Solución:**
- Verificar que overlay tiene `onClick={onClose}`
- Verificar z-index: overlay (40) < sidebar (50)
- Verificar que `isMobile` se detecta correctamente

### Problema: Transiciones con lag en Safari
**Solución:**
- Usar `translate3d()` en lugar de `translateX()`
- Agregar `will-change: transform`
- Verificar que no hay demasiados elementos con hardware acceleration

### Problema: Gauges muy pequeños en móvil
**Solución:**
- Verificar que `useIsMobile()` funciona
- Verificar que `displayMode='compact'` se activa
- Revisar grid: debe ser 2 columnas en móvil

### Problema: Build falla
**Solución:**
```bash
# Limpiar cache
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# Verificar TypeScript
pnpm run build

# Si hay errores, revisar imports y tipos
```

### Problema: Lighthouse score bajo
**Solución:**
- Revisar Network tab: ¿Qué recursos son grandes?
- Implementar code splitting si no está
- Optimizar imágenes
- Reducir JavaScript no usado
- Verificar que lazy loading funciona

---

## ✅ Checklist Final

### Antes de Marcar como Completo

- [ ] Todas las tareas de Fase 1 completadas
- [ ] Todas las tareas de Fase 2 completadas
- [ ] Todas las tareas de Fase 3 completadas
- [ ] Testing en dispositivos reales (iPhone, Android)
- [ ] Lighthouse scores cumplen targets
- [ ] Accessibility testing pasado (WAVE, screen readers)
- [ ] User testing completado (5+ usuarios)
- [ ] Documentación actualizada
- [ ] Commits y push realizados
- [ ] Deploy verificado en Atoms
- [ ] Stakeholders notificados

---

## 📞 Contacto

**Preguntas o issues durante implementación:**
- Contactar a Emma (Product Manager)
- Revisar especificaciones en `/workspace/app/docs/mobile_improvements_spec.md`
- Consultar documentación de referencia

**Reportar bugs:**
- Crear issue en GitHub
- Incluir: dispositivo, browser, pasos para reproducir, screenshot

---

**Documento creado por:** Emma (Product Manager)  
**Para:** Alex (Engineer)  
**Fecha:** 2026-01-25  
**Versión:** 1.0  
**Estado:** Listo para implementación

¡Buena suerte con la implementación! 🚀