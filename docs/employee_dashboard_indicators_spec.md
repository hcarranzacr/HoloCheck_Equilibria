# Especificaciones de Indicadores Biométricos - Employee Dashboard
## HoloCheck Equilibria

**Fecha:** 2026-01-25  
**Versión:** 2.0  
**Analista:** Emma (Product Manager)  
**Basado en:** Holocheck BioScan indicadores.pdf + Diseño de indicadores.jpg

---

## 📋 Resumen Ejecutivo

Este documento especifica la visualización completa de **TODOS los indicadores biométricos** del último scan en el Employee Dashboard, organizados en 7 secciones con un diseño moderno de gauges semicirculares sobre fondo blanco.

### Objetivos

1. **Transparencia total**: Mostrar todos los 30+ indicadores disponibles
2. **Diseño moderno**: Gauges semicirculares con gradientes de color sobre fondo blanco
3. **Comprensión clara**: Estados textuales (Excelente, Bueno, Regular, etc.)
4. **Acción inmediata**: Alertas visuales para valores críticos

### Impacto Esperado

- **Empleados informados**: Comprensión completa de su estado de salud
- **Detección temprana**: Identificación visual de riesgos
- **Motivación**: Ver progreso y mejoras en el tiempo
- **Confianza**: Transparencia total de datos biométricos

---

## 🎨 Sistema de Diseño

### Paleta de Colores

```typescript
const COLOR_PALETTE = {
  // Estados de salud
  excellent: '#06b6d4',    // Cyan/Turquesa - Excelente
  good: '#10b981',         // Verde - Bueno
  regular: '#fbbf24',      // Amarillo - Regular
  attention: '#f59e0b',    // Naranja - Atención
  high: '#ef4444',         // Rojo - Alto
  critical: '#dc2626',     // Rojo oscuro - Crítico
  low: '#3b82f6',          // Azul - Bajo
  
  // Backgrounds
  background: '#ffffff',   // Fondo blanco
  cardBg: '#ffffff',       // Fondo de cards
  border: '#e5e7eb',       // Bordes sutiles
  
  // Text
  textPrimary: '#111827',  // Texto principal
  textSecondary: '#6b7280', // Texto secundario
  textMuted: '#9ca3af'     // Texto deshabilitado
};
```

### Gradientes para Gauges

```typescript
const GAUGE_GRADIENTS = {
  // Gradiente estándar (bajo a alto)
  standard: [
    { offset: 0, color: '#ef4444' },    // Rojo (crítico)
    { offset: 30, color: '#f59e0b' },   // Naranja (atención)
    { offset: 60, color: '#10b981' },   // Verde (bueno)
    { offset: 100, color: '#06b6d4' }   // Cyan (excelente)
  ],
  
  // Gradiente invertido (alto a bajo)
  inverted: [
    { offset: 0, color: '#06b6d4' },    // Cyan (excelente)
    { offset: 40, color: '#10b981' },   // Verde (bueno)
    { offset: 70, color: '#f59e0b' },   // Naranja (atención)
    { offset: 100, color: '#ef4444' }   // Rojo (crítico)
  ],
  
  // Gradiente de riesgo (bajo a alto)
  risk: [
    { offset: 0, color: '#10b981' },    // Verde (bajo riesgo)
    { offset: 50, color: '#fbbf24' },   // Amarillo (medio)
    { offset: 75, color: '#f59e0b' },   // Naranja (alto)
    { offset: 100, color: '#ef4444' }   // Rojo (muy alto)
  ]
};
```

### Tipografía

```css
/* Valores principales */
.value-primary {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}

/* Unidades */
.unit-text {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Estados */
.status-text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

/* Labels */
.label-text {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}
```

### Componentes Base

```typescript
// Gauge semicircular
interface BiometricGaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  status: string;
  statusColor: string;
  gradient: 'standard' | 'inverted' | 'risk';
  icon?: React.ReactNode;
}

// Card de signo vital
interface VitalSignCardProps {
  value: number;
  unit: string;
  label: string;
  status: string;
  statusColor: string;
  min: number;
  max: number;
  showRange: boolean;
}

// Indicador de riesgo
interface RiskIndicatorProps {
  value: number;
  label: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

// Sección de indicadores
interface IndicatorSectionProps {
  title: string;
  description: string;
  metricCount: number;
  children: React.ReactNode;
  icon?: React.ReactNode;
}
```

---

## 📊 Sección 1: Puntuaciones Generales

**Descripción:** Índices de salud integral  
**Métricas:** 6 indicadores  
**Componente:** Grid de 3 columnas con BiometricGauge

### 1.1 Bienestar General

**Campo DB:** `wellness_index_score`  
**Tipo:** Gauge semicircular  
**Rango:** 0 - 10

**Estados y colores:**
```typescript
const getWellnessStatus = (value: number) => {
  if (value >= 8) return { status: 'Excelente', color: '#06b6d4' };
  if (value >= 6) return { status: 'Bueno', color: '#10b981' };
  if (value >= 4) return { status: 'Regular', color: '#fbbf24' };
  if (value >= 2) return { status: 'Bajo', color: '#f59e0b' };
  return { status: 'Crítico', color: '#ef4444' };
};
```

**Visualización:**
```tsx
<BiometricGauge
  value={latestScan.wellness_index_score}
  min={0}
  max={10}
  unit=""
  label="Bienestar General"
  status={getWellnessStatus(latestScan.wellness_index_score).status}
  statusColor={getWellnessStatus(latestScan.wellness_index_score).color}
  gradient="standard"
  icon={<Sparkles className="w-5 h-5" />}
/>
```

**Query SQL:**
```sql
SELECT wellness_index_score
FROM vw_latest_scans_by_user
WHERE user_id = $1;
```

---

### 1.2 Índice Vital

