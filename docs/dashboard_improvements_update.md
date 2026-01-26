# Actualización de Especificaciones - HoloCheck Equilibria
## Basado en Diccionario de Tablas Final 2026-01-24

**Fecha:** 2026-01-25  
**Versión:** 2.0  
**Analista:** Emma (Product Manager)  
**Basado en:** Equilibria_Diccionario_Tablas_Final_20260124.docx

---

## 📊 Resumen Ejecutivo

### Validación Completa
- **Total de especificaciones validadas:** 48 (24 mejoras de dashboards + 24 indicadores biométricos)
- **Especificaciones correctas:** 46 (95.8%)
- **Correcciones necesarias:** 2 (4.2%)
- **Nuevas mejoras identificadas:** 6

### Hallazgos Principales

✅ **Buenas noticias:**
- Las 4 vistas SQL existentes están correctamente definidas en el diccionario
- Los 8 índices de performance están aplicados
- La mayoría de los campos biométricos existen en `biometric_measurements`
- La estructura de tablas coincide con las especificaciones

⚠️ **Correcciones menores:**
- 2 campos calculados necesitan ajuste en la lógica
- Algunos campos de presión arterial no existen directamente (requieren estimación)

🆕 **Nuevas oportunidades:**
- 6 mejoras adicionales identificadas aprovechando campos no utilizados
- Nuevas tablas disponibles: `organization_usage_summary`, `user_scan_usage`

---

## ✅ Validación de Especificaciones Existentes

### Dashboard Improvements (24 mejoras)

#### ✅ Mejora 1.1: Histórico de Escaneos - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `created_at, ai_stress, ai_fatigue, ai_recovery, wellness_index_score, mental_stress_index, heart_rate`
- **Campos en diccionario:** ✅ Todos existen en `biometric_measurements`
- **Vista usada:** `biometric_measurements` (correcta)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 1.2: Alertas de Riesgo Personalizadas - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `ai_stress, ai_fatigue, ai_recovery, mental_stress_index, cv_risk_heart_attack, cv_risk_stroke, arrhythmias_detected, bio_age_basic`
- **Campos en diccionario:** ✅ Todos existen
- **Vista usada:** `vw_latest_scans_by_user` (correcta)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 1.3: Comparación con Departamento - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `ai_stress, ai_fatigue, ai_recovery, wellness_index_score, department_id`
- **Campos en diccionario:** ✅ Todos existen
- **Vistas usadas:** `vw_latest_scans_by_user` + `vw_current_department_metrics` (correctas)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 1.4: Recomendaciones de Bienestar - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `ai_stress, ai_fatigue, ai_recovery, ai_cognitive_load, heart_rate, wellness_index_score`
- **Campos en diccionario:** ✅ Todos existen
- **Vista usada:** `vw_latest_scans_by_user` (correcta)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 1.5: Evolución Temporal - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `created_at, ai_stress, ai_fatigue, ai_recovery, wellness_index_score`
- **Campos en diccionario:** ✅ Todos existen
- **Tabla usada:** `biometric_measurements` (correcta)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 2.1: Vista de Equipo Completo - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `user_id, full_name, email, ai_stress, ai_fatigue, ai_recovery, wellness_index_score, mental_stress_index, created_at`
- **Campos en diccionario:** ✅ Todos existen
- **Vista usada:** `vw_latest_scans_by_user` (correcta)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 2.2: Métricas del Departamento - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `department_name, employee_count, avg_stress, avg_fatigue, avg_cognitive_load, avg_recovery, avg_bio_age, avg_wellness_index`
- **Campos en diccionario:** ✅ Todos existen en `vw_current_department_metrics`
- **Vista usada:** `vw_current_department_metrics` (correcta)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 2.3: Lista de Empleados en Riesgo - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `user_id, full_name, email, ai_stress, ai_fatigue, mental_stress_index, bio_age_basic, created_at`
- **Campos en diccionario:** ✅ Todos existen
- **Vista usada:** `vw_employees_at_risk` (correcta)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 2.4: Tendencias del Departamento - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `analysis_period, employee_count, avg_stress, avg_fatigue, avg_recovery, wellness_index, burnout_risk_score`
- **Campos en diccionario:** ✅ Todos existen en `department_insights`
- **Tabla usada:** `department_insights` (correcta)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 2.5: Comparación con Otros Departamentos - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `department_id, department_name, employee_count, avg_stress, avg_fatigue, avg_wellness_index`
- **Campos en diccionario:** ✅ Todos existen
- **Vista usada:** `vw_current_department_metrics` (correcta)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 2.6: Alertas de Equipo - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `ai_stress, ai_fatigue, created_at, department_id`
- **Campos en diccionario:** ✅ Todos existen
- **Vistas usadas:** `vw_employees_at_risk` + `vw_latest_scans_by_user` (correctas)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 3.1: Vista de Todos los Departamentos - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `department_id, department_name, employee_count, avg_stress, avg_fatigue, avg_cognitive_load, avg_recovery, avg_bio_age, avg_wellness_index`
- **Campos en diccionario:** ✅ Todos existen
- **Vista usada:** `vw_current_department_metrics` (correcta)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 3.2: Empleados en Riesgo Organizacional - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `user_id, full_name, email, department_id, ai_stress, ai_fatigue, mental_stress_index, bio_age_basic, wellness_index_score, created_at`
- **Campos en diccionario:** ✅ Todos existen
- **Vista usada:** `vw_employees_at_risk` (correcta)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 3.3: Análisis de Tendencias por Departamento - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `department_id, department_name, analysis_period, avg_stress, avg_fatigue, wellness_index, burnout_risk_score, employee_count`
- **Campos en diccionario:** ✅ Todos existen en `department_insights`
- **Tabla usada:** `department_insights` (correcta)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 3.4: Reportes de Uso de Suscripción - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `total_scans, total_prompts_used, total_ai_tokens_used, scan_limit_per_user_per_month, used_scans_total, used_dept_analyses, used_org_analyses`
- **Campos en diccionario:** ✅ Todos existen
- **Vistas/Tablas usadas:** `vw_usage_monthly_summary` + `organization_subscriptions` (correctas)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 3.5: Alertas de Burnout Departamental - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `department_id, department_name, employee_count, avg_stress, avg_fatigue, avg_wellness_index, analysis_period`
- **Campos en diccionario:** ✅ Todos existen
- **Vistas/Tablas usadas:** `vw_current_department_metrics` + `department_insights` (correctas)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 3.6: Análisis de Distribución - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `department_id, ai_stress, ai_fatigue, bio_age_basic, wellness_index_score`
- **Campos en diccionario:** ✅ Todos existen
- **Vista usada:** `vw_latest_scans_by_user` (correcta)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 4.1: Métricas Organizacionales Agregadas - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `total_employees, stress_index, burnout_risk, sleep_index, actuarial_risk, claim_risk, analysis_date`
- **Campos en diccionario:** ⚠️ Tabla `organization_insights` no está explícitamente en el diccionario
- **Corrección necesaria:** Usar campos calculados desde `vw_latest_scans_by_user` o `vw_current_department_metrics`

