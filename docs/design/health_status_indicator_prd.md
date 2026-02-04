# PRD: Indicador de Estado de Salud del Sistema - HoloCheck Equilibria

## 1. Resumen Ejecutivo

### 1.1 Visión del Producto
Crear un indicador de estado de salud del sistema discreto, informativo y accesible que proporcione visibilidad en tiempo real del estado operacional de los componentes críticos de la plataforma HoloCheck Equilibria, siguiendo estándares internacionales y mejores prácticas de monitoreo de sistemas.

### 1.2 Objetivos del Producto
- **P0**: Proporcionar visibilidad instantánea del estado de salud del sistema
- **P0**: Implementar sistema RAG (Red-Amber-Green) según estándares internacionales
- **P0**: Diseño no intrusivo que no interfiera con el flujo de login
- **P1**: Soporte completo de internacionalización (i18n) y localización (l10n)
- **P1**: Información detallada de diagnóstico para troubleshooting
- **P2**: Historial de incidentes y notificaciones proactivas

### 1.3 Métricas de Éxito
- Tiempo de carga del indicador < 500ms
- Precisión de detección de estado > 99%
- Tasa de falsos positivos < 1%
- Satisfacción de usuario con claridad de información > 4.5/5
- Impacto en tiempo de carga de login < 100ms

---

## 2. Contexto y Antecedentes

### 2.1 Problema a Resolver
Los usuarios necesitan visibilidad del estado operacional del sistema antes y durante el proceso de login para:
- Entender si los problemas de acceso son del sistema o del usuario
- Tomar decisiones informadas sobre cuándo intentar operaciones críticas
- Reducir tickets de soporte relacionados con problemas de disponibilidad
- Proporcionar información de diagnóstico a equipos de soporte

### 2.2 Estándares Internacionales Aplicables

#### 2.2.1 ISO 22301 - Gestión de Continuidad del Negocio
- Monitoreo continuo de servicios críticos
- Comunicación transparente del estado operacional
- Procedimientos de respuesta a incidentes

#### 2.2.2 ITIL v4 - Gestión de Servicios de TI
- Service Level Management
- Incident Management
- Service Availability Management
- Service Status Communication

#### 2.2.3 Sistema RAG (Red-Amber-Green)
- Estándar internacional para indicadores de estado
- Usado en UK Government Digital Service (GDS)
- Adoptado por ISO/IEC 27001 para gestión de seguridad

#### 2.2.4 WCAG 2.1 AA - Accesibilidad Web
- Contraste de colores para usuarios con daltonismo
- Navegación por teclado
- Compatibilidad con lectores de pantalla
- Indicadores no dependientes solo de color

---

## 3. Historias de Usuario

### 3.1 Historia de Usuario - Usuario General
**Como** usuario intentando iniciar sesión  
**Quiero** ver el estado de salud del sistema de un vistazo  
**Para** saber si los problemas que experimento son del sistema o míos

**Criterios de Aceptación:**
- Veo un indicador pequeño en la esquina inferior derecha
- El color del indicador refleja el estado general del sistema
- Puedo hacer clic para ver detalles sin interrumpir el login
- El indicador no bloquea elementos importantes de la UI
- Entiendo el significado de los colores sin necesidad de explicación

### 3.2 Historia de Usuario - Usuario con Problemas de Conexión
**Como** usuario experimentando problemas de acceso  
**Quiero** ver qué componente específico está fallando  
**Para** entender si debo esperar o contactar soporte

**Criterios de Aceptación:**
- Puedo expandir el indicador para ver estado detallado
- Veo el estado individual de Frontend, Backend, Base de Datos
- Veo información de latencia o tiempo de respuesta
- Recibo mensajes claros sobre qué hacer en caso de falla
- Puedo actualizar manualmente el estado

### 3.3 Historia de Usuario - Administrador de Sistema
**Como** administrador de sistema  
**Quiero** diagnosticar rápidamente problemas del sistema  
**Para** resolver incidentes antes de que afecten a muchos usuarios

**Criterios de Aceptación:**
- Veo métricas técnicas detalladas (latencia, códigos de error)
- Puedo copiar información de diagnóstico para reportes
- Veo timestamp de última verificación
- Puedo forzar una verificación manual
- Recibo alertas de degradación antes de fallas completas

### 3.4 Historia de Usuario - Usuario Internacional
**Como** usuario de habla no inglesa  
**Quiero** ver el indicador en mi idioma nativo  
**Para** entender claramente el estado del sistema

**Criterios de Aceptación:**
- Todos los textos están en mi idioma configurado
- Formatos de fecha/hora respetan mi región
- Números y porcentajes usan formato local
- Puedo cambiar idioma fácilmente
- Los mensajes técnicos son claros y traducidos profesionalmente

### 3.5 Historia de Usuario - Usuario con Discapacidad Visual
**Como** usuario con daltonismo o baja visión  
**Quiero** entender el estado del sistema sin depender solo de colores  
**Para** tener la misma información que otros usuarios

**Criterios de Aceptación:**
- Los estados usan iconos además de colores
- El contraste de texto cumple WCAG 2.1 AA
- Puedo navegar el indicador con teclado
- Los lectores de pantalla anuncian el estado correctamente
- Los patrones visuales complementan los colores

---

## 4. Sistema RAG (Red-Amber-Green)

### 4.1 Definición de Estados

#### 🟢 Verde - Operacional (Operational)
**Criterios**:
- Todos los componentes responden correctamente
- Latencia dentro de umbrales normales (< 200ms backend, < 100ms DB)
- Sin errores en los últimos 5 minutos
- Disponibilidad > 99.9%

**Mensaje al Usuario**:
- ES: "Todos los sistemas operando normalmente"
- EN: "All systems operational"

**Acción Requerida**: Ninguna

#### 🟡 Ámbar - Degradado (Degraded)
**Criterios**:
- Componente responde pero con latencia elevada (200-500ms backend, 100-300ms DB)
- Errores intermitentes (< 5% tasa de error)
- Disponibilidad 95-99.9%
- Funcionalidad reducida pero sistema usable

**Mensaje al Usuario**:
- ES: "Sistema operacional con rendimiento reducido"
- EN: "System operational with reduced performance"

**Acción Requerida**: Monitoreo continuo, posible notificación a usuarios

#### 🔴 Rojo - Caído (Down)
**Criterios**:
- Componente no responde (timeout > 5s)
- Tasa de error > 5%
- Disponibilidad < 95%
- Funcionalidad crítica no disponible

**Mensaje al Usuario**:
- ES: "Sistema no disponible - Estamos trabajando en resolverlo"
- EN: "System unavailable - We're working to resolve this"

**Acción Requerida**: Incidente crítico, notificación inmediata a equipo técnico

#### ⚪ Gris - Desconocido (Unknown)
**Criterios**:
- No se puede determinar el estado (health check falló)
- Timeout en verificación de estado
- Error en el propio sistema de monitoreo

**Mensaje al Usuario**:
- ES: "No se puede determinar el estado del sistema"
- EN: "Unable to determine system status"