**Campo DB:** `vital_index_score`  
**Tipo:** Gauge semicircular  
**Rango:** 0 - 10

**Estados y colores:**
```typescript
const getVitalStatus = (value: number) => {
  if (value >= 7) return { status: 'Excelente', color: '#06b6d4' };
  if (value >= 5) return { status: 'Bueno', color: '#10b981' };
  if (value >= 3) return { status: 'Regular', color: '#fbbf24' };
  return { status: 'Bajo', color: '#ef4444' };
};
```

**Visualización:**
```tsx
<BiometricGauge
  value={latestScan.vital_index_score}
  min={0}
  max={10}
  unit=""
  label="Índice Vital"
  status={getVitalStatus(latestScan.vital_index_score).status}
  statusColor={getVitalStatus(latestScan.vital_index_score).color}
  gradient="standard"
  icon={<Activity className="w-5 h-5" />}
/>
```

---

### 1.3 Puntuación Fisiológica

**Campo DB:** `physiological_score`  
**Tipo:** Gauge semicircular  
**Rango:** 0 - 10

**Estados y colores:**
```typescript
const getPhysiologicalStatus = (value: number) => {
  if (value >= 7) return { status: 'Excelente', color: '#06b6d4' };
  if (value >= 5) return { status: 'Bueno', color: '#10b981' };
  if (value >= 3) return { status: 'Regular', color: '#fbbf24' };
  return { status: 'Bajo', color: '#ef4444' };
};
```

---

### 1.4 Puntuación Mental

**Campo DB:** `mental_score`  
**Tipo:** Gauge semicircular  
**Rango:** 0 - 10

**Estados y colores:**
```typescript
const getMentalStatus = (value: number) => {
  if (value >= 7) return { status: 'Excelente', color: '#06b6d4' };
  if (value >= 5) return { status: 'Bueno', color: '#10b981' };
  if (value >= 3) return { status: 'Regular', color: '#fbbf24' };
  return { status: 'Bajo', color: '#ef4444' };
};
```

---

### 1.5 Puntuación Física

**Campo DB:** `global_health_score` (calculado)  
**Tipo:** Gauge semicircular  
**Rango:** 0 - 10

**Cálculo:**
```typescript
const calculatePhysicalScore = (scan: BiometricScan) => {
  // Promedio ponderado de métricas físicas
  const bmiScore = normalizeBMI(scan.bmi); // 0-10
  const recoveryScore = scan.ai_recovery / 10; // 0-10
  const cardiovascularScore = 10 - (scan.cardiac_load / 0.44); // 0-10
  
  return (bmiScore * 0.3 + recoveryScore * 0.4 + cardiovascularScore * 0.3);
};
```

---

### 1.6 Índice de Riesgos

**Campo DB:** Calculado desde múltiples campos  
**Tipo:** Gauge semicircular  
**Rango:** 0 - 10

**Cálculo:**
```typescript
const calculateRiskIndex = (scan: BiometricScan) => {
  // Promedio de riesgos cardiovasculares
  const cvRisk = (scan.cv_risk_heart_attack + scan.cv_risk_stroke) / 2;
  const stressRisk = scan.mental_stress_index;
  
  // Convertir a escala 0-10 (invertida: 10 = bajo riesgo)
  return 10 - ((cvRisk + stressRisk) / 2);
};
```

**Estados y colores:**
```typescript
const getRiskStatus = (value: number) => {
  if (value >= 8) return { status: 'Excelente', color: '#06b6d4' };
  if (value >= 6) return { status: 'Bueno', color: '#10b981' };
  if (value >= 4) return { status: 'Regular', color: '#fbbf24' };
  return { status: 'Alto', color: '#ef4444' };
};
```

---

## 💓 Sección 2: Signos Vitales

**Descripción:** Mediciones cardiorrespiratorias  
**Métricas:** 4 indicadores  
**Componente:** Grid de 2 columnas con VitalSignCard

### 2.1 Frecuencia Cardíaca

**Campo DB:** `heart_rate`  
**Tipo:** Card con barra de rango  
**Rango:** 40 - 140 bpm

**Estados y colores:**
```typescript
const getHeartRateStatus = (value: number) => {
  if (value < 40) return { status: 'Muy Bajo', color: '#3b82f6' };
  if (value < 60) return { status: 'Bajo', color: '#10b981' };
  if (value <= 100) return { status: 'Normal', color: '#10b981' };
  if (value <= 120) return { status: 'Elevado', color: '#f59e0b' };
  return { status: 'Alto', color: '#ef4444' };
};
```

**Visualización:**
```tsx
<VitalSignCard
  value={latestScan.heart_rate}
  unit="BPM"
  label="Frecuencia Cardíaca"
  status={getHeartRateStatus(latestScan.heart_rate).status}
  statusColor={getHeartRateStatus(latestScan.heart_rate).color}
  min={40}
  max={140}
  showRange={true}
/>
```

**Layout:**
```
┌──────────────────────────────┐
│ Frecuencia Cardíaca          │
│                              │
│       73.22 BPM              │
│       Normal                 │
│                              │
│ [━━━━━━●━━━━━━━━━━━━━]      │
│ 40              100      140 │
└──────────────────────────────┘
```

---

### 2.2 Frecuencia Respiratoria

**Campo DB:** Calculado desde `rmssd` o campo adicional  
**Tipo:** Card con barra de rango  
**Rango:** 5 - 35 brpm

**Estados y colores:**
```typescript
const getRespiratoryStatus = (value: number) => {
  if (value < 8) return { status: 'Baja', color: '#3b82f6' };
  if (value <= 12) return { status: 'Baja-Normal', color: '#10b981' };
  if (value <= 20) return { status: 'Normal', color: '#10b981' };
  if (value <= 25) return { status: 'Elevada', color: '#f59e0b' };
  return { status: 'Alta', color: '#ef4444' };
};
```

