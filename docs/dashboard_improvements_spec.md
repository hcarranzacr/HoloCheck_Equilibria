# Especificaciones de Mejoras de Dashboards - HoloCheck Equilibria

**Fecha:** 2026-01-25  
**Versión:** 1.0  
**Analista:** Emma (Product Manager)  
**Basado en:** Análisis de David (Data Architect) - Vistas e Índices Existentes

---

## Resumen Ejecutivo

Este documento especifica las mejoras detalladas para los 4 dashboards de HoloCheck Equilibria, aprovechando las **4 vistas SQL ya aplicadas** y los **8 índices de performance** existentes en la base de datos.

### Objetivos de las Mejoras

1. **Aumentar valor para usuarios**: Proporcionar insights accionables basados en datos históricos
2. **Mejorar detección de riesgos**: Alertas tempranas de burnout, stress alto y problemas de salud
3. **Facilitar toma de decisiones**: Visualizaciones claras con comparaciones y tendencias
4. **Optimizar performance**: Usar vistas existentes para consultas rápidas (< 50ms)

### Vistas SQL Disponibles

Las siguientes vistas ya están aplicadas en producción y deben ser utilizadas:

1. **`vw_latest_scans_by_user`** - Último escaneo por empleado (10x más rápido)
2. **`vw_current_department_metrics`** - Métricas departamentales en tiempo real
3. **`vw_usage_monthly_summary`** - Resumen mensual de uso organizacional
4. **`vw_employees_at_risk`** - Empleados en riesgo automático (stress > 70, fatigue > 70, etc.)

### Impacto Esperado

- **Employee Dashboard**: De "solo hacer scan" → Dashboard completo con histórico, tendencias y alertas
- **Leader Dashboard**: De métricas básicas → Vista completa del equipo con detección de riesgos
- **HR Dashboard**: De vista general → Análisis profundo con comparaciones departamentales
- **Organization Dashboard**: De métricas simples → Panel ejecutivo con proyecciones y ROI

---

## 1. Employee Dashboard (Perfil: Empleado)

### Mejora 1.1: Histórico de Escaneos con Tendencias - Prioridad: ALTA

**Vista/Tabla a usar:** `biometric_measurements`

**Visualización:** LineChart + Cards con métricas

**Consulta SQL:**
```sql
-- Obtener últimos 90 días de escaneos del usuario
SELECT 
  created_at::date as scan_date,
  ai_stress,
  ai_fatigue,
  ai_recovery,
  wellness_index_score,
  mental_stress_index,
  heart_rate
FROM biometric_measurements
WHERE user_id = $1
  AND created_at >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY created_at ASC;
```

**Campos a mostrar:**
- `scan_date`: Fecha del escaneo (eje X del gráfico)
- `ai_stress`: Nivel de estrés (línea roja en gráfico)
- `ai_fatigue`: Nivel de fatiga (línea naranja)
- `ai_recovery`: Nivel de recuperación (línea verde)
- `wellness_index_score`: Índice de bienestar general

**Lógica de negocio:**
- Calcular tendencia: comparar promedio últimos 7 días vs 7 días anteriores
- Indicador de tendencia: ↑ si mejora > 5%, ↓ si empeora > 5%, → si estable
- Períodos seleccionables: 7, 30, 60, 90 días
- Mostrar promedio del período en card separado

**Componente React sugerido:**
```typescript
<EmployeeHistoryChart 
  data={scanHistory}
  period={selectedPeriod} // 7, 30, 60, 90
  metrics={['ai_stress', 'ai_fatigue', 'ai_recovery']}
  showTrend={true}
/>
```

**Props necesarios:**
- `data`: Array de escaneos con fechas y métricas
- `period`: Número de días a mostrar
- `metrics`: Array de métricas a graficar
- `showTrend`: Boolean para mostrar indicadores de tendencia

**Estado a manejar:**
```typescript
const [scanHistory, setScanHistory] = useState([]);
const [selectedPeriod, setSelectedPeriod] = useState(30);
const [trendIndicators, setTrendIndicators] = useState({});
```

---

### Mejora 1.2: Alertas de Riesgo Personalizadas - Prioridad: ALTA

**Vista/Tabla a usar:** `vw_latest_scans_by_user`

**Visualización:** Alert Cards con colores semafóricos

**Consulta SQL:**
```sql
-- Obtener último escaneo con evaluación de riesgos
SELECT 
  ai_stress,
  ai_fatigue,
  ai_recovery,
  mental_stress_index,
  cv_risk_heart_attack,
  cv_risk_stroke,
  arrhythmias_detected,
  bio_age_basic,
  created_at
FROM vw_latest_scans_by_user
WHERE user_id = $1;
```

**Campos a mostrar:**
- `ai_stress`: Nivel de estrés (umbral: > 70 crítico, 50-70 atención, < 50 bien)
- `ai_fatigue`: Nivel de fatiga (umbral: > 70 crítico, 50-70 atención, < 50 bien)
- `mental_stress_index`: Índice de estrés mental (umbral: > 5.0 crítico)
- `cv_risk_heart_attack`: Riesgo cardiovascular infarto (umbral: > 3.0 crítico)
- `cv_risk_stroke`: Riesgo cardiovascular ACV (umbral: > 2.5 crítico)
- `arrhythmias_detected`: Arritmias detectadas (> 5 crítico)

**Lógica de negocio:**
```typescript
// Función para evaluar nivel de riesgo
function evaluateRisk(metric: string, value: number): RiskLevel {
  const thresholds = {
    ai_stress: { critical: 70, warning: 50 },
    ai_fatigue: { critical: 70, warning: 50 },
    mental_stress_index: { critical: 5.0, warning: 3.0 },
    cv_risk_heart_attack: { critical: 3.0, warning: 2.0 },
    cv_risk_stroke: { critical: 2.5, warning: 1.5 }
  };
  
  const t = thresholds[metric];
  if (value >= t.critical) return 'critical'; // 🔴
  if (value >= t.warning) return 'warning';   // 🟡
  return 'good';                              // 🟢
}
```

**Componente React sugerido:**
```typescript
<RiskAlertPanel
  latestScan={latestScan}
  thresholds={riskThresholds}
  onAlertClick={(alert) => showRecommendations(alert)}
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────┐
│ ⚠️  Alertas de Salud                    │
├─────────────────────────────────────────┤
│ 🔴 Estrés Alto: 75/100                  │
│    Recomendación: Toma un descanso      │
│                                         │
│ 🟡 Fatiga Moderada: 55/100             │
│    Recomendación: Mejora tu sueño       │
│                                         │
│ 🟢 Recuperación Buena: 65/100          │
│                                         │
│ 🟢 Riesgo CV Bajo: 1.5%                │
└─────────────────────────────────────────┘
```

---

### Mejora 1.3: Comparación con Departamento - Prioridad: ALTA

**Vista/Tabla a usar:** `vw_latest_scans_by_user` + `vw_current_department_metrics`

**Visualización:** BarChart comparativo + Cards

**Consulta SQL:**
```sql
-- Obtener métricas del usuario y promedio del departamento
WITH user_metrics AS (
  SELECT 
    ai_stress as my_stress,
    ai_fatigue as my_fatigue,
    ai_recovery as my_recovery,
    wellness_index_score as my_wellness,
    department_id
  FROM vw_latest_scans_by_user
  WHERE user_id = $1
)
SELECT 
  um.my_stress,
  um.my_fatigue,
  um.my_recovery,
  um.my_wellness,
  dm.avg_stress as dept_avg_stress,
  dm.avg_fatigue as dept_avg_fatigue,
  dm.avg_recovery as dept_avg_recovery,
  dm.avg_wellness_index as dept_avg_wellness,
  dm.department_name
FROM user_metrics um
JOIN vw_current_department_metrics dm ON um.department_id = dm.department_id;
```

**Campos a mostrar:**
- `my_stress` vs `dept_avg_stress`: Mi estrés vs promedio del equipo
- `my_fatigue` vs `dept_avg_fatigue`: Mi fatiga vs promedio del equipo
- `my_recovery` vs `dept_avg_recovery`: Mi recuperación vs promedio del equipo
- `my_wellness` vs `dept_avg_wellness`: Mi bienestar vs promedio del equipo

**Lógica de negocio:**
```typescript
// Calcular diferencia porcentual
function calculateDifference(myValue: number, avgValue: number): string {
  const diff = ((myValue - avgValue) / avgValue) * 100;
  if (Math.abs(diff) < 5) return '→ Similar al equipo';
  if (diff > 0) return `↑ ${diff.toFixed(1)}% sobre el promedio`;
  return `↓ ${Math.abs(diff).toFixed(1)}% bajo el promedio`;
}
```

**Componente React sugerido:**
```typescript
<DepartmentComparisonChart
  myMetrics={userMetrics}
  departmentAverage={deptMetrics}
  departmentName={deptName}
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────┐
│ 📊 Comparación con mi Equipo            │
│     (Departamento: Ingeniería)          │
├─────────────────────────────────────────┤
│ Estrés:                                 │
│   Yo: 35  [████░░░░░░] 🟢              │
│   Equipo: 42  [█████░░░░░] 🟢          │
│   ↓ 16.7% bajo el promedio ✨          │
│                                         │
│ Fatiga:                                 │
│   Yo: 28  [███░░░░░░░] 🟢              │
│   Equipo: 25  [███░░░░░░░] 🟢          │
│   ↑ 12.0% sobre el promedio            │
│                                         │
│ Recuperación:                           │
│   Yo: 68  [███████░░░] 🟢              │
│   Equipo: 62  [██████░░░░] 🟢          │
│   ↑ 9.7% sobre el promedio ✨          │
└─────────────────────────────────────────┘
```

---

### Mejora 1.4: Recomendaciones de Bienestar - Prioridad: MEDIA

**Vista/Tabla a usar:** `vw_latest_scans_by_user`

**Visualización:** Card con lista de recomendaciones

**Consulta SQL:**
```sql
-- Obtener último escaneo para generar recomendaciones
SELECT 
  ai_stress,
  ai_fatigue,
  ai_recovery,
  ai_cognitive_load,
  heart_rate,
  wellness_index_score
FROM vw_latest_scans_by_user
WHERE user_id = $1;
```

**Lógica de negocio:**
```typescript
// Motor de recomendaciones basado en métricas
function generateRecommendations(scan: BiometricScan): Recommendation[] {
  const recommendations = [];
  
  if (scan.ai_stress > 70) {
    recommendations.push({
      priority: 'high',
      category: 'stress',
      title: 'Reduce tu estrés',
      description: 'Tu nivel de estrés es alto. Intenta técnicas de respiración profunda.',
      actions: ['Toma 5 minutos de meditación', 'Sal a caminar 10 minutos']
    });
  }
  
  if (scan.ai_fatigue > 60) {
    recommendations.push({
      priority: 'medium',
      category: 'fatigue',
      title: 'Mejora tu descanso',
      description: 'Tu fatiga está elevada. Prioriza un buen sueño esta noche.',
      actions: ['Duerme 7-8 horas', 'Evita cafeína después de las 3pm']
    });
  }
  
  if (scan.ai_recovery < 40) {
    recommendations.push({
      priority: 'medium',
      category: 'recovery',
      title: 'Aumenta tu recuperación',
      description: 'Tu capacidad de recuperación es baja.',
      actions: ['Haz ejercicio ligero', 'Mantente hidratado']
    });
  }
  
  if (scan.wellness_index_score > 8) {
    recommendations.push({
      priority: 'low',
      category: 'wellness',
      title: '¡Excelente trabajo!',
      description: 'Tu bienestar general es muy bueno. Mantén estos hábitos.',
      actions: ['Continúa con tu rutina actual']
    });
  }
  
  return recommendations;
}
```

