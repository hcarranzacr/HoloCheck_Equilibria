# Resumen de Estructuras de Datos para Mejoras de Dashboard
## HoloCheck Equilibria

**Fecha:** 2026-01-25  
**Para:** Emma (Product Manager)  
**De:** David (Data Analyst)  
**Versión:** 1.0

---

## 📋 Resumen Ejecutivo

Este documento proporciona un resumen completo de las **vistas SQL, índices y estructuras de datos YA DISPONIBLES** en la base de datos de HoloCheck Equilibria. Toda esta infraestructura está lista para ser utilizada en las mejoras de los 4 dashboards.

**Estado:** ✅ Vistas e índices aplicados y operativos  
**Performance:** Optimizado para consultas frecuentes  
**Cobertura:** 4 dashboards (Employee, Leader, HR, Organization)

---

## 🎯 Vistas SQL Disponibles

### Vista 1: vw_latest_scans_by_user
**Propósito:** Obtener el último escaneo biométrico de cada usuario empleado

**Campos Disponibles:**
```javascript
{
  // Identificadores
  id: uuid,
  user_id: uuid,
  
  // Datos del usuario
  full_name: string,
  email: string,
  department_id: uuid,
  organization_id: uuid,
  
  // Indicadores vitales (0-100)
  heart_rate: number,
  sdnn: number,
  rmssd: number,
  ai_stress: number,          // 0-100
  ai_fatigue: number,         // 0-100
  ai_cognitive_load: number,  // 0-100
  ai_recovery: number,        // 0-100
  bio_age_basic: number,
  
  // Scores DeepAffex
  vital_index_score: number,
  physiological_score: number,
  mental_score: number,
  wellness_index_score: number,     // 0-10
  mental_stress_index: number,      // 0-10 (burnout risk)
  cardiac_load: number,
  vascular_capacity: number,
  cv_risk_heart_attack: number,     // 0-5
  cv_risk_stroke: number,           // 0-5
  
  // Composición corporal
  bmi: number,
  abdominal_circumference_cm: number,
  waist_height_ratio: number,
  body_shape_index: number,
  
  // Indicadores técnicos
  arrhythmias_detected: number,
  signal_to_noise_ratio: number,
  scan_quality_index: number,
  global_health_score: number,
  
  // Timestamp
  created_at: timestamp
}
```

**Uso en Dashboards:**
- ✅ **Employee Dashboard:** Último escaneo del usuario
- ✅ **Leader Dashboard:** Últimos escaneos de todos los miembros del equipo
- ✅ **HR Dashboard:** Vista rápida de estado de empleados

**Ejemplo de Consulta:**
```typescript
// Employee Dashboard - Último escaneo
const { data } = await supabase
  .from('vw_latest_scans_by_user')
  .select('*')
  .eq('user_id', currentUserId)
  .single();

// Leader Dashboard - Equipo completo
const { data } = await supabase
  .from('vw_latest_scans_by_user')
  .select('*')
  .eq('department_id', departmentId)
  .order('ai_stress', { ascending: false });
```

---

### Vista 2: vw_current_department_metrics
**Propósito:** Métricas agregadas actuales por departamento basadas en últimos escaneos

**Campos Disponibles:**
```javascript
{
  department_id: uuid,
  department_name: string,
  employee_count: number,        // Cantidad de empleados con escaneos
  avg_stress: number,            // Promedio 0-100
  avg_fatigue: number,           // Promedio 0-100
  avg_cognitive_load: number,    // Promedio 0-100
  avg_recovery: number,          // Promedio 0-100
  avg_bio_age: number,           // Promedio de edad biológica
  avg_wellness_index: number     // Promedio 0-10
}
```

**Uso en Dashboards:**
- ✅ **Leader Dashboard:** Métricas actuales del departamento
- ✅ **HR Dashboard:** Comparación entre departamentos
- ✅ **Organization Dashboard:** Vista general de salud organizacional

