// Utility functions for biometric indicator status calculations

export interface StatusResult {
  status: string;
  color: string;
  severity?: string;
  message?: string;
  icon?: string;
}

// Helper function to get just the status string
export const getWellnessStatusString = (value: number): string => {
  if (value >= 8.0) return 'Excelente';
  if (value >= 6.0) return 'Bueno';
  if (value >= 4.0) return 'Regular';
  if (value >= 2.0) return 'Bajo';
  return 'Crítico';
};

// Helper function to get just the color
export const getWellnessColor = (value: number): string => {
  if (value >= 8.0) return '#06b6d4';
  if (value >= 6.0) return '#10b981';
  if (value >= 4.0) return '#fbbf24';
  if (value >= 2.0) return '#f59e0b';
  return '#ef4444';
};

// Section 1: General Scores

export const getWellnessStatus = (value: number): StatusResult => {
  if (value >= 8.0) return { status: 'Excelente', color: '#06b6d4', icon: '🌟' };
  if (value >= 6.0) return { status: 'Bueno', color: '#10b981', icon: '✓' };
  if (value >= 4.0) return { status: 'Regular', color: '#fbbf24', icon: '⚠️' };
  if (value >= 2.0) return { status: 'Bajo', color: '#f59e0b', icon: '⚠️' };
  return { status: 'Crítico', color: '#ef4444', icon: '❌' };
};

export const getVitalIndexStatus = (value: number): StatusResult => {
  if (value >= 8.0) return { status: 'Excelente', color: '#06b6d4' };
  if (value >= 6.0) return { status: 'Bueno', color: '#10b981' };
  if (value >= 4.0) return { status: 'Regular', color: '#fbbf24' };
  if (value >= 2.0) return { status: 'Bajo', color: '#f59e0b' };
  return { status: 'Crítico', color: '#ef4444' };
};

export const getPhysiologicalStatus = (value: number): StatusResult => {
  if (value >= 8.0) return { status: 'Excelente', color: '#06b6d4' };
  if (value >= 6.0) return { status: 'Bueno', color: '#10b981' };
  if (value >= 4.0) return { status: 'Regular', color: '#fbbf24' };
  if (value >= 2.0) return { status: 'Bajo', color: '#f59e0b' };
  return { status: 'Crítico', color: '#ef4444' };
};

export const getMentalScoreStatus = (value: number): StatusResult => {
  if (value >= 8.0) return { status: 'Excelente', color: '#06b6d4' };
  if (value >= 6.0) return { status: 'Bueno', color: '#10b981' };
  if (value >= 4.0) return { status: 'Regular', color: '#fbbf24' };
  if (value >= 2.0) return { status: 'Bajo', color: '#f59e0b' };
  return { status: 'Crítico', color: '#ef4444' };
};

export const calculatePhysicalScore = (data: any): number => {
  // Calculate physical score from BMI, waist-height ratio, and heart rate
  const bmiScore = data.bmi ? Math.max(0, 10 - Math.abs(data.bmi - 22) / 3) : 5;
  const waistScore = data.waist_height_ratio ? Math.max(0, 10 - data.waist_height_ratio / 10) : 5;
  const hrScore = data.heart_rate && data.heart_rate >= 60 && data.heart_rate <= 80 ? 10 : 5;
  
  return (bmiScore * 0.4 + waistScore * 0.3 + hrScore * 0.3);
};

export const getPhysicalScoreStatus = (value: number): StatusResult => {
  if (value >= 8.0) return { status: 'Excelente', color: '#06b6d4' };
  if (value >= 6.0) return { status: 'Bueno', color: '#10b981' };
  if (value >= 4.0) return { status: 'Regular', color: '#fbbf24' };
  if (value >= 2.0) return { status: 'Bajo', color: '#f59e0b' };
  return { status: 'Crítico', color: '#ef4444' };
};

export const calculateRiskIndex = (data: any): number => {
  const heartAttackRisk = data.cv_risk_heart_attack || 0;
  const strokeRisk = data.cv_risk_stroke || 0;
  const mentalStress = data.mental_stress_index || 0;
  
  // Normalize to 0-10 scale (inverted: lower risk = higher score)
  const riskScore = 10 - (
    (heartAttackRisk / 4.4) * 0.4 +
    (strokeRisk / 4.4) * 0.3 +
    (mentalStress / 5.9) * 0.3
  ) * 10;
  
  return Math.max(0, Math.min(10, riskScore));
};