**Componente React sugerido:**
```typescript
<WellnessRecommendations
  scan={latestScan}
  onActionClick={(action) => trackAction(action)}
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────┐
│ 💡 Recomendaciones Personalizadas       │
├─────────────────────────────────────────┤
│ 🔴 URGENTE: Reduce tu estrés           │
│    Tu nivel de estrés es alto (75/100) │
│    ✓ Toma 5 minutos de meditación      │
│    ✓ Sal a caminar 10 minutos          │
│    [Ver más]                            │
│                                         │
│ 🟡 Mejora tu descanso                   │
│    Tu fatiga está elevada (62/100)     │
│    ✓ Duerme 7-8 horas esta noche       │
│    ✓ Evita cafeína después de las 3pm  │
│    [Ver más]                            │
│                                         │
│ 🟢 ¡Excelente recuperación!            │
│    Sigue así (68/100)                   │
└─────────────────────────────────────────┘
```

---

### Mejora 1.5: Evolución Temporal - Prioridad: MEDIA

**Vista/Tabla a usar:** `biometric_measurements`

**Visualización:** LineChart con múltiples métricas + Indicadores de tendencia

**Consulta SQL:**
```sql
-- Calcular promedios semanales para ver evolución
SELECT 
  DATE_TRUNC('week', created_at)::date as week_start,
  ROUND(AVG(ai_stress), 1) as avg_stress,
  ROUND(AVG(ai_fatigue), 1) as avg_fatigue,
  ROUND(AVG(ai_recovery), 1) as avg_recovery,
  ROUND(AVG(wellness_index_score), 1) as avg_wellness,
  COUNT(*) as scan_count
FROM biometric_measurements
WHERE user_id = $1
  AND created_at >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week_start ASC;
```

**Campos a mostrar:**
- `week_start`: Inicio de la semana (eje X)
- `avg_stress`: Estrés promedio de la semana
- `avg_fatigue`: Fatiga promedio de la semana
- `avg_recovery`: Recuperación promedio de la semana
- `avg_wellness`: Bienestar promedio de la semana
- `scan_count`: Número de escaneos en la semana

**Lógica de negocio:**
```typescript
// Calcular tendencia general (últimas 4 semanas vs 4 semanas anteriores)
function calculateOverallTrend(weeklyData: WeeklyMetrics[]): TrendAnalysis {
  const recent = weeklyData.slice(-4); // Últimas 4 semanas
  const previous = weeklyData.slice(-8, -4); // 4 semanas anteriores
  
  const recentAvg = {
    stress: average(recent.map(w => w.avg_stress)),
    fatigue: average(recent.map(w => w.avg_fatigue)),
    recovery: average(recent.map(w => w.avg_recovery))
  };
  
  const previousAvg = {
    stress: average(previous.map(w => w.avg_stress)),
    fatigue: average(previous.map(w => w.avg_fatigue)),
    recovery: average(previous.map(w => w.avg_recovery))
  };
  
  return {
    stress: recentAvg.stress < previousAvg.stress ? 'improving' : 'worsening',
    fatigue: recentAvg.fatigue < previousAvg.fatigue ? 'improving' : 'worsening',
    recovery: recentAvg.recovery > previousAvg.recovery ? 'improving' : 'worsening',
    overall: calculateOverallStatus(recentAvg, previousAvg)
  };
}
```

**Componente React sugerido:**
```typescript
<TemporalEvolutionChart
  weeklyData={weeklyMetrics}
  trendAnalysis={trendAnalysis}
  period="12weeks"
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────┐
│ 📈 Evolución (Últimas 12 semanas)       │
├─────────────────────────────────────────┤
│ Tendencia General: 🟢 Mejorando        │
│                                         │
│ [Gráfico de líneas aquí]               │
│ Estrés:      35 → 28 (↓ 20%) 🟢       │
│ Fatiga:      42 → 35 (↓ 17%) 🟢       │
│ Recuperación: 55 → 68 (↑ 24%) 🟢      │
│                                         │
│ Escaneos realizados: 8/12 semanas       │
│ Promedio semanal: 0.7 escaneos         │
└─────────────────────────────────────────┘
```

---

## 2. Leader Dashboard (Perfil: Líder de Departamento)

### Mejora 2.1: Vista de Equipo Completo - Prioridad: ALTA

**Vista/Tabla a usar:** `vw_latest_scans_by_user`

**Visualización:** Table con estado de cada miembro + Indicadores visuales

**Consulta SQL:**
```sql
-- Obtener último escaneo de cada miembro del equipo
SELECT 
  user_id,
  full_name,
  email,
  ai_stress,
  ai_fatigue,
  ai_recovery,
  wellness_index_score,
  mental_stress_index,
  created_at as last_scan_date,
  CASE 
    WHEN ai_stress > 70 OR ai_fatigue > 70 OR mental_stress_index > 5.0 THEN 'critical'
    WHEN ai_stress > 50 OR ai_fatigue > 50 OR mental_stress_index > 3.0 THEN 'warning'
    ELSE 'good'
  END as risk_level
FROM vw_latest_scans_by_user
WHERE department_id = $1
ORDER BY 
  CASE 
    WHEN ai_stress > 70 OR ai_fatigue > 70 THEN 1
    WHEN ai_stress > 50 OR ai_fatigue > 50 THEN 2
    ELSE 3
  END,
  ai_stress DESC;
```

**Campos a mostrar:**
- `full_name`: Nombre del colaborador
- `last_scan_date`: Fecha del último escaneo
- `ai_stress`: Nivel de estrés (con color según umbral)
- `ai_fatigue`: Nivel de fatiga (con color según umbral)
- `ai_recovery`: Nivel de recuperación
- `risk_level`: Nivel de riesgo general (critical/warning/good)

**Lógica de negocio:**
```typescript
// Función para determinar color de fila según riesgo
function getRowColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'critical': return 'bg-red-50 border-l-4 border-red-500';
    case 'warning': return 'bg-yellow-50 border-l-4 border-yellow-500';
    default: return 'bg-white';
  }
}

// Función para formatear días desde último escaneo
function formatDaysSince(lastScanDate: Date): string {
  const days = Math.floor((Date.now() - lastScanDate.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days > 7) return `⚠️ Hace ${days} días`;
  return `Hace ${days} días`;
}
```

**Componente React sugerido:**
```typescript
<TeamMembersTable
  members={teamMembers}
  onMemberClick={(member) => showMemberDetails(member)}
  sortBy="risk_level"
  highlightAtRisk={true}
/>
```

**Mockup textual:**
```
┌──────────────────────────────────────────────────────────────────┐
│ 👥 Estado del Equipo (15 miembros)                              │
├──────────────────────────────────────────────────────────────────┤
│ Nombre          │ Último Scan │ Estrés │ Fatiga │ Recuperación │
├──────────────────────────────────────────────────────────────────┤
│ 🔴 Carlos López │ Hace 2 días │ 75 🔴  │ 68 🟡  │ 35 🔴       │
│ 🟡 Ana Martínez │ Ayer        │ 55 🟡  │ 52 🟡  │ 48 🟡       │
│ 🟢 Juan Pérez   │ Hoy         │ 32 🟢  │ 28 🟢  │ 72 🟢       │
│ 🟢 María García │ Hoy         │ 28 🟢  │ 25 🟢  │ 68 🟢       │
│ 🟢 Pedro Sánchez│ Hace 1 día  │ 35 🟢  │ 30 🟢  │ 65 🟢       │
│ ...                                                              │
├──────────────────────────────────────────────────────────────────┤
│ 🔴 1 en riesgo crítico  🟡 1 requiere atención  🟢 13 bien      │
└──────────────────────────────────────────────────────────────────┘
```

---

### Mejora 2.2: Métricas del Departamento - Prioridad: ALTA

**Vista/Tabla a usar:** `vw_current_department_metrics`

**Visualización:** Cards con KPIs + Gráfico de barras

**Consulta SQL:**
```sql
-- Obtener métricas actuales del departamento
SELECT 
  department_name,
  employee_count,
  ROUND(avg_stress, 1) as avg_stress,
  ROUND(avg_fatigue, 1) as avg_fatigue,
  ROUND(avg_cognitive_load, 1) as avg_cognitive_load,
  ROUND(avg_recovery, 1) as avg_recovery,
  ROUND(avg_bio_age, 1) as avg_bio_age,
  ROUND(avg_wellness_index, 1) as avg_wellness_index
FROM vw_current_department_metrics
WHERE department_id = $1;
```

**Campos a mostrar:**
- `employee_count`: Número de colaboradores en el equipo
- `avg_stress`: Estrés promedio del equipo
- `avg_fatigue`: Fatiga promedio del equipo
- `avg_recovery`: Recuperación promedio del equipo
- `avg_wellness_index`: Índice de bienestar promedio

**Lógica de negocio:**
```typescript
// Evaluar salud general del departamento
function evaluateDepartmentHealth(metrics: DepartmentMetrics): HealthStatus {
  const criticalCount = [
    metrics.avg_stress > 70,
    metrics.avg_fatigue > 70,
    metrics.avg_recovery < 40
  ].filter(Boolean).length;
  
  if (criticalCount >= 2) return { level: 'critical', message: 'Requiere atención urgente' };
  if (criticalCount === 1) return { level: 'warning', message: 'Requiere atención' };
  if (metrics.avg_wellness_index > 7) return { level: 'good', message: 'Equipo saludable' };
  return { level: 'moderate', message: 'Equipo en buen estado' };
}
```

**Componente React sugerido:**
```typescript
<DepartmentMetricsPanel
  metrics={deptMetrics}
  healthStatus={healthStatus}
  showComparison={true}
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────┐
│ 📊 Métricas del Departamento            │
│     Ingeniería (15 colaboradores)       │
├─────────────────────────────────────────┤
│ Estado General: 🟢 Equipo Saludable     │
│                                         │
│ 😰 Estrés Promedio:    32.5 🟢         │
│    [███░░░░░░░] Bajo                   │
│                                         │
│ 😴 Fatiga Promedio:    28.3 🟢         │
│    [███░░░░░░░] Bajo                   │
│                                         │
│ 💪 Recuperación:       68.2 🟢         │
│    [███████░░░] Bueno                  │
│                                         │
│ ⭐ Índice Bienestar:   8.3 🟢          │
│    [████████░░] Excelente              │
└─────────────────────────────────────────┘
```

