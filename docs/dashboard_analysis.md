# Análisis de Dashboards - HoloCheck Equilibria

**Fecha:** 2026-01-25  
**Versión:** 1.0  
**Analista:** Emma (Product Manager)

---

## Resumen Ejecutivo

Después de analizar los datos de muestra, la documentación técnica y el código actual, se identificaron **problemas críticos** en los 4 dashboards que impiden mostrar información valiosa para la toma de decisiones. Los dashboards actuales no aprovechan las métricas clave disponibles en la base de datos y carecen de visualizaciones efectivas para identificar riesgos de salud organizacional.

### Hallazgos Principales

1. **Employee Dashboard**: Solo muestra mensaje "hacer scan", no aprovecha datos históricos ni tendencias
2. **Leader Dashboard**: Falta visualización de métricas del equipo y alertas de riesgo
3. **HR Dashboard**: No muestra insights departamentales ni empleados en riesgo alto
4. **Organization Dashboard**: Falta información de consumo de suscripción y métricas operativas

### Métricas Clave Disponibles pero No Utilizadas

- **Biométricas**: 28 campos por escaneo (stress, fatigue, recovery, bio_age, cardiac_load, etc.)
- **Departamentales**: avg_stress, burnout_risk_score, wellness_index, employee_count
- **Organizacionales**: stress_index, burnout_risk, actuarial_risk, claim_risk
- **Consumo**: scan_limit, used_scans, usage_percentage, monthly_reset

---

## Dashboard 1: Employee Dashboard

### Estado Actual

**Problemas Identificados:**
- ✅ Carga datos correctamente desde Supabase
- ❌ Solo muestra "No hay mediciones aún" cuando `latest_scan` es null
- ❌ No muestra historial de escaneos (`scan_history`)
- ❌ No muestra tendencias (`trends`)
- ❌ No hay visualización de métricas clave (stress, fatigue, recovery)
- ❌ No hay alertas de riesgo (burnout, cardiovascular)

**Datos Disponibles:**
```javascript
{
  user_profile: {...},
  latest_scan: {...},      // 28 campos biométricos
  scan_history: [...],     // Últimos 10 escaneos
  total_scans: 5,
  trends: {
    avg_stress: 25.82,
    avg_fatigue: 21.84,
    avg_recovery: 55.71
  }
}
```

### Recomendaciones

#### 1. **Sección: Último Escaneo** - Prioridad: ALTA

**Métricas a mostrar:**
- Heart Rate (heart_rate)
- Stress Level (ai_stress) - con color según nivel
- Fatigue Index (ai_fatigue)
- Recovery Score (ai_recovery)
- Wellness Index (wellness_index_score)
- Bio Age vs Real Age (bio_age_basic)

**Visualización:**
```
┌─────────────────────────────────────────┐
│ Último Escaneo - 25 Ene 2026            │
├─────────────────────────────────────────┤
│ ❤️  Heart Rate: 72 BPM                  │
│ 😰 Stress: 33.6 (Bajo) 🟢              │
│ 😴 Fatigue: 16.5 (Bajo) 🟢             │
│ 💪 Recovery: 62.0 (Bueno) 🟢           │
│ ⭐ Wellness: 90.3 (Excelente) 🟢       │
│ 🎂 Bio Age: 27 años (Real: 30) ✨      │
└─────────────────────────────────────────┘
```

**Colores:**
- 🟢 Verde: Stress < 40, Fatigue < 30, Recovery > 50
- 🟡 Amarillo: Stress 40-70, Fatigue 30-60, Recovery 30-50
- 🔴 Rojo: Stress > 70, Fatigue > 60, Recovery < 30

**Consulta necesaria:**
```typescript
// Ya disponible en apiClient.dashboards.employee()
const data = await apiClient.dashboards.employee();
const latest = data.latest_scan;
```

#### 2. **Sección: Tendencias (30 días)** - Prioridad: ALTA

**Métricas:**
- Gráfico de líneas: Stress, Fatigue, Recovery (últimos 10 escaneos)
- Promedio del período
- Comparación con período anterior