export const getRiskIndexStatus = (value: number): StatusResult => {
  if (value >= 8.0) return { status: 'Excelente', color: '#06b6d4', message: 'Riesgo muy bajo' };
  if (value >= 6.0) return { status: 'Bueno', color: '#10b981', message: 'Riesgo bajo' };
  if (value >= 4.0) return { status: 'Regular', color: '#fbbf24', message: 'Riesgo moderado' };
  if (value >= 2.0) return { status: 'Atención', color: '#f59e0b', message: 'Riesgo elevado' };
  return { status: 'Crítico', color: '#ef4444', message: 'Riesgo alto' };
};

// Section 2: Vital Signs

export const getHeartRateStatus = (value: number): StatusResult => {
  if (value < 40) return { status: 'Muy Baja', color: '#3b82f6', severity: 'warning' };
  if (value < 60) return { status: 'Baja', color: '#06b6d4', severity: 'info' };
  if (value <= 100) return { status: 'Normal', color: '#10b981', severity: 'good' };
  if (value <= 120) return { status: 'Elevada', color: '#fbbf24', severity: 'warning' };
  if (value <= 140) return { status: 'Alta', color: '#f59e0b', severity: 'alert' };
  return { status: 'Muy Alta', color: '#ef4444', severity: 'critical' };
};

export const getRespiratoryRateStatus = (value: number): StatusResult => {
  if (value < 5) return { status: 'Muy Baja', color: '#3b82f6', severity: 'critical' };
  if (value < 12) return { status: 'Baja', color: '#06b6d4', severity: 'warning' };
  if (value <= 20) return { status: 'Normal', color: '#10b981', severity: 'good' };
  if (value <= 25) return { status: 'Elevada', color: '#fbbf24', severity: 'warning' };
  if (value <= 35) return { status: 'Alta', color: '#f59e0b', severity: 'alert' };
  return { status: 'Muy Alta', color: '#ef4444', severity: 'critical' };
};

export const getSystolicBPStatus = (value: number): StatusResult => {
  if (value < 90) return { status: 'Baja', color: '#3b82f6', severity: 'warning' };
  if (value < 120) return { status: 'Normal', color: '#10b981', severity: 'good' };
  if (value < 130) return { status: 'Elevada', color: '#fbbf24', severity: 'warning' };
  if (value < 140) return { status: 'Hipertensión Etapa 1', color: '#f59e0b', severity: 'alert' };
  if (value < 180) return { status: 'Hipertensión Etapa 2', color: '#ef4444', severity: 'critical' };
  return { status: 'Crisis Hipertensiva', color: '#dc2626', severity: 'emergency' };
};

export const getDiastolicBPStatus = (value: number): StatusResult => {
  if (value < 60) return { status: 'Baja', color: '#3b82f6', severity: 'warning' };
  if (value < 80) return { status: 'Normal', color: '#10b981', severity: 'good' };
  if (value < 85) return { status: 'Elevada', color: '#fbbf24', severity: 'warning' };
  if (value < 90) return { status: 'Hipertensión Etapa 1', color: '#f59e0b', severity: 'alert' };
  if (value < 120) return { status: 'Hipertensión Etapa 2', color: '#ef4444', severity: 'critical' };
  return { status: 'Crisis Hipertensiva', color: '#dc2626', severity: 'emergency' };
};

// Section 3: Heart Rate Variability

export const getHRVStatus = (value: number): StatusResult => {
  if (value >= 100) return { status: 'Excelente', color: '#06b6d4', message: 'Alta adaptabilidad' };
  if (value >= 50) return { status: 'Buena', color: '#10b981', message: 'Buena adaptabilidad' };
  if (value >= 30) return { status: 'Regular', color: '#fbbf24', message: 'Adaptabilidad moderada' };
  if (value >= 20) return { status: 'Baja', color: '#f59e0b', message: 'Baja adaptabilidad' };
  return { status: 'Muy Baja', color: '#ef4444', message: 'Muy baja adaptabilidad' };
};

// Section 4: Mental Stress

export const getMentalStressStatus = (value: number): StatusResult => {
  if (value < 2.0) return { 
    status: 'Muy Bajo', 
    color: '#06b6d4', 
    severity: 'excellent',
    message: 'Estrés mental mínimo',
    icon: '😌'
  };
  if (value < 3.0) return { 
    status: 'Bajo', 
    color: '#10b981', 
    severity: 'good',
    message: 'Estrés mental bajo',
    icon: '🙂'
  };
  if (value < 4.0) return { 
    status: 'Medio', 
    color: '#fbbf24', 
    severity: 'moderate',
    message: 'Estrés mental moderado',
    icon: '😐'
  };
  if (value < 5.0) return { 
    status: 'Alto', 
    color: '#f59e0b', 
    severity: 'high',
    message: 'Estrés mental elevado',
    icon: '😟'
  };
  return { 
    status: 'Muy Alto', 
    color: '#ef4444', 
    severity: 'critical',
    message: 'Estrés mental muy elevado',
    icon: '😰'
  };
};