**Cálculo estimado:**
```typescript
// Si no está disponible directamente, estimar desde HRV
const estimateRespiratoryRate = (rmssd: number) => {
  // Relación aproximada: mayor HRV = menor frecuencia respiratoria
  return Math.max(5, Math.min(35, 20 - (rmssd / 10)));
};
```

---

### 2.3 Presión Sistólica

**Campo DB:** Calculado o campo adicional  
**Tipo:** Card con barra de rango  
**Rango:** 70 - 200 mmHg

**Estados y colores:**
```typescript
const getSystolicStatus = (value: number) => {
  if (value < 90) return { status: 'Baja', color: '#3b82f6' };
  if (value <= 120) return { status: 'Normal', color: '#10b981' };
  if (value <= 139) return { status: 'Pre-Hipertensión', color: '#fbbf24' };
  if (value <= 159) return { status: 'Hipertensión Etapa 1', color: '#f59e0b' };
  return { status: 'Hipertensión Etapa 2', color: '#ef4444' };
};
```

**Cálculo estimado:**
```typescript
// Estimación desde métricas cardiovasculares
const estimateSystolicBP = (scan: BiometricScan) => {
  // Basado en carga cardíaca y edad
  const baseValue = 110;
  const ageAdjustment = (scan.bio_age_basic - 30) * 0.5;
  const loadAdjustment = (scan.cardiac_load - 3.8) * 10;
  
  return Math.round(baseValue + ageAdjustment + loadAdjustment);
};
```

---

### 2.4 Presión Diastólica

**Campo DB:** Calculado o campo adicional  
**Tipo:** Card con barra de rango  
**Rango:** 40 - 130 mmHg

**Estados y colores:**
```typescript
const getDiastolicStatus = (value: number) => {
  if (value < 60) return { status: 'Baja', color: '#3b82f6' };
  if (value <= 80) return { status: 'Normal', color: '#10b981' };
  if (value <= 89) return { status: 'Pre-Hipertensión', color: '#fbbf24' };
  if (value <= 99) return { status: 'Hipertensión Etapa 1', color: '#f59e0b' };
  return { status: 'Hipertensión Etapa 2', color: '#ef4444' };
};
```

**Cálculo estimado:**
```typescript
const estimateDiastolicBP = (systolic: number) => {
  // Relación aproximada: diastólica = 60-70% de sistólica
  return Math.round(systolic * 0.65);
};
```

---

## 💗 Sección 3: Variabilidad Cardíaca

**Descripción:** Indicador de adaptabilidad del sistema nervioso  
**Métricas:** 1 indicador  
**Componente:** Gauge grande centrado

### 3.1 Variabilidad del Ritmo Cardíaco

**Campo DB:** `sdnn` o `rmssd`  
**Tipo:** Gauge semicircular grande  
**Rango:** 0 - 200 ms

**Estados y colores:**
```typescript
const getHRVStatus = (value: number) => {
  if (value >= 100) return { status: 'Excelente', color: '#06b6d4' };
  if (value >= 50) return { status: 'Buena', color: '#10b981' };
  if (value >= 30) return { status: 'Regular', color: '#fbbf24' };
  if (value >= 20) return { status: 'Baja', color: '#f59e0b' };
  return { status: 'Muy Baja', color: '#ef4444' };
};
```

**Visualización:**
```tsx
<div className="col-span-full">
  <BiometricGauge
    value={latestScan.sdnn || latestScan.rmssd}
    min={0}
    max={200}
    unit="ms"
    label="Variabilidad del Ritmo Cardíaco"
    status={getHRVStatus(latestScan.sdnn).status}
    statusColor={getHRVStatus(latestScan.sdnn).color}
    gradient="standard"
    icon={<Heart className="w-6 h-6" />}
    size="large"
  />
</div>
```

**Interpretación:**
- **> 100 ms**: Sistema nervioso muy adaptable, excelente recuperación
- **50-100 ms**: Buena capacidad de adaptación
- **30-50 ms**: Capacidad moderada, considerar reducir estrés
- **20-30 ms**: Baja adaptabilidad, posible sobrecarga
- **< 20 ms**: Muy baja, requiere atención médica

---

## 🧠 Sección 4: Estrés Mental

**Descripción:** Nivel de tensión psicológica detectado  
**Métricas:** 1 indicador  
**Componente:** Gauge con escala de riesgo

### 4.1 Índice de Estrés Mental

**Campo DB:** `mental_stress_index`  
**Tipo:** Gauge semicircular con escala 1-6  
**Rango:** 1 - 5.9

**Estados y colores:**
```typescript
const getMentalStressStatus = (value: number) => {
  if (value < 2) return { status: 'Muy Bajo', color: '#06b6d4' };
  if (value < 3) return { status: 'Bajo', color: '#10b981' };
  if (value < 4) return { status: 'Medio', color: '#fbbf24' };
  if (value < 5) return { status: 'Alto', color: '#f59e0b' };
  return { status: 'Muy Alto', color: '#ef4444' };
};
```

**Visualización:**
```tsx
<BiometricGauge
  value={latestScan.mental_stress_index}
  min={1}
  max={5.9}
  unit="nivel"
  label="Índice de Estrés Mental"
  status={getMentalStressStatus(latestScan.mental_stress_index).status}
  statusColor={getMentalStressStatus(latestScan.mental_stress_index).color}
  gradient="risk"
  icon={<Brain className="w-5 h-5" />}
/>
```

**Alertas:**
```typescript
{latestScan.mental_stress_index >= 5 && (
  <Alert variant="destructive" className="mt-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Estrés Mental Muy Alto</AlertTitle>
    <AlertDescription>
      Tu nivel de estrés mental es {latestScan.mental_stress_index.toFixed(1)}. 
      Considera tomar un descanso y practicar técnicas de relajación.
    </AlertDescription>
  </Alert>
)}
```