**Visualización:**
```
┌─────────────────────────────────────────┐
│ Tendencias (Últimos 10 escaneos)        │
├─────────────────────────────────────────┤
│     Stress    Fatigue    Recovery       │
│ 📊  25.8 ↓    21.8 ↓     55.7 ↑        │
│     -5%       -8%        +12%           │
│                                         │
│ [Gráfico de líneas aquí]               │
└─────────────────────────────────────────┘
```

**Consulta necesaria:**
```typescript
const history = data.scan_history; // Ya disponible
const trends = data.trends; // Ya calculado
```

#### 3. **Sección: Alertas de Riesgo** - Prioridad: ALTA

**Métricas:**
- CV Risk Heart Attack (cv_risk_heart_attack)
- CV Risk Stroke (cv_risk_stroke)
- Arrhythmias Detected (arrhythmias_detected)
- Mental Stress Index (mental_stress_index)

**Visualización:**
```
┌─────────────────────────────────────────┐
│ ⚠️  Alertas de Salud                    │
├─────────────────────────────────────────┤
│ 🫀 Riesgo CV (Infarto): 1.39% 🟢       │
│ 🧠 Riesgo CV (ACV): 2.04% 🟢           │
│ 💓 Arritmias detectadas: 3              │
│ 😰 Estrés Mental: 5.09 (Bajo) 🟢       │
└─────────────────────────────────────────┘
```

**Consulta necesaria:**
```typescript
const latest = data.latest_scan;
const alerts = {
  cv_heart_attack: latest.cv_risk_heart_attack,
  cv_stroke: latest.cv_risk_stroke,
  arrhythmias: latest.arrhythmias_detected,
  mental_stress: latest.mental_stress_index
};
```

#### 4. **Sección: Historial de Escaneos** - Prioridad: MEDIA

**Visualización:**
- Tabla con últimos 10 escaneos
- Columnas: Fecha, Stress, Fatigue, Recovery, Wellness
- Click para ver detalle completo

**Consulta necesaria:**
```typescript
const history = data.scan_history; // Ya disponible
```

---

## Dashboard 2: Leader Dashboard

### Estado Actual

**Problemas Identificados:**
- ✅ Carga datos del equipo correctamente
- ❌ No muestra métricas del equipo (`team_metrics`)
- ❌ No muestra miembros del equipo (`team_members`)
- ❌ No muestra insights departamentales (`department_insights`)
- ❌ No hay alertas de miembros en riesgo
- ❌ No hay comparación con otros departamentos

**Datos Disponibles:**
```javascript
{
  department_id: "f7e96233-...",
  team_size: 5,
  team_members: [...],     // 5 miembros con perfil
  recent_scans: [...],     // Últimos 50 escaneos del equipo
  team_metrics: {
    avg_stress: 25.82,
    avg_fatigue: 21.84,
    avg_cognitive_load: 55.80,
    avg_recovery: 55.71,
    avg_wellness: 83.63,
    total_scans: 50
  },
  department_insights: {
    avg_stress: 25.82,
    burnout_risk_score: 4.41,
    wellness_index: 83.63,
    employee_count: 5
  }
}
```

### Recomendaciones

#### 1. **Sección: Resumen del Equipo** - Prioridad: ALTA

**Métricas:**
- Team Size
- Métricas promedio del equipo
- Burnout Risk Score
- Wellness Index

**Visualización:**
```
┌─────────────────────────────────────────┐
│ 👥 Mi Equipo - 5 Colaboradores          │
├─────────────────────────────────────────┤
│ 😰 Stress Promedio: 25.8 (Bajo) 🟢     │
│ 😴 Fatigue Promedio: 21.8 (Bajo) 🟢    │
│ 🧠 Carga Cognitiva: 55.8 (Media) 🟡    │
│ 💪 Recovery Promedio: 55.7 (Bueno) 🟢  │
│ ⭐ Wellness Index: 83.6 (Excelente) 🟢 │
│ 🔥 Riesgo Burnout: 4.4/10 (Bajo) 🟢   │
└─────────────────────────────────────────┘
```