export const getStressRecommendation = (value: number): string => {
  if (value < 2.0) return 'Mantén tus hábitos actuales de manejo del estrés.';
  if (value < 3.0) return 'Considera practicar técnicas de relajación regularmente.';
  if (value < 4.0) return 'Tu nivel de estrés es moderado. Toma pausas regulares y practica técnicas de relajación.';
  if (value < 5.0) return 'Tu nivel de estrés es elevado. Considera reducir tu carga de trabajo y buscar apoyo.';
  return 'Tu nivel de estrés es muy alto. Es importante que consultes con un profesional de la salud mental.';
};

// Section 5: Cardiovascular System

export const getCardiacLoadStatus = (value: number): StatusResult => {
  if (value >= 3.8 && value <= 4.2) return { 
    status: 'Óptimo', 
    color: '#06b6d4',
    message: 'Carga cardíaca en rango óptimo'
  };
  if (value >= 3.7 && value <= 4.3) return { 
    status: 'Bueno', 
    color: '#10b981',
    message: 'Carga cardíaca adecuada'
  };
  if (value >= 3.6 && value <= 4.4) return { 
    status: 'Regular', 
    color: '#fbbf24',
    message: 'Carga cardíaca en límite'
  };
  if (value < 3.6) return { 
    status: 'Baja', 
    color: '#3b82f6',
    message: 'Carga cardíaca baja'
  };
  return { 
    status: 'Alta', 
    color: '#ef4444',
    message: 'Carga cardíaca elevada'
  };
};

export const getVascularCapacityStatus = (value: number): StatusResult => {
  if (value >= 2.5) return { 
    status: 'Excelente', 
    color: '#06b6d4',
    message: 'Capacidad vascular excelente'
  };
  if (value >= 2.0) return { 
    status: 'Buena', 
    color: '#10b981',
    message: 'Capacidad vascular buena'
  };
  if (value >= 1.5) return { 
    status: 'Regular', 
    color: '#fbbf24',
    message: 'Capacidad vascular moderada'
  };
  if (value >= 1.0) return { 
    status: 'Baja', 
    color: '#f59e0b',
    message: 'Capacidad vascular baja'
  };
  return { 
    status: 'Muy Baja', 
    color: '#ef4444',
    message: 'Capacidad vascular muy baja'
  };
};

export const calculateCVRisk = (heartAttackRisk: number, strokeRisk: number): number => {
  return (heartAttackRisk * 0.6 + strokeRisk * 0.4);
};

export const getCVRiskStatus = (value: number): StatusResult => {
  if (value < 1.0) return { 
    status: 'Muy Bajo', 
    color: '#06b6d4',
    severity: 'excellent',
    icon: '✓'
  };
  if (value < 2.0) return { 
    status: 'Bajo', 
    color: '#10b981',
    severity: 'good',
    icon: '✓'
  };
  if (value < 3.0) return { 
    status: 'Moderado', 
    color: '#fbbf24',
    severity: 'moderate',
    icon: '⚠️'
  };
  if (value < 4.0) return { 
    status: 'Alto', 
    color: '#f59e0b',
    severity: 'high',
    icon: '⚠️'
  };
  return { 
    status: 'Muy Alto', 
    color: '#ef4444',
    severity: 'critical',
    icon: '❌'
  };
};

export const getHeartAttackRiskStatus = (value: number): StatusResult => {
  if (value < 1.0) return { status: 'Muy Bajo', color: '#06b6d4', icon: '✓' };
  if (value < 2.0) return { status: 'Bajo', color: '#10b981', icon: '✓' };
  if (value < 3.0) return { status: 'Moderado', color: '#fbbf24', icon: '⚠️' };
  if (value < 4.0) return { status: 'Alto', color: '#f59e0b', icon: '⚠️' };
  return { status: 'Muy Alto', color: '#ef4444', icon: '❌' };
};

export const getStrokeRiskStatus = (value: number): StatusResult => {
  if (value < 1.0) return { status: 'Muy Bajo', color: '#06b6d4', icon: '✓' };
  if (value < 2.0) return { status: 'Bajo', color: '#10b981', icon: '✓' };
  if (value < 3.0) return { status: 'Moderado', color: '#fbbf24', icon: '⚠️' };
  if (value < 4.0) return { status: 'Alto', color: '#f59e0b', icon: '⚠️' };
  return { status: 'Muy Alto', color: '#ef4444', icon: '❌' };
};

// Section 6: Body Composition