**Acción Requerida**: Verificación manual del sistema de monitoreo

### 4.2 Lógica de Agregación de Estado

**Estado General del Sistema** = Peor estado de todos los componentes

```
Prioridad de Estados (de mayor a menor severidad):
1. 🔴 Rojo (Down)
2. 🟡 Ámbar (Degraded)
3. ⚪ Gris (Unknown)
4. 🟢 Verde (Operational)
```

**Ejemplo**:
- Frontend: 🟢 Verde
- Backend: 🟡 Ámbar
- Database: 🟢 Verde
- **Estado General**: 🟡 Ámbar

### 4.3 Umbrales de Latencia

| Componente | Verde | Ámbar | Rojo |
|------------|-------|-------|------|
| Frontend | < 100ms | 100-300ms | > 300ms |
| Backend API | < 200ms | 200-500ms | > 500ms |
| Base de Datos | < 100ms | 100-300ms | > 300ms |
| Autenticación | < 300ms | 300-1000ms | > 1000ms |

---

## 5. Componentes a Monitorear

### 5.1 Frontend (React Application)

**Verificación**:
- Estado de la aplicación React (mounted, error boundary)
- Conectividad de red (navigator.onLine)
- Performance de renderizado
- Errores de JavaScript no capturados

**Health Check**:
```typescript
const checkFrontendHealth = (): HealthStatus => {
  // Verificar si React está montado correctamente
  const isReactHealthy = document.getElementById('root')?.children.length > 0;
  
  // Verificar conectividad de red
  const isOnline = navigator.onLine;
  
  // Verificar errores recientes
  const hasRecentErrors = window.errorCount > 0;
  
  if (!isReactHealthy || !isOnline) return 'down';
  if (hasRecentErrors) return 'degraded';
  return 'operational';
};
```

**Métricas**:
- Estado: Operational / Degraded / Down
- Latencia de renderizado: < 100ms
- Errores JS: 0 en últimos 5 minutos

### 5.2 Backend API

**Verificación**:
- Endpoint: `GET /api/health`
- Respuesta esperada: `{ "status": "ok", "timestamp": "ISO8601" }`
- Timeout: 5 segundos

**Health Check**:
```typescript
const checkBackendHealth = async (): Promise<HealthStatus> => {
  try {
    const startTime = Date.now();
    const response = await fetch('/api/health', { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    const latency = Date.now() - startTime;
    
    if (!response.ok) return 'down';
    if (latency > 500) return 'degraded';
    if (latency > 200) return 'degraded';
    return 'operational';
  } catch (error) {
    return 'down';
  }
};
```

**Métricas**:
- Estado: Operational / Degraded / Down
- Latencia: < 200ms (verde), 200-500ms (ámbar), > 500ms (rojo)
- Código de respuesta HTTP
- Timestamp de última verificación

### 5.3 Base de Datos (Supabase)

**Verificación**:
- Endpoint: `GET /api/health/database`
- Query simple: `SELECT 1`
- Timeout: 3 segundos

**Health Check**:
```typescript
const checkDatabaseHealth = async (): Promise<HealthStatus> => {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1)
      .timeout(3000);
    
    const latency = Date.now() - startTime;
    
    if (error) return 'down';
    if (latency > 300) return 'degraded';
    if (latency > 100) return 'degraded';
    return 'operational';
  } catch (error) {
    return 'down';
  }
};
```

**Métricas**:
- Estado: Operational / Degraded / Down
- Latencia de query: < 100ms (verde), 100-300ms (ámbar), > 300ms (rojo)
- Pool de conexiones disponibles
- Timestamp de última verificación

### 5.4 Servicio de Autenticación

**Verificación**:
- Endpoint: `GET /api/auth/health`
- Verificar disponibilidad de OIDC provider
- Timeout: 5 segundos

**Health Check**:
```typescript
const checkAuthHealth = async (): Promise<HealthStatus> => {
  try {
    const startTime = Date.now();
    const response = await fetch('/api/auth/health', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    const latency = Date.now() - startTime;
    
    if (!response.ok) return 'down';
    if (latency > 1000) return 'degraded';
    if (latency > 300) return 'degraded';
    return 'operational';
  } catch (error) {
    return 'down';
  }
};
```

**Métricas**:
- Estado: Operational / Degraded / Down
- Latencia: < 300ms (verde), 300-1000ms (ámbar), > 1000ms (rojo)
- Disponibilidad de OIDC provider
- Timestamp de última verificación

---

## 6. Diseño de UI/UX

### 6.1 Estado Colapsado (Vista Inicial)

#### Diseño Visual

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│                    LOGIN PAGE                            │
│                                                          │
│              [Email Input]                               │
│              [Password Input]                            │
│              [Login Button]                              │
│                                                          │
│                                              ┌────────┐  │
│                                              │  🟢    │  │
│                                              └────────┘  │
└─────────────────────────────────────────────────────────┘
                                                 ↑
                                          Health Indicator
                                          (40x40px)
```

**Especificaciones**:
- **Tamaño**: 40x40px (móvil), 48x48px (desktop)
- **Posición**: Fixed, bottom: 16px, right: 16px
- **Forma**: Círculo con borde sutil
- **Color de fondo**: Blanco/Gris claro (según tema)
- **Borde**: 2px sólido del color de estado
- **Sombra**: 0 2px 8px rgba(0,0,0,0.1)
- **Z-index**: 1000 (sobre contenido pero bajo modales)

**Estados Visuales**:

🟢 **Verde - Operacional**
```css
.health-indicator.operational {
  border-color: #10B981; /* Green-500 */
  background: linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%);
}

.health-indicator.operational::before {
  content: '✓';
  color: #10B981;
  font-size: 24px;
}
```

🟡 **Ámbar - Degradado**
```css
.health-indicator.degraded {
  border-color: #F59E0B; /* Amber-500 */
  background: linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%);
  animation: pulse-amber 2s infinite;
}

.health-indicator.degraded::before {
  content: '⚠';
  color: #F59E0B;
  font-size: 24px;
}