**Consulta necesaria:**
```typescript
const data = await apiClient.dashboards.leader();
const metrics = data.team_metrics;
const insights = data.department_insights;
```

#### 2. **Sección: Miembros del Equipo** - Prioridad: ALTA

**Métricas por miembro:**
- Nombre
- Último escaneo (fecha)
- Stress, Fatigue, Recovery
- Alerta si está en riesgo (stress > 70 o fatigue > 60)

**Visualización:**
```
┌─────────────────────────────────────────────────────────┐
│ 👤 Estado del Equipo                                    │
├─────────────────────────────────────────────────────────┤
│ Juan Pérez        | 24 Ene | Stress: 33 🟢 | OK       │
│ María García      | 25 Ene | Stress: 21 🟢 | OK       │
│ Carlos López ⚠️   | 23 Ene | Stress: 75 🔴 | RIESGO   │
│ Ana Martínez      | 25 Ene | Stress: 38 🟢 | OK       │
│ Pedro Sánchez     | 24 Ene | Stress: 23 🟢 | OK       │
└─────────────────────────────────────────────────────────┘
```

**Consulta necesaria:**
```typescript
// Necesita JOIN entre team_members y sus últimos escaneos
const members = data.team_members;
const scans = data.recent_scans;

// Agrupar escaneos por user_id y tomar el más reciente
const memberStatus = members.map(member => {
  const lastScan = scans
    .filter(s => s.user_id === member.user_id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  
  return {
    name: member.full_name,
    last_scan_date: lastScan?.created_at,
    stress: lastScan?.ai_stress,
    fatigue: lastScan?.ai_fatigue,
    recovery: lastScan?.ai_recovery,
    at_risk: lastScan?.ai_stress > 70 || lastScan?.ai_fatigue > 60
  };
});
```

#### 3. **Sección: Alertas de Riesgo** - Prioridad: ALTA

**Métricas:**
- Número de miembros con stress alto (> 70)
- Número de miembros con fatigue alto (> 60)
- Número de miembros sin escaneo reciente (> 7 días)

**Visualización:**
```
┌─────────────────────────────────────────┐
│ ⚠️  Alertas del Equipo                  │
├─────────────────────────────────────────┤
│ 🔴 1 miembro con stress alto            │
│ 🟡 0 miembros con fatigue alto          │
│ ⏰ 0 miembros sin escaneo reciente      │
└─────────────────────────────────────────┘
```

**Consulta necesaria:**
```typescript
const highStress = memberStatus.filter(m => m.stress > 70).length;
const highFatigue = memberStatus.filter(m => m.fatigue > 60).length;
const noRecentScan = members.filter(m => {
  const lastScan = scans.find(s => s.user_id === m.user_id);
  if (!lastScan) return true;
  const daysSince = (Date.now() - new Date(lastScan.created_at)) / (1000 * 60 * 60 * 24);
  return daysSince > 7;
}).length;
```

#### 4. **Sección: Tendencias del Equipo** - Prioridad: MEDIA

**Visualización:**
- Gráfico de líneas: Stress, Fatigue, Recovery promedio (últimas 4 semanas)
- Comparación con mes anterior

**Consulta necesaria:**
```typescript
// Agrupar recent_scans por semana y calcular promedios
const weeklyTrends = groupByWeek(data.recent_scans);
```

---

## Dashboard 3: HR Dashboard

### Estado Actual

**Problemas Identificados:**
- ✅ Carga datos organizacionales correctamente
- ❌ Error crítico: `TypeError: undefined is not an object (evaluating 'a.team_members.map')`
- ❌ No muestra insights departamentales (`department_insights`)
- ❌ No muestra empleados en riesgo alto
- ❌ No muestra comparación entre departamentos
- ❌ No hay ranking de departamentos por riesgo