export const getBMIStatus = (value: number): StatusResult => {
  if (value < 18.5) return { 
    status: 'Bajo Peso', 
    color: '#3b82f6',
    message: 'Por debajo del peso saludable'
  };
  if (value < 25) return { 
    status: 'Normal', 
    color: '#10b981',
    message: 'Peso saludable'
  };
  if (value < 30) return { 
    status: 'Sobrepeso', 
    color: '#fbbf24',
    message: 'Peso por encima del rango saludable'
  };
  if (value < 35) return { 
    status: 'Obesidad Grado I', 
    color: '#f59e0b',
    message: 'Obesidad leve'
  };
  if (value < 40) return { 
    status: 'Obesidad Grado II', 
    color: '#ef4444',
    message: 'Obesidad moderada'
  };
  return { 
    status: 'Obesidad Grado III', 
    color: '#dc2626',
    message: 'Obesidad severa'
  };
};

export const getAbdominalCircumferenceStatus = (value: number, gender: 'male' | 'female' = 'male'): StatusResult => {
  const thresholds = gender === 'male' 
    ? { normal: 94, high: 102 }
    : { normal: 80, high: 88 };
  
  if (value < thresholds.normal) return { 
    status: 'Normal', 
    color: '#10b981',
    message: 'Sin riesgo metabólico'
  };
  if (value < thresholds.high) return { 
    status: 'Elevada', 
    color: '#fbbf24',
    message: 'Riesgo metabólico incrementado'
  };
  return { 
    status: 'Alta', 
    color: '#ef4444',
    message: 'Riesgo metabólico alto'
  };
};

export const getWaistHeightRatioStatus = (value: number): StatusResult => {
  if (value < 40) return { 
    status: 'Muy Bajo', 
    color: '#3b82f6',
    message: 'Extremadamente delgado'
  };
  if (value < 50) return { 
    status: 'Normal', 
    color: '#10b981',
    message: 'Proporción saludable'
  };
  if (value < 60) return { 
    status: 'Elevada', 
    color: '#fbbf24',
    message: 'Riesgo de salud incrementado'
  };
  if (value < 70) return { 
    status: 'Alta', 
    color: '#f59e0b',
    message: 'Riesgo de salud alto'
  };
  return { 
    status: 'Muy Alta', 
    color: '#ef4444',
    message: 'Riesgo de salud muy alto'
  };
};

export const getBodyShapeIndexStatus = (value: number): StatusResult => {
  if (value < 5) return { 
    status: 'Bajo', 
    color: '#3b82f6',
    message: 'Forma corporal delgada'
  };
  if (value < 8) return { 
    status: 'Normal', 
    color: '#10b981',
    message: 'Forma corporal saludable'
  };
  if (value < 11) return { 
    status: 'Moderado', 
    color: '#fbbf24',
    message: 'Forma corporal con riesgo moderado'
  };
  if (value < 15) return { 
    status: 'Alto', 
    color: '#f59e0b',
    message: 'Forma corporal con riesgo alto'
  };
  return { 
    status: 'Muy Alto', 
    color: '#ef4444',
    message: 'Forma corporal con riesgo muy alto'
  };
};

// Section 7: Measurement Quality

export const getSNRStatus = (value: number): StatusResult => {
  if (value >= 2.0) return { 
    status: 'OK', 
    color: '#10b981',
    severity: 'good',
    icon: '✓',
    message: 'Señal de buena calidad'
  };
  if (value >= 1.0) return { 
    status: 'Aceptable', 
    color: '#fbbf24',
    severity: 'moderate',
    icon: '⚠️',
    message: 'Señal aceptable'
  };
  if (value >= 0) return { 
    status: 'Baja', 
    color: '#f59e0b',
    severity: 'warning',
    icon: '⚠️',
    message: 'Señal de baja calidad'
  };
  return { 
    status: 'Muy Baja', 
    color: '#ef4444',
    severity: 'critical',
    icon: '❌',
    message: 'Señal de muy baja calidad - Repetir escaneo'
  };
};

export const getArrhythmiasStatus = (value: number): StatusResult => {
  if (value === 0) return { 
    status: 'Normal', 
    color: '#10b981',
    severity: 'good',
    icon: '✓',
    message: 'No se detectaron arritmias'
  };
  if (value <= 2) return { 
    status: 'Leve', 
    color: '#fbbf24',
    severity: 'moderate',
    icon: '⚠️',
    message: 'Arritmias leves detectadas'
  };
  if (value <= 4) return { 
    status: 'Moderado', 
    color: '#f59e0b',
    severity: 'warning',
    icon: '⚠️',
    message: 'Arritmias moderadas - Consulta médica recomendada'
  };
  return { 
    status: 'Alto', 
    color: '#ef4444',
    severity: 'critical',
    icon: '❌',
    message: 'Múltiples arritmias - Consulta médica urgente'
  };
};