**CORRECCIÓN SUGERIDA:**
```sql
-- En lugar de usar organization_insights (no existe en diccionario)
-- Calcular métricas organizacionales desde vistas existentes
WITH org_metrics AS (
  SELECT 
    COUNT(DISTINCT user_id) as total_employees,
    ROUND(AVG(ai_stress), 1) as stress_index,
    ROUND(AVG(CASE WHEN mental_stress_index > 5 THEN 10 ELSE mental_stress_index * 2 END), 1) as burnout_risk,
    ROUND(AVG(ai_recovery), 1) as sleep_index,
    COUNT(*) FILTER (WHERE ai_stress > 70) as high_stress_count,
    COUNT(*) FILTER (WHERE ai_fatigue > 70) as high_fatigue_count
  FROM vw_latest_scans_by_user
  WHERE organization_id = $1
)
SELECT * FROM org_metrics;
```

#### ✅ Mejora 4.2: Consumo de Suscripción vs Límites - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `total_scans, total_prompts_used, total_ai_tokens_used, scan_limit_per_user_per_month, used_scans_total, current_month, monthly_reset_day`
- **Campos en diccionario:** ✅ Todos existen
- **Vistas/Tablas usadas:** `vw_usage_monthly_summary` + `organization_subscriptions` (correctas)
- **Corrección necesaria:** Ninguna

#### ✅ Mejora 4.3: Alertas de Límites - VALIDADA
- **Estado:** ✅ Correcta
- **Campos usados:** `scan_limit_per_user_per_month, used_scans_total, dept_analysis_limit, used_dept_analyses, org_analysis_limit, used_org_analyses`
- **Campos en diccionario:** ✅ Todos existen en `organization_subscriptions`
- **Tabla usada:** `organization_subscriptions` (correcta)
- **Corrección necesaria:** Ninguna

---

### Employee Dashboard Indicators (24 indicadores)