---

### Mejora 2.3: Lista de Empleados en Riesgo - Prioridad: ALTA

**Vista/Tabla a usar:** `vw_employees_at_risk`

**Visualización:** Alert List + Cards con detalles

**Consulta SQL:**
```sql
-- Obtener empleados en riesgo del departamento
SELECT 
  user_id,
  full_name,
  email,
  ai_stress,
  ai_fatigue,
  mental_stress_index,
  bio_age_basic,
  created_at as last_scan_date,
  CASE 
    WHEN ai_stress > 70 THEN 'high_stress'
    WHEN ai_fatigue > 70 THEN 'high_fatigue'
    WHEN mental_stress_index > 5.0 THEN 'high_burnout'
    WHEN bio_age_basic > 50 THEN 'high_bio_age'
    ELSE 'other'
  END as risk_category
FROM vw_employees_at_risk
WHERE department_id = $1
ORDER BY 
  CASE 
    WHEN ai_stress > 70 THEN 1
    WHEN ai_fatigue > 70 THEN 2
    WHEN mental_stress_index > 5.0 THEN 3
    ELSE 4
  END,
  ai_stress DESC;
```

**Campos a mostrar:**
- `full_name`: Nombre del colaborador
- `risk_category`: Categoría de riesgo principal
- `ai_stress`: Nivel de estrés si es el riesgo principal
- `ai_fatigue`: Nivel de fatiga si es el riesgo principal
- `mental_stress_index`: Índice de burnout
- `last_scan_date`: Fecha del último escaneo

**Lógica de negocio:**
```typescript
// Generar mensaje de acción recomendada
function getRecommendedAction(riskCategory: string): string {
  const actions = {
    high_stress: 'Conversa con el colaborador sobre su carga de trabajo',
    high_fatigue: 'Sugiere tomar días de descanso',
    high_burnout: 'Considera reasignar responsabilidades',
    high_bio_age: 'Recomienda chequeo médico preventivo'
  };
  return actions[riskCategory] || 'Monitorea de cerca';
}
```

**Componente React sugerido:**
```typescript
<AtRiskEmployeesList
  employees={atRiskEmployees}
  onEmployeeClick={(emp) => showActionPlan(emp)}
  showRecommendations={true}
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️  Empleados que Requieren Atención (3)               │
├─────────────────────────────────────────────────────────┤
│ 🔴 Carlos López - Estrés Alto (75)                     │
│    Último escaneo: Hace 2 días                          │
│    💡 Acción: Conversa sobre su carga de trabajo       │
│    [Ver detalles] [Marcar como atendido]               │
│                                                         │
│ 🟡 Ana Martínez - Fatiga Moderada-Alta (55)           │
│    Último escaneo: Ayer                                 │
│    💡 Acción: Sugiere tomar un día de descanso         │
│    [Ver detalles] [Marcar como atendido]               │
│                                                         │
│ 🟡 Luis Ramírez - Riesgo de Burnout (5.2)             │
│    Último escaneo: Hoy                                  │
│    💡 Acción: Considera reasignar responsabilidades    │
│    [Ver detalles] [Marcar como atendido]               │
└─────────────────────────────────────────────────────────┘
```

---

### Mejora 2.4: Tendencias del Departamento - Prioridad: MEDIA

**Vista/Tabla a usar:** `department_insights` (tabla histórica)

**Visualización:** LineChart con múltiples métricas

**Consulta SQL:**
```sql
-- Obtener evolución mensual del departamento
SELECT 
  analysis_period::date as period,
  employee_count,
  ROUND(avg_stress, 1) as avg_stress,
  ROUND(avg_fatigue, 1) as avg_fatigue,
  ROUND(avg_recovery, 1) as avg_recovery,
  ROUND(wellness_index, 1) as wellness_index,
  ROUND(burnout_risk_score, 1) as burnout_risk
FROM department_insights
WHERE department_id = $1
  AND analysis_period >= CURRENT_DATE - INTERVAL '6 months'
ORDER BY analysis_period ASC;
```

**Campos a mostrar:**
- `period`: Período de análisis (eje X)
- `avg_stress`: Estrés promedio del período
- `avg_fatigue`: Fatiga promedio del período
- `avg_recovery`: Recuperación promedio del período
- `wellness_index`: Índice de bienestar del período
- `burnout_risk`: Riesgo de burnout del período

**Lógica de negocio:**
```typescript
// Calcular tendencia del departamento
function calculateDepartmentTrend(historicalData: DepartmentInsight[]): TrendAnalysis {
  const recent = historicalData.slice(-3); // Últimos 3 meses
  const previous = historicalData.slice(-6, -3); // 3 meses anteriores
  
  const recentAvg = {
    stress: average(recent.map(d => d.avg_stress)),
    wellness: average(recent.map(d => d.wellness_index))
  };
  
  const previousAvg = {
    stress: average(previous.map(d => d.avg_stress)),
    wellness: average(previous.map(d => d.wellness_index))
  };
  
  return {
    stress: recentAvg.stress < previousAvg.stress ? 'improving' : 'worsening',
    wellness: recentAvg.wellness > previousAvg.wellness ? 'improving' : 'worsening',
    overall: recentAvg.stress < previousAvg.stress && recentAvg.wellness > previousAvg.wellness 
      ? 'improving' : 'needs_attention'
  };
}
```

**Componente React sugerido:**
```typescript
<DepartmentTrendsChart
  historicalData={deptHistory}
  trendAnalysis={trendAnalysis}
  period="6months"
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────┐
│ 📈 Tendencias del Equipo (6 meses)      │
├─────────────────────────────────────────┤
│ Tendencia General: 🟢 Mejorando        │
│                                         │
│ [Gráfico de líneas aquí]               │
│                                         │
│ Estrés:      42 → 32 (↓ 24%) 🟢       │
│ Fatiga:      38 → 28 (↓ 26%) 🟢       │
│ Bienestar:   7.2 → 8.2 (↑ 14%) 🟢     │
│ Burnout:     4.2 → 2.8 (↓ 33%) 🟢     │
│                                         │
│ Tamaño del equipo: 12 → 15 (+25%)      │
└─────────────────────────────────────────┘
```

---

### Mejora 2.5: Comparación con Otros Departamentos - Prioridad: MEDIA

**Vista/Tabla a usar:** `vw_current_department_metrics`

**Visualización:** BarChart comparativo + Ranking

**Consulta SQL:**
```sql
-- Obtener métricas de todos los departamentos de la organización
WITH my_dept AS (
  SELECT organization_id
  FROM departments
  WHERE id = $1
)
SELECT 
  dm.department_id,
  dm.department_name,
  dm.employee_count,
  ROUND(dm.avg_stress, 1) as avg_stress,
  ROUND(dm.avg_fatigue, 1) as avg_fatigue,
  ROUND(dm.avg_wellness_index, 1) as avg_wellness_index,
  CASE WHEN dm.department_id = $1 THEN true ELSE false END as is_my_department
FROM vw_current_department_metrics dm
JOIN departments d ON dm.department_id = d.id
WHERE d.organization_id = (SELECT organization_id FROM my_dept)
ORDER BY dm.avg_wellness_index DESC;
```

**Campos a mostrar:**
- `department_name`: Nombre del departamento
- `employee_count`: Tamaño del equipo
- `avg_stress`: Estrés promedio
- `avg_wellness_index`: Índice de bienestar
- `is_my_department`: Indicador de mi departamento

**Lógica de negocio:**
```typescript
// Calcular posición en ranking
function calculateRanking(allDepts: DepartmentMetrics[], myDeptId: string): RankingInfo {
  const sorted = [...allDepts].sort((a, b) => b.avg_wellness_index - a.avg_wellness_index);
  const myPosition = sorted.findIndex(d => d.department_id === myDeptId) + 1;
  
  return {
    position: myPosition,
    total: sorted.length,
    percentile: Math.round((1 - (myPosition / sorted.length)) * 100),
    message: myPosition <= sorted.length / 3 
      ? '¡Top 33%! Excelente desempeño' 
      : myPosition <= (sorted.length * 2) / 3
      ? 'Desempeño promedio'
      : 'Oportunidad de mejora'
  };
}
```

**Componente React sugerido:**
```typescript
<DepartmentBenchmarkChart
  allDepartments={allDepts}
  myDepartmentId={myDeptId}
  metric="avg_wellness_index"
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────────────────────┐
│ 🏆 Ranking de Departamentos (Índice de Bienestar)      │
├─────────────────────────────────────────────────────────┤
│ Tu equipo: #2 de 5 (Top 40%) ⭐                        │
│                                                         │
│ 1. Ventas           [█████████░] 8.9  (12 personas)   │
│ 2. Ingeniería (TÚ)  [████████░░] 8.3  (15 personas)   │
│ 3. Marketing        [███████░░░] 7.8  (8 personas)    │
│ 4. Operaciones      [██████░░░░] 7.3  (20 personas)   │
│ 5. Soporte          [█████░░░░░] 6.9  (10 personas)   │
│                                                         │
│ 📊 Comparación de Estrés:                              │
│    Tu equipo: 32.5  |  Promedio org: 38.2             │
│    ↓ 15% bajo el promedio 🟢                           │
└─────────────────────────────────────────────────────────┘
```

---

### Mejora 2.6: Alertas de Equipo - Prioridad: ALTA

**Vista/Tabla a usar:** `vw_employees_at_risk` + `vw_latest_scans_by_user`

**Visualización:** Alert Banner + Cards

**Consulta SQL:**
```sql
-- Detectar alertas del equipo
WITH team_stats AS (
  SELECT 
    COUNT(*) as total_members,
    COUNT(*) FILTER (WHERE ai_stress > 70) as high_stress_count,
    COUNT(*) FILTER (WHERE ai_fatigue > 70) as high_fatigue_count,
    COUNT(*) FILTER (WHERE created_at < CURRENT_DATE - INTERVAL '7 days') as no_recent_scan_count,
    ROUND(AVG(ai_stress), 1) as avg_stress,
    ROUND(AVG(wellness_index_score), 1) as avg_wellness
  FROM vw_latest_scans_by_user
  WHERE department_id = $1
)
SELECT 
  *,
  CASE 
    WHEN high_stress_count >= 3 THEN 'critical'
    WHEN high_stress_count >= 2 OR high_fatigue_count >= 2 THEN 'warning'
    WHEN no_recent_scan_count > total_members * 0.3 THEN 'warning'
    ELSE 'good'
  END as alert_level
FROM team_stats;
```

**Campos a mostrar:**
- `high_stress_count`: Número de miembros con estrés alto
- `high_fatigue_count`: Número de miembros con fatiga alta
- `no_recent_scan_count`: Número de miembros sin escaneo reciente
- `avg_stress`: Estrés promedio del equipo
- `alert_level`: Nivel de alerta general