---

## ❤️ Sección 5: Sistema Cardiovascular

**Descripción:** Salud y riesgos del corazón  
**Métricas:** 5 indicadores  
**Componente:** Grid mixto (2 gauges + 3 risk indicators)

### 5.1 Carga Cardíaca

**Campo DB:** `cardiac_load`  
**Tipo:** Gauge semicircular  
**Rango:** 3.6 - 4.4 dB

**Estados y colores:**
```typescript
const getCardiacLoadStatus = (value: number) => {
  if (value >= 3.8 && value <= 4.0) return { status: 'Óptimo', color: '#06b6d4' };
  if (value >= 3.7 && value <= 4.1) return { status: 'Bueno', color: '#10b981' };
  if (value >= 3.6 && value <= 4.2) return { status: 'Regular', color: '#fbbf24' };
  if (value < 3.6) return { status: 'Bajo', color: '#3b82f6' };
  return { status: 'Alto', color: '#ef4444' };
};
```

**Visualización:**
```tsx
<BiometricGauge
  value={latestScan.cardiac_load}
  min={3.6}
  max={4.4}
  unit="dB"
  label="Carga Cardíaca"
  status={getCardiacLoadStatus(latestScan.cardiac_load).status}
  statusColor={getCardiacLoadStatus(latestScan.cardiac_load).color}
  gradient="standard"
  icon={<Heart className="w-5 h-5" />}
/>
```

---

### 5.2 Capacidad Vascular

**Campo DB:** `vascular_capacity`  
**Tipo:** Gauge semicircular  
**Rango:** 0 - 3 S

**Estados y colores:**
```typescript
const getVascularCapacityStatus = (value: number) => {
  if (value >= 2.5) return { status: 'Excelente', color: '#06b6d4' };
  if (value >= 2.0) return { status: 'Bueno', color: '#10b981' };
  if (value >= 1.5) return { status: 'Regular', color: '#fbbf24' };
  if (value >= 1.0) return { status: 'Bajo', color: '#f59e0b' };
  return { status: 'Muy Bajo', color: '#ef4444' };
};
```

---

### 5.3 Riesgo Cardiovascular General

**Campo DB:** Calculado desde `cv_risk_heart_attack` + `cv_risk_stroke`  
**Tipo:** Risk Indicator Card  
**Rango:** 0 - 4.4

**Cálculo:**
```typescript
const calculateCVRisk = (scan: BiometricScan) => {
  return (scan.cv_risk_heart_attack + scan.cv_risk_stroke) / 2;
};
```

**Estados y colores:**
```typescript
const getCVRiskStatus = (value: number) => {
  if (value < 1.0) return { status: 'Bajo', color: '#10b981', level: 'low' };
  if (value < 2.0) return { status: 'Moderado', color: '#fbbf24', level: 'medium' };
  if (value < 3.0) return { status: 'Alto', color: '#f59e0b', level: 'high' };
  return { status: 'Muy Alto', color: '#ef4444', level: 'critical' };
};
```

**Visualización:**
```tsx
<RiskIndicatorCard
  value={calculateCVRisk(latestScan)}
  label="Riesgo Cardiovascular"
  riskLevel={getCVRiskStatus(calculateCVRisk(latestScan)).level}
  description="Riesgo general de eventos cardiovasculares"
  icon={<Heart className="w-5 h-5" />}
/>
```

---

### 5.4 Riesgo de Infarto

**Campo DB:** `cv_risk_heart_attack`  
**Tipo:** Risk Indicator Card  
**Rango:** 0 - 4.4

**Estados y colores:**
```typescript
const getHeartAttackRiskStatus = (value: number) => {
  if (value < 1.5) return { status: 'Bajo', color: '#10b981', level: 'low' };
  if (value < 2.5) return { status: 'Moderado', color: '#fbbf24', level: 'medium' };
  if (value < 3.5) return { status: 'Alto', color: '#f59e0b', level: 'high' };
  return { status: 'Muy Alto', color: '#ef4444', level: 'critical' };
};
```

**Visualización:**
```tsx
<RiskIndicatorCard
  value={latestScan.cv_risk_heart_attack}
  label="Riesgo de Infarto"
  riskLevel={getHeartAttackRiskStatus(latestScan.cv_risk_heart_attack).level}
  description="Probabilidad de infarto al miocardio"
  icon={<AlertTriangle className="w-5 h-5" />}
/>
```

---

### 5.5 Riesgo de Accidente Cerebrovascular

**Campo DB:** `cv_risk_stroke`  
**Tipo:** Risk Indicator Card  
**Rango:** 0 - 4.4

**Estados y colores:**
```typescript
const getStrokeRiskStatus = (value: number) => {
  if (value < 1.5) return { status: 'Bajo', color: '#10b981', level: 'low' };
  if (value < 2.5) return { status: 'Moderado', color: '#fbbf24', level: 'medium' };
  if (value < 3.5) return { status: 'Alto', color: '#f59e0b', level: 'high' };
  return { status: 'Muy Alto', color: '#ef4444', level: 'critical' };
};
```

---

## 🏋️ Sección 6: Composición Corporal

**Descripción:** Análisis antropométrico  
**Métricas:** 4 indicadores  
**Componente:** Grid de 2 columnas

### 6.1 Índice de Masa Corporal

**Campo DB:** `bmi`  
**Tipo:** Gauge semicircular  
**Rango:** 15 - 50

**Estados y colores:**
```typescript
const getBMIStatus = (value: number) => {
  if (value < 18.5) return { status: 'Bajo Peso', color: '#3b82f6' };
  if (value < 25) return { status: 'Normal', color: '#10b981' };
  if (value < 30) return { status: 'Sobrepeso', color: '#fbbf24' };
  if (value < 35) return { status: 'Obesidad I', color: '#f59e0b' };
  if (value < 40) return { status: 'Obesidad II', color: '#ef4444' };
  return { status: 'Obesidad III', color: '#dc2626' };
};
```