**Ejemplo de Consulta:**
```typescript
// Leader Dashboard - Métricas del departamento
const { data } = await supabase
  .from('vw_current_department_metrics')
  .select('*')
  .eq('department_id', departmentId)
  .single();

// HR Dashboard - Todos los departamentos
const { data } = await supabase
  .from('vw_current_department_metrics')
  .select('*')
  .in('department_id', departmentIds)
  .order('avg_stress', { ascending: false });
```

**Interpretación de Valores:**
- `avg_stress > 70` → Departamento con estrés alto
- `avg_fatigue > 60` → Departamento con fatiga alta
- `avg_wellness_index < 5` → Departamento requiere atención
- `employee_count = 0` → Departamento sin escaneos recientes

---

### Vista 3: vw_usage_monthly_summary
**Propósito:** Resumen de uso mensual de la plataforma por organización

**Campos Disponibles:**
```javascript
{
  organization_id: uuid,
  organization_name: string,
  month: date,                    // Formato: 2026-01-01
  total_scans: number,            // Total de escaneos del mes
  total_prompts_used: number,     // Total de prompts de IA
  total_ai_tokens_used: number,   // Total de tokens consumidos
  created_at: timestamp
}
```

**Uso en Dashboards:**
- ✅ **HR Dashboard:** Consumo mensual de recursos
- ✅ **Organization Dashboard:** Monitoreo de uso y tendencias
- ✅ **Admin Panel:** Análisis de costos y facturación

**Ejemplo de Consulta:**
```typescript
// HR Dashboard - Últimos 12 meses
const { data } = await supabase
  .from('vw_usage_monthly_summary')
  .select('*')
  .eq('organization_id', orgId)
  .order('month', { ascending: false })
  .limit(12);

// Calcular tendencia
const trend = data.reduce((acc, curr, idx) => {
  if (idx === 0) return 0;
  return ((curr.total_scans - data[idx-1].total_scans) / data[idx-1].total_scans) * 100;
}, 0);
```

---

### Vista 4: vw_employees_at_risk
**Propósito:** Identificar empleados con indicadores de riesgo alto

**Campos Disponibles:**
```javascript
{
  // Todos los campos de vw_latest_scans_by_user +
  // Solo incluye empleados que cumplen AL MENOS UNO de estos criterios:
  // - ai_stress > 70
  // - ai_fatigue > 70
  // - mental_stress_index > 5.0
  // - bio_age_basic > 50
}
```

**Uso en Dashboards:**
- ✅ **Leader Dashboard:** Miembros del equipo que requieren atención
- ✅ **HR Dashboard:** Lista de empleados en riesgo de toda la organización
- ✅ **Sistema de Alertas:** Notificaciones automáticas

**Ejemplo de Consulta:**
```typescript
// Leader Dashboard - Equipo en riesgo
const { data } = await supabase
  .from('vw_employees_at_risk')
  .select('user_id, full_name, email, ai_stress, ai_fatigue, mental_stress_index')
  .eq('department_id', departmentId)
  .order('ai_stress', { ascending: false });

// HR Dashboard - Top 20 empleados en riesgo
const { data } = await supabase
  .from('vw_employees_at_risk')
  .select('*')
  .eq('organization_id', orgId)
  .order('mental_stress_index', { ascending: false })
  .limit(20);
```

**Niveles de Riesgo Sugeridos:**
```javascript
function getRiskLevel(employee) {
  if (employee.ai_stress > 80 || employee.mental_stress_index > 7) {
    return { level: 'critical', color: 'red', action: 'Intervención inmediata' };
  }
  if (employee.ai_stress > 70 || employee.mental_stress_index > 5) {
    return { level: 'high', color: 'orange', action: 'Seguimiento cercano' };
  }
  if (employee.ai_fatigue > 70) {
    return { level: 'moderate', color: 'yellow', action: 'Monitoreo' };
  }
  return { level: 'low', color: 'green', action: 'Normal' };
}
```

---

## 🔍 Índices Aplicados

### Tabla: biometric_measurements
```sql
idx_biometrics_user_created_at ON (user_id, created_at DESC)
```
**Beneficio:** Acelera consultas de historial de escaneos por usuario  
**Uso:** Employee Dashboard (historial), Leader Dashboard (escaneos del equipo)

