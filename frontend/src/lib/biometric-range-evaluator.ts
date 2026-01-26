/**
 * Biometric Range Evaluator
 * Evaluates biometric values against risk ranges from the database
 * and returns appropriate color, level, and emoji for UI display
 */

export interface RangeEvaluation {
  level: string;
  color: string;
  emoji: string;
  rangeLabel: string;
}

// Color mapping for different risk levels
const LEVEL_COLORS: Record<string, string> = {
  // Green - Good/Normal/Healthy
  'normal': '#10b981',
  'bueno': '#10b981',
  'excelente': '#10b981',
  'saludable': '#10b981',
  'bajo': '#10b981', // When "bajo" is good (e.g., low risk)
  'muy_bajo': '#10b981',
  'buena': '#10b981',
  'alta': '#10b981', // When "alta" is good (e.g., high recovery)
  
  // Yellow - Moderate/Warning
  'moderado': '#f59e0b',
  'moderada': '#f59e0b',
  'leve': '#f59e0b',
  'en_riesgo': '#f59e0b',
  'sobrepeso': '#f59e0b',
  'baja': '#f59e0b', // When "baja" is concerning (e.g., low HRV)
  
  // Red - High/Critical
  'alto': '#ef4444',
  'critico': '#ef4444',
  'muy_alto': '#ef4444',
  'obesidad': '#ef4444',
  'alta_riesgo': '#ef4444', // When "alta" is bad (e.g., high stress)
};

// Emoji mapping for different risk levels
const LEVEL_EMOJIS: Record<string, string> = {
  'normal': '✅',
  'bueno': '✅',
  'excelente': '✅',
  'saludable': '✅',
  'bajo': '✅',
  'muy_bajo': '✅',
  'buena': '✅',
  'alta': '✅',
  
  'moderado': '🟡',
  'moderada': '🟡',
  'leve': '🟡',
  'en_riesgo': '🟡',
  'sobrepeso': '🟡',
  'baja': '🟡',
  
  'alto': '🔴',
  'critico': '🔴',
  'muy_alto': '🔴',
  'obesidad': '🔴',
  'alta_riesgo': '🔴',
};

// Special cases where "alta" or "baja" means different things
const POSITIVE_HIGH_INDICATORS = [
  'ai_recovery',
  'sdnn',
  'rmssd',
  'vascular_capacity',
  'global_health_score',
  'wellness_index_score',
  'physiological_score',
  'mental_score',
  'physical_score',
  'vital_index_score'
];

const NEGATIVE_LOW_INDICATORS = [
  'heart_rate',
  'respiratory_rate',
  'mental_stress_index',
  'ai_stress',
  'ai_fatigue',
  'risk_score',
  'cv_risk_heart_attack',
  'cv_risk_stroke',
  'cardiac_load'
];

/**
 * Evaluates a biometric value against its risk ranges
 * @param value - The current biometric value
 * @param riskRanges - Risk ranges object from database (e.g., {"normal": [60, 100], "alta": [101, 140]})
 * @param indicatorCode - The indicator code to determine context (e.g., 'heart_rate', 'ai_recovery')
 * @returns RangeEvaluation object with level, color, emoji, and range label
 */
export function evaluateRange(
  value: number,
  riskRanges: Record<string, [number, number]> | null | undefined,
  indicatorCode?: string
): RangeEvaluation {
  // Default response for undefined ranges
  if (!riskRanges || Object.keys(riskRanges).length === 0) {
    return {
      level: 'N/D',
      color: '#f59e0b', // Yellow for undefined
      emoji: '🟡',
      rangeLabel: 'N/D'
    };
  }

  // Find which range the value falls into
  let matchedLevel: string | null = null;
  let matchedRange: [number, number] | null = null;

  for (const [level, range] of Object.entries(riskRanges)) {
    if (Array.isArray(range) && range.length === 2) {
      const [min, max] = range;
      if (value >= min && value <= max) {
        matchedLevel = level;
        matchedRange = range;
        break;
      }
    }
  }

  // If no match found, return undefined range
  if (!matchedLevel || !matchedRange) {
    return {
      level: 'Fuera de rango',
      color: '#f59e0b',
      emoji: '🟡',
      rangeLabel: 'N/D'
    };
  }

  // Determine color based on level and context
  let color = LEVEL_COLORS[matchedLevel.toLowerCase()] || '#f59e0b';
  let emoji = LEVEL_EMOJIS[matchedLevel.toLowerCase()] || '🟡';

  // Handle special cases where "alta" or "baja" have different meanings
  if (indicatorCode) {
    if (matchedLevel.toLowerCase() === 'alta' && POSITIVE_HIGH_INDICATORS.includes(indicatorCode)) {
      // High is good for these indicators
      color = '#10b981';
      emoji = '✅';
    } else if (matchedLevel.toLowerCase() === 'alta' && NEGATIVE_LOW_INDICATORS.includes(indicatorCode)) {
      // High is bad for these indicators
      color = '#ef4444';
      emoji = '🔴';
    } else if (matchedLevel.toLowerCase() === 'baja' && POSITIVE_HIGH_INDICATORS.includes(indicatorCode)) {
      // Low is bad for these indicators
      color = '#ef4444';
      emoji = '🔴';
    } else if (matchedLevel.toLowerCase() === 'baja' && NEGATIVE_LOW_INDICATORS.includes(indicatorCode)) {
      // Low is good for these indicators
      color = '#10b981';
      emoji = '✅';
    }
  }

  // Format level label (capitalize first letter)
  const levelLabel = matchedLevel.charAt(0).toUpperCase() + matchedLevel.slice(1).replace('_', ' ');

  // Format range label
  const rangeLabel = `${matchedRange[0]}–${matchedRange[1]}`;

  return {
    level: levelLabel,
    color,
    emoji,
    rangeLabel
  };
}

/**
 * Gets a display-friendly interpretation for a biometric indicator
 * @param level - The evaluated level (e.g., "Normal", "Alto", "Moderado")
 * @param indicatorCode - The indicator code
 * @returns Human-readable interpretation
 */
export function getInterpretation(level: string, indicatorCode?: string): string {
  const levelLower = level.toLowerCase();
  
  const interpretations: Record<string, string> = {
    'normal': 'Dentro del rango normal',
    'bueno': 'Buen estado',
    'excelente': 'Estado excelente',
    'saludable': 'Rango saludable',
    'bajo': 'Nivel bajo',
    'muy_bajo': 'Nivel muy bajo',
    'moderado': 'Nivel moderado',
    'leve': 'Nivel leve',
    'en_riesgo': 'En riesgo',
    'sobrepeso': 'Sobrepeso',
    'alto': 'Nivel alto',
    'critico': 'Nivel crítico',
    'muy_alto': 'Nivel muy alto',
    'obesidad': 'Obesidad',
    'n/d': 'Interpretar en contexto',
    'fuera de rango': 'Valor fuera de rangos definidos'
  };

  return interpretations[levelLower] || levelLower;
}