**Lógica de negocio:**
```typescript
// Generar alertas del equipo
function generateTeamAlerts(stats: TeamStats): Alert[] {
  const alerts = [];
  
  if (stats.high_stress_count >= 3) {
    alerts.push({
      level: 'critical',
      title: 'Múltiples miembros con estrés alto',
      message: `${stats.high_stress_count} miembros tienen estrés > 70`,
      action: 'Revisa la carga de trabajo del equipo',
      priority: 1
    });
  }
  
  if (stats.high_fatigue_count >= 2) {
    alerts.push({
      level: 'warning',
      title: 'Fatiga elevada en el equipo',
      message: `${stats.high_fatigue_count} miembros tienen fatiga > 70`,
      action: 'Considera redistribuir tareas',
      priority: 2
    });
  }
  
  if (stats.no_recent_scan_count > stats.total_members * 0.3) {
    alerts.push({
      level: 'warning',
      title: 'Baja participación en escaneos',
      message: `${stats.no_recent_scan_count} miembros sin escaneo reciente`,
      action: 'Recuerda al equipo realizar escaneos',
      priority: 3
    });
  }
  
  if (stats.avg_stress > 60) {
    alerts.push({
      level: 'warning',
      title: 'Estrés promedio elevado',
      message: `Estrés promedio del equipo: ${stats.avg_stress}`,
      action: 'Evalúa factores estresantes comunes',
      priority: 2
    });
  }
  
  return alerts.sort((a, b) => a.priority - b.priority);
}
```

**Componente React sugerido:**
```typescript
<TeamAlertsPanel
  alerts={teamAlerts}
  onAlertClick={(alert) => showActionPlan(alert)}
  dismissible={true}
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────────────────────┐
│ 🚨 Alertas del Equipo                                   │
├─────────────────────────────────────────────────────────┤
│ 🔴 CRÍTICO: Múltiples miembros con estrés alto         │
│    3 colaboradores tienen estrés > 70                   │
│    💡 Acción: Revisa la carga de trabajo del equipo    │
│    [Ver detalles] [Marcar como revisado]               │
│                                                         │
│ 🟡 ATENCIÓN: Fatiga elevada en el equipo               │
│    2 colaboradores tienen fatiga > 70                   │
│    💡 Acción: Considera redistribuir tareas            │
│    [Ver detalles] [Marcar como revisado]               │
│                                                         │
│ 🟡 INFO: Baja participación en escaneos                │
│    5 miembros sin escaneo en los últimos 7 días        │
│    💡 Acción: Recuerda al equipo realizar escaneos     │
│    [Enviar recordatorio]                                │
└─────────────────────────────────────────────────────────┘
```

---

## 3. HR Dashboard (Perfil: Recursos Humanos)

### Mejora 3.1: Vista de Todos los Departamentos - Prioridad: ALTA

**Vista/Tabla a usar:** `vw_current_department_metrics`

**Visualización:** Table con métricas + BarChart comparativo

**Consulta SQL:**
```sql
-- Obtener métricas de todos los departamentos
SELECT 
  department_id,
  department_name,
  employee_count,
  ROUND(avg_stress, 1) as avg_stress,
  ROUND(avg_fatigue, 1) as avg_fatigue,
  ROUND(avg_cognitive_load, 1) as avg_cognitive_load,
  ROUND(avg_recovery, 1) as avg_recovery,
  ROUND(avg_bio_age, 1) as avg_bio_age,
  ROUND(avg_wellness_index, 1) as avg_wellness_index,
  CASE 
    WHEN avg_stress > 60 OR avg_fatigue > 60 THEN 'high_risk'
    WHEN avg_stress > 45 OR avg_fatigue > 45 THEN 'medium_risk'
    ELSE 'low_risk'
  END as risk_category
FROM vw_current_department_metrics
WHERE department_id IN (
  SELECT id FROM departments WHERE organization_id = $1
)
ORDER BY 
  CASE 
    WHEN avg_stress > 60 OR avg_fatigue > 60 THEN 1
    WHEN avg_stress > 45 OR avg_fatigue > 45 THEN 2
    ELSE 3
  END,
  avg_stress DESC;
```

**Campos a mostrar:**
- `department_name`: Nombre del departamento
- `employee_count`: Tamaño del equipo
- `avg_stress`: Estrés promedio (con color según umbral)
- `avg_fatigue`: Fatiga promedio (con color según umbral)
- `avg_wellness_index`: Índice de bienestar
- `risk_category`: Categoría de riesgo

**Lógica de negocio:**
```typescript
// Evaluar prioridad de intervención por departamento
function evaluateInterventionPriority(dept: DepartmentMetrics): Priority {
  const riskScore = 
    (dept.avg_stress > 60 ? 3 : dept.avg_stress > 45 ? 2 : 0) +
    (dept.avg_fatigue > 60 ? 3 : dept.avg_fatigue > 45 ? 2 : 0) +
    (dept.avg_wellness_index < 6 ? 2 : 0);
  
  if (riskScore >= 5) return { level: 'urgent', message: 'Requiere intervención inmediata' };
  if (riskScore >= 3) return { level: 'high', message: 'Requiere atención prioritaria' };
  if (riskScore >= 1) return { level: 'medium', message: 'Monitorear de cerca' };
  return { level: 'low', message: 'En buen estado' };
}
```

**Componente React sugerido:**
```typescript
<AllDepartmentsTable
  departments={allDepts}
  onDepartmentClick={(dept) => showDepartmentDetails(dept)}
  sortBy="risk_category"
  showComparison={true}
/>
```

**Mockup textual:**
```
┌────────────────────────────────────────────────────────────────────────┐
│ 🏢 Vista de Departamentos (5 departamentos, 65 empleados)             │
├────────────────────────────────────────────────────────────────────────┤
│ Departamento  │ Empleados │ Estrés │ Fatiga │ Bienestar │ Prioridad   │
├────────────────────────────────────────────────────────────────────────┤
│ 🔴 Soporte    │    10     │ 68 🔴  │ 72 🔴  │  6.5 🟡   │ URGENTE     │
│ 🟡 Operaciones│    20     │ 52 🟡  │ 48 🟡  │  7.2 🟢   │ ALTA        │
│ 🟡 Marketing  │     8     │ 48 🟡  │ 42 🟢  │  7.8 🟢   │ MEDIA       │
│ 🟢 Ingeniería │    15     │ 32 🟢  │ 28 🟢  │  8.2 🟢   │ BAJA        │
│ 🟢 Ventas     │    12     │ 28 🟢  │ 25 🟢  │  8.8 🟢   │ BAJA        │
├────────────────────────────────────────────────────────────────────────┤
│ Promedio Org: │    13     │ 45.6   │ 43.0   │  7.7     │             │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Mejora 3.2: Empleados en Riesgo Organizacional - Prioridad: ALTA

**Vista/Tabla a usar:** `vw_employees_at_risk`

**Visualización:** Filterable Table + Export functionality

**Consulta SQL:**
```sql
-- Obtener todos los empleados en riesgo de la organización
SELECT 
  user_id,
  full_name,
  email,
  department_id,
  ai_stress,
  ai_fatigue,
  mental_stress_index,
  bio_age_basic,
  wellness_index_score,
  created_at as last_scan_date,
  CASE 
    WHEN ai_stress > 70 THEN 'high_stress'
    WHEN ai_fatigue > 70 THEN 'high_fatigue'
    WHEN mental_stress_index > 5.0 THEN 'high_burnout'
    WHEN bio_age_basic > 50 THEN 'high_bio_age'
    ELSE 'other'
  END as primary_risk,
  CASE 
    WHEN ai_stress > 70 OR mental_stress_index > 5.0 THEN 'critical'
    WHEN ai_fatigue > 70 OR bio_age_basic > 50 THEN 'high'
    ELSE 'medium'
  END as risk_severity
FROM vw_employees_at_risk
WHERE organization_id = $1
ORDER BY 
  CASE 
    WHEN ai_stress > 70 OR mental_stress_index > 5.0 THEN 1
    WHEN ai_fatigue > 70 THEN 2
    ELSE 3
  END,
  ai_stress DESC;
```

**Campos a mostrar:**
- `full_name`: Nombre del empleado
- `department_id`: Departamento (necesita JOIN para obtener nombre)
- `primary_risk`: Riesgo principal
- `risk_severity`: Severidad del riesgo
- `last_scan_date`: Fecha del último escaneo

**Lógica de negocio:**
```typescript
// Generar plan de acción por tipo de riesgo
function generateActionPlan(employee: EmployeeAtRisk): ActionPlan {
  const plans = {
    high_stress: {
      immediate: 'Contactar al líder del departamento',
      shortTerm: 'Evaluar carga de trabajo y redistribuir si es necesario',
      longTerm: 'Ofrecer programa de manejo de estrés'
    },
    high_fatigue: {
      immediate: 'Sugerir días de descanso',
      shortTerm: 'Revisar horarios y flexibilidad',
      longTerm: 'Implementar política de balance vida-trabajo'
    },
    high_burnout: {
      immediate: 'Reunión con líder y RRHH',
      shortTerm: 'Reasignar responsabilidades críticas',
      longTerm: 'Plan de desarrollo y rotación de tareas'
    },
    high_bio_age: {
      immediate: 'Recomendar chequeo médico',
      shortTerm: 'Ofrecer programa de wellness',
      longTerm: 'Seguimiento trimestral de salud'
    }
  };
  
  return plans[employee.primary_risk] || plans.high_stress;
}
```

**Componente React sugerido:**
```typescript
<AtRiskEmployeesTable
  employees={atRiskEmployees}
  filters={{
    department: selectedDepartment,
    riskType: selectedRiskType,
    severity: selectedSeverity
  }}
  onExport={() => exportToCSV(atRiskEmployees)}
  onEmployeeClick={(emp) => showActionPlan(emp)}
/>
```

**Mockup textual:**
```
┌──────────────────────────────────────────────────────────────────┐
│ ⚠️  Empleados en Riesgo (12 de 65)                              │
├──────────────────────────────────────────────────────────────────┤
│ Filtros: [Todos los deptos ▼] [Todos los riesgos ▼] [Exportar] │
├──────────────────────────────────────────────────────────────────┤
│ Nombre          │ Departamento │ Riesgo Principal │ Severidad   │
├──────────────────────────────────────────────────────────────────┤
│ Carlos López    │ Soporte      │ Estrés Alto (75) │ 🔴 CRÍTICO │
│ Ana Martínez    │ Soporte      │ Fatiga Alta (72) │ 🔴 ALTA    │
│ Luis Ramírez    │ Operaciones  │ Burnout (5.8)    │ 🔴 CRÍTICO │
│ María Gómez     │ Operaciones  │ Estrés Alto (71) │ 🔴 CRÍTICO │
│ Pedro Torres    │ Marketing    │ Fatiga Alta (68) │ 🟡 ALTA    │
│ ...                                                              │
├──────────────────────────────────────────────────────────────────┤
│ 🔴 4 críticos  🟡 5 altos  🟢 3 medios                          │
│ [Ver plan de acción] [Notificar líderes] [Exportar reporte]    │
└──────────────────────────────────────────────────────────────────┘
```

---

### Mejora 3.3: Análisis de Tendencias por Departamento - Prioridad: MEDIA

**Vista/Tabla a usar:** `department_insights` (tabla histórica)

**Visualización:** Multi-line Chart + Comparative Table

**Consulta SQL:**
```sql
-- Obtener evolución de todos los departamentos (últimos 6 meses)
SELECT 
  di.department_id,
  d.name as department_name,
  di.analysis_period::date as period,
  ROUND(di.avg_stress, 1) as avg_stress,
  ROUND(di.avg_fatigue, 1) as avg_fatigue,
  ROUND(di.wellness_index, 1) as wellness_index,
  ROUND(di.burnout_risk_score, 1) as burnout_risk,
  di.employee_count