@keyframes pulse-amber {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

🔴 **Rojo - Caído**
```css
.health-indicator.down {
  border-color: #EF4444; /* Red-500 */
  background: linear-gradient(135deg, #FEE2E2 0%, #FEF2F2 100%);
  animation: pulse-red 1.5s infinite;
}

.health-indicator.down::before {
  content: '✕';
  color: #EF4444;
  font-size: 24px;
}

@keyframes pulse-red {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}
```

⚪ **Gris - Desconocido**
```css
.health-indicator.unknown {
  border-color: #9CA3AF; /* Gray-400 */
  background: linear-gradient(135deg, #F3F4F6 0%, #F9FAFB 100%);
}

.health-indicator.unknown::before {
  content: '?';
  color: #9CA3AF;
  font-size: 24px;
}
```

**Tooltip en Hover**:
```
┌────────────────────────────┐
│ Estado del Sistema         │
│ ────────────────────────── │
│ 🟢 Todos los sistemas      │
│    operando normalmente    │
│                            │
│ Clic para ver detalles     │
└────────────────────────────┘
```

### 6.2 Estado Expandido (Vista Detallada)

#### Diseño del Popup

```
┌──────────────────────────────────────────────────┐
│  Estado del Sistema                        [✕]   │
├──────────────────────────────────────────────────┤
│                                                   │
│  Estado General: 🟢 Operacional                  │
│  Última actualización: Hace 30 segundos          │
│  [🔄 Actualizar]                                 │
│                                                   │
├──────────────────────────────────────────────────┤
│                                                   │
│  Componentes:                                    │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ 🟢 Frontend                                │ │
│  │    Estado: Operacional                     │ │
│  │    Latencia: 45ms                          │ │
│  │    Última verificación: 10:30:45           │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ 🟢 Backend API                             │ │
│  │    Estado: Operacional                     │ │
│  │    Latencia: 125ms                         │ │
│  │    Última verificación: 10:30:45           │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ 🟢 Base de Datos                           │ │
│  │    Estado: Operacional                     │ │
│  │    Latencia: 78ms                          │ │
│  │    Última verificación: 10:30:45           │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ 🟢 Autenticación                           │ │
│  │    Estado: Operacional                     │ │
│  │    Latencia: 234ms                         │ │
│  │    Última verificación: 10:30:45           │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
├──────────────────────────────────────────────────┤
│  ℹ️ ¿Experimentas problemas?                     │
│  [Contactar Soporte] [Ver Página de Estado]     │
└──────────────────────────────────────────────────┘
```

**Especificaciones del Popup**:
- **Tamaño**: 400px ancho × auto altura (máx 600px)
- **Posición**: Anclado a la esquina inferior derecha, con margen de 16px
- **Animación de entrada**: Slide-up + fade-in (300ms ease-out)
- **Fondo**: Blanco (light mode) / Gris oscuro (dark mode)
- **Sombra**: 0 10px 40px rgba(0,0,0,0.2)
- **Borde**: 1px sólido gris claro
- **Border-radius**: 12px

**Responsive - Móvil**:
```
En pantallas < 640px:
- Ancho: 100vw - 32px
- Altura máxima: 70vh
- Scroll vertical si excede altura
- Botones apilados verticalmente
```

### 6.3 Card de Componente Individual

```css
.component-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-left: 4px solid var(--status-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.component-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

.component-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.component-icon {
  font-size: 24px;
}

.component-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.component-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  font-size: 14px;
  color: #6B7280;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9CA3AF;
}

.detail-value {
  font-weight: 500;
  color: #374151;
}
```

### 6.4 Paleta de Colores RAG

**Verde - Operacional**
```css
:root {
  --status-operational-bg: #ECFDF5;
  --status-operational-border: #10B981;
  --status-operational-text: #065F46;
  --status-operational-icon: #10B981;
}
```

**Ámbar - Degradado**
```css
:root {
  --status-degraded-bg: #FFFBEB;
  --status-degraded-border: #F59E0B;
  --status-degraded-text: #92400E;
  --status-degraded-icon: #F59E0B;
}
```

**Rojo - Caído**
```css
:root {
  --status-down-bg: #FEF2F2;
  --status-down-border: #EF4444;
  --status-down-text: #991B1B;
  --status-down-icon: #EF4444;
}
```

**Gris - Desconocido**
```css
:root {
  --status-unknown-bg: #F9FAFB;
  --status-unknown-border: #9CA3AF;
  --status-unknown-text: #4B5563;
  --status-unknown-icon: #9CA3AF;
}
```

### 6.5 Iconografía

**Iconos de Estado** (usando Lucide React):
- 🟢 Operacional: `<CheckCircle2 />`
- 🟡 Degradado: `<AlertTriangle />`
- 🔴 Caído: `<XCircle />`
- ⚪ Desconocido: `<HelpCircle />`

**Iconos de Componentes**:
- Frontend: `<Monitor />` o `<Globe />`
- Backend: `<Server />`
- Base de Datos: `<Database />`
- Autenticación: `<Lock />` o `<Key />`
- Red: `<Wifi />` o `<Network />`

**Iconos de Acción**:
- Actualizar: `<RefreshCw />`
- Cerrar: `<X />`
- Información: `<Info />`
- Soporte: `<MessageCircle />` o `<LifeBuoy />`
- Historial: `<Clock />`

### 6.6 Animaciones

**Fade In (Entrada del Popup)**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.health-popup {
  animation: fadeInUp 0.3s ease-out;
}
```

**Pulse (Estado Degradado/Caído)**
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.health-indicator.degraded,
.health-indicator.down {
  animation: pulse 2s infinite;
}
```

**Spin (Actualización en Progreso)**
```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.refresh-icon.loading {
  animation: spin 1s linear infinite;
}
```

---

## 7. Internacionalización (i18n)

### 7.1 Idiomas Soportados (Fase 1)

1. **Español (es-ES, es-419)** - Español de España y Latinoamérica
2. **Inglés (en-US, en-GB)** - Inglés Americano y Británico
3. **Portugués (pt-BR)** - Portugués de Brasil (preparado para futuro)

### 7.2 Estructura de Traducciones

```typescript
// src/i18n/locales/es-ES.json
{
  "healthStatus": {
    "title": "Estado del Sistema",
    "lastUpdated": "Última actualización",
    "timeAgo": {
      "seconds": "Hace {{count}} segundos",
      "minutes": "Hace {{count}} minutos",
      "hours": "Hace {{count}} horas"
    },
    "refresh": "Actualizar",
    "close": "Cerrar",
    "overallStatus": "Estado General",
    "components": "Componentes",
    
    "status": {
      "operational": "Operacional",
      "degraded": "Degradado",
      "down": "Caído",
      "unknown": "Desconocido"
    },
    
    "messages": {
      "operational": "Todos los sistemas operando normalmente",
      "degraded": "Sistema operacional con rendimiento reducido",
      "down": "Sistema no disponible - Estamos trabajando en resolverlo",
      "unknown": "No se puede determinar el estado del sistema"
    },
    
    "components": {
      "frontend": "Frontend",
      "backend": "Backend API",
      "database": "Base de Datos",
      "auth": "Autenticación"
    },
    
    "metrics": {
      "status": "Estado",
      "latency": "Latencia",
      "lastCheck": "Última verificación",
      "ms": "ms"
    },
    
    "help": {
      "title": "¿Experimentas problemas?",
      "contactSupport": "Contactar Soporte",
      "viewStatusPage": "Ver Página de Estado"
    },
    
    "tooltip": {
      "clickForDetails": "Clic para ver detalles"
    }
  }
}
```

```typescript
// src/i18n/locales/en-US.json
{
  "healthStatus": {
    "title": "System Status",
    "lastUpdated": "Last updated",
    "timeAgo": {
      "seconds": "{{count}} seconds ago",
      "minutes": "{{count}} minutes ago",
      "hours": "{{count}} hours ago"
    },
    "refresh": "Refresh",
    "close": "Close",
    "overallStatus": "Overall Status",
    "components": "Components",
    
    "status": {
      "operational": "Operational",
      "degraded": "Degraded",
      "down": "Down",
      "unknown": "Unknown"
    },
    
    "messages": {
      "operational": "All systems operational",
      "degraded": "System operational with reduced performance",
      "down": "System unavailable - We're working to resolve this",
      "unknown": "Unable to determine system status"
    },
    
    "components": {
      "frontend": "Frontend",
      "backend": "Backend API",
      "database": "Database",
      "auth": "Authentication"
    },
    
    "metrics": {
      "status": "Status",
      "latency": "Latency",
      "lastCheck": "Last check",
      "ms": "ms"
    },
    
    "help": {
      "title": "Experiencing issues?",
      "contactSupport": "Contact Support",
      "viewStatusPage": "View Status Page"
    },
    
    "tooltip": {
      "clickForDetails": "Click for details"
    }
  }
}
```

### 7.3 Localización de Formatos

#### Fecha y Hora
```typescript
// src/lib/i18n-utils.ts

export const formatDateTime = (
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options
  }).format(date);
};

// Ejemplos:
// es-ES: "2 feb 2026, 10:30:45"
// en-US: "Feb 2, 2026, 10:30:45 AM"
// pt-BR: "2 de fev. de 2026, 10:30:45"
```

#### Tiempo Relativo
```typescript
export const formatTimeAgo = (
  date: Date,
  locale: string,
  t: TFunction
): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) {
    return t('healthStatus.timeAgo.seconds', { count: seconds });
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return t('healthStatus.timeAgo.minutes', { count: minutes });
  }
  
  const hours = Math.floor(minutes / 60);
  return t('healthStatus.timeAgo.hours', { count: hours });
};
```

#### Números y Latencia
```typescript
export const formatLatency = (
  latency: number,
  locale: string
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(latency);
};

// Ejemplos:
// es-ES: "1.234 ms"
// en-US: "1,234 ms"
```

### 7.4 Detección de Idioma

**Prioridad de Detección**:
1. Preferencia guardada en localStorage (`user_locale`)
2. Configuración del navegador (`navigator.language`)
3. Idioma por defecto (`es-ES`)

```typescript
export const detectUserLocale = (): string => {
  // 1. Check localStorage
  const savedLocale = localStorage.getItem('user_locale');
  if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
    return savedLocale;
  }
  
  // 2. Check browser language
  const browserLang = navigator.language;
  if (SUPPORTED_LOCALES.includes(browserLang)) {
    return browserLang;
  }
  
  // 3. Check browser language without region (es-MX -> es)
  const langWithoutRegion = browserLang.split('-')[0];
  const matchingLocale = SUPPORTED_LOCALES.find(
    locale => locale.startsWith(langWithoutRegion)
  );
  if (matchingLocale) {
    return matchingLocale;
  }
  
  // 4. Default to Spanish
  return 'es-ES';
};
```

### 7.5 Regionalización

#### Español Latinoamericano vs. España
```json
{
  "es-ES": {
    "healthStatus.help.contactSupport": "Contactar con Soporte"
  },
  "es-419": {
    "healthStatus.help.contactSupport": "Contactar Soporte"
  }
}
```

#### Inglés Americano vs. Británico
```json
{
  "en-US": {
    "healthStatus.components.frontend": "Frontend"
  },
  "en-GB": {
    "healthStatus.components.frontend": "Front-end"
  }
}
```

---

## 8. Arquitectura Técnica

### 8.1 Estructura de Componentes

```
src/components/health-status/
  ├── HealthStatusIndicator.tsx       # Componente principal
  ├── HealthStatusPopup.tsx           # Popup expandido
  ├── ComponentCard.tsx               # Card de componente individual
  ├── StatusBadge.tsx                 # Badge de estado RAG
  └── RefreshButton.tsx               # Botón de actualización

src/hooks/
  ├── useHealthStatus.ts              # Hook principal de health check
  ├── useHealthCheck.ts               # Hook para verificación individual
  └── useHealthHistory.ts             # Hook para historial (opcional)

src/lib/
  ├── health-check.ts                 # Lógica de health checks
  ├── health-aggregation.ts           # Lógica de agregación de estado
  └── health-utils.ts                 # Utilidades (formateo, colores, etc.)

src/types/
  └── health-status.ts                # Tipos TypeScript

src/i18n/
  ├── locales/
  │   ├── es-ES.json
  │   ├── en-US.json
  │   └── pt-BR.json
  └── i18n-utils.ts                   # Utilidades de i18n
```

### 8.2 Tipos TypeScript

```typescript
// src/types/health-status.ts

export type HealthStatus = 'operational' | 'degraded' | 'down' | 'unknown';

export interface ComponentHealth {
  name: string;
  status: HealthStatus;
  latency: number | null;
  lastCheck: Date;
  message?: string;
  details?: Record<string, any>;
}

export interface SystemHealth {
  overallStatus: HealthStatus;
  components: {
    frontend: ComponentHealth;
    backend: ComponentHealth;
    database: ComponentHealth;
    auth: ComponentHealth;
  };
  lastUpdated: Date;
  isRefreshing: boolean;
}

export interface HealthCheckResult {
  status: HealthStatus;
  latency: number | null;
  timestamp: Date;
  error?: Error;
}

export interface HealthThresholds {
  operational: number;
  degraded: number;
}

export const LATENCY_THRESHOLDS: Record<string, HealthThresholds> = {
  frontend: { operational: 100, degraded: 300 },
  backend: { operational: 200, degraded: 500 },
  database: { operational: 100, degraded: 300 },
  auth: { operational: 300, degraded: 1000 }
};
```

### 8.3 Hook Principal: useHealthStatus

```typescript
// src/hooks/useHealthStatus.ts

import { useState, useEffect, useCallback } from 'react';
import { SystemHealth, HealthStatus } from '@/types/health-status';
import { 
  checkFrontendHealth, 
  checkBackendHealth, 
  checkDatabaseHealth, 
  checkAuthHealth 
} from '@/lib/health-check';
import { aggregateSystemStatus } from '@/lib/health-aggregation';

const REFRESH_INTERVAL = 30000; // 30 segundos

export function useHealthStatus() {
  const [health, setHealth] = useState<SystemHealth>({
    overallStatus: 'unknown',
    components: {
      frontend: {
        name: 'Frontend',
        status: 'unknown',
        latency: null,
        lastCheck: new Date()
      },
      backend: {
        name: 'Backend API',
        status: 'unknown',
        latency: null,
        lastCheck: new Date()
      },
      database: {
        name: 'Base de Datos',
        status: 'unknown',
        latency: null,
        lastCheck: new Date()
      },
      auth: {
        name: 'Autenticación',
        status: 'unknown',
        latency: null,
        lastCheck: new Date()
      }
    },
    lastUpdated: new Date(),
    isRefreshing: false
  });

  const checkAllComponents = useCallback(async () => {
    setHealth(prev => ({ ...prev, isRefreshing: true }));

    try {
      const [frontendResult, backendResult, databaseResult, authResult] = 
        await Promise.all([
          checkFrontendHealth(),
          checkBackendHealth(),
          checkDatabaseHealth(),
          checkAuthHealth()
        ]);

      const newHealth: SystemHealth = {
        overallStatus: aggregateSystemStatus([
          frontendResult.status,
          backendResult.status,
          databaseResult.status,
          authResult.status
        ]),
        components: {
          frontend: {
            name: 'Frontend',
            status: frontendResult.status,
            latency: frontendResult.latency,
            lastCheck: frontendResult.timestamp
          },
          backend: {
            name: 'Backend API',
            status: backendResult.status,
            latency: backendResult.latency,
            lastCheck: backendResult.timestamp
          },
          database: {
            name: 'Base de Datos',
            status: databaseResult.status,
            latency: databaseResult.latency,
            lastCheck: databaseResult.timestamp
          },
          auth: {
            name: 'Autenticación',
            status: authResult.status,
            latency: authResult.latency,
            lastCheck: authResult.timestamp
          }
        },
        lastUpdated: new Date(),
        isRefreshing: false
      };

      setHealth(newHealth);
    } catch (error) {
      console.error('Error checking system health:', error);
      setHealth(prev => ({ ...prev, isRefreshing: false }));
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    checkAllComponents();
    const interval = setInterval(checkAllComponents, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [checkAllComponents]);

  return {
    health,
    refresh: checkAllComponents,
    isRefreshing: health.isRefreshing
  };
}
```

### 8.4 Lógica de Health Checks

```typescript
// src/lib/health-check.ts

import { HealthCheckResult, HealthStatus, LATENCY_THRESHOLDS } from '@/types/health-status';

export async function checkFrontendHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Check if React is mounted
    const isReactHealthy = document.getElementById('root')?.children.length > 0;
    
    // Check network connectivity
    const isOnline = navigator.onLine;
    
    // Check for recent errors
    const hasRecentErrors = (window as any).errorCount > 0;
    
    const latency = Date.now() - startTime;
    
    let status: HealthStatus;
    if (!isReactHealthy || !isOnline) {
      status = 'down';
    } else if (hasRecentErrors) {
      status = 'degraded';
    } else if (latency > LATENCY_THRESHOLDS.frontend.degraded) {
      status = 'degraded';
    } else if (latency > LATENCY_THRESHOLDS.frontend.operational) {
      status = 'degraded';
    } else {
      status = 'operational';
    }
    
    return {
      status,
      latency,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      status: 'down',
      latency: null,
      timestamp: new Date(),
      error: error as Error
    };
  }
}

export async function checkBackendHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('/api/health', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    let status: HealthStatus;
    if (!response.ok) {
      status = 'down';
    } else if (latency > LATENCY_THRESHOLDS.backend.degraded) {
      status = 'degraded';
    } else if (latency > LATENCY_THRESHOLDS.backend.operational) {
      status = 'degraded';
    } else {
      status = 'operational';
    }
    
    return {
      status,
      latency,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      status: 'down',
      latency: null,
      timestamp: new Date(),
      error: error as Error
    };
  }
}

export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('/api/health/database', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    let status: HealthStatus;
    if (!response.ok) {
      status = 'down';
    } else if (latency > LATENCY_THRESHOLDS.database.degraded) {
      status = 'degraded';
    } else if (latency > LATENCY_THRESHOLDS.database.operational) {
      status = 'degraded';
    } else {
      status = 'operational';
    }
    
    return {
      status,
      latency,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      status: 'down',
      latency: null,
      timestamp: new Date(),
      error: error as Error
    };
  }
}

export async function checkAuthHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('/api/auth/health', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    let status: HealthStatus;
    if (!response.ok) {
      status = 'down';
    } else if (latency > LATENCY_THRESHOLDS.auth.degraded) {
      status = 'degraded';
    } else if (latency > LATENCY_THRESHOLDS.auth.operational) {
      status = 'degraded';
    } else {
      status = 'operational';
    }
    
    return {
      status,
      latency,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      status: 'down',
      latency: null,
      timestamp: new Date(),
      error: error as Error
    };
  }
}
```

### 8.5 Lógica de Agregación de Estado

```typescript
// src/lib/health-aggregation.ts

import { HealthStatus } from '@/types/health-status';

const STATUS_PRIORITY: Record<HealthStatus, number> = {
  'down': 4,
  'degraded': 3,
  'unknown': 2,
  'operational': 1
};

export function aggregateSystemStatus(statuses: HealthStatus[]): HealthStatus {
  // Return the worst status (highest priority)
  let worstStatus: HealthStatus = 'operational';
  let highestPriority = STATUS_PRIORITY['operational'];
  
  for (const status of statuses) {
    const priority = STATUS_PRIORITY[status];
    if (priority > highestPriority) {
      worstStatus = status;
      highestPriority = priority;
    }
  }
  
  return worstStatus;
}

export function getStatusColor(status: HealthStatus): string {
  const colors: Record<HealthStatus, string> = {
    'operational': '#10B981',  // Green-500
    'degraded': '#F59E0B',     // Amber-500
    'down': '#EF4444',         // Red-500
    'unknown': '#9CA3AF'       // Gray-400
  };
  
  return colors[status];
}

export function getStatusIcon(status: HealthStatus): string {
  const icons: Record<HealthStatus, string> = {
    'operational': '✓',
    'degraded': '⚠',
    'down': '✕',
    'unknown': '?'
  };
  
  return icons[status];
}
```

---

## 9. Requisitos de Backend

### 9.1 Endpoint: GET /api/health

**Propósito**: Verificar estado general del backend

**Respuesta Exitosa** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2026-02-02T22:30:45.123Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

**Respuesta de Error** (503 Service Unavailable):
```json
{
  "status": "error",
  "timestamp": "2026-02-02T22:30:45.123Z",
  "message": "Service temporarily unavailable"
}
```

**Implementación Backend**:
```python
# backend/routers/health.py

from fastapi import APIRouter, HTTPException
from datetime import datetime
import time

router = APIRouter()

start_time = time.time()

@router.get("/health")
async def health_check():
    """
    Health check endpoint for system monitoring
    """
    try:
        return {
            "status": "ok",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "version": "1.0.0",
            "uptime": int(time.time() - start_time)
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "message": str(e)
            }
        )
```

### 9.2 Endpoint: GET /api/health/database

**Propósito**: Verificar conectividad y rendimiento de la base de datos

**Respuesta Exitosa** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2026-02-02T22:30:45.123Z",
  "latency": 45,
  "pool": {
    "active": 2,
    "idle": 8,
    "total": 10
  }
}
```

**Respuesta de Error** (503 Service Unavailable):
```json
{
  "status": "error",
  "timestamp": "2026-02-02T22:30:45.123Z",
  "message": "Database connection failed",
  "error": "Connection timeout"
}
```

**Implementación Backend**:
```python
# backend/routers/health.py