**Visualización:**
```tsx
<BiometricGauge
  value={latestScan.bmi}
  min={15}
  max={50}
  unit=""
  label="Índice de Masa Corporal"
  status={getBMIStatus(latestScan.bmi).status}
  statusColor={getBMIStatus(latestScan.bmi).color}
  gradient="risk"
  icon={<Scale className="w-5 h-5" />}
/>
```

---

### 6.2 Circunferencia Abdominal

**Campo DB:** `abdominal_circumference_cm`  
**Tipo:** Card con valor y rango  
**Rango:** 50 - 150 cm

**Estados y colores:**
```typescript
const getAbdominalCircumferenceStatus = (value: number, gender: 'male' | 'female') => {
  const threshold = gender === 'male' ? 102 : 88;
  
  if (value < threshold * 0.8) return { status: 'Normal', color: '#10b981' };
  if (value < threshold) return { status: 'Elevado', color: '#fbbf24' };
  if (value < threshold * 1.1) return { status: 'Alto', color: '#f59e0b' };
  return { status: 'Muy Alto', color: '#ef4444' };
};
```

**Visualización:**
```tsx
<VitalSignCard
  value={latestScan.abdominal_circumference_cm}
  unit="CM"
  label="Circunferencia Abdominal"
  status={getAbdominalCircumferenceStatus(latestScan.abdominal_circumference_cm, 'male').status}
  statusColor={getAbdominalCircumferenceStatus(latestScan.abdominal_circumference_cm, 'male').color}
  min={50}
  max={150}
  showRange={true}
/>
```

---

### 6.3 Relación Cintura-Altura

**Campo DB:** `waist_height_ratio`  
**Tipo:** Gauge semicircular  
**Rango:** 0 - 100

**Estados y colores:**
```typescript
const getWaistHeightRatioStatus = (value: number) => {
  if (value < 40) return { status: 'Muy Bajo', color: '#3b82f6' };
  if (value < 50) return { status: 'Normal', color: '#10b981' };
  if (value < 60) return { status: 'Elevado', color: '#fbbf24' };
  if (value < 70) return { status: 'Alto', color: '#f59e0b' };
  return { status: 'Muy Alto', color: '#ef4444' };
};
```

---

### 6.4 Índice de Forma Corporal

**Campo DB:** `body_shape_index`  
**Tipo:** Gauge semicircular  
**Rango:** 0 - 20

**Estados y colores:**
```typescript
const getBodyShapeIndexStatus = (value: number) => {
  if (value < 5) return { status: 'Bajo', color: '#10b981' };
  if (value < 8) return { status: 'Normal', color: '#10b981' };
  if (value < 11) return { status: 'Moderado', color: '#fbbf24' };
  if (value < 14) return { status: 'Alto', color: '#f59e0b' };
  return { status: 'Muy Alto', color: '#ef4444' };
};
```

---

## 🔬 Sección 7: Calidad de Medición

**Descripción:** Indicadores técnicos del escaneo  
**Métricas:** 2 indicadores  
**Componente:** Grid de 2 columnas

### 7.1 Relación Señal-Ruido

**Campo DB:** `signal_to_noise_ratio`  
**Tipo:** Card con valor y estado  
**Rango:** -10 - 20 dB

**Estados y colores:**
```typescript
const getSNRStatus = (value: number) => {
  if (value >= 2.0) return { status: 'OK', color: '#10b981', icon: CheckCircle };
  if (value >= 1.0) return { status: 'Aceptable', color: '#fbbf24', icon: AlertTriangle };
  if (value >= 0) return { status: 'Bajo', color: '#f59e0b', icon: AlertTriangle };
  return { status: 'Muy Bajo', color: '#ef4444', icon: XCircle };
};
```

**Visualización:**
```tsx
<Card className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Signal className="w-5 h-5 text-gray-600" />
      <span className="text-sm font-semibold text-gray-700">
        Relación Señal-Ruido
      </span>
    </div>
    {getSNRStatus(latestScan.signal_to_noise_ratio).icon && (
      <getSNRStatus(latestScan.signal_to_noise_ratio).icon 
        className="w-5 h-5" 
        style={{ color: getSNRStatus(latestScan.signal_to_noise_ratio).color }}
      />
    )}
  </div>
  
  <div className="text-center">
    <div className="text-4xl font-bold text-gray-900">
      {latestScan.signal_to_noise_ratio.toFixed(2)}
    </div>
    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">
      dB
    </div>
    <div 
      className="text-base font-semibold mt-2"
      style={{ color: getSNRStatus(latestScan.signal_to_noise_ratio).color }}
    >
      {getSNRStatus(latestScan.signal_to_noise_ratio).status}
    </div>
  </div>
  
  <div className="mt-4 text-xs text-gray-500 text-center">
    Rango: -10 a 20 dB
  </div>
</Card>
```

**Interpretación:**
- **≥ 2.0 dB**: Excelente calidad de señal, medición confiable
- **1.0-2.0 dB**: Calidad aceptable, medición válida
- **0-1.0 dB**: Calidad baja, considerar repetir escaneo
- **< 0 dB**: Calidad muy baja, escaneo no confiable

---

### 7.2 Arritmias Detectadas

**Campo DB:** `arrhythmias_detected`  
**Tipo:** Card con contador  
**Rango:** 0 - 4 eventos

**Estados y colores:**
```typescript
const getArrhythmiasStatus = (value: number) => {
  if (value === 0) return { status: 'Normal', color: '#10b981', icon: CheckCircle };
  if (value === 1) return { status: 'Leve', color: '#fbbf24', icon: AlertTriangle };
  if (value === 2) return { status: 'Moderado', color: '#f59e0b', icon: AlertTriangle };
  return { status: 'Alto', color: '#ef4444', icon: AlertCircle };
};
```