**Datos Disponibles:**
```javascript
{
  organization_id: "dd73e14a-...",
  total_employees: 5,
  organization_insights: {
    stress_index: 25.82,
    burnout_risk: 4.41,
    sleep_index: 55.71,
    actuarial_risk: 1.70,
    claim_risk: 15.08
  },
  department_insights: [
    {
      department_name: "Engineering",
      department_id: "f7e96233-...",
      insights: {
        avg_stress: 25.82,
        burnout_risk_score: 4.41,
        wellness_index: 83.63,
        employee_count: 5
      }
    }
  ],
  departments_count: 1,
  usage_summary: [...]
}
```

### Recomendaciones

#### 1. **Sección: Resumen Organizacional** - Prioridad: ALTA

**Métricas:**
- Total de empleados
- Stress Index organizacional
- Burnout Risk
- Actuarial Risk
- Claim Risk

**Visualización:**
```
┌─────────────────────────────────────────┐
│ 🏢 Resumen Organizacional               │
├─────────────────────────────────────────┤
│ 👥 Total Empleados: 5                   │
│ 😰 Stress Index: 25.8 (Bajo) 🟢        │
│ 🔥 Riesgo Burnout: 4.4/10 (Bajo) 🟢   │
│ 📊 Riesgo Actuarial: 1.7% 🟢           │
│ 💰 Riesgo de Reclamos: 15.1% 🟡        │
└─────────────────────────────────────────┘
```

**Consulta necesaria:**
```typescript
const data = await apiClient.dashboards.hr();
const orgInsights = data.organization_insights;
```

#### 2. **Sección: Departamentos** - Prioridad: ALTA

**Métricas por departamento:**
- Nombre del departamento
- Número de empleados
- Stress promedio
- Burnout Risk Score
- Wellness Index

**Visualización:**
```
┌──────────────────────────────────────────────────────────────┐
│ 🏢 Departamentos                                             │
├──────────────────────────────────────────────────────────────┤
│ Dept         | Empleados | Stress | Burnout | Wellness      │
├──────────────────────────────────────────────────────────────┤
│ Engineering  |     5     |  25.8  |   4.4   |   83.6  🟢   │
│ Sales        |     3     |  45.2  |   6.8   |   72.3  🟡   │
│ Marketing    |     2     |  68.5  |   8.2   |   55.1  🔴   │
└──────────────────────────────────────────────────────────────┘
```

**Consulta necesaria:**
```typescript
const depts = data.department_insights || [];
// FIX: Asegurar que siempre sea array
const departments = Array.isArray(depts) ? depts : [];
```

#### 3. **Sección: Empleados en Riesgo Alto** - Prioridad: ALTA

**Métricas:**
- Nombre del empleado
- Departamento
- Stress Level
- Burnout Risk Score
- Último escaneo

**Visualización:**
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️  Empleados en Riesgo Alto (Stress > 70)             │
├─────────────────────────────────────────────────────────┤
│ Carlos López | Marketing | Stress: 75 | Burnout: 8.2  │
│ Ana Gómez    | Sales     | Stress: 72 | Burnout: 7.5  │
└─────────────────────────────────────────────────────────┘
```

**Consulta necesaria:**
```typescript
// NUEVA CONSULTA NECESARIA
// Obtener todos los usuarios con su último escaneo
const { data: highRiskEmployees } = await supabase
  .from('user_profiles')
  .select(`
    user_id,
    full_name,
    departments(name),
    biometric_measurements(ai_stress, burnout_risk_score, created_at)
  `)
  .eq('organization_id', orgId)
  .order('biometric_measurements.created_at', { ascending: false })
  .limit(1);

// Filtrar solo los que tienen stress > 70
const atRisk = highRiskEmployees.filter(e => 
  e.biometric_measurements?.[0]?.ai_stress > 70
);
```

#### 4. **Sección: Ranking de Departamentos** - Prioridad: MEDIA

**Visualización:**
- Gráfico de barras: Departamentos ordenados por Burnout Risk Score
- Top 3 departamentos con mayor riesgo

**Consulta necesaria:**
```typescript
const rankedDepts = departments
  .sort((a, b) => b.insights.burnout_risk_score - a.insights.burnout_risk_score)
  .slice(0, 5);