from core.database import get_db
import time

@router.get("/health/database")
async def database_health_check():
    """
    Database health check endpoint
    """
    try:
        start_time = time.time()
        
        # Simple query to test database connectivity
        async with get_db() as db:
            result = await db.execute("SELECT 1")
            await result.fetchone()
        
        latency = int((time.time() - start_time) * 1000)
        
        return {
            "status": "ok",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "latency": latency,
            "pool": {
                "active": 2,  # Get from connection pool
                "idle": 8,
                "total": 10
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "message": "Database connection failed",
                "error": str(e)
            }
        )
```

### 9.3 Endpoint: GET /api/auth/health

**Propósito**: Verificar disponibilidad del servicio de autenticación

**Respuesta Exitosa** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2026-02-02T22:30:45.123Z",
  "provider": "oidc",
  "issuer": "https://auth.holocheck.app"
}
```

**Implementación Backend**:
```python
# backend/routers/health.py

import httpx
from core.config import settings

@router.get("/auth/health")
async def auth_health_check():
    """
    Authentication service health check
    """
    try:
        # Check OIDC provider availability
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{settings.oidc_issuer_url}/.well-known/openid-configuration"
            )
            response.raise_for_status()
        
        return {
            "status": "ok",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "provider": "oidc",
            "issuer": settings.oidc_issuer_url
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "message": "Authentication service unavailable",
                "error": str(e)
            }
        )
```