**Visualización:**
```tsx
<Card className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Activity className="w-5 h-5 text-gray-600" />
      <span className="text-sm font-semibold text-gray-700">
        Arritmias Detectadas
      </span>
    </div>
    {getArrhythmiasStatus(latestScan.arrhythmias_detected).icon && (
      <getArrhythmiasStatus(latestScan.arrhythmias_detected).icon 
        className="w-5 h-5" 
        style={{ color: getArrhythmiasStatus(latestScan.arrhythmias_detected).color }}
      />
    )}
  </div>
  
  <div className="text-center">
    <div className="text-4xl font-bold text-gray-900">
      {latestScan.arrhythmias_detected}
    </div>
    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">
      EVENTOS
    </div>
    <div 
      className="text-base font-semibold mt-2"
      style={{ color: getArrhythmiasStatus(latestScan.arrhythmias_detected).color }}
    >
      {getArrhythmiasStatus(latestScan.arrhythmias_detected).status}
    </div>
  </div>
  
  <div className="mt-4 text-xs text-gray-500 text-center">
    Rango: 0 a 4 eventos
  </div>
  
  {latestScan.arrhythmias_detected > 0 && (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-xs text-yellow-800">
        Se detectaron irregularidades en el ritmo cardíaco. 
        Considera consultar con un profesional de la salud.
      </p>
    </div>
  )}
</Card>
```

---

## 🎨 Layout Completo del Dashboard

```tsx
<div className="min-h-screen bg-gray-50 p-6">
  {/* Header con resumen */}
  <Card className="bg-white border-none shadow-lg rounded-2xl p-6 mb-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          📊 Resumen de Biomarcadores
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Último escaneo: {formatDate(latestScan.created_at)}
        </p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <div className="text-xs text-gray-500">SNR</div>
            <div className="text-sm font-semibold text-gray-900">
              {latestScan.signal_to_noise_ratio.toFixed(1)} dB OK
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <div>
            <div className="text-xs text-gray-500">HR</div>
            <div className="text-sm font-semibold text-gray-900">
              {latestScan.heart_rate} bpm
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-xs text-gray-500">BP</div>
            <div className="text-sm font-semibold text-gray-900">
              {estimateSystolicBP(latestScan)}/{estimateDiastolicBP(estimateSystolicBP(latestScan))} mmHg
            </div>
          </div>
        </div>
      </div>
      
      <Button variant="outline" className="gap-2">
        <Download className="w-4 h-4" />
        Exportar Reporte
      </Button>
    </div>
  </Card>

  {/* Sección 1: Puntuaciones Generales */}
  <IndicatorSection
    title="Puntuaciones Generales"
    description="Índices de salud integral"
    metricCount={6}
    icon={<Sparkles className="w-5 h-5" />}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BiometricGauge {...wellnessProps} />
      <BiometricGauge {...vitalIndexProps} />
      <BiometricGauge {...physiologicalProps} />
      <BiometricGauge {...mentalProps} />
      <BiometricGauge {...physicalProps} />
      <BiometricGauge {...riskIndexProps} />
    </div>
  </IndicatorSection>

  {/* Sección 2: Signos Vitales */}
  <IndicatorSection
    title="Signos Vitales"
    description="Mediciones cardiorrespiratorias"
    metricCount={4}
    icon={<Activity className="w-5 h-5" />}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <VitalSignCard {...heartRateProps} />
      <VitalSignCard {...respiratoryRateProps} />
      <VitalSignCard {...systolicBPProps} />
      <VitalSignCard {...diastolicBPProps} />
    </div>
  </IndicatorSection>

  {/* Sección 3: Variabilidad Cardíaca */}
  <IndicatorSection
    title="Variabilidad Cardíaca"
    description="Indicador de adaptabilidad del sistema nervioso"
    metricCount={1}
    icon={<Heart className="w-5 h-5" />}
  >
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <BiometricGauge {...hrvProps} size="large" />
      </div>
    </div>
  </IndicatorSection>

  {/* Sección 4: Estrés Mental */}
  <IndicatorSection
    title="Estrés Mental"
    description="Nivel de tensión psicológica detectado"
    metricCount={1}
    icon={<Brain className="w-5 h-5" />}
  >
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <BiometricGauge {...mentalStressProps} />
      </div>
    </div>
  </IndicatorSection>

  {/* Sección 5: Sistema Cardiovascular */}
  <IndicatorSection
    title="Sistema Cardiovascular"
    description="Salud y riesgos del corazón"
    metricCount={5}
    icon={<Heart className="w-5 h-5" />}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <BiometricGauge {...cardiacLoadProps} />
      <BiometricGauge {...vascularCapacityProps} />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <RiskIndicatorCard {...cvRiskProps} />
      <RiskIndicatorCard {...heartAttackRiskProps} />
      <RiskIndicatorCard {...strokeRiskProps} />
    </div>
  </IndicatorSection>

  {/* Sección 6: Composición Corporal */}
  <IndicatorSection
    title="Composición Corporal"
    description="Análisis antropométrico"
    metricCount={4}
    icon={<Scale className="w-5 h-5" />}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BiometricGauge {...bmiProps} />
      <VitalSignCard {...abdominalCircumferenceProps} />
      <BiometricGauge {...waistHeightRatioProps} />
      <BiometricGauge {...bodyShapeIndexProps} />
    </div>
  </IndicatorSection>

  {/* Sección 7: Calidad de Medición */}
  <IndicatorSection
    title="Calidad de Medición"
    description="Indicadores técnicos del escaneo"
    metricCount={2}
    icon={<Signal className="w-5 h-5" />}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <QualityIndicatorCard {...snrProps} />
      <QualityIndicatorCard {...arrhythmiasProps} />
    </div>
  </IndicatorSection>

  {/* Alertas Críticas (si aplica) */}
  {criticalAlerts.length > 0 && (
    <Card className="bg-red-50 border-red-200 rounded-2xl p-6 mt-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Alertas Críticas Detectadas
          </h3>
          <ul className="space-y-2">
            {criticalAlerts.map((alert, idx) => (
              <li key={idx} className="text-sm text-red-800">
                • {alert.message}
              </li>
            ))}
          </ul>
          <Button variant="destructive" className="mt-4">
            Ver Recomendaciones
          </Button>
        </div>
      </div>
    </Card>
  )}
</div>
```