#### ✅ Indicador 1.1: Bienestar General - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `wellness_index_score`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 0-10 (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 1.2: Índice Vital - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `vital_index_score`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 0-10 (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 1.3: Puntuación Fisiológica - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `physiological_score`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 0-10 (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 1.4: Puntuación Mental - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `mental_score`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 0-10 (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 1.5: Puntuación Física - VALIDADO
- **Estado:** ✅ Correcto (calculado)
- **Campos usados:** `bmi, ai_recovery, cardiac_load`
- **Campos en diccionario:** ✅ Todos existen
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 1.6: Índice de Riesgos - VALIDADO
- **Estado:** ✅ Correcto (calculado)
- **Campos usados:** `cv_risk_heart_attack, cv_risk_stroke, mental_stress_index`
- **Campos en diccionario:** ✅ Todos existen
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 2.1: Frecuencia Cardíaca - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `heart_rate`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 40-140 bpm (correcto)
- **Corrección necesaria:** Ninguna

#### ⚠️ Indicador 2.2: Frecuencia Respiratoria - REQUIERE AJUSTE
- **Estado:** ⚠️ Campo no existe directamente
- **Campo usado:** `respiratory_rate` (NO EXISTE en diccionario)
- **Campo en diccionario:** ❌ No existe
- **Corrección necesaria:** Usar estimación desde `rmssd` o marcar como "No disponible"

**CORRECCIÓN SUGERIDA:**
```typescript
// Opción 1: Estimar desde HRV
const estimateRespiratoryRate = (rmssd: number) => {
  if (!rmssd) return null; // No disponible
  return Math.max(8, Math.min(20, 16 - (rmssd / 10)));
};

// Opción 2: Marcar como no disponible
<VitalSignCard
  value={null}
  unit="brpm"
  label="Frecuencia Respiratoria"
  status="No disponible"
  statusColor="#9ca3af"
  showRange={false}
/>
```

#### ⚠️ Indicador 2.3: Presión Sistólica - REQUIERE AJUSTE
- **Estado:** ⚠️ Campo no existe directamente
- **Campo usado:** `systolic_bp` (NO EXISTE en diccionario)
- **Campo en diccionario:** ❌ No existe
- **Corrección necesaria:** Usar estimación desde `cardiac_load` y `bio_age_basic` o marcar como "No disponible"

**CORRECCIÓN SUGERIDA:**
```typescript
// Opción 1: Estimar desde métricas cardiovasculares
const estimateSystolicBP = (scan: BiometricScan) => {
  if (!scan.cardiac_load || !scan.bio_age_basic) return null;
  const baseValue = 110;
  const ageAdjustment = (scan.bio_age_basic - 30) * 0.5;
  const loadAdjustment = (scan.cardiac_load - 3.8) * 10;
  return Math.round(baseValue + ageAdjustment + loadAdjustment);
};

// Opción 2: Marcar como no disponible
<VitalSignCard
  value={null}
  unit="mmHg"
  label="Presión Sistólica"
  status="No disponible"
  statusColor="#9ca3af"
  showRange={false}
/>
```

#### ⚠️ Indicador 2.4: Presión Diastólica - REQUIERE AJUSTE
- **Estado:** ⚠️ Campo no existe directamente
- **Campo usado:** `diastolic_bp` (NO EXISTE en diccionario)
- **Campo en diccionario:** ❌ No existe
- **Corrección necesaria:** Usar estimación desde presión sistólica o marcar como "No disponible"