---

## 10. Accesibilidad (WCAG 2.1 AA)

### 10.1 Contraste de Colores

**Requisito**: Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande

**Verificación de Colores RAG**:

| Estado | Color de Fondo | Color de Texto | Ratio de Contraste | Cumple |
|--------|----------------|----------------|-------------------|--------|
| Verde | #ECFDF5 | #065F46 | 8.2:1 | ✅ AAA |
| Ámbar | #FFFBEB | #92400E | 7.5:1 | ✅ AAA |
| Rojo | #FEF2F2 | #991B1B | 8.9:1 | ✅ AAA |
| Gris | #F9FAFB | #4B5563 | 7.1:1 | ✅ AAA |

### 10.2 Navegación por Teclado

**Teclas Soportadas**:
- `Tab`: Navegar al indicador
- `Enter` / `Space`: Abrir/cerrar popup
- `Escape`: Cerrar popup
- `Tab` (dentro del popup): Navegar entre elementos
- `Shift + Tab`: Navegación inversa

**Implementación**:
```typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      togglePopup();
      break;
    case 'Escape':
      if (isOpen) {
        event.preventDefault();
        closePopup();
      }
      break;
  }
};
```

### 10.3 Atributos ARIA

```tsx
<button
  className="health-indicator"
  onClick={togglePopup}
  onKeyDown={handleKeyDown}
  aria-label={t('healthStatus.title')}
  aria-expanded={isOpen}
  aria-haspopup="dialog"
  role="button"
  tabIndex={0}
>
  <span 
    className="status-icon"
    aria-label={t(`healthStatus.status.${overallStatus}`)}
    role="img"
  >
    {getStatusIcon(overallStatus)}
  </span>
</button>

<div
  className="health-popup"
  role="dialog"
  aria-modal="true"
  aria-labelledby="health-popup-title"
  aria-describedby="health-popup-description"
>
  <h2 id="health-popup-title">
    {t('healthStatus.title')}
  </h2>
  
  <div id="health-popup-description">
    {t(`healthStatus.messages.${overallStatus}`)}
  </div>
</div>
```