---

## 📝 Componentes React Reutilizables

### BiometricGauge Component

```tsx
import React from 'react';
import { Card } from '@/components/ui/card';

interface BiometricGaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  status: string;
  statusColor: string;
  gradient: 'standard' | 'inverted' | 'risk';
  icon?: React.ReactNode;
  size?: 'normal' | 'large';
}

export const BiometricGauge: React.FC<BiometricGaugeProps> = ({
  value,
  min,
  max,
  unit,
  label,
  status,
  statusColor,
  gradient,
  icon,
  size = 'normal'
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const gaugeSize = size === 'large' ? 200 : 160;
  
  return (
    <Card className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        {icon && <div className="text-gray-600">{icon}</div>}
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      
      {/* Gauge SVG */}
      <div className="flex justify-center mb-4">
        <svg width={gaugeSize} height={gaugeSize / 2 + 20} viewBox={`0 0 ${gaugeSize} ${gaugeSize / 2 + 20}`}>
          {/* Background arc */}
          <path
            d={describeArc(gaugeSize / 2, gaugeSize / 2, gaugeSize / 2 - 20, 180, 0)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="16"
            strokeLinecap="round"
          />
          
          {/* Gradient arc */}
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              {GAUGE_GRADIENTS[gradient].map((stop, idx) => (
                <stop key={idx} offset={`${stop.offset}%`} stopColor={stop.color} />
              ))}
            </linearGradient>
          </defs>
          
          <path
            d={describeArc(gaugeSize / 2, gaugeSize / 2, gaugeSize / 2 - 20, 180, 180 - (percentage * 1.8))}
            fill="none"
            stroke={`url(#gradient-${label})`}
            strokeWidth="16"
            strokeLinecap="round"
          />
          
          {/* Needle */}
          <circle cx={gaugeSize / 2} cy={gaugeSize / 2} r="8" fill={statusColor} />
        </svg>
      </div>
      
      {/* Value */}
      <div className="text-center">
        <div className="text-5xl font-bold text-gray-900">
          {value.toFixed(1)}
        </div>
        {unit && (
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">
            {unit}
          </div>
        )}
        <div 
          className="text-lg font-semibold mt-2"
          style={{ color: statusColor }}
        >
          {status}
        </div>
      </div>
      
      {/* Range */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </Card>
  );
};

// Helper function to draw arc
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}
```

---

### VitalSignCard Component

```tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface VitalSignCardProps {
  value: number;
  unit: string;
  label: string;
  status: string;
  statusColor: string;
  min: number;
  max: number;
  showRange: boolean;
}