---

### Tabla: user_profiles
```sql
idx_user_profiles_org_dept_role ON (organization_id, department_id, role)
```
**Beneficio:** Optimiza filtros multitenant por organización y departamento  
**Uso:** Todos los dashboards (filtros por organización/departamento)

---

### Tabla: department_insights
```sql
idx_dept_insights_dept ON (department_id)
```
**Beneficio:** Acelera obtención de insights departamentales  
**Uso:** Leader Dashboard (insights del departamento)

---

### Tabla: organization_insights
```sql
idx_org_insights_org_period ON (organization_id, analysis_date DESC)
```
**Beneficio:** Optimiza consultas de insights organizacionales históricos  
**Uso:** HR Dashboard (tendencias organizacionales)

---

### Tabla: subscription_usage_logs
```sql
idx_usage_logs_org_month ON (organization_id, used_at)
idx_usage_logs_user ON (user_id, used_at)
```
**Beneficio:** Acelera análisis de uso por organización y por usuario  
**Uso:** Organization Dashboard (logs de uso, análisis de actividad)

---

### Tabla: organization_usage_summary
```sql
idx_org_usage_org_month ON (organization_id, month) [UNIQUE]
```
**Beneficio:** Garantiza integridad y optimiza consultas de resumen mensual  
**Uso:** HR Dashboard, Organization Dashboard (consumo mensual)

---

### Tabla: ai_analysis_results
```sql
idx_ai_results_measurement ON (measurement_id)
```
**Beneficio:** Optimiza uniones con biometric_measurements  
**Uso:** Employee Dashboard (análisis de IA del usuario)

---

## 📊 Estructuras de Datos por Dashboard

### 1. Employee Dashboard

#### Datos Disponibles:
```typescript
interface EmployeeDashboardData {
  // Último escaneo (vw_latest_scans_by_user)
  latestScan: {
    ai_stress: number;           // 0-100
    ai_fatigue: number;          // 0-100
    ai_recovery: number;         // 0-100
    wellness_index_score: number; // 0-10
    mental_stress_index: number;  // 0-10
    cv_risk_heart_attack: number; // 0-5
    cv_risk_stroke: number;       // 0-5
    created_at: Date;
  };
  
  // Historial (biometric_measurements)
  scanHistory: Array<{
    created_at: Date;
    ai_stress: number;
    ai_fatigue: number;
    ai_recovery: number;
    wellness_index_score: number;
  }>;
  
  // Tendencias (calculadas)
  trends: {
    stress_trend: 'up' | 'down' | 'stable';
    fatigue_trend: 'up' | 'down' | 'stable';
    wellness_trend: 'improving' | 'declining' | 'stable';
  };
  
  // Estado de riesgo (vw_employees_at_risk)
  riskStatus: {
    isAtRisk: boolean;
    riskLevel: 'critical' | 'high' | 'moderate' | 'low';
    riskFactors: string[];
  };
}
```

#### Consultas Recomendadas:
```typescript
// 1. Último escaneo
const latestScan = await supabase
  .from('vw_latest_scans_by_user')
  .select('*')
  .eq('user_id', userId)
  .single();

// 2. Historial últimos 30 días
const history = await supabase
  .from('biometric_measurements')
  .select('created_at, ai_stress, ai_fatigue, ai_recovery, wellness_index_score')
  .eq('user_id', userId)
  .gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString())
  .order('created_at', { ascending: false });

// 3. Verificar si está en riesgo
const riskCheck = await supabase
  .from('vw_employees_at_risk')
  .select('ai_stress, ai_fatigue, mental_stress_index')
  .eq('user_id', userId)
  .maybeSingle(); // Retorna null si no está en riesgo
```

#### Widgets Sugeridos:
1. **Tarjeta de Último Escaneo** - Mostrar métricas clave del último escaneo
2. **Gráfico de Tendencias** - Línea de tiempo de estrés/fatiga últimos 30 días
3. **Indicador de Bienestar** - Gauge con wellness_index_score
4. **Alertas de Riesgo** - Banner si está en vw_employees_at_risk
5. **Comparación con Promedios** - Comparar con avg del departamento

