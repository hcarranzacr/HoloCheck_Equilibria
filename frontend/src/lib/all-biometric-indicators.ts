// Complete list of all biometric indicators from biometric_measurements table
export interface BiometricIndicator {
  key: string;
  indicatorCode: string;
  label: string;
  hasInfo: boolean;
  category: 'scores' | 'vitals' | 'hrv' | 'cardiovascular' | 'body_composition' | 'other';
}

export const ALL_BIOMETRIC_INDICATORS: BiometricIndicator[] = [
  // Scores principales
  { key: 'wellness_index_score', indicatorCode: 'global_health_score', label: 'Índice de Bienestar', hasInfo: true, category: 'scores' },
  { key: 'global_health_score', indicatorCode: 'global_health_score', label: 'Salud Global', hasInfo: true, category: 'scores' },
  { key: 'ai_stress', indicatorCode: 'mental_stress_index', label: 'Estrés (IA)', hasInfo: true, category: 'scores' },
  { key: 'ai_fatigue', indicatorCode: 'mental_score', label: 'Fatiga (IA)', hasInfo: true, category: 'scores' },
  { key: 'ai_recovery', indicatorCode: 'physical_score', label: 'Recuperación (IA)', hasInfo: true, category: 'scores' },
  { key: 'ai_cognitive_load', indicatorCode: 'mental_score', label: 'Carga Cognitiva (IA)', hasInfo: true, category: 'scores' },
  
  // Signos vitales
  { key: 'heart_rate', indicatorCode: 'heart_rate', label: 'Frecuencia Cardíaca', hasInfo: true, category: 'vitals' },
  { key: 'respiratory_rate', indicatorCode: 'respiratory_rate', label: 'Frecuencia Respiratoria', hasInfo: true, category: 'vitals' },
  
  // Variabilidad de frecuencia cardíaca
  { key: 'sdnn', indicatorCode: 'sdnn', label: 'SDNN (VFC)', hasInfo: true, category: 'hrv' },
  { key: 'rmssd', indicatorCode: 'sdnn', label: 'RMSSD (VFC)', hasInfo: false, category: 'hrv' },
  
  // Scores adicionales
  { key: 'vital_index_score', indicatorCode: 'vital_index_score', label: 'Índice Vital', hasInfo: true, category: 'scores' },
  { key: 'physiological_score', indicatorCode: 'physiological_score', label: 'Score Fisiológico', hasInfo: true, category: 'scores' },
  { key: 'mental_score', indicatorCode: 'mental_score', label: 'Score Mental', hasInfo: true, category: 'scores' },
  { key: 'physical_score', indicatorCode: 'physical_score', label: 'Score Físico', hasInfo: true, category: 'scores' },
  { key: 'mental_stress_index', indicatorCode: 'mental_stress_index', label: 'Índice de Estrés Mental', hasInfo: true, category: 'scores' },
  { key: 'risk_score', indicatorCode: 'risk_score', label: 'Score de Riesgo', hasInfo: true, category: 'scores' },
  
  // Cardiovascular
  { key: 'cardiac_load', indicatorCode: 'physical_score', label: 'Carga Cardíaca', hasInfo: false, category: 'cardiovascular' },
  { key: 'vascular_capacity', indicatorCode: 'physical_score', label: 'Capacidad Vascular', hasInfo: false, category: 'cardiovascular' },
  { key: 'cv_risk_heart_attack', indicatorCode: 'risk_score', label: 'Riesgo CV - Infarto', hasInfo: false, category: 'cardiovascular' },
  { key: 'cv_risk_stroke', indicatorCode: 'risk_score', label: 'Riesgo CV - ACV', hasInfo: false, category: 'cardiovascular' },
  
  // Composición corporal
  { key: 'bmi', indicatorCode: 'bmi', label: 'IMC', hasInfo: true, category: 'body_composition' },
  { key: 'abdominal_circumference_cm', indicatorCode: 'waist_height_ratio', label: 'Circunferencia Abdominal', hasInfo: false, category: 'body_composition' },
  { key: 'waist_height_ratio', indicatorCode: 'waist_height_ratio', label: 'Ratio Cintura-Altura', hasInfo: true, category: 'body_composition' },
  { key: 'body_shape_index', indicatorCode: 'body_shape_index', label: 'Índice de Forma Corporal', hasInfo: true, category: 'body_composition' },
  
  // Otros
  { key: 'bio_age_basic', indicatorCode: 'global_health_score', label: 'Edad Biológica', hasInfo: false, category: 'other' },
  { key: 'arrhythmias_detected', indicatorCode: 'heart_rate', label: 'Arritmias Detectadas', hasInfo: false, category: 'other' },
  { key: 'signal_to_noise_ratio', indicatorCode: 'global_health_score', label: 'Relación Señal/Ruido', hasInfo: false, category: 'other' },
  { key: 'scan_quality_index', indicatorCode: 'global_health_score', label: 'Calidad del Escaneo', hasInfo: false, category: 'other' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  scores: '📊 Scores Principales',
  vitals: '💓 Signos Vitales',
  hrv: '📈 Variabilidad Cardíaca',
  cardiovascular: '❤️ Cardiovascular',
  body_composition: '⚖️ Composición Corporal',
  other: '🔬 Otros Indicadores',
};