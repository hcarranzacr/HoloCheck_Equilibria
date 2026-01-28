// Complete list of all biometric indicators from biometric_measurements table
// Based on actual database schema and HoloCheck BioScan reference images

export interface BiometricIndicator {
  key: string;
  indicatorCode: string;
  label: string;
  hasInfo: boolean;
  category: 'puntuaciones' | 'signos_vitales' | 'variabilidad' | 'cardiovascular' | 'composicion_corporal' | 'estres_ia';
}

// ONLY indicators that exist in the database schema
export const ALL_BIOMETRIC_INDICATORS: BiometricIndicator[] = [
  // Puntuaciones Principales (Scores)
  { key: 'wellness_index_score', indicatorCode: 'global_health_score', label: 'Índice de Bienestar', hasInfo: true, category: 'puntuaciones' },
  { key: 'global_health_score', indicatorCode: 'global_health_score', label: 'Salud Global', hasInfo: true, category: 'puntuaciones' },
  { key: 'vital_index_score', indicatorCode: 'vital_index_score', label: 'Índice Vital', hasInfo: true, category: 'puntuaciones' },
  { key: 'physiological_score', indicatorCode: 'physiological_score', label: 'Score Fisiológico', hasInfo: true, category: 'puntuaciones' },
  { key: 'mental_score', indicatorCode: 'mental_score', label: 'Score Mental', hasInfo: true, category: 'puntuaciones' },
  { key: 'mental_stress_index', indicatorCode: 'mental_stress_index', label: 'Índice de Estrés Mental', hasInfo: true, category: 'puntuaciones' },
  
  // Signos Vitales
  { key: 'heart_rate', indicatorCode: 'heart_rate', label: 'Frecuencia Cardíaca', hasInfo: true, category: 'signos_vitales' },
  
  // Variabilidad (HRV)
  { key: 'sdnn', indicatorCode: 'sdnn', label: 'Variabilidad del Ritmo Cardíaco', hasInfo: true, category: 'variabilidad' },
  { key: 'rmssd', indicatorCode: 'sdnn', label: 'RMSSD', hasInfo: false, category: 'variabilidad' },
  
  // Cardiovascular y Riesgos
  { key: 'cardiac_load', indicatorCode: 'physical_score', label: 'Carga Cardíaca', hasInfo: false, category: 'cardiovascular' },
  { key: 'vascular_capacity', indicatorCode: 'physical_score', label: 'Capacidad Vascular', hasInfo: false, category: 'cardiovascular' },
  { key: 'cv_risk_heart_attack', indicatorCode: 'risk_score', label: 'Riesgo de Infarto', hasInfo: false, category: 'cardiovascular' },
  { key: 'cv_risk_stroke', indicatorCode: 'risk_score', label: 'Riesgo de Accidente Cerebrovascular', hasInfo: false, category: 'cardiovascular' },
  
  // Composición Corporal
  { key: 'bmi', indicatorCode: 'bmi', label: 'Índice de Masa Corporal', hasInfo: true, category: 'composicion_corporal' },
  { key: 'abdominal_circumference_cm', indicatorCode: 'waist_height_ratio', label: 'Circunferencia Abdominal', hasInfo: false, category: 'composicion_corporal' },
  { key: 'waist_height_ratio', indicatorCode: 'waist_height_ratio', label: 'Relación Cintura-Altura', hasInfo: true, category: 'composicion_corporal' },
  { key: 'body_shape_index', indicatorCode: 'body_shape_index', label: 'Índice de Forma Corporal', hasInfo: true, category: 'composicion_corporal' },
  
  // Estrés e IA
  { key: 'ai_stress', indicatorCode: 'mental_stress_index', label: 'Estrés (IA)', hasInfo: true, category: 'estres_ia' },
  { key: 'ai_fatigue', indicatorCode: 'mental_score', label: 'Fatiga (IA)', hasInfo: true, category: 'estres_ia' },
  { key: 'ai_recovery', indicatorCode: 'physical_score', label: 'Recuperación (IA)', hasInfo: true, category: 'estres_ia' },
  { key: 'ai_cognitive_load', indicatorCode: 'mental_score', label: 'Carga Cognitiva (IA)', hasInfo: true, category: 'estres_ia' },
  
  // Otros indicadores
  { key: 'bio_age_basic', indicatorCode: 'global_health_score', label: 'Edad Biológica', hasInfo: false, category: 'puntuaciones' },
  { key: 'arrhythmias_detected', indicatorCode: 'heart_rate', label: 'Arritmias Detectadas', hasInfo: false, category: 'signos_vitales' },
  { key: 'signal_to_noise_ratio', indicatorCode: 'global_health_score', label: 'Relación Señal/Ruido', hasInfo: false, category: 'puntuaciones' },
  { key: 'scan_quality_index', indicatorCode: 'global_health_score', label: 'Calidad del Escaneo', hasInfo: false, category: 'puntuaciones' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  puntuaciones: '📊 Puntuaciones',
  signos_vitales: '💓 Signos Vitales',
  variabilidad: '📈 Variabilidad (HRV)',
  cardiovascular: '❤️ Cardiovascular y Riesgos',
  composicion_corporal: '⚖️ Composición Corporal',
  estres_ia: '🧠 Estrés e IA',
};

// Category order for display
export const CATEGORY_ORDER = [
  'puntuaciones',
  'signos_vitales',
  'variabilidad',
  'cardiovascular',
  'composicion_corporal',
  'estres_ia',
];