FROM department_insights di
JOIN departments d ON di.department_id = d.id
WHERE d.organization_id = $1
  AND di.analysis_period >= CURRENT_DATE - INTERVAL '6 months'
ORDER BY di.analysis_period ASC, d.name ASC;
```

**Campos a mostrar:**
- `department_name`: Nombre del departamento
- `period`: Período de análisis (eje X)
- `avg_stress`: Estrés promedio del período
- `wellness_index`: Índice de bienestar del período
- `burnout_risk`: Riesgo de burnout del período

**Lógica de negocio:**
```typescript
// Identificar departamentos con tendencias preocupantes
function identifyTrendingDepartments(historicalData: DepartmentInsight[]): TrendingDept[] {
  const deptGroups = groupBy(historicalData, 'department_id');
  
  return Object.entries(deptGroups).map(([deptId, data]) => {
    const recent = data.slice(-3); // Últimos 3 meses
    const previous = data.slice(-6, -3); // 3 meses anteriores
    
    const recentAvgStress = average(recent.map(d => d.avg_stress));
    const previousAvgStress = average(previous.map(d => d.avg_stress));
    const stressChange = ((recentAvgStress - previousAvgStress) / previousAvgStress) * 100;
    
    const recentAvgWellness = average(recent.map(d => d.wellness_index));
    const previousAvgWellness = average(previous.map(d => d.wellness_index));
    const wellnessChange = ((recentAvgWellness - previousAvgWellness) / previousAvgWellness) * 100;
    
    return {
      department_id: deptId,
      department_name: data[0].department_name,
      stress_trend: stressChange > 10 ? 'worsening' : stressChange < -10 ? 'improving' : 'stable',
      wellness_trend: wellnessChange > 10 ? 'improving' : wellnessChange < -10 ? 'worsening' : 'stable',
      stress_change_pct: stressChange,
      wellness_change_pct: wellnessChange,
      alert: stressChange > 15 || wellnessChange < -15
    };
  }).filter(d => d.alert);
}
```

**Componente React sugerido:**
```typescript
<DepartmentTrendsComparison
  historicalData={deptHistory}
  selectedDepartments={selectedDepts}
  metric={selectedMetric}
  period="6months"
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────────────────────┐
│ 📈 Tendencias por Departamento (6 meses)                │
├─────────────────────────────────────────────────────────┤
│ Métrica: [Estrés ▼] [Bienestar] [Burnout]              │
│                                                         │
│ [Gráfico multi-línea aquí]                             │
│                                                         │
│ Departamentos con Cambios Significativos:              │
│                                                         │
│ 🔴 Soporte:      Estrés ↑ 28% (48 → 62)               │
│    Acción: Requiere intervención urgente               │
│                                                         │
│ 🟡 Operaciones:  Estrés ↑ 12% (45 → 52)               │
│    Acción: Monitorear de cerca                         │
│                                                         │
│ 🟢 Ingeniería:   Estrés ↓ 18% (42 → 32)               │
│    Buena práctica: Revisar qué están haciendo bien    │
└─────────────────────────────────────────────────────────┘
```

---

### Mejora 3.4: Reportes de Uso de Suscripción - Prioridad: ALTA

**Vista/Tabla a usar:** `vw_usage_monthly_summary` + `organization_subscriptions`

**Visualización:** Cards + BarChart + Progress Bars

**Consulta SQL:**
```sql
-- Obtener consumo actual y límites
WITH current_usage AS (
  SELECT 
    total_scans,
    total_prompts_used,
    total_ai_tokens_used,
    month
  FROM vw_usage_monthly_summary
  WHERE organization_id = $1
    AND month = DATE_TRUNC('month', CURRENT_DATE)::date
),
subscription_info AS (
  SELECT 
    scan_limit_per_user_per_month,
    dept_analysis_limit,
    org_analysis_limit,
    used_scans_total,
    used_dept_analyses,
    used_org_analyses,
    (SELECT COUNT(*) FROM user_profiles WHERE organization_id = $1) as total_users
  FROM organization_subscriptions
  WHERE organization_id = $1
    AND active = true
)
SELECT 
  cu.total_scans,
  cu.total_prompts_used,
  cu.total_ai_tokens_used,
  si.scan_limit_per_user_per_month,
  si.total_users,
  si.scan_limit_per_user_per_month * si.total_users as total_scan_limit,
  si.used_scans_total,
  ROUND((si.used_scans_total::float / NULLIF(si.scan_limit_per_user_per_month * si.total_users, 0)) * 100, 1) as usage_percentage,
  si.dept_analysis_limit,
  si.used_dept_analyses,
  si.org_analysis_limit,
  si.used_org_analyses
FROM current_usage cu
CROSS JOIN subscription_info si;
```

**Campos a mostrar:**
- `total_scans`: Escaneos realizados este mes
- `total_scan_limit`: Límite total de escaneos
- `usage_percentage`: Porcentaje de uso
- `used_scans_total`: Escaneos usados
- `used_dept_analyses`: Análisis departamentales usados
- `used_org_analyses`: Análisis organizacionales usados

**Lógica de negocio:**
```typescript
// Calcular proyección de consumo
function projectUsage(currentUsage: UsageData, daysIntoMonth: number): Projection {
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const dailyRate = currentUsage.total_scans / daysIntoMonth;
  const projectedTotal = Math.round(dailyRate * daysInMonth);
  const projectedPercentage = (projectedTotal / currentUsage.total_scan_limit) * 100;
  
  return {
    projected_total: projectedTotal,
    projected_percentage: projectedPercentage,
    will_exceed: projectedPercentage > 100,
    days_until_limit: projectedPercentage > 100 
      ? Math.floor((currentUsage.total_scan_limit - currentUsage.used_scans_total) / dailyRate)
      : null,
    recommendation: projectedPercentage > 90 
      ? 'Considera aumentar tu plan'
      : projectedPercentage > 100
      ? 'Límite será excedido - Acción requerida'
      : 'Consumo dentro de lo esperado'
  };
}
```

**Componente React sugerido:**
```typescript
<SubscriptionUsagePanel
  currentUsage={usageData}
  projection={usageProjection}
  onUpgradeClick={() => showUpgradeOptions()}
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Uso de Suscripción - Enero 2026                      │
├─────────────────────────────────────────────────────────┤
│ 🔬 Escaneos Biométricos:                                │
│    Usados: 85 / 130 (65%)                               │
│    [█████████████░░░░░░] 🟡                            │
│    Proyección fin de mes: 118 / 130 (91%) 🟡           │
│                                                         │
│ 💬 Análisis Departamentales:                            │
│    Usados: 3 / 5 (60%)                                  │
│    [████████████░░░░░░░] 🟢                            │
│                                                         │
│ 🏢 Análisis Organizacionales:                           │
│    Usados: 1 / 2 (50%)                                  │
│    [██████████░░░░░░░░░] 🟢                            │
│                                                         │
│ 🤖 Tokens de IA:                                        │
│    Consumidos: 125,450 tokens                           │
│                                                         │
│ ⚠️  Alerta: Proyección indica 91% de uso               │
│    Recomendación: Monitorear de cerca                   │
│    [Ver detalles] [Considerar upgrade]                 │
└─────────────────────────────────────────────────────────┘
```

---

### Mejora 3.5: Alertas de Burnout Departamental - Prioridad: ALTA

**Vista/Tabla a usar:** `vw_current_department_metrics` + `department_insights`

**Visualización:** Alert Cards + Heatmap

**Consulta SQL:**
```sql
-- Detectar departamentos con alto riesgo de burnout
WITH current_metrics AS (
  SELECT 
    department_id,
    department_name,
    employee_count,
    avg_stress,
    avg_fatigue,
    avg_wellness_index
  FROM vw_current_department_metrics
  WHERE department_id IN (
    SELECT id FROM departments WHERE organization_id = $1
  )
),
historical_trend AS (
  SELECT 
    department_id,
    ROUND(AVG(avg_stress) FILTER (WHERE analysis_period >= CURRENT_DATE - INTERVAL '30 days'), 1) as recent_avg_stress,
    ROUND(AVG(avg_stress) FILTER (WHERE analysis_period >= CURRENT_DATE - INTERVAL '60 days' 
                                    AND analysis_period < CURRENT_DATE - INTERVAL '30 days'), 1) as previous_avg_stress
  FROM department_insights
  WHERE department_id IN (
    SELECT id FROM departments WHERE organization_id = $1
  )
  GROUP BY department_id
)
SELECT 
  cm.department_id,
  cm.department_name,
  cm.employee_count,
  cm.avg_stress,
  cm.avg_fatigue,
  cm.avg_wellness_index,
  ht.recent_avg_stress,
  ht.previous_avg_stress,
  ROUND(((ht.recent_avg_stress - ht.previous_avg_stress) / NULLIF(ht.previous_avg_stress, 0)) * 100, 1) as stress_change_pct,
  CASE 
    WHEN cm.avg_stress > 60 AND cm.avg_fatigue > 60 THEN 'critical'
    WHEN cm.avg_stress > 60 OR cm.avg_fatigue > 60 THEN 'high'
    WHEN (ht.recent_avg_stress - ht.previous_avg_stress) > 10 THEN 'rising'
    ELSE 'normal'
  END as burnout_risk_level
FROM current_metrics cm
LEFT JOIN historical_trend ht ON cm.department_id = ht.department_id
WHERE cm.avg_stress > 50 OR cm.avg_fatigue > 50 
   OR (ht.recent_avg_stress - ht.previous_avg_stress) > 10
ORDER BY 
  CASE 
    WHEN cm.avg_stress > 60 AND cm.avg_fatigue > 60 THEN 1
    WHEN cm.avg_stress > 60 OR cm.avg_fatigue > 60 THEN 2
    WHEN (ht.recent_avg_stress - ht.previous_avg_stress) > 10 THEN 3
    ELSE 4
  END,
  cm.avg_stress DESC;
