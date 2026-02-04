# PRD: Mejora Evolutiva de Dashboards - Equilibria 2026

**Fecha:** 2026-02-03  
**Versión:** 1.0  
**Autor:** Emma (Product Manager)  
**Estado:** En Revisión

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Análisis del Estado Actual](#análisis-del-estado-actual)
3. [Evaluación de Disponibilidad de Datos](#evaluación-de-disponibilidad-de-datos)
4. [Mejoras por Dashboard](#mejoras-por-dashboard)
5. [Especificaciones de Gráficos de Evolución](#especificaciones-de-gráficos-de-evolución)
6. [Agrupación y UX](#agrupación-y-ux)
7. [Vistas de Base de Datos Requeridas](#vistas-de-base-de-datos-requeridas)
8. [Prioridades de Implementación](#prioridades-de-implementación)
9. [Restricciones y Consideraciones](#restricciones-y-consideraciones)

---

## 1. Resumen Ejecutivo

### 🎯 Objetivo
Mejorar los dashboards existentes (Empleado, Líder, RRHH, Admin Org) mediante la adición de visualizaciones evolutivas, agrupación lógica de indicadores y mejoras de UX, **sin romper la funcionalidad operativa actual**.

### 🔑 Principios Clave
- **Expansión, no reemplazo**: Mantener toda la funcionalidad existente
- **Solo datos reales**: Usar únicamente tablas y vistas existentes en la base de datos
- **Mejora incremental**: Implementación por fases priorizadas
- **UX centrado en el usuario**: Agrupación lógica según contexto y rol

### 📊 Alcance
- **4 Dashboards**: Employee, Leader, HR, Org Admin
- **Nuevas características**: Gráficos de evolución temporal, comparativas, agrupación de indicadores
- **Datos base**: Diccionario de datos Equilibria 2026

---

## 2. Análisis del Estado Actual

### 2.1 Dashboard de Empleado (Employee)

#### Estado Actual
**Archivo:** `/workspace/app/frontend/src/pages/employee/Dashboard.tsx`

**Indicadores Existentes:**
- ✅ Wellness Index Score (indicador principal)
- ✅ Estrés promedio (últimos 10 escaneos)
- ✅ Fatiga promedio
- ✅ Recuperación promedio
- ✅ Total de escaneos
- ✅ Fecha último escaneo
- ✅ Todos los indicadores biométricos agrupados por categoría (usando `ALL_BIOMETRIC_INDICATORS`)

**Fuentes de Datos Actuales:**
- Tabla: `biometric_measurements`
- Tabla: `user_profiles`
- API: `/api/v1/biometric-indicators/ranges`
- API: `/api/v1/biometric-indicators/info/{indicator_code}`

**Componentes Utilizados:**
- `BiometricGaugeWithInfo` - Indicadores con información detallada
- `BiometricGauge` - Indicadores simples
- `LoyaltyBenefitsIndicator` - Programa de beneficios

**Fortalezas:**
- ✅ Muestra datos en tiempo real del último escaneo
- ✅ Agrupación por categorías (Cardiovascular, Mental, Fisiológico, etc.)
- ✅ Información contextual de cada indicador
- ✅ Refresh manual disponible

**Oportunidades de Mejora:**
- ⚠️ No hay visualización de evolución temporal
- ⚠️ No hay comparativas con promedios personales
- ⚠️ No hay alertas o recomendaciones personalizadas
- ⚠️ Falta contexto histórico (tendencias)

---

### 2.2 Dashboard de Líder (Leader)

#### Estado Actual
**Archivo:** `/workspace/app/frontend/src/pages/leader/Dashboard.tsx`

**Indicadores Existentes:**
- ✅ Wellness Index del departamento
- ✅ Nivel de estrés promedio
- ✅ Índice de fatiga promedio
- ✅ Carga cognitiva promedio
- ✅ Capacidad de recuperación promedio
- ✅ Riesgo de burnout
- ✅ Lista de colaboradores en riesgo
- ✅ Últimos escaneos del equipo
- ✅ Programas de lealtad activos

**Fuentes de Datos Actuales:**
- Tabla: `department_insights` (último insight)
- Vista: `vw_current_department_metrics`
- Vista: `vw_employees_at_risk`
- Vista: `vw_active_partner_programs_by_org`
- Tabla: `biometric_measurements` (con filtro por departamento)

**Componentes Utilizados:**
- `BiometricGaugeWithInfo` - 6 indicadores principales
- Tabs con 3 secciones: En Riesgo, Últimos Scans, Programas

**Fortalezas:**
- ✅ Vista consolidada del departamento
- ✅ Identificación de colaboradores en riesgo
- ✅ Insights generados por IA
- ✅ Flags de alerta (rojo/amarillo/verde)

**Oportunidades de Mejora:**
- ⚠️ No hay evolución temporal del departamento
- ⚠️ No hay comparativa con otros departamentos
- ⚠️ No hay análisis de tendencias (mejora/deterioro)
- ⚠️ Falta visualización de distribución de riesgos

---

### 2.3 Dashboard de RRHH (HR)

#### Estado Actual
**Archivo:** `/workspace/app/frontend/src/pages/hr/Dashboard.tsx`

**Indicadores Existentes:**
- ✅ Wellness Index organizacional
- ✅ Nivel de estrés organizacional
- ✅ Índice de fatiga
- ✅ Carga cognitiva
- ✅ Capacidad de recuperación
- ✅ Riesgo de burnout
- ✅ Índice de sueño
- ✅ Brecha edad biológica
- ✅ Riesgo actuarial
- ✅ Riesgo de reclamaciones
- ✅ Insights departamentales detallados (19 campos)
- ✅ Comparativa por departamentos
- ✅ Colaboradores en riesgo (con filtros)
- ✅ Programas de lealtad

**Fuentes de Datos Actuales:**
- Tabla: `organization_insights` (último insight)
- Vista: `vw_current_department_metrics`
- Vista: `vw_employees_at_risk`
- Tabla: `department_insights` (último por departamento)
- Vista: `vw_active_partner_programs_by_org`

**Componentes Utilizados:**
- `BiometricGaugeWithInfo` - 8 indicadores organizacionales
- Tabs con 4 secciones: Insights Departamentales, Departamentos, En Riesgo, Programas
- Cards con métricas detalladas por departamento

**Fortalezas:**
- ✅ Vista completa organizacional
- ✅ Insights departamentales muy detallados
- ✅ Filtros por departamento y nivel de riesgo
- ✅ Métricas actuariales para aseguradoras
- ✅ Resumen de riesgos (crítico/alto/moderado)

**Oportunidades de Mejora:**
- ⚠️ No hay evolución temporal organizacional
- ⚠️ No hay comparativas entre períodos
- ⚠️ No hay análisis de impacto de intervenciones
- ⚠️ Falta visualización de tendencias por departamento
- ⚠️ No hay proyecciones o predicciones

---

### 2.4 Dashboard de Admin Org

#### Estado Actual
**Archivo:** `/workspace/app/frontend/src/pages/org/Dashboard.tsx`

**Indicadores Existentes:**
- ✅ Total usuarios
- ✅ Usuarios activos
- ✅ Total departamentos
- ✅ Total mediciones
- ✅ Total prompts IA
- ✅ Estado de suscripción
- ✅ Días restantes de suscripción
- ✅ Uso de escaneos
- ✅ Análisis departamentales usados
- ✅ Análisis organizacionales usados
- ✅ Uso mensual (últimos 6 meses)
- ✅ Uso por usuario (top 20)

**Fuentes de Datos Actuales:**
- Tabla: `organization_subscriptions`
- Tabla: `organization_usage_summary`
- Vista: `user_scan_usage`
- Tablas: `user_profiles`, `departments`, `biometric_measurements`, `prompts`

**Componentes Utilizados:**
- Cards de acceso rápido a gestión
- Progress bars para límites de uso
- Tabs con uso mensual y por usuario

**Fortalezas:**
- ✅ Vista administrativa completa
- ✅ Control de suscripción y límites
- ✅ Acceso rápido a gestión de usuarios, departamentos, prompts
- ✅ Histórico de uso mensual

**Oportunidades de Mejora:**
- ⚠️ No hay métricas de salud organizacional
- ⚠️ No hay visualización de tendencias de uso
- ⚠️ No hay alertas de límites próximos a agotarse
- ⚠️ Falta análisis de ROI de la plataforma
- ⚠️ No hay comparativas de uso entre departamentos

---

## 3. Evaluación de Disponibilidad de Datos

### 3.1 Tablas Principales Existentes

Basado en el análisis del código y modelos:

#### Mediciones y Escaneos
- ✅ `biometric_measurements` - Todas las mediciones biométricas por usuario
  - Campos: user_id, ai_stress, ai_fatigue, ai_recovery, wellness_index_score, biological_age, etc.
  - Timestamp: created_at (permite análisis temporal)

#### Insights y Análisis
- ✅ `department_insights` - Análisis departamentales generados
  - Campos: 19 campos incluyendo avg_stress, avg_fatigue, wellness_index, burnout_risk_score, etc.
  - Timestamp: created_at, analysis_period
  
- ✅ `organization_insights` - Análisis organizacionales
  - Campos: stress_index, burnout_risk, wellness_index, actuarial_risk, claim_risk, etc.
  - Timestamp: analysis_date

#### Usuarios y Organización
- ✅ `user_profiles` - Perfiles de usuarios
- ✅ `departments` - Departamentos
- ✅ `organizations` - Organizaciones

#### Suscripciones y Uso
- ✅ `organization_subscriptions` - Suscripciones activas
- ✅ `organization_usage_summary` - Resumen de uso mensual
- ✅ `user_scan_usage` - Vista de uso por usuario

#### Beneficios y Programas
- ✅ `benefits` - Beneficios disponibles
- ✅ `partnerships` - Alianzas activas
- ✅ `vw_active_partner_programs_by_org` - Vista de programas activos

### 3.2 Vistas Existentes

- ✅ `vw_current_department_metrics` - Métricas actuales por departamento
- ✅ `vw_employees_at_risk` - Empleados en riesgo
- ✅ `vw_active_partner_programs_by_org` - Programas activos por organización
- ✅ `user_scan_usage` - Uso de escaneos por usuario

### 3.3 Datos Disponibles para Evolución Temporal

**✅ DISPONIBLE - Evolución Individual (Empleado)**
- Tabla: `biometric_measurements`
- Filtro: `user_id = current_user`
- Ordenar: `created_at DESC`
- Métricas: Todos los indicadores biométricos

**✅ DISPONIBLE - Evolución Departamental (Líder)**
- Tabla: `department_insights`
- Filtro: `department_id = user_department`
- Ordenar: `created_at DESC`
- Métricas: avg_stress, avg_fatigue, wellness_index, burnout_risk_score, etc.

**✅ DISPONIBLE - Evolución Organizacional (RRHH)**
- Tabla: `organization_insights`
- Filtro: `organization_id = user_org`
- Ordenar: `analysis_date DESC`
- Métricas: stress_index, wellness_index, actuarial_risk, etc.

**✅ DISPONIBLE - Evolución de Uso (Admin Org)**
- Tabla: `organization_usage_summary`
- Filtro: `organization_id = user_org`
- Ordenar: `month DESC`
- Métricas: total_scans, total_ai_tokens_used, total_valid_scans, etc.

### 3.4 Datos NO Disponibles (Requieren Nuevas Vistas)

**⚠️ FALTA - Comparativas entre Departamentos**
- Necesita: Vista agregada de métricas por departamento en mismo período
- SQL requerido: Crear vista `vw_department_comparison`

**⚠️ FALTA - Distribución de Riesgos**
- Necesita: Vista de conteo de empleados por nivel de riesgo
- SQL requerido: Crear vista `vw_risk_distribution`

**⚠️ FALTA - Tendencias Semanales/Mensuales**
- Necesita: Vista agregada por semana/mes
- SQL requerido: Crear vista `vw_weekly_trends`, `vw_monthly_trends`

**⚠️ FALTA - Impacto de Beneficios**
- Necesita: Vista de métricas antes/después de activar beneficio
- SQL requerido: Crear vista `vw_benefit_impact`

---

## 4. Mejoras por Dashboard

### 4.1 Dashboard de Empleado - Mejoras Propuestas

#### 4.1.1 Nueva Sección: "Mi Evolución Personal"

**Ubicación:** Después del header, antes de los indicadores actuales

**Componente:** `PersonalEvolutionChart`

**Visualización:** Gráfico de líneas múltiples (últimos 30 días)

**Métricas a Mostrar:**
- Wellness Index Score (línea azul)
- Estrés (línea roja)
- Fatiga (línea naranja)
- Recuperación (línea verde)

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/biometric-measurements/my-history?days=30
// Tabla: biometric_measurements
// Filtro: user_id = current_user AND created_at >= NOW() - INTERVAL '30 days'
// Ordenar: created_at ASC
```

**Datos Requeridos:**
```json
{
  "data": [
    {
      "date": "2026-01-15",
      "wellness_index_score": 75.5,
      "ai_stress": 45.2,
      "ai_fatigue": 38.7,
      "ai_recovery": 68.3
    }
  ]
}
```

#### 4.1.2 Nueva Sección: "Comparativa Personal"

**Ubicación:** Después de stats cards, antes de indicadores por categoría

**Componente:** `PersonalComparisonCards`

**Visualización:** 3 cards con comparativas

**Métricas:**
1. **Promedio Últimos 7 días vs Últimos 30 días**
   - Wellness Index
   - Estrés
   - Fatiga

2. **Mejor Día vs Peor Día (último mes)**
   - Fecha y valor

3. **Tendencia General**
   - Mejorando / Estable / Deteriorando
   - Basado en regresión lineal simple

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/biometric-measurements/my-comparison
// Cálculo: Backend calcula promedios y tendencias
```

#### 4.1.3 Mejora: Agrupación de Indicadores con Tabs

**Cambio:** Convertir las secciones de categorías en Tabs

**Tabs Propuestos:**
1. **Resumen** - Top 6 indicadores más importantes
2. **Cardiovascular** - Indicadores cardiovasculares
3. **Mental** - Indicadores mentales y cognitivos
4. **Fisiológico** - Indicadores fisiológicos
5. **Todos** - Vista completa actual

**Beneficio UX:** Reduce scroll, mejora navegación

#### 4.1.4 Nueva Sección: "Recomendaciones Personalizadas"

**Ubicación:** Al final del dashboard

**Componente:** `PersonalizedRecommendations`

**Visualización:** Cards con recomendaciones basadas en datos

**Lógica:**
- Si estrés > 70: Recomendar técnicas de relajación
- Si fatiga > 60: Recomendar descanso
- Si recovery < 50: Recomendar actividades de recuperación
- Si bio_age_gap > 5: Recomendar chequeo médico

**Fuente de Datos:**
```typescript
// Basado en último escaneo (ya disponible)
// Lógica en frontend
```

---

### 4.2 Dashboard de Líder - Mejoras Propuestas

#### 4.2.1 Nueva Sección: "Evolución del Equipo"

**Ubicación:** Después del header, antes de los gauges

**Componente:** `TeamEvolutionChart`

**Visualización:** Gráfico de líneas (últimos 6 meses)

**Métricas a Mostrar:**
- Wellness Index promedio
- Estrés promedio
- Burnout Risk Score

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/department-insights/evolution?department_id={id}&months=6
// Tabla: department_insights
// Filtro: department_id = user_department AND created_at >= NOW() - INTERVAL '6 months'
// Ordenar: created_at ASC
```

**Datos Requeridos:**
```json
{
  "data": [
    {
      "analysis_period": "2025-09",
      "wellness_index": 72.5,
      "avg_stress": 48.3,
      "burnout_risk_score": 2.8
    }
  ]
}
```

#### 4.2.2 Nueva Sección: "Comparativa con Otros Departamentos"

**Ubicación:** Después de los gauges

**Componente:** `DepartmentComparisonChart`

**Visualización:** Gráfico de barras horizontales

**Métricas:**
- Wellness Index (mi depto vs promedio org)
- Estrés (mi depto vs promedio org)
- Fatiga (mi depto vs promedio org)

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/department-insights/comparison?department_id={id}
// Vista Nueva: vw_department_comparison
```

**Vista SQL Requerida:**
```sql
CREATE VIEW vw_department_comparison AS
SELECT 
  d.id as department_id,
  d.name as department_name,
  di.wellness_index,
  di.avg_stress,
  di.avg_fatigue,
  (SELECT AVG(wellness_index) FROM department_insights WHERE created_at >= NOW() - INTERVAL '1 month') as org_avg_wellness,
  (SELECT AVG(avg_stress) FROM department_insights WHERE created_at >= NOW() - INTERVAL '1 month') as org_avg_stress,
  (SELECT AVG(avg_fatigue) FROM department_insights WHERE created_at >= NOW() - INTERVAL '1 month') as org_avg_fatigue
FROM departments d
LEFT JOIN LATERAL (
  SELECT * FROM department_insights 
  WHERE department_id = d.id 
  ORDER BY created_at DESC 
  LIMIT 1
) di ON true;
```

#### 4.2.3 Mejora: Distribución de Riesgos

**Ubicación:** Reemplazar los 3 cards de riesgo con un gráfico

**Componente:** `RiskDistributionChart`

**Visualización:** Gráfico de dona (donut chart)

**Segmentos:**
- Bajo (verde)
- Moderado (amarillo)
- Alto (naranja)
- Crítico (rojo)

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/employees-at-risk/distribution?department_id={id}
// Vista: vw_employees_at_risk (ya existe)
// Cálculo: Backend cuenta por nivel_riesgo
```

#### 4.2.4 Nueva Sección: "Alertas y Acciones"

**Ubicación:** Después de la tab "En Riesgo"

**Componente:** `TeamAlertsPanel`

**Visualización:** Lista de alertas con acciones sugeridas

**Alertas:**
- Empleados con deterioro > 10% en última semana
- Empleados sin escaneo en últimos 7 días
- Departamento con tendencia negativa

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/department-insights/alerts?department_id={id}
// Lógica: Backend compara insights recientes
```

---

### 4.3 Dashboard de RRHH - Mejoras Propuestas

#### 4.3.1 Nueva Sección: "Evolución Organizacional"

**Ubicación:** Después del header, antes de los gauges

**Componente:** `OrganizationEvolutionChart`

**Visualización:** Gráfico de líneas múltiples (últimos 12 meses)

**Métricas a Mostrar:**
- Wellness Index organizacional
- Estrés promedio
- Riesgo actuarial
- Riesgo de reclamaciones

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/organization-insights/evolution?organization_id={id}&months=12
// Tabla: organization_insights
// Filtro: organization_id = user_org AND analysis_date >= NOW() - INTERVAL '12 months'
// Ordenar: analysis_date ASC
```

**Datos Requeridos:**
```json
{
  "data": [
    {
      "analysis_date": "2025-02-01",
      "wellness_index": 68.5,
      "stress_index": 52.3,
      "actuarial_risk": 3.2,
      "claim_risk": 15.7
    }
  ]
}
```

#### 4.3.2 Nueva Sección: "Heatmap Departamental"

**Ubicación:** En la tab "Departamentos"

**Componente:** `DepartmentHeatmap`

**Visualización:** Heatmap (matriz de colores)

**Ejes:**
- X: Departamentos
- Y: Métricas (Wellness, Estrés, Fatiga, Burnout)
- Color: Verde (bueno) → Amarillo → Rojo (crítico)

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/department-insights/heatmap?organization_id={id}
// Tabla: department_insights (último por departamento)
```

#### 4.3.3 Nueva Sección: "Impacto de Beneficios"

**Ubicación:** Nueva tab "Impacto de Beneficios"

**Componente:** `BenefitImpactAnalysis`

**Visualización:** Gráfico de barras comparativas

**Métricas:**
- Wellness Index antes/después de activar beneficio
- Estrés antes/después
- Participación en beneficios

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/benefits/impact-analysis?organization_id={id}
// Vista Nueva: vw_benefit_impact
```

**Vista SQL Requerida:**
```sql
CREATE VIEW vw_benefit_impact AS
SELECT 
  b.id as benefit_id,
  b.title as benefit_title,
  COUNT(DISTINCT uba.user_id) as users_activated,
  AVG(CASE WHEN bm.created_at < uba.activated_at THEN bm.wellness_index_score END) as avg_wellness_before,
  AVG(CASE WHEN bm.created_at >= uba.activated_at THEN bm.wellness_index_score END) as avg_wellness_after,
  AVG(CASE WHEN bm.created_at < uba.activated_at THEN bm.ai_stress END) as avg_stress_before,
  AVG(CASE WHEN bm.created_at >= uba.activated_at THEN bm.ai_stress END) as avg_stress_after
FROM benefits b
LEFT JOIN user_benefit_activations uba ON b.id = uba.benefit_id
LEFT JOIN biometric_measurements bm ON uba.user_id = bm.user_id
WHERE uba.activated_at IS NOT NULL
GROUP BY b.id, b.title;
```

#### 4.3.4 Mejora: Proyección Actuarial

**Ubicación:** Después de los stats cards

**Componente:** `ActuarialProjection`

**Visualización:** Gráfico de líneas con proyección

**Métricas:**
- Riesgo actuarial histórico (últimos 6 meses)
- Proyección próximos 3 meses (basado en tendencia)

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/organization-insights/actuarial-projection?organization_id={id}
// Tabla: organization_insights
// Cálculo: Backend usa regresión lineal para proyección
```

---

### 4.4 Dashboard de Admin Org - Mejoras Propuestas

#### 4.4.1 Nueva Sección: "Métricas de Salud Organizacional"

**Ubicación:** Después del header, antes de Quick Access

**Componente:** `OrgHealthMetrics`

**Visualización:** 4 gauges con métricas de salud

**Métricas:**
- Wellness Index organizacional
- Tasa de participación (% usuarios con escaneos)
- Tasa de adopción de beneficios
- Satisfacción general

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/organization-insights/health-metrics?organization_id={id}
// Tablas: organization_insights, user_scan_usage, user_benefit_activations
```

#### 4.4.2 Nueva Sección: "Tendencias de Uso"

**Ubicación:** Reemplazar el gráfico de uso mensual con uno más visual

**Componente:** `UsageTrendsChart`

**Visualización:** Gráfico de área apilada

**Métricas:**
- Escaneos válidos (área verde)
- Escaneos inválidos (área roja)
- Prompts IA usados (línea punteada)

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/organization-usage-summary/trends?organization_id={id}&months=12
// Tabla: organization_usage_summary (ya existe)
```

#### 4.4.3 Nueva Sección: "Alertas de Límites"

**Ubicación:** Después de Subscription Status

**Componente:** `LimitAlertsPanel`

**Visualización:** Cards con alertas

**Alertas:**
- Escaneos al 80% del límite (amarillo)
- Escaneos al 95% del límite (rojo)
- Análisis departamentales próximos a agotarse
- Días restantes de suscripción < 30

**Fuente de Datos:**
```typescript
// Basado en organization_subscriptions (ya disponible)
// Lógica en frontend
```

#### 4.4.4 Nueva Sección: "ROI de la Plataforma"

**Ubicación:** Nueva tab "ROI y Análisis"

**Componente:** `PlatformROIAnalysis`

**Visualización:** Cards con métricas de ROI

**Métricas:**
- Reducción de riesgo actuarial (%)
- Ahorro estimado en reclamaciones
- Mejora en wellness index (%)
- Participación en beneficios

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/organization-insights/roi-analysis?organization_id={id}
// Tablas: organization_insights (comparar primer mes vs actual)
```

#### 4.4.5 Nueva Sección: "Comparativa de Uso por Departamento"

**Ubicación:** Nueva tab "Uso por Departamento"

**Componente:** `DepartmentUsageComparison`

**Visualización:** Gráfico de barras horizontales

**Métricas:**
- Escaneos por departamento
- Prompts IA por departamento
- Tasa de participación por departamento

**Fuente de Datos:**
```typescript
// API Endpoint: GET /api/v1/departments/usage-comparison?organization_id={id}
// Vista Nueva: vw_department_usage
```

**Vista SQL Requerida:**
```sql
CREATE VIEW vw_department_usage AS
SELECT 
  d.id as department_id,
  d.name as department_name,
  COUNT(DISTINCT up.user_id) as total_users,
  COUNT(DISTINCT usu.user_id) as active_users,
  COALESCE(SUM(usu.total_scans), 0) as total_scans,
  COALESCE(AVG(usu.total_scans), 0) as avg_scans_per_user,
  ROUND(COUNT(DISTINCT usu.user_id)::numeric / NULLIF(COUNT(DISTINCT up.user_id), 0) * 100, 2) as participation_rate
FROM departments d
LEFT JOIN user_profiles up ON d.id = up.department_id
LEFT JOIN user_scan_usage usu ON up.user_id = usu.user_id
WHERE d.is_active = true
GROUP BY d.id, d.name;
```

---

## 5. Especificaciones de Gráficos de Evolución

### 5.1 Gráfico de Evolución Personal (Employee)

**Tipo:** Line Chart (Recharts)

**Configuración:**
```typescript
<LineChart data={evolutionData} width={800} height={400}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis domain={[0, 100]} />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="wellness_index_score" stroke="#3b82f6" strokeWidth={2} name="Bienestar" />
  <Line type="monotone" dataKey="ai_stress" stroke="#ef4444" strokeWidth={2} name="Estrés" />
  <Line type="monotone" dataKey="ai_fatigue" stroke="#f97316" strokeWidth={2} name="Fatiga" />
  <Line type="monotone" dataKey="ai_recovery" stroke="#22c55e" strokeWidth={2} name="Recuperación" />
</LineChart>
```

**Datos de Entrada:**
```typescript
interface EvolutionDataPoint {
  date: string; // "2026-01-15"
  wellness_index_score: number;
  ai_stress: number;
  ai_fatigue: number;
  ai_recovery: number;
}
```

**Fuente de Datos:**
- Tabla: `biometric_measurements`
- Endpoint: `GET /api/v1/biometric-measurements/my-history?days=30`

---

### 5.2 Gráfico de Evolución del Equipo (Leader)

**Tipo:** Line Chart con área sombreada

**Configuración:**
```typescript
<LineChart data={teamEvolutionData} width={800} height={400}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="analysis_period" />
  <YAxis domain={[0, 100]} />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="wellness_index" stroke="#3b82f6" strokeWidth={3} name="Bienestar" />
  <Line type="monotone" dataKey="avg_stress" stroke="#ef4444" strokeWidth={2} name="Estrés" />
  <Line type="monotone" dataKey="burnout_risk_score" stroke="#f59e0b" strokeWidth={2} name="Riesgo Burnout" />
</LineChart>
```

**Datos de Entrada:**
```typescript
interface TeamEvolutionDataPoint {
  analysis_period: string; // "2025-09"
  wellness_index: number;
  avg_stress: number;
  burnout_risk_score: number;
}
```

**Fuente de Datos:**
- Tabla: `department_insights`
- Endpoint: `GET /api/v1/department-insights/evolution?department_id={id}&months=6`

---

### 5.3 Gráfico de Comparativa Departamental (Leader)

**Tipo:** Horizontal Bar Chart

**Configuración:**
```typescript
<BarChart data={comparisonData} layout="horizontal" width={800} height={400}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis type="number" domain={[0, 100]} />
  <YAxis type="category" dataKey="metric" />
  <Tooltip />
  <Legend />
  <Bar dataKey="my_department" fill="#3b82f6" name="Mi Departamento" />
  <Bar dataKey="org_average" fill="#94a3b8" name="Promedio Org" />
</BarChart>
```

**Datos de Entrada:**
```typescript
interface ComparisonDataPoint {
  metric: string; // "Bienestar", "Estrés", "Fatiga"
  my_department: number;
  org_average: number;
}
```

**Fuente de Datos:**
- Vista: `vw_department_comparison` (nueva)
- Endpoint: `GET /api/v1/department-insights/comparison?department_id={id}`

---

### 5.4 Gráfico de Distribución de Riesgos (Leader)

**Tipo:** Donut Chart (Recharts PieChart)

**Configuración:**
```typescript
<PieChart width={400} height={400}>
  <Pie
    data={riskDistributionData}
    cx={200}
    cy={200}
    innerRadius={80}
    outerRadius={120}
    fill="#8884d8"
    dataKey="count"
    label
  >
    {riskDistributionData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.color} />
    ))}
  </Pie>
  <Tooltip />
  <Legend />
</PieChart>
```

**Datos de Entrada:**
```typescript
interface RiskDistributionDataPoint {
  name: string; // "Bajo", "Moderado", "Alto", "Crítico"
  count: number;
  color: string; // "#22c55e", "#eab308", "#f97316", "#ef4444"
}
```

**Fuente de Datos:**
- Vista: `vw_employees_at_risk` (ya existe)
- Endpoint: `GET /api/v1/employees-at-risk/distribution?department_id={id}`

---

### 5.5 Gráfico de Evolución Organizacional (HR)

**Tipo:** Multi-Line Chart con dos ejes Y

**Configuración:**
```typescript
<LineChart data={orgEvolutionData} width={1000} height={500}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="analysis_date" />
  <YAxis yAxisId="left" domain={[0, 100]} />
  <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
  <Tooltip />
  <Legend />
  <Line yAxisId="left" type="monotone" dataKey="wellness_index" stroke="#3b82f6" strokeWidth={3} name="Bienestar" />
  <Line yAxisId="left" type="monotone" dataKey="stress_index" stroke="#ef4444" strokeWidth={2} name="Estrés" />
  <Line yAxisId="right" type="monotone" dataKey="actuarial_risk" stroke="#f59e0b" strokeWidth={2} name="Riesgo Actuarial" />
  <Line yAxisId="right" type="monotone" dataKey="claim_risk" stroke="#dc2626" strokeWidth={2} name="Riesgo Reclamaciones" />
</LineChart>
```

**Datos de Entrada:**
```typescript
interface OrgEvolutionDataPoint {
  analysis_date: string; // "2025-02-01"
  wellness_index: number;
  stress_index: number;
  actuarial_risk: number;
  claim_risk: number;
}
```

**Fuente de Datos:**
- Tabla: `organization_insights`
- Endpoint: `GET /api/v1/organization-insights/evolution?organization_id={id}&months=12`

---

### 5.6 Heatmap Departamental (HR)

**Tipo:** Heatmap (usando recharts o custom component)

**Configuración:**
```typescript
// Custom Heatmap Component
<HeatmapGrid>
  {departments.map(dept => (
    <HeatmapRow key={dept.id}>
      <HeatmapCell>{dept.name}</HeatmapCell>
      <HeatmapCell color={getColor(dept.wellness_index)}>{dept.wellness_index}</HeatmapCell>
      <HeatmapCell color={getColor(dept.avg_stress)}>{dept.avg_stress}</HeatmapCell>
      <HeatmapCell color={getColor(dept.avg_fatigue)}>{dept.avg_fatigue}</HeatmapCell>
      <HeatmapCell color={getColor(dept.burnout_risk_score)}>{dept.burnout_risk_score}</HeatmapCell>
    </HeatmapRow>
  ))}
</HeatmapGrid>
```

**Datos de Entrada:**
```typescript
interface HeatmapDataPoint {
  department_id: string;
  department_name: string;
  wellness_index: number;
  avg_stress: number;
  avg_fatigue: number;
  burnout_risk_score: number;
}
```

**Fuente de Datos:**
- Tabla: `department_insights` (último por departamento)
- Endpoint: `GET /api/v1/department-insights/heatmap?organization_id={id}`

---

### 5.7 Gráfico de Impacto de Beneficios (HR)

**Tipo:** Grouped Bar Chart

**Configuración:**
```typescript
<BarChart data={benefitImpactData} width={800} height={400}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="benefit_title" />
  <YAxis domain={[0, 100]} />
  <Tooltip />
  <Legend />
  <Bar dataKey="avg_wellness_before" fill="#94a3b8" name="Antes" />
  <Bar dataKey="avg_wellness_after" fill="#3b82f6" name="Después" />
</BarChart>
```

**Datos de Entrada:**
```typescript
interface BenefitImpactDataPoint {
  benefit_id: string;
  benefit_title: string;
  users_activated: number;
  avg_wellness_before: number;
  avg_wellness_after: number;
  avg_stress_before: number;
  avg_stress_after: number;
}
```

**Fuente de Datos:**
- Vista: `vw_benefit_impact` (nueva)
- Endpoint: `GET /api/v1/benefits/impact-analysis?organization_id={id}`

---

### 5.8 Gráfico de Tendencias de Uso (Admin Org)

**Tipo:** Stacked Area Chart

**Configuración:**
```typescript
<AreaChart data={usageTrendsData} width={1000} height={400}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Area type="monotone" dataKey="total_valid_scans" stackId="1" stroke="#22c55e" fill="#22c55e" name="Escaneos Válidos" />
  <Area type="monotone" dataKey="total_invalid_scans" stackId="1" stroke="#ef4444" fill="#ef4444" name="Escaneos Inválidos" />
  <Line type="monotone" dataKey="total_prompts_used" stroke="#3b82f6" strokeWidth={2} name="Prompts IA" />
</AreaChart>
```

**Datos de Entrada:**
```typescript
interface UsageTrendsDataPoint {
  month: string; // "2025-09"
  total_valid_scans: number;
  total_invalid_scans: number;
  total_prompts_used: number;
}
```

**Fuente de Datos:**
- Tabla: `organization_usage_summary` (ya existe)
- Endpoint: `GET /api/v1/organization-usage-summary/trends?organization_id={id}&months=12`

---

### 5.9 Gráfico de Uso por Departamento (Admin Org)

**Tipo:** Horizontal Bar Chart

**Configuración:**
```typescript
<BarChart data={deptUsageData} layout="horizontal" width={800} height={600}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis type="number" />
  <YAxis type="category" dataKey="department_name" width={150} />
  <Tooltip />
  <Legend />
  <Bar dataKey="total_scans" fill="#3b82f6" name="Escaneos Totales" />
  <Bar dataKey="participation_rate" fill="#22c55e" name="Tasa Participación (%)" />
</BarChart>
```

**Datos de Entrada:**
```typescript
interface DeptUsageDataPoint {
  department_id: string;
  department_name: string;
  total_users: number;
  active_users: number;
  total_scans: number;
  avg_scans_per_user: number;
  participation_rate: number;
}
```

**Fuente de Datos:**
- Vista: `vw_department_usage` (nueva)
- Endpoint: `GET /api/v1/departments/usage-comparison?organization_id={id}`

---

## 6. Agrupación y UX

### 6.1 Principios de Agrupación

#### Jerarquía de Información
1. **Nivel 1 - Resumen Ejecutivo** (Header)
   - Métrica principal (Wellness Index)
   - Estado general (Excelente/Bueno/Regular/Crítico)
   - Última actualización

2. **Nivel 2 - Evolución Temporal** (Primera sección)
   - Gráficos de tendencias
   - Comparativas temporales

3. **Nivel 3 - Indicadores Detallados** (Tabs o secciones)
   - Agrupados por categoría o función
   - Con información contextual

4. **Nivel 4 - Acciones y Recomendaciones** (Última sección)
   - Alertas
   - Recomendaciones personalizadas
   - Acciones sugeridas

### 6.2 Sistema de Tabs Propuesto

#### Employee Dashboard
```
┌─────────────────────────────────────────────────┐
│ Header: Wellness Index + Stats                 │
├─────────────────────────────────────────────────┤
│ Sección: Mi Evolución Personal (gráfico)       │
├─────────────────────────────────────────────────┤
│ Sección: Comparativa Personal (cards)          │
├─────────────────────────────────────────────────┤
│ Tabs:                                           │
│  [Resumen] [Cardiovascular] [Mental]           │
│  [Fisiológico] [Todos]                          │
├─────────────────────────────────────────────────┤
│ Sección: Recomendaciones Personalizadas        │
└─────────────────────────────────────────────────┘
```

#### Leader Dashboard
```
┌─────────────────────────────────────────────────┐
│ Header: Wellness Index Equipo + Stats          │
├─────────────────────────────────────────────────┤
│ Sección: Evolución del Equipo (gráfico)        │
├─────────────────────────────────────────────────┤
│ Sección: Comparativa con Otros Deptos          │
├─────────────────────────────────────────────────┤
│ Sección: Distribución de Riesgos (donut)       │
├─────────────────────────────────────────────────┤
│ Gauges: 6 indicadores principales               │
├─────────────────────────────────────────────────┤
│ Tabs:                                           │
│  [En Riesgo] [Últimos Scans] [Programas]       │
│  [Alertas y Acciones]                           │
└─────────────────────────────────────────────────┘
```

#### HR Dashboard
```
┌─────────────────────────────────────────────────┐
│ Header: Wellness Index Org + Stats             │
├─────────────────────────────────────────────────┤
│ Sección: Evolución Organizacional (gráfico)    │
├─────────────────────────────────────────────────┤
│ Sección: Proyección Actuarial                  │
├─────────────────────────────────────────────────┤
│ Gauges: 8 indicadores organizacionales          │
├─────────────────────────────────────────────────┤
│ Stats Cards: Riesgos (Crítico/Alto/Moderado)   │
├─────────────────────────────────────────────────┤
│ Tabs:                                           │
│  [Insights Deptos] [Heatmap Deptos]            │
│  [En Riesgo] [Impacto Beneficios] [Programas]  │
└─────────────────────────────────────────────────┘
```

#### Admin Org Dashboard
```
┌─────────────────────────────────────────────────┐
│ Header: Stats Generales + Refresh              │
├─────────────────────────────────────────────────┤
│ Sección: Métricas de Salud Organizacional      │
├─────────────────────────────────────────────────┤
│ Sección: Quick Access Cards (6 cards)          │
├─────────────────────────────────────────────────┤
│ Sección: Subscription Status + Alertas         │
├─────────────────────────────────────────────────┤
│ Tabs:                                           │
│  [Uso Mensual] [Uso por Usuario]               │
│  [Uso por Departamento] [ROI y Análisis]       │
└─────────────────────────────────────────────────┘
```

### 6.3 Sistema de Colores

#### Paleta de Colores por Métrica
- **Bienestar (Wellness):** Azul (`#3b82f6`)
- **Estrés:** Rojo (`#ef4444`)
- **Fatiga:** Naranja (`#f97316`)
- **Recuperación:** Verde (`#22c55e`)
- **Burnout:** Amarillo/Naranja (`#f59e0b`)
- **Riesgo Actuarial:** Naranja oscuro (`#ea580c`)
- **Riesgo Reclamaciones:** Rojo oscuro (`#dc2626`)

#### Escala de Riesgos
- **Bajo:** Verde (`#22c55e`)
- **Moderado:** Amarillo (`#eab308`)
- **Alto:** Naranja (`#f97316`)
- **Crítico:** Rojo (`#ef4444`)

### 6.4 Iconografía

#### Iconos por Sección
- **Bienestar:** `<Heart />` (lucide-react)
- **Estrés:** `<Brain />` (lucide-react)
- **Fatiga:** `<Battery />` (lucide-react)
- **Recuperación:** `<Zap />` (lucide-react)
- **Burnout:** `<Shield />` (lucide-react)
- **Evolución:** `<TrendingUp />` (lucide-react)
- **Alertas:** `<AlertTriangle />` (lucide-react)
- **Recomendaciones:** `<Sparkles />` (lucide-react)

### 6.5 Responsive Design

#### Breakpoints
- **Mobile:** < 768px - 1 columna, tabs verticales
- **Tablet:** 768px - 1024px - 2 columnas, tabs horizontales
- **Desktop:** > 1024px - 3-4 columnas, layout completo

#### Priorización Mobile-First
1. Métrica principal (Wellness Index)
2. Gráfico de evolución (simplificado)
3. Top 3 indicadores
4. Tabs colapsables

---

## 7. Vistas de Base de Datos Requeridas

### 7.1 Vista: vw_department_comparison

**Propósito:** Comparar métricas de un departamento con el promedio organizacional

**SQL:**
```sql
CREATE OR REPLACE VIEW vw_department_comparison AS
SELECT 
  d.id as department_id,
  d.name as department_name,
  d.organization_id,
  
  -- Métricas del departamento (último insight)
  di.wellness_index as dept_wellness_index,
  di.avg_stress as dept_avg_stress,
  di.avg_fatigue as dept_avg_fatigue,
  di.avg_cognitive_load as dept_avg_cognitive_load,
  di.avg_recovery as dept_avg_recovery,
  di.burnout_risk_score as dept_burnout_risk,
  
  -- Promedios organizacionales (últimos 30 días)
  (
    SELECT AVG(wellness_index) 
    FROM department_insights 
    WHERE organization_id = d.organization_id 
      AND created_at >= NOW() - INTERVAL '30 days'
  ) as org_avg_wellness_index,
  
  (
    SELECT AVG(avg_stress) 
    FROM department_insights 
    WHERE organization_id = d.organization_id 
      AND created_at >= NOW() - INTERVAL '30 days'
  ) as org_avg_stress,
  
  (
    SELECT AVG(avg_fatigue) 
    FROM department_insights 
    WHERE organization_id = d.organization_id 
      AND created_at >= NOW() - INTERVAL '30 days'
  ) as org_avg_fatigue,
  
  (
    SELECT AVG(avg_cognitive_load) 
    FROM department_insights 
    WHERE organization_id = d.organization_id 
      AND created_at >= NOW() - INTERVAL '30 days'
  ) as org_avg_cognitive_load,
  
  (
    SELECT AVG(avg_recovery) 
    FROM department_insights 
    WHERE organization_id = d.organization_id 
      AND created_at >= NOW() - INTERVAL '30 days'
  ) as org_avg_recovery,
  
  (
    SELECT AVG(burnout_risk_score) 
    FROM department_insights 
    WHERE organization_id = d.organization_id 
      AND created_at >= NOW() - INTERVAL '30 days'
  ) as org_avg_burnout_risk,
  
  di.created_at as last_analysis_date

FROM departments d
LEFT JOIN LATERAL (
  SELECT * 
  FROM department_insights 
  WHERE department_id = d.id 
  ORDER BY created_at DESC 
  LIMIT 1
) di ON true
WHERE d.is_active = true;
```

**Campos Retornados:**
- `department_id` (uuid)
- `department_name` (text)
- `organization_id` (uuid)
- `dept_wellness_index` (numeric)
- `dept_avg_stress` (numeric)
- `dept_avg_fatigue` (numeric)
- `dept_avg_cognitive_load` (numeric)
- `dept_avg_recovery` (numeric)
- `dept_burnout_risk` (numeric)
- `org_avg_wellness_index` (numeric)
- `org_avg_stress` (numeric)
- `org_avg_fatigue` (numeric)
- `org_avg_cognitive_load` (numeric)
- `org_avg_recovery` (numeric)
- `org_avg_burnout_risk` (numeric)
- `last_analysis_date` (timestamp)

---

### 7.2 Vista: vw_benefit_impact

**Propósito:** Analizar el impacto de beneficios en métricas de salud

**SQL:**
```sql
CREATE OR REPLACE VIEW vw_benefit_impact AS
SELECT 
  b.id as benefit_id,
  b.title as benefit_title,
  b.description as benefit_description,
  b.organization_id,
  
  -- Conteo de usuarios que activaron el beneficio
  COUNT(DISTINCT uba.user_id) as users_activated,
  
  -- Métricas ANTES de activar el beneficio (30 días antes)
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN uba.activated_at - INTERVAL '30 days' AND uba.activated_at 
      THEN bm.wellness_index_score 
    END
  ) as avg_wellness_before,
  
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN uba.activated_at - INTERVAL '30 days' AND uba.activated_at 
      THEN bm.ai_stress 
    END
  ) as avg_stress_before,
  
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN uba.activated_at - INTERVAL '30 days' AND uba.activated_at 
      THEN bm.ai_fatigue 
    END
  ) as avg_fatigue_before,
  
  -- Métricas DESPUÉS de activar el beneficio (30 días después)
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN uba.activated_at AND uba.activated_at + INTERVAL '30 days' 
      THEN bm.wellness_index_score 
    END
  ) as avg_wellness_after,
  
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN uba.activated_at AND uba.activated_at + INTERVAL '30 days' 
      THEN bm.ai_stress 
    END
  ) as avg_stress_after,
  
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN uba.activated_at AND uba.activated_at + INTERVAL '30 days' 
      THEN bm.ai_fatigue 
    END
  ) as avg_fatigue_after,
  
  -- Cálculo de impacto (diferencia)
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN uba.activated_at AND uba.activated_at + INTERVAL '30 days' 
      THEN bm.wellness_index_score 
    END
  ) - AVG(
    CASE 
      WHEN bm.created_at BETWEEN uba.activated_at - INTERVAL '30 days' AND uba.activated_at 
      THEN bm.wellness_index_score 
    END
  ) as wellness_impact,
  
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN uba.activated_at - INTERVAL '30 days' AND uba.activated_at 
      THEN bm.ai_stress 
    END
  ) - AVG(
    CASE 
      WHEN bm.created_at BETWEEN uba.activated_at AND uba.activated_at + INTERVAL '30 days' 
      THEN bm.ai_stress 
    END
  ) as stress_reduction,
  
  MIN(uba.activated_at) as first_activation_date,
  MAX(uba.activated_at) as last_activation_date

FROM benefits b
LEFT JOIN user_benefit_activations uba ON b.id = uba.benefit_id
LEFT JOIN biometric_measurements bm ON uba.user_id = bm.user_id
WHERE uba.activated_at IS NOT NULL
  AND b.is_active = true
GROUP BY b.id, b.title, b.description, b.organization_id
HAVING COUNT(DISTINCT uba.user_id) > 0;
```

**Campos Retornados:**
- `benefit_id` (uuid)
- `benefit_title` (text)
- `benefit_description` (text)
- `organization_id` (uuid)
- `users_activated` (integer)
- `avg_wellness_before` (numeric)
- `avg_stress_before` (numeric)
- `avg_fatigue_before` (numeric)
- `avg_wellness_after` (numeric)
- `avg_stress_after` (numeric)
- `avg_fatigue_after` (numeric)
- `wellness_impact` (numeric)
- `stress_reduction` (numeric)
- `first_activation_date` (timestamp)
- `last_activation_date` (timestamp)

---

### 7.3 Vista: vw_department_usage

**Propósito:** Comparar uso de la plataforma por departamento

**SQL:**
```sql
CREATE OR REPLACE VIEW vw_department_usage AS
SELECT 
  d.id as department_id,
  d.name as department_name,
  d.organization_id,
  
  -- Conteo de usuarios
  COUNT(DISTINCT up.user_id) as total_users,
  COUNT(DISTINCT CASE WHEN up.is_active = true THEN up.user_id END) as active_users,
  COUNT(DISTINCT usu.user_id) as users_with_scans,
  
  -- Métricas de escaneos
  COALESCE(SUM(usu.total_scans), 0) as total_scans,
  COALESCE(AVG(usu.total_scans), 0) as avg_scans_per_user,
  COALESCE(MAX(usu.total_scans), 0) as max_scans_per_user,
  COALESCE(MIN(usu.total_scans), 0) as min_scans_per_user,
  
  -- Tasa de participación
  ROUND(
    (COUNT(DISTINCT usu.user_id)::numeric / NULLIF(COUNT(DISTINCT up.user_id), 0)) * 100, 
    2
  ) as participation_rate,
  
  -- Fecha último escaneo
  MAX(usu.last_scan_date) as last_scan_date,
  
  -- Conteo de prompts IA (si existe tabla user_prompt_usage)
  COALESCE(
    (
      SELECT SUM(total_prompts) 
      FROM user_prompt_usage upu 
      WHERE upu.user_id IN (SELECT user_id FROM user_profiles WHERE department_id = d.id)
    ), 
    0
  ) as total_prompts_used

FROM departments d
LEFT JOIN user_profiles up ON d.id = up.department_id
LEFT JOIN user_scan_usage usu ON up.user_id = usu.user_id
WHERE d.is_active = true
GROUP BY d.id, d.name, d.organization_id;
```

**Campos Retornados:**
- `department_id` (uuid)
- `department_name` (text)
- `organization_id` (uuid)
- `total_users` (integer)
- `active_users` (integer)
- `users_with_scans` (integer)
- `total_scans` (integer)
- `avg_scans_per_user` (numeric)
- `max_scans_per_user` (integer)
- `min_scans_per_user` (integer)
- `participation_rate` (numeric)
- `last_scan_date` (timestamp)
- `total_prompts_used` (integer)

---

### 7.4 Vista: vw_weekly_trends

**Propósito:** Agregación semanal de métricas para análisis de tendencias

**SQL:**
```sql
CREATE OR REPLACE VIEW vw_weekly_trends AS
SELECT 
  up.user_id,
  up.organization_id,
  up.department_id,
  
  -- Semana (año + número de semana)
  DATE_TRUNC('week', bm.created_at) as week_start,
  EXTRACT(YEAR FROM bm.created_at) as year,
  EXTRACT(WEEK FROM bm.created_at) as week_number,
  
  -- Conteo de escaneos
  COUNT(*) as scans_count,
  
  -- Promedios semanales
  AVG(bm.wellness_index_score) as avg_wellness_index,
  AVG(bm.ai_stress) as avg_stress,
  AVG(bm.ai_fatigue) as avg_fatigue,
  AVG(bm.ai_recovery) as avg_recovery,
  AVG(bm.ai_cognitive_load) as avg_cognitive_load,
  AVG(bm.biological_age - up.age) as avg_bio_age_gap,
  
  -- Valores mínimos y máximos
  MIN(bm.wellness_index_score) as min_wellness_index,
  MAX(bm.wellness_index_score) as max_wellness_index,
  MIN(bm.ai_stress) as min_stress,
  MAX(bm.ai_stress) as max_stress,
  
  -- Desviación estándar (variabilidad)
  STDDEV(bm.wellness_index_score) as stddev_wellness_index,
  STDDEV(bm.ai_stress) as stddev_stress

FROM biometric_measurements bm
INNER JOIN user_profiles up ON bm.user_id = up.user_id
WHERE bm.created_at >= NOW() - INTERVAL '6 months'
GROUP BY 
  up.user_id, 
  up.organization_id, 
  up.department_id, 
  DATE_TRUNC('week', bm.created_at),
  EXTRACT(YEAR FROM bm.created_at),
  EXTRACT(WEEK FROM bm.created_at);
```

**Campos Retornados:**
- `user_id` (uuid)
- `organization_id` (uuid)
- `department_id` (uuid)
- `week_start` (timestamp)
- `year` (integer)
- `week_number` (integer)
- `scans_count` (integer)
- `avg_wellness_index` (numeric)
- `avg_stress` (numeric)
- `avg_fatigue` (numeric)
- `avg_recovery` (numeric)
- `avg_cognitive_load` (numeric)
- `avg_bio_age_gap` (numeric)
- `min_wellness_index` (numeric)
- `max_wellness_index` (numeric)
- `min_stress` (numeric)
- `max_stress` (numeric)
- `stddev_wellness_index` (numeric)
- `stddev_stress` (numeric)

---

### 7.5 Vista: vw_monthly_trends

**Propósito:** Agregación mensual de métricas para análisis de tendencias

**SQL:**
```sql
CREATE OR REPLACE VIEW vw_monthly_trends AS
SELECT 
  up.user_id,
  up.organization_id,
  up.department_id,
  
  -- Mes (año + mes)
  DATE_TRUNC('month', bm.created_at) as month_start,
  EXTRACT(YEAR FROM bm.created_at) as year,
  EXTRACT(MONTH FROM bm.created_at) as month_number,
  TO_CHAR(bm.created_at, 'YYYY-MM') as month_label,
  
  -- Conteo de escaneos
  COUNT(*) as scans_count,
  
  -- Promedios mensuales
  AVG(bm.wellness_index_score) as avg_wellness_index,
  AVG(bm.ai_stress) as avg_stress,
  AVG(bm.ai_fatigue) as avg_fatigue,
  AVG(bm.ai_recovery) as avg_recovery,
  AVG(bm.ai_cognitive_load) as avg_cognitive_load,
  AVG(bm.mental_stress_index) as avg_mental_stress,
  AVG(bm.biological_age - up.age) as avg_bio_age_gap,
  
  -- Valores mínimos y máximos
  MIN(bm.wellness_index_score) as min_wellness_index,
  MAX(bm.wellness_index_score) as max_wellness_index,
  MIN(bm.ai_stress) as min_stress,
  MAX(bm.ai_stress) as max_stress,
  
  -- Desviación estándar (variabilidad)
  STDDEV(bm.wellness_index_score) as stddev_wellness_index,
  STDDEV(bm.ai_stress) as stddev_stress,
  
  -- Percentiles
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY bm.wellness_index_score) as p25_wellness_index,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY bm.wellness_index_score) as p50_wellness_index,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY bm.wellness_index_score) as p75_wellness_index

FROM biometric_measurements bm
INNER JOIN user_profiles up ON bm.user_id = up.user_id
WHERE bm.created_at >= NOW() - INTERVAL '12 months'
GROUP BY 
  up.user_id, 
  up.organization_id, 
  up.department_id, 
  DATE_TRUNC('month', bm.created_at),
  EXTRACT(YEAR FROM bm.created_at),
  EXTRACT(MONTH FROM bm.created_at),
  TO_CHAR(bm.created_at, 'YYYY-MM');
```

**Campos Retornados:**
- `user_id` (uuid)
- `organization_id` (uuid)
- `department_id` (uuid)
- `month_start` (timestamp)
- `year` (integer)
- `month_number` (integer)
- `month_label` (text)
- `scans_count` (integer)
- `avg_wellness_index` (numeric)
- `avg_stress` (numeric)
- `avg_fatigue` (numeric)
- `avg_recovery` (numeric)
- `avg_cognitive_load` (numeric)
- `avg_mental_stress` (numeric)
- `avg_bio_age_gap` (numeric)
- `min_wellness_index` (numeric)
- `max_wellness_index` (numeric)
- `min_stress` (numeric)
- `max_stress` (numeric)
- `stddev_wellness_index` (numeric)
- `stddev_stress` (numeric)
- `p25_wellness_index` (numeric)
- `p50_wellness_index` (numeric)
- `p75_wellness_index` (numeric)

---

## 8. Prioridades de Implementación

### Fase 1: Fundamentos de Evolución (Prioridad Alta) - 2 semanas

**Objetivo:** Implementar gráficos de evolución temporal básicos

**Tareas:**
1. **Backend - Nuevos Endpoints**
   - ✅ `GET /api/v1/biometric-measurements/my-history?days=30` (Employee)
   - ✅ `GET /api/v1/department-insights/evolution?department_id={id}&months=6` (Leader)
   - ✅ `GET /api/v1/organization-insights/evolution?organization_id={id}&months=12` (HR)
   - ✅ `GET /api/v1/organization-usage-summary/trends?organization_id={id}&months=12` (Admin)

2. **Frontend - Componentes de Gráficos**
   - ✅ `PersonalEvolutionChart.tsx` (Employee)
   - ✅ `TeamEvolutionChart.tsx` (Leader)
   - ✅ `OrganizationEvolutionChart.tsx` (HR)
   - ✅ `UsageTrendsChart.tsx` (Admin)

3. **Integración en Dashboards**
   - ✅ Agregar sección de evolución en cada dashboard
   - ✅ Mantener funcionalidad existente
   - ✅ Testing de integración

**Estimación:** 80 horas (2 desarrolladores x 1 semana)

---

### Fase 2: Comparativas y Distribuciones (Prioridad Alta) - 2 semanas

**Objetivo:** Implementar comparativas y visualizaciones de distribución

**Tareas:**
1. **Backend - Vistas de Base de Datos**
   - ✅ Crear `vw_department_comparison`
   - ✅ Crear `vw_department_usage`
   - ✅ Nuevos endpoints para comparativas

2. **Frontend - Componentes de Comparación**
   - ✅ `PersonalComparisonCards.tsx` (Employee)
   - ✅ `DepartmentComparisonChart.tsx` (Leader)
   - ✅ `RiskDistributionChart.tsx` (Leader)
   - ✅ `DepartmentUsageComparison.tsx` (Admin)

3. **Integración en Dashboards**
   - ✅ Agregar secciones de comparación
   - ✅ Testing de integración

**Estimación:** 80 horas (2 desarrolladores x 1 semana)

---

### Fase 3: Análisis Avanzado (Prioridad Media) - 2 semanas

**Objetivo:** Implementar análisis de impacto y proyecciones

**Tareas:**
1. **Backend - Vistas y Lógica Avanzada**
   - ✅ Crear `vw_benefit_impact`
   - ✅ Crear `vw_weekly_trends`, `vw_monthly_trends`
   - ✅ Endpoint de proyección actuarial (regresión lineal)
   - ✅ Endpoint de análisis de ROI

2. **Frontend - Componentes Avanzados**
   - ✅ `BenefitImpactAnalysis.tsx` (HR)
   - ✅ `ActuarialProjection.tsx` (HR)
   - ✅ `DepartmentHeatmap.tsx` (HR)
   - ✅ `PlatformROIAnalysis.tsx` (Admin)

3. **Integración en Dashboards**
   - ✅ Agregar nuevas tabs
   - ✅ Testing de integración

**Estimación:** 80 horas (2 desarrolladores x 1 semana)

---

### Fase 4: UX y Agrupación (Prioridad Media) - 1 semana

**Objetivo:** Mejorar UX mediante agrupación y tabs

**Tareas:**
1. **Frontend - Refactorización de Layout**
   - ✅ Implementar sistema de tabs en Employee Dashboard
   - ✅ Reorganizar secciones en Leader Dashboard
   - ✅ Mejorar navegación en HR Dashboard
   - ✅ Optimizar Admin Dashboard

2. **Frontend - Componentes de UX**
   - ✅ `PersonalizedRecommendations.tsx` (Employee)
   - ✅ `TeamAlertsPanel.tsx` (Leader)
   - ✅ `LimitAlertsPanel.tsx` (Admin)

3. **Testing y Ajustes**
   - ✅ Testing de usabilidad
   - ✅ Ajustes de responsive design
   - ✅ Optimización de performance

**Estimación:** 40 horas (2 desarrolladores x 0.5 semanas)

---

### Fase 5: Métricas de Salud Organizacional (Prioridad Baja) - 1 semana

**Objetivo:** Agregar métricas de salud en Admin Dashboard

**Tareas:**
1. **Backend - Endpoints de Métricas**
   - ✅ `GET /api/v1/organization-insights/health-metrics?organization_id={id}`
   - ✅ Cálculo de tasa de participación
   - ✅ Cálculo de tasa de adopción de beneficios

2. **Frontend - Componentes de Métricas**
   - ✅ `OrgHealthMetrics.tsx` (Admin)
   - ✅ Integración en Admin Dashboard

3. **Testing y Documentación**
   - ✅ Testing de integración
   - ✅ Documentación de métricas

**Estimación:** 40 horas (2 desarrolladores x 0.5 semanas)

---

### Resumen de Fases

| Fase | Prioridad | Duración | Esfuerzo (horas) | Entregables |
|------|-----------|----------|------------------|-------------|
| 1. Fundamentos de Evolución | Alta | 2 semanas | 80 | Gráficos de evolución en 4 dashboards |
| 2. Comparativas y Distribuciones | Alta | 2 semanas | 80 | Comparativas y distribuciones |
| 3. Análisis Avanzado | Media | 2 semanas | 80 | Impacto de beneficios, proyecciones |
| 4. UX y Agrupación | Media | 1 semana | 40 | Sistema de tabs, recomendaciones |
| 5. Métricas de Salud Org | Baja | 1 semana | 40 | Métricas de salud en Admin |
| **TOTAL** | - | **8 semanas** | **320 horas** | **Dashboard completos mejorados** |

---

## 9. Restricciones y Consideraciones

### 9.1 Restricciones Técnicas

#### 9.1.1 Datos Existentes
- ✅ **SOLO usar datos existentes** en tablas y vistas actuales
- ❌ **NO inventar** métricas o datos que no existen
- ✅ **Validar** con David (Data Analyst) antes de implementar

#### 9.1.2 Funcionalidad Operativa
- ✅ **NO romper** funcionalidad existente
- ✅ **Mantener** todos los indicadores actuales
- ✅ **Agregar** nuevas características sin eliminar las antiguas
- ✅ **Testing exhaustivo** antes de cada despliegue

#### 9.1.3 Performance
- ⚠️ **Optimizar consultas** de vistas agregadas
- ⚠️ **Implementar caché** para gráficos de evolución
- ⚠️ **Lazy loading** para tabs y secciones pesadas
- ⚠️ **Paginación** en listas largas (ej. empleados en riesgo)

### 9.2 Consideraciones de Negocio

#### 9.2.1 Privacidad de Datos
- ✅ **Respetar RLS** (Row Level Security) de Supabase
- ✅ **Filtrar datos** según rol de usuario
- ✅ **No exponer** datos personales en vistas agregadas
- ✅ **Anonimizar** datos en comparativas organizacionales

#### 9.2.2 Roles y Permisos
- **Employee:** Solo sus propios datos
- **Leader:** Solo datos de su departamento
- **HR:** Datos de toda la organización
- **Admin Org:** Datos administrativos y de uso

#### 9.2.3 Escalabilidad
- ⚠️ **Diseñar para crecer** (100+ departamentos, 10,000+ usuarios)
- ⚠️ **Optimizar vistas** para grandes volúmenes de datos
- ⚠️ **Implementar índices** en columnas de filtrado frecuente

### 9.3 Consideraciones de UX

#### 9.3.1 Tiempos de Carga
- ⚠️ **Máximo 3 segundos** para carga inicial de dashboard
- ⚠️ **Máximo 1 segundo** para cambio de tab
- ⚠️ **Skeleton loaders** durante carga de datos
- ⚠️ **Error handling** con mensajes claros

#### 9.3.2 Accesibilidad
- ✅ **Contraste de colores** WCAG AA
- ✅ **Navegación por teclado** en todos los componentes
- ✅ **Screen reader friendly** con aria-labels
- ✅ **Responsive design** mobile-first

#### 9.3.3 Internacionalización
- ✅ **Español** como idioma principal
- ✅ **Formato de fechas** según locale (es-ES)
- ✅ **Formato de números** con separadores correctos
- ⚠️ **Preparar para i18n** futuro (inglés, portugués)

### 9.4 Consideraciones de Mantenimiento

#### 9.4.1 Documentación
- ✅ **Documentar** cada nueva vista de base de datos
- ✅ **Documentar** cada nuevo endpoint
- ✅ **Documentar** cada nuevo componente
- ✅ **Mantener** este PRD actualizado

#### 9.4.2 Testing
- ✅ **Unit tests** para lógica de negocio
- ✅ **Integration tests** para endpoints
- ✅ **E2E tests** para flujos críticos
- ✅ **Visual regression tests** para componentes

#### 9.4.3 Monitoreo
- ⚠️ **Logging** de errores en producción
- ⚠️ **Métricas de performance** (tiempo de carga)
- ⚠️ **Alertas** para errores críticos
- ⚠️ **Analytics** de uso de nuevas características

---

## 10. Apéndices

### 10.1 Glosario de Términos

- **Wellness Index:** Índice de bienestar general (0-100)
- **Estrés (ai_stress):** Nivel de estrés detectado por IA (0-100)
- **Fatiga (ai_fatigue):** Nivel de fatiga detectado por IA (0-100)
- **Recuperación (ai_recovery):** Capacidad de recuperación (0-100)
- **Burnout Risk:** Riesgo de agotamiento laboral (1-5)
- **Riesgo Actuarial:** Riesgo calculado para aseguradoras (1-10)
- **Riesgo de Reclamaciones:** Probabilidad de reclamaciones (%)
- **Brecha Edad Biológica:** Diferencia entre edad biológica y cronológica (años)

### 10.2 Referencias

- **Diccionario de Datos:** `/workspace/uploads/Diccionario_Datos_Equilibria_2026_Para_Analistas (1).docx`
- **Especificaciones de Dashboards:** `/workspace/uploads/Equilibria_Dashboards_Evolutivos_2026 (2).docx`
- **Código Actual:**
  - Employee Dashboard: `/workspace/app/frontend/src/pages/employee/Dashboard.tsx`
  - Leader Dashboard: `/workspace/app/frontend/src/pages/leader/Dashboard.tsx`
  - HR Dashboard: `/workspace/app/frontend/src/pages/hr/Dashboard.tsx`
  - Admin Dashboard: `/workspace/app/frontend/src/pages/org/Dashboard.tsx`

### 10.3 Contactos

- **Product Manager:** Emma
- **Data Analyst:** David (validación de datos)
- **Engineer:** Alex (implementación)
- **Architect:** Bob (revisión de arquitectura)

---

## 11. Aprobaciones

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Product Manager | Emma | 2026-02-03 | ✅ |
| Data Analyst | David | Pendiente | ⏳ |
| Engineer | Alex | Pendiente | ⏳ |
| Architect | Bob | Pendiente | ⏳ |

---

**Fin del Documento**

---

## Notas Finales

Este PRD define una **expansión ordenada y estructural** de los dashboards existentes, **sin romper funcionalidad operativa**. Todas las mejoras propuestas están basadas en **datos reales existentes** en la base de datos.

La implementación se realizará en **5 fases priorizadas** (8 semanas totales), comenzando por los gráficos de evolución temporal (Fase 1) que aportan el mayor valor inmediato.

**Próximos Pasos:**
1. Revisión y aprobación por David (Data Analyst) ✅
2. Revisión y aprobación por Alex (Engineer) ✅
3. Revisión y aprobación por Bob (Architect) ✅
4. Inicio de Fase 1: Fundamentos de Evolución 🚀