---

### 2. Leader Dashboard

#### Datos Disponibles:
```typescript
interface LeaderDashboardData {
  // Métricas del departamento (vw_current_department_metrics)
  departmentMetrics: {
    department_name: string;
    employee_count: number;
    avg_stress: number;
    avg_fatigue: number;
    avg_cognitive_load: number;
    avg_recovery: number;
    avg_wellness_index: number;
  };
  
  // Miembros del equipo (vw_latest_scans_by_user)
  teamMembers: Array<{
    user_id: string;
    full_name: string;
    email: string;
    ai_stress: number;
    ai_fatigue: number;
    wellness_index_score: number;
    last_scan_date: Date;
    isAtRisk: boolean;
  }>;
  
  // Miembros en riesgo (vw_employees_at_risk)
  atRiskMembers: Array<{
    user_id: string;
    full_name: string;
    risk_level: string;
    risk_factors: string[];
  }>;
  
  // Insights departamentales (department_insights)
  insights: {
    analysis_period: Date;
    burnout_risk_score: number;
    insight_summary: string;
  };
}
```

#### Consultas Recomendadas:
```typescript
// 1. Métricas del departamento
const metrics = await supabase
  .from('vw_current_department_metrics')
  .select('*')
  .eq('department_id', deptId)
  .single();

// 2. Todos los miembros del equipo con último escaneo
const team = await supabase
  .from('vw_latest_scans_by_user')
  .select('user_id, full_name, email, ai_stress, ai_fatigue, wellness_index_score, created_at')
  .eq('department_id', deptId)
  .order('ai_stress', { ascending: false });

// 3. Miembros en riesgo
const atRisk = await supabase
  .from('vw_employees_at_risk')
  .select('user_id, full_name, email, ai_stress, ai_fatigue, mental_stress_index')
  .eq('department_id', deptId);

// 4. Insights históricos
const insights = await supabase
  .from('department_insights')
  .select('*')
  .eq('department_id', deptId)
  .order('analysis_period', { ascending: false })
  .limit(6);
```

#### Widgets Sugeridos:
1. **Tarjeta de Métricas del Departamento** - KPIs principales (avg_stress, avg_wellness)
2. **Lista de Miembros del Equipo** - Tabla con estado de cada miembro
3. **Alertas de Riesgo** - Lista de miembros que requieren atención
4. **Gráfico de Distribución** - Histograma de niveles de estrés del equipo
5. **Tendencias Departamentales** - Línea de tiempo de métricas (últimos 6 meses)
6. **Comparación con Otros Departamentos** - Ranking de wellness_index

---

### 3. HR Dashboard

#### Datos Disponibles:
```typescript
interface HRDashboardData {
  // Resumen organizacional (organization_insights)
  organizationSummary: {
    total_employees: number;
    stress_index: number;
    burnout_risk: number;
    sleep_index: number;
    actuarial_risk: number;
    claim_risk: number;
  };
  
  // Todos los departamentos (vw_current_department_metrics)
  departments: Array<{
    department_id: string;
    department_name: string;
    employee_count: number;
    avg_stress: number;
    avg_fatigue: number;
    avg_wellness_index: number;
    rank: number;
  }>;
  
  // Empleados en riesgo (vw_employees_at_risk)
  employeesAtRisk: Array<{
    user_id: string;
    full_name: string;
    email: string;
    department_name: string;
    ai_stress: number;
    ai_fatigue: number;
    mental_stress_index: number;
    risk_level: string;
  }>;
  
  // Consumo mensual (vw_usage_monthly_summary)
  monthlyUsage: Array<{
    month: Date;
    total_scans: number;
    total_prompts_used: number;
    total_ai_tokens_used: number;
  }>;
}
```

