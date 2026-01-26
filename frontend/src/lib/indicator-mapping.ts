/**
 * Mapping between database field names and indicator codes in param_biometric_indicators_info
 */
export const INDICATOR_CODE_MAPPING: Record<string, string> = {
  // Clinical indicators
  heart_rate: 'heart_rate',
  respiratory_rate: 'respiratory_rate',
  blood_pressure: 'blood_pressure',
  
  // Body composition
  bmi: 'bmi',
  body_shape_index: 'body_shape_index',
  waist_height_ratio: 'waist_height_ratio',
  
  // Wellness scores
  wellness_index_score: 'global_health_score',
  global_health_score: 'global_health_score',
  
  // Stress and mental
  mental_stress_index: 'mental_stress_index',
  mental_score: 'mental_score',
  
  // Physical and physiological
  physical_score: 'physical_score',
  physiological_score: 'physiological_score',
  
  // HRV and risk
  sdnn: 'sdnn',
  risk_score: 'risk_score',
  vital_index_score: 'vital_index_score',
};

/**
 * Get indicator code from field name
 */
export function getIndicatorCode(fieldName: string): string {
  return INDICATOR_CODE_MAPPING[fieldName] || fieldName;
}

/**
 * Risk level color mapping
 */
export const RISK_LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  muy_bajo: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' },
  bajo: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  leve: { bg: '#fef9c3', text: '#a16207', border: '#fde047' },
  normal: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  saludable: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  moderado: { bg: '#fed7aa', text: '#c2410c', border: '#fdba74' },
  moderada: { bg: '#fed7aa', text: '#c2410c', border: '#fdba74' },
  bueno: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  buena: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  alto: { bg: '#fecaca', text: '#b91c1c', border: '#fca5a5' },
  alta: { bg: '#fecaca', text: '#b91c1c', border: '#fca5a5' },
  muy_alto: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  excelente: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  critico: { bg: '#fecaca', text: '#991b1b', border: '#f87171' },
  riesgo: { bg: '#fecaca', text: '#b91c1c', border: '#fca5a5' },
  baja: { bg: '#fef9c3', text: '#a16207', border: '#fde047' },
  obesidad: { bg: '#fecaca', text: '#b91c1c', border: '#fca5a5' },
  sobrepeso: { bg: '#fed7aa', text: '#c2410c', border: '#fdba74' },
};

/**
 * Get risk level from value and ranges
 */
export function getRiskLevel(value: number, riskRanges: Record<string, [number, number]>): string {
  for (const [level, [min, max]] of Object.entries(riskRanges)) {
    if (value >= min && value <= max) {
      return level;
    }
  }
  return 'normal';
}