```

**Campos a mostrar:**
- `department_name`: Nombre del departamento
- `employee_count`: Tamaño del equipo
- `avg_stress`: Estrés promedio actual
- `avg_fatigue`: Fatiga promedio actual
- `stress_change_pct`: Cambio porcentual de estrés (último mes vs mes anterior)
- `burnout_risk_level`: Nivel de riesgo de burnout

**Lógica de negocio:**
```typescript
// Generar plan de intervención por nivel de riesgo
function generateInterventionPlan(dept: DepartmentBurnoutRisk): InterventionPlan {
  const plans = {
    critical: {
      urgency: 'immediate',
      actions: [
        'Reunión urgente con líder del departamento',
        'Auditoría de carga de trabajo',
        'Redistribución inmediata de tareas críticas',
        'Ofrecer días de descanso al equipo',
        'Implementar programa de apoyo psicológico'
      ],
      timeline: 'Esta semana',
      followUp: 'Revisión diaria'
    },
    high: {
      urgency: 'high',
      actions: [
        'Reunión con líder del departamento',
        'Evaluación de procesos y cargas',
        'Identificar y eliminar tareas no esenciales',
        'Implementar pausas activas obligatorias',
        'Ofrecer talleres de manejo de estrés'
      ],
      timeline: 'Próximas 2 semanas',
      followUp: 'Revisión semanal'
    },
    rising: {
      urgency: 'medium',
      actions: [
        'Conversación con líder del departamento',
        'Monitoreo cercano de métricas',
        'Evaluar cambios recientes en el equipo',
        'Ofrecer recursos de bienestar',
        'Revisar distribución de proyectos'
      ],
      timeline: 'Este mes',
      followUp: 'Revisión quincenal'
    }
  };
  
  return plans[dept.burnout_risk_level] || plans.rising;
}
```

**Componente React sugerido:**
```typescript
<BurnoutAlertsDashboard
  departments={deptsBurnoutRisk}
  onDepartmentClick={(dept) => showInterventionPlan(dept)}
  showHeatmap={true}
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔥 Alertas de Burnout por Departamento                  │
├─────────────────────────────────────────────────────────┤
│ 🔴 CRÍTICO: Soporte (10 personas)                       │
│    Estrés: 68  Fatiga: 72  Cambio: ↑ 28%              │
│    💡 Acción: Intervención inmediata requerida         │
│    [Ver plan de acción]                                 │
│                                                         │
│ 🟡 ALTO: Operaciones (20 personas)                      │
│    Estrés: 62  Fatiga: 58  Cambio: ↑ 15%              │
│    💡 Acción: Reunión con líder esta semana            │
│    [Ver plan de acción]                                 │
│                                                         │
│ 🟡 EN AUMENTO: Marketing (8 personas)                   │
│    Estrés: 48  Fatiga: 42  Cambio: ↑ 18%              │
│    💡 Acción: Monitoreo cercano                        │
│    [Ver plan de acción]                                 │
│                                                         │
│ 📊 Mapa de Calor Organizacional:                        │
│ [Heatmap aquí mostrando todos los departamentos]       │
└─────────────────────────────────────────────────────────┘
```

---

### Mejora 3.6: Análisis de Distribución - Prioridad: MEDIA

**Vista/Tabla a usar:** `vw_latest_scans_by_user`

**Visualización:** Histogram + Distribution Charts

**Consulta SQL:**
```sql
-- Análisis de distribución de métricas por departamento
WITH user_metrics AS (
  SELECT 
    department_id,
    ai_stress,
    ai_fatigue,
    bio_age_basic,
    wellness_index_score
  FROM vw_latest_scans_by_user
  WHERE organization_id = $1
)
SELECT 
  d.name as department_name,
  COUNT(*) as employee_count,
  -- Distribución de estrés
  COUNT(*) FILTER (WHERE um.ai_stress < 40) as stress_low,
  COUNT(*) FILTER (WHERE um.ai_stress >= 40 AND um.ai_stress < 70) as stress_medium,
  COUNT(*) FILTER (WHERE um.ai_stress >= 70) as stress_high,
  -- Distribución de fatiga
  COUNT(*) FILTER (WHERE um.ai_fatigue < 40) as fatigue_low,
  COUNT(*) FILTER (WHERE um.ai_fatigue >= 40 AND um.ai_fatigue < 70) as fatigue_medium,
  COUNT(*) FILTER (WHERE um.ai_fatigue >= 70) as fatigue_high,
  -- Distribución de edad biológica
  ROUND(AVG(um.bio_age_basic), 1) as avg_bio_age,
  ROUND(STDDEV(um.bio_age_basic), 1) as stddev_bio_age,
  -- Distribución de bienestar
  ROUND(AVG(um.wellness_index_score), 1) as avg_wellness,
  ROUND(STDDEV(um.wellness_index_score), 1) as stddev_wellness
FROM user_metrics um
JOIN departments d ON um.department_id = d.id
GROUP BY d.name
ORDER BY stress_high DESC, fatigue_high DESC;
```

**Campos a mostrar:**
- `department_name`: Nombre del departamento
- `stress_low/medium/high`: Distribución de niveles de estrés
- `fatigue_low/medium/high`: Distribución de niveles de fatiga
- `avg_bio_age`: Edad biológica promedio
- `avg_wellness`: Bienestar promedio

**Lógica de negocio:**
```typescript
// Analizar distribución y detectar patrones
function analyzeDistribution(deptData: DistributionData): DistributionAnalysis {
  const stressDistribution = {
    low: (deptData.stress_low / deptData.employee_count) * 100,
    medium: (deptData.stress_medium / deptData.employee_count) * 100,
    high: (deptData.stress_high / deptData.employee_count) * 100
  };
  
  // Detectar si la distribución es preocupante
  const isSkewedHigh = stressDistribution.high > 30; // Más del 30% en alto
  const isSkewedMedium = stressDistribution.medium > 50; // Más del 50% en medio
  
  return {
    pattern: isSkewedHigh ? 'high_risk' : isSkewedMedium ? 'moderate_risk' : 'healthy',
    recommendation: isSkewedHigh 
      ? 'Intervención inmediata: Demasiados empleados en riesgo alto'
      : isSkewedMedium
      ? 'Monitoreo cercano: Tendencia hacia niveles medios-altos'
      : 'Mantener prácticas actuales',
    distribution: stressDistribution
  };
}
```

**Componente React sugerido:**
```typescript
<DistributionAnalysisCharts
  departmentData={distributionData}
  metric={selectedMetric}
  showHistogram={true}
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Análisis de Distribución - Estrés por Departamento   │
├─────────────────────────────────────────────────────────┤
│ Soporte (10 personas):                                  │
│ Bajo (< 40):    [██] 20%                                │
│ Medio (40-70):  [████] 40%                              │
│ Alto (> 70):    [████] 40% ⚠️                           │
│ 💡 Intervención inmediata requerida                     │
│                                                         │
│ Operaciones (20 personas):                              │
│ Bajo (< 40):    [████] 40%                              │
│ Medio (40-70):  [██████] 50%                            │
│ Alto (> 70):    [█] 10%                                 │
│ 💡 Monitoreo cercano recomendado                        │
│                                                         │
│ Ingeniería (15 personas):                               │
│ Bajo (< 40):    [████████] 80%                          │
│ Medio (40-70):  [██] 20%                                │
│ Alto (> 70):    [] 0% ✅                                │
│ 💡 Mantener prácticas actuales                          │
│                                                         │
│ [Ver análisis de Fatiga] [Ver Edad Biológica]          │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Organization Dashboard (Perfil: Administrador)

### Mejora 4.1: Métricas Organizacionales Agregadas - Prioridad: ALTA

**Vista/Tabla a usar:** `organization_insights` + `vw_latest_scans_by_user`

**Visualización:** KPI Cards + Trend Indicators

**Consulta SQL:**
```sql
-- Obtener métricas organizacionales actuales y tendencias
WITH current_org_insights AS (
  SELECT 
    total_employees,
    ROUND(stress_index, 1) as stress_index,
    ROUND(burnout_risk, 1) as burnout_risk,
    ROUND(sleep_index, 1) as sleep_index,
    ROUND(actuarial_risk, 1) as actuarial_risk,
    ROUND(claim_risk, 1) as claim_risk,
    analysis_date
  FROM organization_insights
  WHERE organization_id = $1
  ORDER BY analysis_date DESC
  LIMIT 1
),
previous_org_insights AS (
  SELECT 
    ROUND(stress_index, 1) as prev_stress_index,
    ROUND(burnout_risk, 1) as prev_burnout_risk,
    ROUND(sleep_index, 1) as prev_sleep_index
  FROM organization_insights
  WHERE organization_id = $1
    AND analysis_date < (SELECT analysis_date FROM current_org_insights)
  ORDER BY analysis_date DESC
  LIMIT 1
),
employee_stats AS (
  SELECT 
    COUNT(*) as active_employees,
    COUNT(*) FILTER (WHERE ai_stress > 70) as high_stress_count,
    COUNT(*) FILTER (WHERE ai_fatigue > 70) as high_fatigue_count,
    ROUND(AVG(wellness_index_score), 1) as avg_wellness
  FROM vw_latest_scans_by_user
  WHERE organization_id = $1
)
SELECT 
  coi.*,
  poi.prev_stress_index,
  poi.prev_burnout_risk,
  poi.prev_sleep_index,
  es.active_employees,
  es.high_stress_count,
  es.high_fatigue_count,
  es.avg_wellness,
  ROUND(((coi.stress_index - poi.prev_stress_index) / NULLIF(poi.prev_stress_index, 0)) * 100, 1) as stress_change_pct,
  ROUND(((coi.burnout_risk - poi.prev_burnout_risk) / NULLIF(poi.prev_burnout_risk, 0)) * 100, 1) as burnout_change_pct
FROM current_org_insights coi
CROSS JOIN previous_org_insights poi
CROSS JOIN employee_stats es;
```

**Campos a mostrar:**
- `total_employees`: Total de empleados
- `stress_index`: Índice de estrés organizacional
- `burnout_risk`: Riesgo de burnout organizacional
- `actuarial_risk`: Riesgo actuarial
- `claim_risk`: Riesgo de reclamos
- `avg_wellness`: Bienestar promedio
- `stress_change_pct`: Cambio porcentual de estrés
- `high_stress_count`: Número de empleados con estrés alto

**Lógica de negocio:**
```typescript
// Evaluar salud organizacional general
function evaluateOrganizationalHealth(metrics: OrgMetrics): HealthAssessment {
  const criticalFactors = [
    metrics.stress_index > 60,
    metrics.burnout_risk > 7,
    metrics.high_stress_count > metrics.total_employees * 0.15, // Más del 15%
    metrics.avg_wellness < 6
  ].filter(Boolean).length;
  
  if (criticalFactors >= 3) {
    return {
      level: 'critical',
      score: 25,
      message: 'Salud organizacional en riesgo crítico',
      actions: ['Intervención ejecutiva inmediata', 'Auditoría organizacional completa']
    };
  }
  
  if (criticalFactors >= 2) {
    return {
      level: 'warning',
      score: 50,
      message: 'Salud organizacional requiere atención',
      actions: ['Revisar políticas de bienestar', 'Implementar programas de apoyo']
    };
  }
  
  if (criticalFactors >= 1) {
    return {
      level: 'moderate',
      score: 75,
      message: 'Salud organizacional aceptable',
      actions: ['Monitoreo continuo', 'Mantener programas actuales']
    };
  }
  
  return {
    level: 'good',
    score: 90,
    message: 'Salud organizacional excelente',
    actions: ['Continuar con prácticas actuales', 'Compartir mejores prácticas']
  };
}
```