#### Consultas Recomendadas:
```typescript
// 1. Resumen organizacional
const orgSummary = await supabase
  .from('organization_insights')
  .select('*')
  .eq('organization_id', orgId)
  .order('analysis_date', { ascending: false })
  .limit(1)
  .single();

// 2. Todos los departamentos con métricas
const departments = await supabase
  .from('vw_current_department_metrics')
  .select('*')
  .in('department_id', departmentIds)
  .order('avg_wellness_index', { ascending: false });

// 3. Top 50 empleados en riesgo
const atRisk = await supabase
  .from('vw_employees_at_risk')
  .select(`
    user_id,
    full_name,
    email,
    department_id,
    ai_stress,
    ai_fatigue,
    mental_stress_index,
    cv_risk_heart_attack
  `)
  .eq('organization_id', orgId)
  .order('mental_stress_index', { ascending: false })
  .limit(50);

// 4. Consumo últimos 12 meses
const usage = await supabase
  .from('vw_usage_monthly_summary')
  .select('*')
  .eq('organization_id', orgId)
  .order('month', { ascending: false })
  .limit(12);

// 5. Departamentos con más empleados en riesgo
const deptRisk = await supabase
  .from('vw_employees_at_risk')
  .select('department_id')
  .eq('organization_id', orgId);
// Agrupar en frontend por department_id
```

#### Widgets Sugeridos:
1. **KPIs Organizacionales** - Tarjetas con stress_index, burnout_risk, etc.
2. **Tabla de Departamentos** - Comparación con ranking y métricas
3. **Mapa de Calor** - Visualización de estrés por departamento
4. **Lista de Empleados en Riesgo** - Tabla filtrable y ordenable
5. **Gráfico de Consumo** - Línea de tiempo de uso mensual
6. **Alertas y Notificaciones** - Panel de acciones requeridas
7. **Tendencias Organizacionales** - Evolución de métricas clave

---

### 4. Organization Dashboard (Admin)

#### Datos Disponibles:
```typescript
interface OrganizationDashboardData {
  // Información de suscripción (organization_subscriptions)
  subscription: {
    plan_name: string;
    scan_limit_per_user_per_month: number;
    used_scans_total: number;
    dept_analysis_limit: number;
    org_analysis_limit: number;
    max_users_allowed: number;
    active: boolean;
    current_month: Date;
    usage_percentage: number;
  };
  
  // Consumo mensual (vw_usage_monthly_summary)
  monthlyUsage: Array<{
    month: Date;
    total_scans: number;
    total_prompts_used: number;
    total_ai_tokens_used: number;
  }>;
  
  // Logs de uso (subscription_usage_logs)
  usageLogs: Array<{
    used_at: Date;
    user_name: string;
    scan_type: string;
    source: string;
    scan_success: boolean;
  }>;
  
  // Actividad de usuarios
  userActivity: {
    total_users: number;
    active_users_7d: number;
    inactive_users_30d: number;
  };
}
```

#### Consultas Recomendadas:
```typescript
// 1. Información de suscripción con cálculo de uso
const subscription = await supabase
  .from('organization_subscriptions')
  .select(`
    *,
    subscription_plans(name, slot_range, price)
  `)
  .eq('organization_id', orgId)
  .eq('active', true)
  .single();

// Calcular porcentaje de uso
const totalUsers = await supabase
  .from('user_profiles')
  .select('user_id', { count: 'exact' })
  .eq('organization_id', orgId);

const usagePercentage = (subscription.used_scans_total / 
  (subscription.scan_limit_per_user_per_month * totalUsers.count)) * 100;

// 2. Consumo últimos 12 meses
const usage = await supabase
  .from('vw_usage_monthly_summary')
  .select('*')
  .eq('organization_id', orgId)
  .order('month', { ascending: false })
  .limit(12);

// 3. Logs de uso recientes
const logs = await supabase
  .from('subscription_usage_logs')
  .select(`
    id,
    used_at,
    scan_type,
    source,
    scan_success,
    user_profiles(full_name, email)
  `)
  .eq('organization_id', orgId)
  .order('used_at', { ascending: false })
  .limit(100);

// 4. Actividad de usuarios
const activeUsers = await supabase
  .from('biometric_measurements')
  .select('user_id')
  .gte('created_at', new Date(Date.now() - 7*24*60*60*1000).toISOString());

const uniqueActiveUsers = new Set(activeUsers.data?.map(u => u.user_id)).size;
```