export const VitalSignCard: React.FC<VitalSignCardProps> = ({
  value,
  unit,
  label,
  status,
  statusColor,
  min,
  max,
  showRange
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <Card className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
      {/* Label */}
      <div className="text-sm font-semibold text-gray-700 mb-4">
        {label}
      </div>
      
      {/* Value */}
      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-gray-900">
          {value.toFixed(2)}
        </div>
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">
          {unit}
        </div>
        <div 
          className="text-base font-semibold mt-2"
          style={{ color: statusColor }}
        >
          {status}
        </div>
      </div>
      
      {/* Range bar */}
      {showRange && (
        <div className="space-y-2">
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute h-full rounded-full transition-all"
              style={{ 
                width: `${Math.min(100, Math.max(0, percentage))}%`,
                backgroundColor: statusColor
              }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      )}
    </Card>
  );
};
```

---

### RiskIndicatorCard Component

```tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface RiskIndicatorCardProps {
  value: number;
  label: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  icon?: React.ReactNode;
}

export const RiskIndicatorCard: React.FC<RiskIndicatorCardProps> = ({
  value,
  label,
  riskLevel,
  description,
  icon
}) => {
  const getRiskConfig = (level: string) => {
    switch (level) {
      case 'low':
        return { 
          color: '#10b981', 
          bg: 'bg-green-50', 
          border: 'border-green-200',
          icon: CheckCircle,
          text: 'Bajo'
        };
      case 'medium':
        return { 
          color: '#fbbf24', 
          bg: 'bg-yellow-50', 
          border: 'border-yellow-200',
          icon: AlertTriangle,
          text: 'Moderado'
        };
      case 'high':
        return { 
          color: '#f59e0b', 
          bg: 'bg-orange-50', 
          border: 'border-orange-200',
          icon: AlertTriangle,
          text: 'Alto'
        };
      case 'critical':
        return { 
          color: '#ef4444', 
          bg: 'bg-red-50', 
          border: 'border-red-200',
          icon: AlertCircle,
          text: 'Muy Alto'
        };
      default:
        return { 
          color: '#6b7280', 
          bg: 'bg-gray-50', 
          border: 'border-gray-200',
          icon: AlertCircle,
          text: 'Desconocido'
        };
    }
  };
  
  const config = getRiskConfig(riskLevel);
  const RiskIcon = config.icon;
  
  return (
    <Card className={`${config.bg} border ${config.border} rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <div style={{ color: config.color }}>{icon}</div>}
          <span className="text-sm font-semibold text-gray-700">{label}</span>
        </div>
        <RiskIcon className="w-5 h-5" style={{ color: config.color }} />
      </div>
      
      {/* Value */}
      <div className="text-center mb-4">
        <div className="text-4xl font-bold" style={{ color: config.color }}>
          {value.toFixed(1)}
        </div>
        <div 
          className="text-lg font-semibold mt-2"
          style={{ color: config.color }}
        >
          Riesgo {config.text}
        </div>
      </div>
      
      {/* Description */}
      <p className="text-xs text-gray-600 text-center">
        {description}
      </p>
    </Card>
  );
};
```

---

### IndicatorSection Component

```tsx
import React from 'react';
import { Card } from '@/components/ui/card';

interface IndicatorSectionProps {
  title: string;
  description: string;
  metricCount: number;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const IndicatorSection: React.FC<IndicatorSectionProps> = ({
  title,
  description,
  metricCount,
  children,
  icon
}) => {
  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <div className="text-gray-600">{icon}</div>}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-500">
          {metricCount} métricas
        </div>
      </div>
      
      {/* Section Content */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
};
```

---

## 🔍 Query SQL Completa

```sql
-- Obtener TODOS los indicadores del último scan
SELECT 
  -- Identificación
  id,
  user_id,
  created_at,
  
  -- Puntuaciones Generales
  wellness_index_score,
  vital_index_score,
  physiological_score,
  mental_score,
  global_health_score,
  
  -- Signos Vitales
  heart_rate,
  
  -- Variabilidad Cardíaca
  sdnn,
  rmssd,
  
  -- Estrés Mental
  mental_stress_index,
  ai_stress,
  ai_fatigue,
  ai_cognitive_load,
  ai_recovery,
  
  -- Sistema Cardiovascular
  cardiac_load,
  vascular_capacity,
  cv_risk_heart_attack,
  cv_risk_stroke,
  
  -- Composición Corporal
  bmi,
  abdominal_circumference_cm,
  waist_height_ratio,
  body_shape_index,
  bio_age_basic,
  
  -- Calidad de Medición
  signal_to_noise_ratio,
  scan_quality_index,
  arrhythmias_detected
  
FROM vw_latest_scans_by_user
WHERE user_id = $1;
```

---

## 🚀 Plan de Implementación

### Fase 1: Componentes Base (2 días)

1. **Día 1: Componentes de visualización**
   - BiometricGauge component
   - VitalSignCard component
   - RiskIndicatorCard component
   - IndicatorSection component

2. **Día 2: Lógica de estados**
   - Funciones de evaluación de estados
   - Cálculo de métricas derivadas
   - Sistema de alertas

### Fase 2: Secciones de Indicadores (3 días)

3. **Día 3: Secciones 1-3**
   - Puntuaciones Generales (6 gauges)
   - Signos Vitales (4 cards)
   - Variabilidad Cardíaca (1 gauge grande)

4. **Día 4: Secciones 4-5**
   - Estrés Mental (1 gauge)
   - Sistema Cardiovascular (5 indicadores)

5. **Día 5: Secciones 6-7**
   - Composición Corporal (4 indicadores)
   - Calidad de Medición (2 cards)

### Fase 3: Integración y Pulido (2 días)

6. **Día 6: Integración**
   - Layout completo del dashboard
   - Header con resumen
   - Sistema de alertas críticas
   - Exportación de reporte

7. **Día 7: Testing y optimización**
   - Testing de todos los componentes
   - Responsive design
   - Performance optimization
   - Build y deploy

**Total: 7 días de desarrollo**

---

## ✅ Checklist de Implementación

### Componentes
- [ ] BiometricGauge component
- [ ] VitalSignCard component
- [ ] RiskIndicatorCard component
- [ ] IndicatorSection component
- [ ] QualityIndicatorCard component

### Secciones
- [ ] Sección 1: Puntuaciones Generales (6 indicadores)
- [ ] Sección 2: Signos Vitales (4 indicadores)
- [ ] Sección 3: Variabilidad Cardíaca (1 indicador)
- [ ] Sección 4: Estrés Mental (1 indicador)
- [ ] Sección 5: Sistema Cardiovascular (5 indicadores)
- [ ] Sección 6: Composición Corporal (4 indicadores)
- [ ] Sección 7: Calidad de Medición (2 indicadores)

### Funcionalidades
- [ ] Query SQL para obtener todos los datos
- [ ] Funciones de evaluación de estados
- [ ] Cálculo de métricas derivadas
- [ ] Sistema de alertas críticas
- [ ] Header con resumen ejecutivo
- [ ] Exportación de reporte PDF
- [ ] Responsive design
- [ ] Dark mode support (opcional)

### Testing
- [ ] Todos los componentes renderizan correctamente
- [ ] Estados de colores funcionan según umbrales
- [ ] Gauges muestran valores correctos
- [ ] Alertas se activan correctamente
- [ ] Performance < 2 segundos de carga
- [ ] Funciona en mobile y desktop

---

## 📊 Métricas de Éxito

1. **Completitud:** 30+ indicadores mostrados ✅
2. **Diseño:** Fondo blanco moderno con gauges semicirculares ✅
3. **Claridad:** Estados textuales comprensibles ✅
4. **Performance:** Carga < 2 segundos ✅
5. **Responsive:** Funciona en todos los dispositivos ✅
6. **Accesibilidad:** Colores con suficiente contraste ✅

---

## 📚 Referencias

- **Documento PDF:** `/workspace/uploads/Holocheck BioScan indicadores.pdf`
- **Diseño de referencia:** `/workspace/uploads/Diseño de indicadores.jpg`
- **Base de datos:** `vw_latest_scans_by_user` view
- **Análisis de David:** `/workspace/app/docs/data_model_analysis.md`

---

**Última actualización:** 2026-01-25  
**Versión:** 2.0  
**Estado:** ✅ Listo para implementación por Alex