### 10.4 Soporte para Lectores de Pantalla

**Anuncios de Estado**:
```tsx
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {t('healthStatus.overallStatus')}: {t(`healthStatus.status.${overallStatus}`)}
</div>
```

**Clase sr-only (Screen Reader Only)**:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 10.5 Indicadores No Dependientes de Color

**Uso de Iconos**:
- ✅ Verde: Checkmark (✓)
- ⚠️ Ámbar: Warning triangle (⚠)
- ❌ Rojo: X mark (✕)
- ❓ Gris: Question mark (?)

**Patrones Visuales**:
- Borde izquierdo grueso en cards de componentes
- Animación de pulso para estados degradados/caídos
- Iconos descriptivos para cada componente

### 10.6 Prefers Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .health-indicator,
  .health-popup,
  .component-card {
    animation: none !important;
    transition: none !important;
  }
  
  .refresh-icon.loading {
    animation: none !important;
  }
}
```

---

## 11. Rendimiento y Optimización

### 11.1 Estrategia de Caché

**Frontend Caching**:
```typescript
const CACHE_DURATION = 30000; // 30 segundos
const cache = new Map<string, { data: any; timestamp: number }>();

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}
```

### 11.2 Carga Asíncrona

**Lazy Loading del Componente**:
```typescript
// App.tsx
const HealthStatusIndicator = lazy(() => 
  import('@/components/health-status/HealthStatusIndicator')
);

// En el componente de Login
<Suspense fallback={null}>
  <HealthStatusIndicator />
</Suspense>
```

### 11.3 Debouncing de Actualizaciones

```typescript
import { debounce } from 'lodash';

const debouncedRefresh = debounce(
  () => checkAllComponents(),
  1000,
  { leading: true, trailing: false }
);
```

### 11.4 Optimización de Requests

**Request Batching**:
```typescript
// En lugar de 4 requests individuales, hacer 1 request agregado
const checkAllComponentsOptimized = async () => {
  const response = await fetch('/api/health/all');
  const data = await response.json();
  
  return {
    frontend: data.frontend,
    backend: data.backend,
    database: data.database,
    auth: data.auth
  };
};
```

### 11.5 Métricas de Rendimiento

**Targets**:
- Tiempo de carga del indicador: < 500ms
- Tiempo de apertura del popup: < 300ms
- Tiempo de health check completo: < 2s
- Impacto en First Contentful Paint: < 100ms
- Impacto en Time to Interactive: < 200ms

**Monitoreo**:
```typescript
const measurePerformance = (label: string) => {
  const startMark = `${label}-start`;
  const endMark = `${label}-end`;
  const measureName = `${label}-duration`;
  
  performance.mark(startMark);
  
  return () => {
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    console.log(`${label}: ${measure.duration.toFixed(2)}ms`);
    
    // Cleanup
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
  };
};

// Uso
const endMeasure = measurePerformance('health-check');
await checkAllComponents();
endMeasure();
```

---

## 12. Testing

### 12.1 Unit Tests

```typescript
// __tests__/health-aggregation.test.ts

import { aggregateSystemStatus } from '@/lib/health-aggregation';

describe('aggregateSystemStatus', () => {
  it('should return operational when all components are operational', () => {
    const statuses = ['operational', 'operational', 'operational', 'operational'];
    expect(aggregateSystemStatus(statuses)).toBe('operational');
  });
  
  it('should return degraded when at least one component is degraded', () => {
    const statuses = ['operational', 'degraded', 'operational', 'operational'];
    expect(aggregateSystemStatus(statuses)).toBe('degraded');
  });
  
  it('should return down when at least one component is down', () => {
    const statuses = ['operational', 'degraded', 'down', 'operational'];
    expect(aggregateSystemStatus(statuses)).toBe('down');
  });
  
  it('should prioritize down over degraded', () => {
    const statuses = ['degraded', 'down', 'operational', 'degraded'];
    expect(aggregateSystemStatus(statuses)).toBe('down');
  });
});
```

### 12.2 Integration Tests

```typescript
// __tests__/health-check.test.ts