**Componente React sugerido:**
```typescript
<OrganizationalKPIPanel
  metrics={orgMetrics}
  healthAssessment={healthAssessment}
  showTrends={true}
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────────────────────┐
│ 🏢 Métricas Organizacionales                            │
│    Salud General: 🟢 Excelente (Score: 85/100)         │
├─────────────────────────────────────────────────────────┤
│ 👥 Empleados Activos: 65                                │
│    ⚠️  3 en riesgo alto (4.6%)                          │
│                                                         │
│ 😰 Índice de Estrés: 45.6 🟢                           │
│    Tendencia: ↓ 8.5% vs mes anterior                   │
│    [████████░░] Bajo-Medio                             │
│                                                         │
│ 🔥 Riesgo de Burnout: 4.2 🟢                           │
│    Tendencia: ↓ 12.3% vs mes anterior                  │
│    [████░░░░░░] Bajo                                   │
│                                                         │
│ 😴 Índice de Sueño: 68.5 🟢                            │
│    Tendencia: ↑ 5.2% vs mes anterior                   │
│    [███████░░░] Bueno                                  │
│                                                         │
│ ⭐ Bienestar Promedio: 7.7 🟢                           │
│    [████████░░] Muy Bueno                              │
│                                                         │
│ 📊 Riesgo Actuarial: 1.7% 🟢                           │
│ 💰 Riesgo de Reclamos: 15.1% 🟡                        │
└─────────────────────────────────────────────────────────┘
```

---

### Mejora 4.2: Consumo de Suscripción vs Límites - Prioridad: ALTA

**Vista/Tabla a usar:** `vw_usage_monthly_summary` + `organization_subscriptions`

**Visualización:** Progress Bars + Projection Chart + Alert Cards

**Consulta SQL:**
```sql
-- Obtener consumo detallado y proyecciones
WITH monthly_usage AS (
  SELECT 
    month,
    total_scans,
    total_prompts_used,
    total_ai_tokens_used
  FROM vw_usage_monthly_summary
  WHERE organization_id = $1
  ORDER BY month DESC
  LIMIT 6
),
subscription_limits AS (
  SELECT 
    scan_limit_per_user_per_month,
    dept_analysis_limit,
    org_analysis_limit,
    used_scans_total,
    used_dept_analyses,
    used_org_analyses,
    current_month,
    monthly_reset_day,
    (SELECT COUNT(*) FROM user_profiles WHERE organization_id = $1) as total_users
  FROM organization_subscriptions
  WHERE organization_id = $1
    AND active = true
)
SELECT 
  sl.scan_limit_per_user_per_month,
  sl.total_users,
  sl.scan_limit_per_user_per_month * sl.total_users as total_scan_limit,
  sl.used_scans_total,
  ROUND((sl.used_scans_total::float / NULLIF(sl.scan_limit_per_user_per_month * sl.total_users, 0)) * 100, 1) as usage_percentage,
  sl.dept_analysis_limit,
  sl.used_dept_analyses,
  sl.org_analysis_limit,
  sl.used_org_analyses,
  sl.monthly_reset_day,
  EXTRACT(DAY FROM CURRENT_DATE) as current_day,
  EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')) as days_in_month,
  (SELECT total_scans FROM monthly_usage WHERE month = DATE_TRUNC('month', CURRENT_DATE)::date) as current_month_scans,
  (SELECT AVG(total_scans) FROM monthly_usage WHERE month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')::date) as avg_monthly_scans
FROM subscription_limits sl;
```

**Campos a mostrar:**
- `total_scan_limit`: Límite total de escaneos
- `used_scans_total`: Escaneos usados
- `usage_percentage`: Porcentaje de uso
- `current_day`: Día actual del mes
- `days_in_month`: Total de días en el mes
- `current_month_scans`: Escaneos del mes actual
- `avg_monthly_scans`: Promedio de escaneos mensuales

**Lógica de negocio:**
```typescript
// Proyectar consumo y detectar si se excederá el límite
function projectMonthlyUsage(data: SubscriptionData): UsageProjection {
  const daysElapsed = data.current_day;
  const daysRemaining = data.days_in_month - daysElapsed;
  const dailyRate = data.current_month_scans / daysElapsed;
  const projectedTotal = Math.round(dailyRate * data.days_in_month);
  const projectedPercentage = (projectedTotal / data.total_scan_limit) * 100;
  
  // Calcular cuándo se alcanzará el límite
  let daysUntilLimit = null;
  if (projectedPercentage > 100) {
    const scansRemaining = data.total_scan_limit - data.used_scans_total;
    daysUntilLimit = Math.floor(scansRemaining / dailyRate);
  }
  
  // Generar recomendación
  let recommendation = '';
  let alertLevel = 'good';
  
  if (projectedPercentage > 110) {
    recommendation = 'URGENTE: Se excederá el límite en ' + daysUntilLimit + ' días. Considera upgrade inmediato.';
    alertLevel = 'critical';
  } else if (projectedPercentage > 100) {
    recommendation = 'ATENCIÓN: Se alcanzará el límite. Considera upgrade o reduce uso.';
    alertLevel = 'warning';
  } else if (projectedPercentage > 90) {
    recommendation = 'Uso alto proyectado. Monitorea de cerca.';
    alertLevel = 'warning';
  } else {
    recommendation = 'Consumo dentro de lo esperado.';
    alertLevel = 'good';
  }
  
  return {
    projected_total: projectedTotal,
    projected_percentage: projectedPercentage,
    days_until_limit: daysUntilLimit,
    recommendation,
    alert_level: alertLevel,
    daily_rate: dailyRate
  };
}
```

**Componente React sugerido:**
```typescript
<SubscriptionConsumptionPanel
  subscriptionData={subData}
  projection={usageProjection}
  historicalData={monthlyHistory}
  onUpgradeClick={() => showUpgradeModal()}
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────────────────────┐
│ 💳 Consumo de Suscripción - Enero 2026                  │
├─────────────────────────────────────────────────────────┤
│ 🔬 Escaneos Biométricos:                                │
│    Usados: 85 / 130 (65.4%)                             │
│    [█████████████░░░░░░] 🟡                            │
│                                                         │
│    Proyección fin de mes: 118 / 130 (90.8%) 🟡         │
│    Tasa diaria: 3.4 escaneos/día                        │
│    Días restantes: 6 días                               │
│                                                         │
│    ⚠️  Alerta: Uso alto proyectado                     │
│    💡 Recomendación: Monitorea de cerca                │
│                                                         │
│ 📊 Análisis Departamentales:                            │
│    Usados: 3 / 5 (60%)                                  │
│    [████████████░░░░░░░] 🟢                            │
│                                                         │
│ 🏢 Análisis Organizacionales:                           │
│    Usados: 1 / 2 (50%)                                  │
│    [██████████░░░░░░░░░] 🟢                            │
│                                                         │
│ 📈 Histórico (últimos 6 meses):                         │
│    Promedio mensual: 112 escaneos                       │
│    Tendencia: ↑ 8% vs trimestre anterior               │
│                                                         │
│ [Ver detalles] [Considerar upgrade] [Exportar reporte] │
└─────────────────────────────────────────────────────────┘
```

---

### Mejora 4.3: Alertas de Límites - Prioridad: ALTA

**Vista/Tabla a usar:** `organization_subscriptions` + `vw_usage_monthly_summary`

**Visualización:** Alert Banner + Notification Cards

**Consulta SQL:**
```sql
-- Detectar alertas de límites de suscripción
WITH current_usage AS (
  SELECT 
    total_scans,
    total_prompts_used
  FROM vw_usage_monthly_summary
  WHERE organization_id = $1
    AND month = DATE_TRUNC('month', CURRENT_DATE)::date
),
subscription_limits AS (
  SELECT 
    scan_limit_per_user_per_month,
    dept_analysis_limit,
    org_analysis_limit,
    used_scans_total,
    used_dept_analyses,
    used_org_analyses,
    (SELECT COUNT(*) FROM user_profiles WHERE organization_id = $1) as total_users,
    EXTRACT(DAY FROM CURRENT_DATE) as current_day,
    EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')) as days_in_month
  FROM organization_subscriptions
  WHERE organization_id = $1
    AND active = true
)
SELECT 
  sl.scan_limit_per_user_per_month * sl.total_users as total_scan_limit,
  sl.used_scans_total,
  ROUND((sl.used_scans_total::float / NULLIF(sl.scan_limit_per_user_per_month * sl.total_users, 0)) * 100, 1) as usage_percentage,
  sl.dept_analysis_limit,
  sl.used_dept_analyses,
  ROUND((sl.used_dept_analyses::float / NULLIF(sl.dept_analysis_limit, 0)) * 100, 1) as dept_analysis_percentage,
  sl.org_analysis_limit,
  sl.used_org_analyses,
  ROUND((sl.used_org_analyses::float / NULLIF(sl.org_analysis_limit, 0)) * 100, 1) as org_analysis_percentage,
  sl.current_day,
  sl.days_in_month,
  ROUND((sl.current_day::float / sl.days_in_month) * 100, 1) as month_progress_percentage,
  cu.total_scans as current_month_scans,
  ROUND((cu.total_scans::float / sl.current_day), 1) as daily_rate
FROM subscription_limits sl
CROSS JOIN current_usage cu;
```

**Campos a mostrar:**
- `usage_percentage`: Porcentaje de uso de escaneos
- `dept_analysis_percentage`: Porcentaje de uso de análisis departamentales
- `org_analysis_percentage`: Porcentaje de uso de análisis organizacionales
- `month_progress_percentage`: Porcentaje del mes transcurrido
- `daily_rate`: Tasa diaria de consumo