#### Widgets Sugeridos:
1. **Tarjeta de Suscripción** - Plan actual, límites, fecha de renovación
2. **Medidor de Consumo** - Gauge con porcentaje de uso del mes
3. **Gráfico de Tendencias de Uso** - Línea de tiempo de escaneos mensuales
4. **Tabla de Logs de Uso** - Últimas 100 acciones con filtros
5. **Actividad de Usuarios** - Usuarios activos vs inactivos
6. **Alertas de Límites** - Notificaciones si se acerca al límite
7. **Proyección de Costos** - Estimación de uso futuro

---

## 🎨 Guía de Visualización de Datos

### Escalas de Colores Recomendadas

#### Para ai_stress y ai_fatigue (0-100):
```javascript
function getStressColor(value) {
  if (value >= 80) return '#DC2626'; // Rojo - Crítico
  if (value >= 70) return '#F59E0B'; // Naranja - Alto
  if (value >= 50) return '#FCD34D'; // Amarillo - Moderado
  return '#10B981'; // Verde - Normal
}
```

#### Para wellness_index_score (0-10):
```javascript
function getWellnessColor(value) {
  if (value >= 8) return '#10B981'; // Verde - Excelente
  if (value >= 6) return '#FCD34D'; // Amarillo - Bueno
  if (value >= 4) return '#F59E0B'; // Naranja - Regular
  return '#DC2626'; // Rojo - Bajo
}
```

#### Para mental_stress_index (0-10):
```javascript
function getBurnoutColor(value) {
  if (value >= 7) return '#DC2626'; // Rojo - Alto riesgo
  if (value >= 5) return '#F59E0B'; // Naranja - Riesgo moderado
  if (value >= 3) return '#FCD34D'; // Amarillo - Atención
  return '#10B981'; // Verde - Normal
}
```

---

### Iconos Sugeridos

```javascript
const icons = {
  stress: '😰',
  fatigue: '😴',
  recovery: '💪',
  wellness: '🌟',
  heart: '❤️',
  brain: '🧠',
  alert: '⚠️',
  success: '✅',
  warning: '⚡',
  critical: '🚨'
};
```

---

### Formatos de Fecha

```javascript
// Para gráficos
const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-ES', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
};

// Para tablas
const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};
```

---

## 🔄 Triggers Automáticos

### Actualización de Department Insights

**Trigger:** `trg_generate_department_insight`  
**Tabla:** `biometric_measurements`  
**Evento:** AFTER INSERT

**Comportamiento:**
- Se ejecuta automáticamente después de cada escaneo
- Actualiza `department_insights` con promedios del mes actual
- Usa UPSERT para evitar duplicados

**Implicación para Dashboards:**
- Los datos en `vw_current_department_metrics` se actualizan en tiempo real
- No es necesario recalcular promedios en el frontend
- Los insights departamentales siempre están actualizados

---

## ⚡ Optimizaciones de Performance

### 1. Usar Vistas en Lugar de JOINs Complejos

**❌ Evitar:**
```typescript
// Consulta compleja con múltiples JOINs
const { data } = await supabase
  .from('biometric_measurements')
  .select(`
    *,
    user_profiles(full_name, email, department_id),
    departments(name)
  `)
  .order('created_at', { ascending: false });
```

**✅ Preferir:**
```typescript
// Usar vista optimizada
const { data } = await supabase
  .from('vw_latest_scans_by_user')
  .select('*');
```

---

### 2. Consultas Paralelas

**❌ Evitar:**
```typescript
const profile = await supabase.from('user_profiles').select('*');
const scans = await supabase.from('biometric_measurements').select('*');
const insights = await supabase.from('department_insights').select('*');
```

**✅ Preferir:**
```typescript
const [profile, scans, insights] = await Promise.all([
  supabase.from('user_profiles').select('*'),
  supabase.from('biometric_measurements').select('*'),
  supabase.from('department_insights').select('*')
]);
```

---

### 3. Limitar Campos Seleccionados

**❌ Evitar:**
```typescript
const { data } = await supabase
  .from('biometric_measurements')
  .select('*'); // Trae 28+ campos
```