import { checkBackendHealth } from '@/lib/health-check';

describe('checkBackendHealth', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });
  
  it('should return operational status for successful health check', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ status: 'ok' }), {
      status: 200
    });
    
    const result = await checkBackendHealth();
    
    expect(result.status).toBe('operational');
    expect(result.latency).toBeLessThan(200);
  });
  
  it('should return degraded status for slow response', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ status: 'ok' }),
      { status: 200 },
      { delay: 400 }
    );
    
    const result = await checkBackendHealth();
    
    expect(result.status).toBe('degraded');
    expect(result.latency).toBeGreaterThan(200);
  });
  
  it('should return down status for failed request', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'));
    
    const result = await checkBackendHealth();
    
    expect(result.status).toBe('down');
    expect(result.latency).toBeNull();
    expect(result.error).toBeDefined();
  });
});
```

### 12.3 E2E Tests

```typescript
// e2e/health-status.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Health Status Indicator', () => {
  test('should display health indicator on login page', async ({ page }) => {
    await page.goto('/login');
    
    const indicator = page.locator('.health-indicator');
    await expect(indicator).toBeVisible();
  });
  
  test('should open popup on click', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('.health-indicator');
    
    const popup = page.locator('.health-popup');
    await expect(popup).toBeVisible();
  });
  
  test('should display all components in popup', async ({ page }) => {
    await page.goto('/login');
    await page.click('.health-indicator');
    
    await expect(page.locator('text=Frontend')).toBeVisible();
    await expect(page.locator('text=Backend API')).toBeVisible();
    await expect(page.locator('text=Base de Datos')).toBeVisible();
    await expect(page.locator('text=Autenticación')).toBeVisible();
  });
  
  test('should close popup on escape key', async ({ page }) => {
    await page.goto('/login');
    await page.click('.health-indicator');
    
    await page.keyboard.press('Escape');
    
    const popup = page.locator('.health-popup');
    await expect(popup).not.toBeVisible();
  });
  
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login');
    
    await page.keyboard.press('Tab'); // Navigate to indicator
    await page.keyboard.press('Enter'); // Open popup
    
    const popup = page.locator('.health-popup');
    await expect(popup).toBeVisible();
  });
});
```

### 12.4 Accessibility Tests

```typescript
// __tests__/health-status-a11y.test.ts

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import HealthStatusIndicator from '@/components/health-status/HealthStatusIndicator';

expect.extend(toHaveNoViolations);

describe('HealthStatusIndicator Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<HealthStatusIndicator />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
  
  it('should have proper ARIA attributes', () => {
    const { getByRole } = render(<HealthStatusIndicator />);
    
    const button = getByRole('button', { name: /estado del sistema/i });
    expect(button).toHaveAttribute('aria-expanded');
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
  });
});
```

---

## 13. Plan de Implementación

### 13.1 Fase 1: Fundamentos (Semana 1)

**Objetivo**: Implementar funcionalidad básica del indicador

**Tareas**:
- [ ] Crear estructura de componentes
- [ ] Implementar tipos TypeScript
- [ ] Desarrollar lógica de health checks (frontend, backend, database)
- [ ] Implementar hook useHealthStatus
- [ ] Crear componente HealthStatusIndicator (estado colapsado)
- [ ] Implementar backend endpoints (/api/health, /api/health/database)
- [ ] Agregar indicador a página de login

**Criterios de Aceptación**:
- Indicador visible en esquina inferior derecha de login
- Colores RAG funcionan correctamente
- Health checks ejecutan cada 30 segundos
- Backend endpoints responden correctamente

### 13.2 Fase 2: Popup Expandido (Semana 2)

**Objetivo**: Implementar vista detallada del estado

**Tareas**:
- [ ] Crear componente HealthStatusPopup
- [ ] Implementar ComponentCard para cada servicio
- [ ] Agregar botón de actualización manual
- [ ] Implementar animaciones de apertura/cierre
- [ ] Agregar formateo de latencia y timestamps
- [ ] Implementar cierre con Escape y clic fuera

**Criterios de Aceptación**:
- Popup se abre/cierra correctamente
- Muestra estado detallado de todos los componentes
- Actualización manual funciona
- Animaciones son fluidas

### 13.3 Fase 3: Internacionalización (Semana 3)

**Objetivo**: Agregar soporte completo de i18n

**Tareas**:
- [ ] Configurar react-i18next
- [ ] Crear archivos de traducción (es-ES, en-US)
- [ ] Implementar detección automática de idioma
- [ ] Localizar formatos de fecha/hora
- [ ] Localizar formatos de números
- [ ] Agregar selector de idioma (opcional)
- [ ] Testing de traducciones

**Criterios de Aceptación**:
- Todos los textos están traducidos
- Detección de idioma funciona correctamente
- Formatos de fecha/hora respetan locale
- Cambio de idioma actualiza toda la UI

### 13.4 Fase 4: Accesibilidad y Optimización (Semana 4)

**Objetivo**: Asegurar accesibilidad y rendimiento

**Tareas**:
- [ ] Implementar navegación por teclado completa
- [ ] Agregar atributos ARIA apropiados
- [ ] Verificar contraste de colores (WCAG 2.1 AA)
- [ ] Testing con lectores de pantalla
- [ ] Implementar caché de health checks
- [ ] Optimizar rendimiento (lazy loading, debouncing)
- [ ] Testing de accesibilidad automatizado
- [ ] Testing E2E completo

**Criterios de Aceptación**:
- Cumple WCAG 2.1 AA
- Navegable completamente por teclado
- Compatible con lectores de pantalla
- Tiempo de carga < 500ms
- Impacto en login page < 100ms

---

## 14. Métricas de Éxito

### 14.1 Métricas Técnicas

| Métrica | Target | Medición |
|---------|--------|----------|
| Tiempo de carga del indicador | < 500ms | Performance API |
| Tiempo de health check completo | < 2s | Custom timing |
| Precisión de detección | > 99% | Comparación con monitoreo real |
| Tasa de falsos positivos | < 1% | Análisis de logs |
| Impacto en First Contentful Paint | < 100ms | Lighthouse |
| Impacto en Time to Interactive | < 200ms | Lighthouse |

### 14.2 Métricas de Usabilidad

| Métrica | Target | Medición |
|---------|--------|----------|
| Tasa de interacción | > 10% | Analytics |
| Tiempo promedio en popup | 5-15s | Analytics |
| Satisfacción de usuario | > 4.5/5 | Encuesta |
| Comprensión de estados RAG | > 90% | Encuesta |

### 14.3 Métricas de Accesibilidad

| Métrica | Target | Medición |
|---------|--------|----------|
| Score de Lighthouse Accessibility | > 95 | Lighthouse |
| Violaciones de axe | 0 | jest-axe |
| Contraste de colores | WCAG 2.1 AA | Manual/Automated |
| Navegación por teclado | 100% funcional | Manual testing |

---

## 15. Riesgos y Mitigaciones

### 15.1 Riesgo: Health checks impactan rendimiento de login

**Probabilidad**: Media  
**Impacto**: Alto  
**Mitigación**:
- Cargar indicador de forma asíncrona (lazy loading)
- No bloquear el proceso de login
- Implementar timeout agresivo en health checks (5s máximo)
- Caché de resultados por 30 segundos

### 15.2 Riesgo: Falsos positivos/negativos en detección de estado

**Probabilidad**: Media  
**Impacto**: Medio  
**Mitigación**:
- Umbrales de latencia bien calibrados
- Múltiples intentos antes de marcar como "down"
- Logging detallado para análisis post-mortem
- Monitoreo paralelo con herramientas externas

### 15.3 Riesgo: Indicador confunde a usuarios

**Probabilidad**: Baja  
**Impacto**: Medio  
**Mitigación**:
- Mensajes claros y accionables
- Tooltip explicativo en hover
- Documentación de ayuda accesible
- Testing de usabilidad con usuarios reales

### 15.4 Riesgo: Problemas de internacionalización

**Probabilidad**: Media  
**Impacto**: Medio  
**Mitigación**:
- Usar biblioteca probada (react-i18next)
- Revisión de traducciones por hablantes nativos
- Testing exhaustivo en diferentes locales
- Fallback a inglés si falla traducción

### 15.5 Riesgo: Accesibilidad insuficiente

**Probabilidad**: Baja  
**Impacto**: Alto  
**Mitigación**:
- Testing automatizado con jest-axe
- Testing manual con lectores de pantalla
- Revisión por expertos en accesibilidad
- Seguir guías WCAG 2.1 estrictamente

---

## 16. Preguntas Abiertas

### 16.1 Diseño
- ¿Deberíamos agregar animación de "latido" al indicador cuando hay problemas?
- ¿Incluir gráfico de historial de estado en el popup?
- ¿Permitir minimizar el popup sin cerrarlo completamente?

### 16.2 Funcionalidad
- ¿Implementar notificaciones push cuando el estado cambia?
- ¿Agregar opción de suscripción a alertas por email?
- ¿Incluir link a página de estado pública (status page)?

### 16.3 Datos
- ¿Guardar historial de health checks en base de datos?
- ¿Implementar dashboard de monitoreo para administradores?
- ¿Agregar métricas de uso del indicador (analytics)?

### 16.4 Internacionalización
- ¿Agregar más idiomas además de español e inglés?
- ¿Permitir personalización de mensajes por organización?
- ¿Implementar traducción automática de mensajes técnicos?

---

## 17. Anexos

### 17.1 Ejemplo de Implementación Completa

```tsx
// src/components/health-status/HealthStatusIndicator.tsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHealthStatus } from '@/hooks/useHealthStatus';
import { getStatusColor, getStatusIcon } from '@/lib/health-aggregation';
import HealthStatusPopup from './HealthStatusPopup';
import './HealthStatusIndicator.css';