**Lógica de negocio:**
```typescript
// Generar alertas basadas en umbrales y proyecciones
function generateSubscriptionAlerts(data: SubscriptionData): Alert[] {
  const alerts = [];
  
  // Alerta 1: Límite de escaneos
  if (data.usage_percentage >= 100) {
    alerts.push({
      level: 'critical',
      type: 'limit_reached',
      title: '🔴 LÍMITE ALCANZADO: Escaneos',
      message: 'Has alcanzado el límite de escaneos del mes',
      action: 'Upgrade inmediato requerido para continuar',
      priority: 1
    });
  } else if (data.usage_percentage >= 90) {
    alerts.push({
      level: 'warning',
      type: 'approaching_limit',
      title: '🟡 ALERTA: Acercándose al límite de escaneos',
      message: `${data.usage_percentage}% del límite usado`,
      action: 'Considera upgrade o reduce uso',
      priority: 2
    });
  } else if (data.usage_percentage > data.month_progress_percentage + 10) {
    // Consumo más rápido que el avance del mes
    alerts.push({
      level: 'warning',
      type: 'high_consumption_rate',
      title: '🟡 ATENCIÓN: Consumo acelerado',
      message: `Uso (${data.usage_percentage}%) supera avance del mes (${data.month_progress_percentage}%)`,
      action: 'Monitorea de cerca',
      priority: 3
    });
  }
  
  // Alerta 2: Análisis departamentales
  if (data.dept_analysis_percentage >= 100) {
    alerts.push({
      level: 'critical',
      type: 'limit_reached',
      title: '🔴 LÍMITE ALCANZADO: Análisis Departamentales',
      message: 'No puedes realizar más análisis departamentales este mes',
      action: 'Espera al próximo ciclo o considera upgrade',
      priority: 1
    });
  } else if (data.dept_analysis_percentage >= 80) {
    alerts.push({
      level: 'warning',
      type: 'approaching_limit',
      title: '🟡 ALERTA: Análisis departamentales',
      message: `${data.dept_analysis_percentage}% del límite usado`,
      action: 'Planifica uso restante',
      priority: 3
    });
  }
  
  // Alerta 3: Análisis organizacionales
  if (data.org_analysis_percentage >= 100) {
    alerts.push({
      level: 'critical',
      type: 'limit_reached',
      title: '🔴 LÍMITE ALCANZADO: Análisis Organizacionales',
      message: 'No puedes realizar más análisis organizacionales este mes',
      action: 'Espera al próximo ciclo o considera upgrade',
      priority: 1
    });
  } else if (data.org_analysis_percentage >= 50) {
    alerts.push({
      level: 'info',
      type: 'approaching_limit',
      title: 'ℹ️  INFO: Análisis organizacionales',
      message: `${data.org_analysis_percentage}% del límite usado`,
      action: 'Planifica uso restante',
      priority: 4
    });
  }
  
  // Alerta 4: Proyección de exceso
  const projectedUsage = (data.daily_rate * data.days_in_month);
  const projectedPercentage = (projectedUsage / data.total_scan_limit) * 100;
  
  if (projectedPercentage > 100 && data.usage_percentage < 100) {
    const daysUntilLimit = Math.floor((data.total_scan_limit - data.used_scans_total) / data.daily_rate);
    alerts.push({
      level: 'warning',
      type: 'projected_excess',
      title: '⚠️  PROYECCIÓN: Se excederá el límite',
      message: `Límite se alcanzará en aproximadamente ${daysUntilLimit} días`,
      action: 'Considera upgrade antes de alcanzar el límite',
      priority: 2
    });
  }
  
  return alerts.sort((a, b) => a.priority - b.priority);
}
```

**Componente React sugerido:**
```typescript
<SubscriptionAlertsPanel
  alerts={subscriptionAlerts}
  onAlertClick={(alert) => showAlertDetails(alert)}
  onUpgradeClick={() => showUpgradeModal()}
  dismissible={false}
/>
```

**Mockup textual:**
```
┌─────────────────────────────────────────────────────────┐
│ 🚨 Alertas de Suscripción                               │
├─────────────────────────────────────────────────────────┤
│ 🟡 ALERTA: Acercándose al límite de escaneos           │
│    Uso actual: 90.8% (118/130 escaneos)                │
│    Días restantes: 6 días                               │
│    💡 Acción: Considera upgrade o reduce uso            │
│    [Ver detalles] [Considerar upgrade]                 │
│                                                         │
│ ⚠️  PROYECCIÓN: Se excederá el límite                   │
│    Al ritmo actual (3.4 escaneos/día), alcanzarás      │
│    el límite en aproximadamente 4 días                  │
│    💡 Acción: Upgrade recomendado antes del 29 Ene     │
│    [Ver proyección] [Upgrade ahora]                    │
│                                                         │
│ 🟡 ATENCIÓN: Consumo acelerado                          │
│    Tu uso (90.8%) supera el avance del mes (80.6%)     │
│    Estás consumiendo más rápido de lo esperado          │
│    💡 Acción: Monitorea de cerca                        │
│    [Ver análisis]                                       │
│                                                         │
│ ℹ️  INFO: Análisis organizacionales                     │
│    Uso actual: 50% (1/2 análisis)                       │
│    💡 Acción: Planifica uso restante                    │
│                                                         │
│ [Configurar notificaciones] [Ver historial de alertas] │
└─────────────────────────────────────────────────────────┘
```

---

## Plan de Implementación

### Fase 1: Mejoras Críticas (Prioridad ALTA) - Semana 1-2

**Objetivo:** Implementar funcionalidades esenciales que aportan mayor valor inmediato

#### Employee Dashboard (3 días)
1. Día 1: Histórico de escaneos con tendencias (Mejora 1.1)
2. Día 2: Alertas de riesgo personalizadas (Mejora 1.2)
3. Día 3: Comparación con departamento (Mejora 1.3)

#### Leader Dashboard (3 días)
4. Día 1: Vista de equipo completo (Mejora 2.1)
5. Día 2: Métricas del departamento (Mejora 2.2) + Lista de empleados en riesgo (Mejora 2.3)
6. Día 3: Alertas de equipo (Mejora 2.6)

#### HR Dashboard (4 días)
7. Día 1-2: Vista de todos los departamentos (Mejora 3.1) + Empleados en riesgo organizacional (Mejora 3.2)
8. Día 3: Reportes de uso de suscripción (Mejora 3.4)
9. Día 4: Alertas de burnout departamental (Mejora 3.5)

#### Organization Dashboard (4 días)
10. Día 1-2: Métricas organizacionales agregadas (Mejora 4.1) + Consumo de suscripción (Mejora 4.2)
11. Día 3-4: Alertas de límites (Mejora 4.3)

**Total Fase 1: 14 días (2.8 semanas)**

---

### Fase 2: Mejoras Avanzadas (Prioridad MEDIA) - Semana 3-4

**Objetivo:** Agregar análisis avanzados y visualizaciones de tendencias

#### Employee Dashboard (2 días)
1. Día 1: Recomendaciones de bienestar (Mejora 1.4)
2. Día 2: Evolución temporal (Mejora 1.5)

#### Leader Dashboard (2 días)
3. Día 1: Tendencias del departamento (Mejora 2.4)
4. Día 2: Comparación con otros departamentos (Mejora 2.5)

#### HR Dashboard (2 días)
5. Día 1: Análisis de tendencias por departamento (Mejora 3.3)
6. Día 2: Análisis de distribución (Mejora 3.6)

**Total Fase 2: 6 días (1.2 semanas)**

---

### Fase 3: Optimizaciones y Pulido - Semana 5

**Objetivo:** Mejorar UX, performance y agregar funcionalidades adicionales

1. Día 1-2: Optimización de consultas y cacheo
2. Día 3: Implementación de exportación de reportes
3. Día 4: Mejoras de UI/UX basadas en feedback
4. Día 5: Testing y corrección de bugs

**Total Fase 3: 5 días (1 semana)**

---

## Resumen de Tiempos

| Fase | Duración | Dashboards Afectados | Mejoras Implementadas |
|------|----------|----------------------|-----------------------|
| Fase 1 (ALTA) | 14 días | Todos (4) | 15 mejoras críticas |
| Fase 2 (MEDIA) | 6 días | Todos (4) | 6 mejoras avanzadas |
| Fase 3 (Optimización) | 5 días | Todos (4) | Pulido y testing |
| **TOTAL** | **25 días (5 semanas)** | **4 dashboards** | **21 mejoras** |

---

## Métricas de Éxito

### KPIs de Implementación

1. **Performance:**
   - Todas las consultas < 100ms ✅
   - Carga de dashboard < 2 segundos ✅
   - Uso de vistas existentes en 100% de consultas ✅

2. **Funcionalidad:**
   - 15 mejoras críticas implementadas ✅
   - 0 errores en producción ✅
   - 100% de vistas SQL utilizadas ✅

3. **Adopción de Usuarios:**
   - 80% de usuarios acceden a dashboards semanalmente
   - 60% de líderes revisan empleados en riesgo diariamente
   - 90% de HR usa reportes de suscripción mensualmente

4. **Valor de Negocio:**
   - Reducción de 30% en tiempo de identificación de riesgos
   - Aumento de 40% en escaneos regulares
   - Mejora de 25% en satisfacción de usuarios

---

## Consideraciones Técnicas

### 1. Uso de Vistas Existentes

**IMPORTANTE:** Todas las consultas deben usar las 4 vistas SQL ya aplicadas:

```typescript
// ✅ CORRECTO: Usar vista existente
const { data } = await supabase
  .from('vw_latest_scans_by_user')
  .select('*')
  .eq('user_id', userId);

// ❌ INCORRECTO: Consulta compleja con JOINs
const { data } = await supabase
  .from('biometric_measurements')
  .select('*, user_profiles(*)')
  .eq('user_id', userId);
```

### 2. Manejo de Errores

```typescript
// Siempre validar datos nulos
const { data, error } = await supabase
  .from('vw_latest_scans_by_user')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();

if (error) {
  console.error('Error fetching data:', error);
  return null;
}

if (!data) {
  return { message: 'No hay escaneos disponibles' };
}
```

### 3. Consultas Paralelas

```typescript
// Ejecutar múltiples consultas en paralelo
const [metrics, members, atRisk] = await Promise.all([
  supabase.from('vw_current_department_metrics').select('*').eq('department_id', deptId),
  supabase.from('vw_latest_scans_by_user').select('*').eq('department_id', deptId),
  supabase.from('vw_employees_at_risk').select('*').eq('department_id', deptId)
]);
```

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

## Restricciones y Limitaciones

### ✅ Permitido

- Usar las 4 vistas SQL existentes
- Usar los 8 índices aplicados
- Consultas con filtros simples (eq, in, gt, lt)
- Agregaciones básicas en frontend (COUNT, AVG)
- Ordenamiento y paginación

### ❌ No Permitido

- Crear nuevas vistas SQL
- Crear nuevos índices
- Modificar estructura de tablas
- Consultas con JOINs complejos (usar vistas en su lugar)
- Triggers o funciones SQL nuevas

---

## Documentos de Referencia

1. `/workspace/app/docs/data_model_analysis.md` - Análisis completo de David
2. `/workspace/app/docs/dashboard_data_structures_summary.md` - Resumen de estructuras
3. `/workspace/uploads/Equilibria_Diccionario_Tablas_Final_20260124 (1).docx` - Diccionario de BD

---

## Contacto y Soporte

**Para consultas sobre especificaciones:**
- Emma (Product Manager) - Responsable de este documento

**Para consultas técnicas sobre vistas e índices:**
- David (Data Architect) - Análisis de modelo de datos

**Para implementación:**
- Alex (Engineer) - Desarrollo de componentes React
- Mike (Team Lead) - Coordinación y revisión

---

**Última actualización:** 2026-01-25  
**Versión:** 1.0  
**Estado:** ✅ Listo para implementación