**✅ Preferir:**
```typescript
const { data } = await supabase
  .from('biometric_measurements')
  .select('id, user_id, ai_stress, ai_fatigue, created_at'); // Solo lo necesario
```

---

### 4. Paginación

```typescript
const PAGE_SIZE = 50;

const { data, count } = await supabase
  .from('vw_employees_at_risk')
  .select('*', { count: 'exact' })
  .eq('organization_id', orgId)
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

---

## 🚨 Manejo de Errores

### Validación de Datos Nulos

```typescript
// Siempre validar antes de usar
const { data, error } = await supabase
  .from('vw_latest_scans_by_user')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle(); // Retorna null si no hay datos

if (error) {
  console.error('Error fetching data:', error);
  return null;
}

if (!data) {
  console.warn('No scan data found for user');
  return { message: 'No hay escaneos disponibles' };
}

// Usar valores por defecto
const stressLevel = data.ai_stress ?? 0;
const fatigueLevel = data.ai_fatigue ?? 0;
```

---

### Estados de Carga

```typescript
interface DashboardState {
  loading: boolean;
  error: string | null;
  data: any | null;
}

const [state, setState] = useState<DashboardState>({
  loading: true,
  error: null,
  data: null
});

async function loadData() {
  try {
    setState({ loading: true, error: null, data: null });
    
    const { data, error } = await supabase
      .from('vw_latest_scans_by_user')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    setState({ loading: false, error: null, data });
  } catch (err) {
    setState({ loading: false, error: err.message, data: null });
  }
}
```

---

## 📋 Checklist de Implementación

### Para Cada Dashboard:

- [ ] Identificar qué vistas usar (vw_latest_scans_by_user, vw_current_department_metrics, etc.)
- [ ] Diseñar widgets basados en datos disponibles
- [ ] Implementar consultas usando vistas optimizadas
- [ ] Agregar manejo de errores y estados de carga
- [ ] Implementar escalas de colores y visualizaciones
- [ ] Agregar filtros y ordenamiento
- [ ] Implementar paginación si es necesario
- [ ] Optimizar con consultas paralelas
- [ ] Agregar caché en frontend (opcional)
- [ ] Probar con datos reales

---

## 🎯 Recomendaciones Finales

### 1. Prioridad de Implementación

**Alta Prioridad:**
- ✅ Usar `vw_latest_scans_by_user` en todos los dashboards
- ✅ Usar `vw_current_department_metrics` para métricas departamentales
- ✅ Usar `vw_employees_at_risk` para alertas

**Media Prioridad:**
- ⚠️ Implementar gráficos de tendencias (historial)
- ⚠️ Agregar comparaciones entre departamentos
- ⚠️ Implementar sistema de notificaciones

**Baja Prioridad:**
- 💡 Análisis predictivos
- 💡 Exportación de reportes
- 💡 Dashboards personalizables

---

### 2. Consideraciones de UX

- Mostrar **indicadores de carga** mientras se obtienen datos
- Usar **valores por defecto** cuando no hay datos disponibles
- Implementar **mensajes claros** cuando no hay escaneos recientes
- Agregar **tooltips** para explicar métricas complejas
- Usar **colores consistentes** según las escalas recomendadas

---

### 3. Performance

- Todas las consultas deben completarse en **< 100ms**
- Usar **caché en frontend** para datos que no cambian frecuentemente
- Implementar **lazy loading** para listas largas
- Usar **paginación** para más de 50 registros

---

## 📞 Contacto

**Para consultas técnicas sobre vistas e índices:**  
David (Data Analyst)

**Para consultas sobre requerimientos de dashboard:**  
Emma (Product Manager)

**Documentos relacionados:**
- `/workspace/app/docs/data_model_analysis.md` - Análisis completo del modelo de datos
- `/workspace/uploads/Equilibria_Diccionario_Tablas_Final_20260124 (1).docx` - Diccionario de base de datos

---

**Última actualización:** 2026-01-25  
**Versión:** 1.0  
**Estado:** ✅ Listo para implementación