```

#### 5. **Sección: Consumo de Recursos** - Prioridad: MEDIA

**Métricas:**
- Escaneos realizados este mes
- Prompts utilizados
- Tokens de IA consumidos
- Porcentaje de uso del límite

**Visualización:**
```
┌─────────────────────────────────────────┐
│ 📊 Consumo Mensual                      │
├─────────────────────────────────────────┤
│ 🔬 Escaneos: 5 / 10 (50%)              │
│ 💬 Prompts: 0 / 5 (0%)                 │
│ 🤖 Tokens IA: 0                        │
└─────────────────────────────────────────┘
```

**Consulta necesaria:**
```typescript
const usage = data.usage_summary[0] || {};
```

---

## Dashboard 4: Organization Dashboard (Admin)

### Estado Actual

**Problemas Identificados:**
- ✅ Carga datos de suscripción correctamente
- ❌ No muestra métricas de consumo (`consumption_metrics`)
- ❌ No muestra logs de uso recientes (`recent_usage_logs`)
- ❌ No muestra resumen mensual (`monthly_usage_summary`)
- ❌ No hay alertas de límite de suscripción
- ❌ No hay gráficos de tendencias de uso

**Datos Disponibles:**
```javascript
{
  organization_id: "dd73e14a-...",
  total_users: 5,
  subscription: {
    scan_limit_per_user_per_month: 2,
    used_scans_total: 5,
    active: true,
    start_date: "2026-01-21",
    end_date: "2027-01-21"
  },
  consumption_metrics: {
    scan_limit: 10,           // 2 * 5 users
    scans_used: 5,
    subscription_active: true,
    current_month_scans: 5,
    current_month_prompts: 0,
    current_month_tokens: 0,
    limit_reached: false,
    usage_percentage: 50
  },
  recent_usage_logs: [...],
  monthly_usage_summary: [...],
  recent_scans_count: 5
}
```

### Recomendaciones

#### 1. **Sección: Estado de Suscripción** - Prioridad: ALTA

**Métricas:**
- Plan actual
- Usuarios activos
- Fecha de inicio y fin
- Estado (activa/inactiva)

**Visualización:**
```
┌─────────────────────────────────────────┐
│ 💳 Suscripción                          │
├─────────────────────────────────────────┤
│ Plan: Professional                      │
│ 👥 Usuarios: 5                          │
│ 📅 Vigencia: 21 Ene 2026 - 21 Ene 2027 │
│ ✅ Estado: ACTIVA                       │
└─────────────────────────────────────────┘
```

**Consulta necesaria:**
```typescript
const sub = data.subscription;
```

#### 2. **Sección: Consumo Mensual** - Prioridad: ALTA

**Métricas:**
- Escaneos utilizados vs límite
- Porcentaje de uso
- Días restantes hasta reset
- Alerta si se acerca al límite (> 80%)

**Visualización:**
```
┌─────────────────────────────────────────┐
│ 📊 Consumo del Mes                      │
├─────────────────────────────────────────┤
│ 🔬 Escaneos: 5 / 10 (50%)              │
│ [████████░░░░░░░░░░] 50%               │
│                                         │
│ 💬 Prompts: 0 / 5 (0%)                 │
│ [░░░░░░░░░░░░░░░░░░░] 0%               │
│                                         │
│ 🤖 Tokens IA: 0                        │
│                                         │
│ 📅 Reset: en 6 días (1 Feb)            │
└─────────────────────────────────────────┘
```

**Consulta necesaria:**
```typescript
const metrics = data.consumption_metrics;
const daysUntilReset = calculateDaysUntilReset(sub.monthly_reset_day);
```

#### 3. **Sección: Alertas de Límite** - Prioridad: ALTA

**Visualización:**
```
┌─────────────────────────────────────────┐
│ ⚠️  Alertas                             │
├─────────────────────────────────────────┤
│ 🟡 Consumo de escaneos al 50%          │
│    Quedan 5 escaneos disponibles        │
└─────────────────────────────────────────┘
```

**Lógica:**
- 🟢 Verde: < 50% de uso
- 🟡 Amarillo: 50-80% de uso
- 🔴 Rojo: > 80% de uso o límite alcanzado

**Consulta necesaria:**
```typescript
const usagePercentage = metrics.usage_percentage;
const alertLevel = usagePercentage > 80 ? 'red' : usagePercentage > 50 ? 'yellow' : 'green';
```

#### 4. **Sección: Logs de Uso Recientes** - Prioridad: MEDIA

**Métricas:**
- Fecha y hora
- Usuario
- Tipo de acción (escaneo, prompt)
- Éxito/Fallo

**Visualización:**
```
┌─────────────────────────────────────────────────────────┐
│ 📋 Actividad Reciente                                   │
├─────────────────────────────────────────────────────────┤
│ 25 Ene 18:33 | Juan Pérez    | Escaneo | ✅ Exitoso   │
│ 25 Ene 18:33 | María García  | Escaneo | ✅ Exitoso   │
│ 25 Ene 18:33 | Carlos López  | Escaneo | ✅ Exitoso   │
│ 25 Ene 18:33 | Ana Martínez  | Escaneo | ✅ Exitoso   │
│ 25 Ene 18:33 | Pedro Sánchez | Escaneo | ✅ Exitoso   │
└─────────────────────────────────────────────────────────┘
```

**Consulta necesaria:**
```typescript
const logs = data.recent_usage_logs.slice(0, 10);
```

#### 5. **Sección: Tendencias de Uso (12 meses)** - Prioridad: MEDIA

**Visualización:**
- Gráfico de barras: Escaneos por mes (últimos 12 meses)
- Gráfico de líneas: Prompts y Tokens por mes

**Consulta necesaria:**
```typescript
const monthlyData = data.monthly_usage_summary.slice(0, 12);
```

#### 6. **Sección: Usuarios Activos** - Prioridad: BAJA

**Métricas:**
- Total de usuarios
- Usuarios con escaneo reciente (últimos 7 días)
- Usuarios inactivos (sin escaneo > 30 días)

**Visualización:**
```
┌─────────────────────────────────────────┐
│ 👥 Usuarios                             │
├─────────────────────────────────────────┤
│ Total: 5                                │
│ Activos (7 días): 5 (100%)             │
│ Inactivos (30+ días): 0 (0%)           │
└─────────────────────────────────────────┘
```

**Consulta necesaria:**
```typescript
const activeUsers = data.recent_scans
  .filter(s => {
    const daysSince = (Date.now() - new Date(s.created_at)) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  })
  .map(s => s.user_id)
  .filter((v, i, a) => a.indexOf(v) === i) // unique
  .length;