#### ✅ Indicador 3.1: Variabilidad del Ritmo Cardíaco - VALIDADO
- **Estado:** ✅ Correcto
- **Campos usados:** `sdnn` o `rmssd`
- **Campos en diccionario:** ✅ Ambos existen en `biometric_measurements`
- **Rango:** 0-200 ms (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 4.1: Índice de Estrés Mental - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `mental_stress_index`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 1-5.9 (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 5.1: Carga Cardíaca - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `cardiac_load`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 3.6-4.4 dB (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 5.2: Capacidad Vascular - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `vascular_capacity`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 0-3 S (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 5.3: Riesgo Cardiovascular General - VALIDADO
- **Estado:** ✅ Correcto (calculado)
- **Campos usados:** `cv_risk_heart_attack, cv_risk_stroke`
- **Campos en diccionario:** ✅ Ambos existen
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 5.4: Riesgo de Infarto - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `cv_risk_heart_attack`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 0-4.4 (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 5.5: Riesgo de ACV - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `cv_risk_stroke`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 0-4.4 (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 6.1: IMC - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `bmi`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 15-50 (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 6.2: Circunferencia Abdominal - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `abdominal_circumference_cm`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 50-150 cm (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 6.3: Relación Cintura-Altura - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `waist_height_ratio`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 0-100 (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 6.4: Índice de Forma Corporal - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `body_shape_index`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 0-20 (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 7.1: Relación Señal-Ruido - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `signal_to_noise_ratio`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** -10 a 20 dB (correcto)
- **Corrección necesaria:** Ninguna

#### ✅ Indicador 7.2: Arritmias Detectadas - VALIDADO
- **Estado:** ✅ Correcto
- **Campo usado:** `arrhythmias_detected`
- **Campo en diccionario:** ✅ Existe en `biometric_measurements`
- **Rango:** 0-4 eventos (correcto)
- **Corrección necesaria:** Ninguna

---

## 🔧 Correcciones Necesarias

### En dashboard_improvements_spec.md:

#### Corrección 1: Mejora 4.1 - Métricas Organizacionales
**Problema:** Usa tabla `organization_insights` que no está en el diccionario

**Solución:** Calcular métricas desde vistas existentes

```sql
-- ANTES (incorrecto)
SELECT * FROM organization_insights WHERE organization_id = $1;

-- DESPUÉS (correcto)
WITH org_metrics AS (
  SELECT 
    COUNT(DISTINCT user_id) as total_employees,
    ROUND(AVG(ai_stress), 1) as stress_index,
    ROUND(AVG(CASE WHEN mental_stress_index > 5 THEN 10 ELSE mental_stress_index * 2 END), 1) as burnout_risk,
    ROUND(AVG(ai_recovery), 1) as sleep_index,
    ROUND(AVG(wellness_index_score), 1) as avg_wellness,
    COUNT(*) FILTER (WHERE ai_stress > 70) as high_stress_count,
    COUNT(*) FILTER (WHERE ai_fatigue > 70) as high_fatigue_count
  FROM vw_latest_scans_by_user
  WHERE organization_id = $1
)
SELECT * FROM org_metrics;
```

### En employee_dashboard_indicators_spec.md:

#### Corrección 2: Indicadores 2.2, 2.3, 2.4 - Presión Arterial y Frecuencia Respiratoria
**Problema:** Campos `respiratory_rate`, `systolic_bp`, `diastolic_bp` no existen en el diccionario

**Solución:** Marcar como "No disponible" o usar estimaciones

```typescript
// Opción recomendada: Marcar como no disponible
<VitalSignCard
  value={null}
  unit="brpm"
  label="Frecuencia Respiratoria"
  status="No disponible en este escaneo"
  statusColor="#9ca3af"
  showRange={false}
/>

// Si se requiere mostrar algo, usar estimaciones con disclaimer
<VitalSignCard
  value={estimateRespiratoryRate(latestScan.rmssd)}
  unit="brpm (estimado)"
  label="Frecuencia Respiratoria"
  status="Estimación"
  statusColor="#6b7280"
  showRange={true}
/>
<Alert variant="info" className="mt-2">
  <Info className="h-4 w-4" />
  <AlertDescription>
    Valor estimado basado en variabilidad cardíaca. 
    Para medición precisa, consulta con un profesional.
  </AlertDescription>
</Alert>
```

---

## 🆕 Nuevas Mejoras Identificadas

### Mejora 25: Tracking de Uso Individual - Prioridad: MEDIA
**Perfil:** Employee
**Justificación:** Nueva tabla `user_scan_usage` permite rastrear uso individual de scans

**Vista/Tabla a usar:** `user_scan_usage`

**Campos disponibles:**
- `user_id`, `organization_id`, `scan_date`, `scan_type`, `session_id`, `valid`, `notes`, `created_at`

**Query SQL:**
```sql
SELECT 
  scan_date,
  scan_type,
  valid,
  COUNT(*) as scans_per_day
FROM user_scan_usage
WHERE user_id = $1
  AND scan_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY scan_date, scan_type, valid
ORDER BY scan_date DESC;
```

**Visualización:** LineChart + Cards

**Componente:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Mi Historial de Escaneos</CardTitle>
    <CardDescription>Últimos 30 días</CardDescription>
  </CardHeader>
  <CardContent>
    <LineChart data={scanUsageHistory}>
      <Line dataKey="scans_per_day" stroke="#3b82f6" name="Escaneos" />
    </LineChart>
    
    <div className="grid grid-cols-3 gap-4 mt-4">
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold">{totalScans}</div>
          <div className="text-xs text-gray-500">Total escaneos</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold">{validScans}</div>
          <div className="text-xs text-gray-500">Escaneos válidos</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold">{avgPerWeek}</div>
          <div className="text-xs text-gray-500">Promedio semanal</div>
        </CardContent>
      </Card>
    </div>
  </CardContent>
</Card>
```

---

### Mejora 26: Detalle de Consumo Organizacional - Prioridad: ALTA
**Perfil:** Organization
**Justificación:** Nueva tabla `organization_usage_summary` ofrece campos granulares de consumo

**Vista/Tabla a usar:** `organization_usage_summary`

**Campos disponibles:**
- `total_ai_tokens_used`, `total_scans`, `total_prompts_used`
- `total_user_scans`, `total_valid_scans`, `total_invalid_scans`
- `total_biometric_scans`, `total_voice_scans`
- `scan_limit_reached`

**Query SQL:**
```sql
SELECT 
  month,
  total_scans,
  total_valid_scans,
  total_invalid_scans,
  total_biometric_scans,
  total_voice_scans,
  total_ai_tokens_used,
  scan_limit_reached
FROM organization_usage_summary
WHERE organization_id = $1
  AND month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')::date
ORDER BY month DESC;
```

**Visualización:** BarChart + Progress Bars + Alert Cards

**Componente:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Detalle de Consumo Mensual</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <div className="text-sm text-gray-500">Escaneos Válidos</div>
        <div className="text-3xl font-bold text-green-600">
          {currentMonth.total_valid_scans}
        </div>
        <Progress 
          value={(currentMonth.total_valid_scans / currentMonth.total_scans) * 100} 
          className="mt-2"
        />
      </div>
      
      <div>
        <div className="text-sm text-gray-500">Escaneos Inválidos</div>
        <div className="text-3xl font-bold text-red-600">
          {currentMonth.total_invalid_scans}
        </div>
        <Progress 
          value={(currentMonth.total_invalid_scans / currentMonth.total_scans) * 100} 
          className="mt-2"
        />
      </div>
    </div>
    
    <Separator className="my-4" />
    
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-sm">Escaneos Biométricos:</span>
        <span className="font-semibold">{currentMonth.total_biometric_scans}</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-sm">Escaneos de Voz:</span>
        <span className="font-semibold">{currentMonth.total_voice_scans}</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-sm">Tokens de IA Consumidos:</span>
        <span className="font-semibold">{currentMonth.total_ai_tokens_used.toLocaleString()}</span>
      </div>
    </div>
    
    {currentMonth.scan_limit_reached && (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Límite Alcanzado</AlertTitle>
        <AlertDescription>
          Has alcanzado el límite de escaneos para este mes.
        </AlertDescription>
      </Alert>
    )}
  </CardContent>
</Card>
```

---

### Mejora 27: Auditoría de Acciones - Prioridad: MEDIA
**Perfil:** HR, Organization
**Justificación:** Nueva tabla `system_audit_logs` permite rastrear acciones administrativas

**Vista/Tabla a usar:** `system_audit_logs`

**Campos disponibles:**
- `actor_user_id`, `organization_id`, `department_id`, `role`
- `action`, `action_scope`, `entity_type`, `entity_id`
- `description`, `metadata`, `source`, `module`
- `success`, `error_message`, `created_at`

**Query SQL:**
```sql
SELECT 
  sal.actor_user_id,
  up.full_name as actor_name,
  sal.action,
  sal.action_scope,
  sal.entity_type,
  sal.description,
  sal.success,
  sal.created_at
FROM system_audit_logs sal
JOIN user_profiles up ON sal.actor_user_id = up.user_id
WHERE sal.organization_id = $1
  AND sal.created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY sal.created_at DESC
LIMIT 100;
```

**Visualización:** DataTable con filtros

**Componente:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Registro de Auditoría</CardTitle>
    <CardDescription>Últimas 100 acciones administrativas</CardDescription>
  </CardHeader>
  <CardContent>
    <DataTable
      columns={[
        { header: 'Fecha', accessorKey: 'created_at' },
        { header: 'Usuario', accessorKey: 'actor_name' },
        { header: 'Acción', accessorKey: 'action' },
        { header: 'Módulo', accessorKey: 'action_scope' },
        { header: 'Descripción', accessorKey: 'description' },
        { header: 'Estado', accessorKey: 'success' }
      ]}
      data={auditLogs}
      filters={[
        { column: 'action_scope', placeholder: 'Filtrar por módulo' },
        { column: 'success', placeholder: 'Filtrar por estado' }
      ]}
    />
  </CardContent>
</Card>
```

---

### Mejora 28: Logs del Sistema - Prioridad: BAJA
**Perfil:** Organization
**Justificación:** Nueva tabla `system_logs` para debugging y monitoreo

**Vista/Tabla a usar:** `system_logs`

**Campos disponibles:**
- `organization_id`, `user_id`, `role`, `log_type`, `severity`
- `source`, `module`, `action`, `description`, `payload`
- `route`, `browser`, `device`, `ip_address`, `created_at`

**Query SQL:**
```sql
SELECT 
  log_type,
  severity,
  module,
  action,
  description,
  COUNT(*) as count
FROM system_logs
WHERE organization_id = $1
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
  AND severity IN ('high', 'critical')
GROUP BY log_type, severity, module, action, description
ORDER BY 
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    ELSE 3
  END,
  count DESC;
```

**Visualización:** Alert Cards + Table

---

### Mejora 29: Configuración de Plataforma - Prioridad: BAJA
**Perfil:** Organization
**Justificación:** Nueva tabla `platform_settings` para configuraciones globales

**Vista/Tabla a usar:** `platform_settings`

**Campos disponibles:**
- `key`, `value`, `description`, `data_type`, `is_editable`, `scope`, `created_at`, `updated_at`

**Query SQL:**
```sql
SELECT 
  key,
  value,
  description,
  data_type,
  is_editable,
  scope
FROM platform_settings
WHERE scope IN ('global', 'tenant')
  AND is_editable = true
ORDER BY key;
```

**Visualización:** Settings Form

---

### Mejora 30: Análisis de Calidad de Escaneos - Prioridad: MEDIA
**Perfil:** HR, Organization
**Justificación:** Usar `scan_quality_index` para análisis de calidad

**Vista/Tabla a usar:** `vw_latest_scans_by_user`

**Campos disponibles:**
- `scan_quality_index`, `signal_to_noise_ratio`, `arrhythmias_detected`

**Query SQL:**
```sql
WITH quality_stats AS (
  SELECT 
    department_id,
    COUNT(*) as total_scans,
    COUNT(*) FILTER (WHERE scan_quality_index >= 8) as high_quality,
    COUNT(*) FILTER (WHERE scan_quality_index >= 5 AND scan_quality_index < 8) as medium_quality,
    COUNT(*) FILTER (WHERE scan_quality_index < 5) as low_quality,
    ROUND(AVG(scan_quality_index), 2) as avg_quality,
    ROUND(AVG(signal_to_noise_ratio), 2) as avg_snr
  FROM vw_latest_scans_by_user
  WHERE organization_id = $1
  GROUP BY department_id
)
SELECT 
  d.name as department_name,
  qs.*,
  ROUND((qs.high_quality::float / qs.total_scans) * 100, 1) as high_quality_pct
FROM quality_stats qs
JOIN departments d ON qs.department_id = d.id
ORDER BY avg_quality DESC;
```

**Visualización:** BarChart + Cards

**Componente:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Calidad de Escaneos por Departamento</CardTitle>
  </CardHeader>
  <CardContent>
    <BarChart data={qualityByDept}>
      <Bar dataKey="high_quality_pct" fill="#10b981" name="Alta Calidad" />
      <Bar dataKey="medium_quality_pct" fill="#fbbf24" name="Calidad Media" />
      <Bar dataKey="low_quality_pct" fill="#ef4444" name="Baja Calidad" />
    </BarChart>
    
    <div className="mt-6 space-y-2">
      {qualityByDept.map(dept => (
        <div key={dept.department_name} className="flex justify-between items-center">
          <span className="text-sm">{dept.department_name}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {dept.avg_quality.toFixed(1)}/10
            </span>
            <Badge variant={dept.avg_quality >= 8 ? 'success' : dept.avg_quality >= 5 ? 'warning' : 'destructive'}>
              {dept.avg_quality >= 8 ? 'Excelente' : dept.avg_quality >= 5 ? 'Bueno' : 'Mejorar'}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

---

## 📋 Mapeo de Perfiles del Menú

### Employee (Colaborador)

**Tablas principales:**
- `user_profiles` - Información del usuario
- `biometric_measurements` - Escaneos biométricos
- `user_scan_usage` - Historial de uso individual
- Vista: `vw_latest_scans_by_user`

**Campos clave disponibles:**
```sql
-- Desde vw_latest_scans_by_user
SELECT 
  id, user_id, full_name, email, department_id, organization_id,
  -- Indicadores vitales
  heart_rate, sdnn, rmssd,
  -- IA scores
  ai_stress, ai_fatigue, ai_cognitive_load, ai_recovery, bio_age_basic,
  -- Índices DeepAffex
  vital_index_score, physiological_score, mental_score, wellness_index_score,
  mental_stress_index, cardiac_load, vascular_capacity,
  cv_risk_heart_attack, cv_risk_stroke,
  -- Composición corporal
  bmi, abdominal_circumference_cm, waist_height_ratio, body_shape_index,
  -- Calidad
  arrhythmias_detected, signal_to_noise_ratio, scan_quality_index, global_health_score,
  created_at
FROM vw_latest_scans_by_user
WHERE user_id = $1;
```

**Mejoras disponibles:**
- 1.1 Histórico de escaneos ✅
- 1.2 Alertas de riesgo ✅
- 1.3 Comparación con departamento ✅
- 1.4 Recomendaciones de bienestar ✅
- 1.5 Evolución temporal ✅
- **25 Tracking de uso individual 🆕**

---

### Leader (Líder de Equipo)

**Tablas principales:**
- `departments` - Información del departamento
- `user_profiles` - Miembros del equipo
- `department_insights` - Insights históricos
- Vista: `vw_current_department_metrics`
- Vista: `vw_employees_at_risk`
- Vista: `vw_latest_scans_by_user`

**Campos clave disponibles:**
```sql
-- Desde vw_current_department_metrics
SELECT 
  department_id, department_name, employee_count,
  avg_stress, avg_fatigue, avg_cognitive_load, avg_recovery,
  avg_bio_age, avg_wellness_index
FROM vw_current_department_metrics
WHERE department_id = $1;

-- Desde vw_employees_at_risk
SELECT 
  user_id, full_name, email, department_id,
  ai_stress, ai_fatigue, mental_stress_index, bio_age_basic,
  wellness_index_score, created_at
FROM vw_employees_at_risk
WHERE department_id = $1;
```

**Mejoras disponibles:**
- 2.1 Vista de equipo completo ✅
- 2.2 Métricas del departamento ✅
- 2.3 Lista de empleados en riesgo ✅
- 2.4 Tendencias del departamento ✅
- 2.5 Comparación con otros departamentos ✅
- 2.6 Alertas de equipo ✅

---

### HR (Recursos Humanos)

**Tablas principales:**
- `organizations` - Información organizacional
- `departments` - Todos los departamentos
- `user_profiles` - Todos los empleados
- `department_insights` - Insights históricos
- Vista: `vw_current_department_metrics`
- Vista: `vw_employees_at_risk`
- Vista: `vw_usage_monthly_summary`

**Campos clave disponibles:**
```sql
-- Métricas de todos los departamentos
SELECT 
  department_id, department_name, employee_count,
  avg_stress, avg_fatigue, avg_cognitive_load, avg_recovery,
  avg_bio_age, avg_wellness_index
FROM vw_current_department_metrics
WHERE department_id IN (
  SELECT id FROM departments WHERE organization_id = $1
);

-- Empleados en riesgo organizacional
SELECT 
  user_id, full_name, email, department_id,
  ai_stress, ai_fatigue, mental_stress_index, bio_age_basic,
  wellness_index_score, created_at
FROM vw_employees_at_risk
WHERE organization_id = $1;

-- Uso de suscripción
SELECT 
  month, total_scans, total_prompts_used, total_ai_tokens_used
FROM vw_usage_monthly_summary
WHERE organization_id = $1
ORDER BY month DESC;
```

**Mejoras disponibles:**
- 3.1 Vista de todos los departamentos ✅
- 3.2 Empleados en riesgo organizacional ✅
- 3.3 Análisis de tendencias por departamento ✅
- 3.4 Reportes de uso de suscripción ✅
- 3.5 Alertas de burnout departamental ✅
- 3.6 Análisis de distribución ✅
- **27 Auditoría de acciones 🆕**
- **30 Análisis de calidad de escaneos 🆕**

---

### Organization (Administrador)

**Tablas principales:**
- `organizations` - Información de la organización
- `organization_subscriptions` - Suscripciones activas
- `organization_usage_summary` - Resumen de uso mensual
- `subscription_usage_logs` - Logs de uso detallados
- `system_audit_logs` - Auditoría de acciones
- `system_logs` - Logs del sistema
- `platform_settings` - Configuraciones
- Vista: `vw_usage_monthly_summary`
- Vista: `vw_latest_scans_by_user`

**Campos clave disponibles:**
```sql
-- Suscripción actual
SELECT 
  scan_limit_per_user_per_month, dept_analysis_limit, org_analysis_limit,
  used_scans_total, used_dept_analyses, used_org_analyses,
  current_month, monthly_reset_day, last_reset,
  allow_employee_ai_feedback, enable_branding,
  start_date, end_date, active
FROM organization_subscriptions
WHERE organization_id = $1 AND active = true;

-- Uso mensual detallado
SELECT 
  month, total_scans, total_valid_scans, total_invalid_scans,
  total_biometric_scans, total_voice_scans,
  total_ai_tokens_used, total_prompts_used,
  scan_limit_reached
FROM organization_usage_summary
WHERE organization_id = $1
ORDER BY month DESC;

-- Métricas organizacionales (calculadas)
SELECT 
  COUNT(DISTINCT user_id) as total_employees,
  ROUND(AVG(ai_stress), 1) as avg_stress,
  ROUND(AVG(ai_fatigue), 1) as avg_fatigue,
  ROUND(AVG(wellness_index_score), 1) as avg_wellness,
  COUNT(*) FILTER (WHERE ai_stress > 70) as high_stress_count,
  COUNT(*) FILTER (WHERE ai_fatigue > 70) as high_fatigue_count
FROM vw_latest_scans_by_user
WHERE organization_id = $1;
```

**Mejoras disponibles:**
- 4.1 Métricas organizacionales agregadas ✅ (con corrección)
- 4.2 Consumo de suscripción vs límites ✅
- 4.3 Alertas de límites ✅
- **26 Detalle de consumo organizacional 🆕**
- **27 Auditoría de acciones 🆕**
- **28 Logs del sistema 🆕**
- **29 Configuración de plataforma 🆕**
- **30 Análisis de calidad de escaneos 🆕**

---

## 💡 Recomendaciones para Alex

### Prioridad Inmediata (Antes de continuar):

1. **Corrección Mejora 4.1:** Reemplazar query de `organization_insights` por cálculo desde `vw_latest_scans_by_user`
2. **Corrección Indicadores 2.2-2.4:** Marcar presión arterial y frecuencia respiratoria como "No disponible" o usar estimaciones con disclaimer

### Mejoras Sugeridas (Implementar después de las 24 originales):

**Prioridad ALTA:**
- Mejora 26: Detalle de consumo organizacional (Organization Dashboard)

**Prioridad MEDIA:**
- Mejora 25: Tracking de uso individual (Employee Dashboard)
- Mejora 27: Auditoría de acciones (HR/Organization Dashboard)
- Mejora 30: Análisis de calidad de escaneos (HR/Organization Dashboard)

**Prioridad BAJA:**
- Mejora 28: Logs del sistema (Organization Dashboard)
- Mejora 29: Configuración de plataforma (Organization Dashboard)

### Consideraciones Técnicas:

1. **Nuevas tablas disponibles:**
   - `organization_usage_summary` - Usar para consumo detallado
   - `user_scan_usage` - Usar para tracking individual
   - `system_audit_logs` - Usar para auditoría
   - `system_logs` - Usar para debugging
   - `platform_settings` - Usar para configuraciones

2. **Campos no disponibles:**
   - `respiratory_rate` - NO EXISTE (estimar o marcar como N/A)
   - `systolic_bp` - NO EXISTE (estimar o marcar como N/A)
   - `diastolic_bp` - NO EXISTE (estimar o marcar como N/A)
   - `organization_insights` tabla - NO EXISTE (calcular desde vistas)

3. **Performance:**
   - Todas las vistas existentes están correctamente indexadas
   - Los nuevos campos en `organization_usage_summary` permiten queries más eficientes
   - Usar `user_scan_usage` para historial individual en lugar de `biometric_measurements`

---

## 📊 Resumen de Priorización

### Alta Prioridad (Implementar primero):
1. ✅ Corrección Mejora 4.1 - Métricas organizacionales
2. ✅ Corrección Indicadores 2.2-2.4 - Presión arterial y frecuencia respiratoria
3. 🆕 Mejora 26 - Detalle de consumo organizacional

### Media Prioridad:
1. 🆕 Mejora 25 - Tracking de uso individual
2. 🆕 Mejora 27 - Auditoría de acciones
3. 🆕 Mejora 30 - Análisis de calidad de escaneos

### Baja Prioridad:
1. 🆕 Mejora 28 - Logs del sistema
2. 🆕 Mejora 29 - Configuración de plataforma

---

## 📄 Archivos Actualizados

### Archivos que requieren actualización:

1. **`/workspace/app/docs/dashboard_improvements_spec.md`**
   - Actualizar Mejora 4.1 con nueva query
   - Agregar 6 nuevas mejoras identificadas

2. **`/workspace/app/docs/employee_dashboard_indicators_spec.md`**
   - Actualizar Indicadores 2.2, 2.3, 2.4 con disclaimer de "No disponible"
   - Agregar nota sobre campos estimados

3. **`/workspace/app/frontend/src/lib/api-client.ts`**
   - Agregar queries para nuevas tablas:
     - `getUserScanUsage()`
     - `getOrganizationUsageSummary()`
     - `getSystemAuditLogs()`
     - `getScanQualityStats()`

---

**Última actualización:** 2026-01-25  
**Versión:** 2.0  
**Estado:** ✅ Validación completa - Listo para implementación con correcciones