export default function HealthStatusIndicator() {
  const { t } = useTranslation();
  const { health, refresh, isRefreshing } = useHealthStatus();
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => setIsOpen(!isOpen);
  const closePopup = () => setIsOpen(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      togglePopup();
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closePopup();
    }
  };

  const statusColor = getStatusColor(health.overallStatus);
  const statusIcon = getStatusIcon(health.overallStatus);

  return (
    <>
      <button
        className={`health-indicator ${health.overallStatus}`}
        onClick={togglePopup}
        onKeyDown={handleKeyDown}
        aria-label={t('healthStatus.title')}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        role="button"
        tabIndex={0}
        style={{ borderColor: statusColor }}
        title={t(`healthStatus.messages.${health.overallStatus}`)}
      >
        <span 
          className="status-icon"
          aria-label={t(`healthStatus.status.${health.overallStatus}`)}
          role="img"
          style={{ color: statusColor }}
        >
          {statusIcon}
        </span>
      </button>

      {isOpen && (
        <HealthStatusPopup
          health={health}
          onClose={closePopup}
          onRefresh={refresh}
          isRefreshing={isRefreshing}
        />
      )}

      {/* Screen reader announcement */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {t('healthStatus.overallStatus')}: {t(`healthStatus.status.${health.overallStatus}`)}
      </div>
    </>
  );
}
```

### 17.2 Checklist de Implementación

**Frontend**:
- [ ] Componente HealthStatusIndicator
- [ ] Componente HealthStatusPopup
- [ ] Componente ComponentCard
- [ ] Hook useHealthStatus
- [ ] Lógica de health checks
- [ ] Lógica de agregación de estado
- [ ] Tipos TypeScript
- [ ] Estilos CSS
- [ ] Animaciones
- [ ] Internacionalización
- [ ] Accesibilidad (ARIA, keyboard nav)
- [ ] Testing (unit, integration, e2e)

**Backend**:
- [ ] Endpoint GET /api/health
- [ ] Endpoint GET /api/health/database
- [ ] Endpoint GET /api/auth/health
- [ ] Endpoint GET /api/health/all (opcional, agregado)
- [ ] Logging de health checks
- [ ] Monitoreo de performance

**Documentación**:
- [ ] README con instrucciones de uso
- [ ] Documentación de API endpoints
- [ ] Guía de troubleshooting
- [ ] Guía de internacionalización
- [ ] Guía de accesibilidad

**Testing**:
- [ ] Unit tests (> 80% coverage)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Accessibility tests (jest-axe)
- [ ] Manual testing con lectores de pantalla
- [ ] Testing en diferentes navegadores
- [ ] Testing en diferentes dispositivos
- [ ] Testing de performance (Lighthouse)

---

## 18. Conclusión

El Indicador de Estado de Salud del Sistema para HoloCheck Equilibria representa una implementación profesional y completa de monitoreo de servicios que sigue estándares internacionales (ISO 22301, ITIL, WCAG 2.1 AA) y mejores prácticas de la industria.

**Beneficios Clave**:

1. **Transparencia Operacional**: Los usuarios tienen visibilidad clara del estado del sistema
2. **Reducción de Tickets de Soporte**: Usuarios pueden autodiagnosticar problemas de disponibilidad
3. **Experiencia de Usuario Mejorada**: Información clara y accionable en caso de incidentes
4. **Accesibilidad Universal**: Cumple con estándares WCAG 2.1 AA para todos los usuarios
5. **Internacionalización Completa**: Soporte para múltiples idiomas y regiones
6. **Rendimiento Optimizado**: Impacto mínimo en la experiencia de login

Este PRD proporciona una guía completa para implementar una solución robusta, escalable y centrada en el usuario que mejorará significativamente la transparencia operacional de la plataforma HoloCheck Equilibria.

---

**Versión**: 1.0  
**Fecha**: 2026-02-02  
**Autor**: Emma (Product Manager)  
**Estado**: Aprobado para Implementación  
**Próxima Revisión**: Post-implementación Fase 1