```

---

## Plan de Implementación

### Fase 1: Correcciones Críticas (Prioridad ALTA) - 1 día

**Objetivo:** Hacer que los dashboards muestren datos básicos sin errores

1. **Employee Dashboard**
   - Mostrar último escaneo con métricas clave
   - Mostrar tendencias básicas
   - Agregar alertas de riesgo

2. **Leader Dashboard**
   - Mostrar resumen del equipo
   - Listar miembros con estado
   - Agregar alertas de riesgo

3. **HR Dashboard**
   - **FIX CRÍTICO:** Corregir error `team_members.map`
   - Mostrar resumen organizacional
   - Listar departamentos con métricas

4. **Organization Dashboard**
   - Mostrar estado de suscripción
   - Mostrar consumo mensual
   - Agregar alertas de límite

### Fase 2: Visualizaciones Avanzadas (Prioridad MEDIA) - 2 días

**Objetivo:** Agregar gráficos y visualizaciones interactivas

1. Gráficos de tendencias (líneas)
2. Gráficos de comparación (barras)
3. Tablas interactivas con filtros
4. Exportación de datos (CSV, PDF)

### Fase 3: Funcionalidades Adicionales (Prioridad BAJA) - 1 día

**Objetivo:** Mejorar UX y agregar funcionalidades nice-to-have

1. Notificaciones push para alertas
2. Comparación entre períodos
3. Benchmarking con industria
4. Reportes automatizados

---

## Justificación de Prioridades

### Por qué Fase 1 es ALTA prioridad:

1. **Employee Dashboard**: Los empleados necesitan ver su progreso personal para motivarse a hacer escaneos regulares
2. **Leader Dashboard**: Los líderes necesitan identificar miembros en riesgo para tomar acción preventiva
3. **HR Dashboard**: RRHH necesita vista global para asignar recursos y programas de bienestar
4. **Organization Dashboard**: Admins necesitan monitorear consumo para evitar sobrecostos

### Métricas de Éxito:

- ✅ 0 errores de JavaScript en consola
- ✅ Todos los dashboards muestran datos reales
- ✅ Alertas de riesgo funcionando
- ✅ Tiempo de carga < 2 segundos
- ✅ Usuarios pueden tomar decisiones basadas en datos

---

## Anexo: Mockups Textuales

### Employee Dashboard - Vista Completa

```
┌─────────────────────────────────────────────────────────────┐
│ HoloCheck Equilibria - Mi Dashboard                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────┐  ┌─────────────────────────┐  │
│ │ Último Escaneo          │  │ Tendencias (30 días)    │  │
│ │ 25 Ene 2026 18:33       │  │                         │  │
│ │                         │  │ Stress:  25.8 ↓ -5%    │  │
│ │ ❤️  Heart Rate: 72 BPM  │  │ Fatigue: 21.8 ↓ -8%    │  │
│ │ 😰 Stress: 33.6 🟢      │  │ Recovery: 55.7 ↑ +12%  │  │
│ │ 😴 Fatigue: 16.5 🟢     │  │                         │  │
│ │ 💪 Recovery: 62.0 🟢    │  │ [Gráfico de líneas]    │  │
│ │ ⭐ Wellness: 90.3 🟢    │  │                         │  │
│ │ 🎂 Bio Age: 27 (30) ✨  │  │                         │  │
│ └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
│ ┌─────────────────────────┐  ┌─────────────────────────┐  │
│ │ ⚠️  Alertas de Salud    │  │ Historial               │  │
│ │                         │  │                         │  │
│ │ 🫀 Riesgo CV: 1.39% 🟢 │  │ [Tabla con últimos     │  │
│ │ 🧠 Riesgo ACV: 2.04% 🟢│  │  10 escaneos]          │  │
│ │ 💓 Arritmias: 3         │  │                         │  │
│ │ 😰 Estrés: 5.09 🟢     │  │                         │  │
│ └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
│ [Botón: Hacer Nuevo Escaneo]                               │
└─────────────────────────────────────────────────────────────┘
```

### Leader Dashboard - Vista Completa

```
┌─────────────────────────────────────────────────────────────┐
│ HoloCheck Equilibria - Dashboard del Equipo                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────┐  ┌─────────────────────────┐  │
│ │ 👥 Mi Equipo (5)        │  │ ⚠️  Alertas             │  │
│ │                         │  │                         │  │
│ │ Stress: 25.8 🟢         │  │ 🔴 1 con stress alto    │  │
│ │ Fatigue: 21.8 🟢        │  │ 🟡 0 con fatigue alto   │  │
│ │ Recovery: 55.7 🟢       │  │ ⏰ 0 sin escaneo        │  │
│ │ Wellness: 83.6 🟢       │  │                         │  │
│ │ Burnout: 4.4/10 🟢     │  │ [Ver detalles]          │  │
│ └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ 👤 Estado del Equipo                                  │  │
│ ├───────────────────────────────────────────────────────┤  │
│ │ Juan Pérez      | 24 Ene | Stress: 33 🟢 | OK       │  │
│ │ María García    | 25 Ene | Stress: 21 🟢 | OK       │  │
│ │ Carlos López ⚠️ | 23 Ene | Stress: 75 🔴 | RIESGO   │  │
│ │ Ana Martínez    | 25 Ene | Stress: 38 🟢 | OK       │  │
│ │ Pedro Sánchez   | 24 Ene | Stress: 23 🟢 | OK       │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 📊 Tendencias del Equipo (4 semanas)               │    │
│ │ [Gráfico de líneas: Stress, Fatigue, Recovery]     │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

**Fin del Análisis de Dashboards**