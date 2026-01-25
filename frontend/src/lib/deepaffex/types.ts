// DeepAffex SDK Types

export interface DfxConfig {
  apiUrl: string;
  licenseKey: string;
  studyId: string;
  wsUrl: string;
}

export interface DfxMeasurement {
  id: string;
  status: 'created' | 'processing' | 'completed' | 'failed';
  data?: DfxResults;
  error?: string;
}

export interface DfxResults {
  // Vital Signs
  HR_BPM?: number;
  IHB_COUNT?: number;
  BR_BPM?: number;
  BP_SYSTOLIC?: number;
  BP_DIASTOLIC?: number;
  
  // Physiological
  HRV_SDNN?: number;
  BP_RPP?: number;
  BP_TAU?: number;
  
  // Mental/Emotional
  MSI?: number;
  MENTAL_SCORE?: number;
  
  // Physical
  BMI_CALC?: number;
  ABSI?: number;
  WAIST_CIRCUM?: number;
  WAIST_TO_HEIGHT?: number;
  HEIGHT?: number;
  WEIGHT?: number;
  FACIAL_SKIN_AGE?: number;
  
  // Risks
  BP_CVD?: number;
  BP_HEART_ATTACK?: number;
  BP_STROKE?: number;
  HPT_RISK_PROB?: number;
  DBT_RISK_PROB?: number;
  HDLTC_RISK_PROB?: number;
  TG_RISK_PROB?: number;
  FLD_RISK_PROB?: number;
  OVERALL_METABOLIC_RISK_PROB?: number;
  
  // Blood Biomarkers
  HBA1C_RISK_PROB?: number;
  MFBG_RISK_PROB?: number;
  
  // Composite Scores
  HEALTH_SCORE?: number;
  VITAL_SCORE?: number;
  PHYSIO_SCORE?: number;
  PHYSICAL_SCORE?: number;
  RISKS_SCORE?: number;
}

export interface DfxVideoConstraints {
  width: { ideal: number };
  height: { ideal: number };
  frameRate: { ideal: number };
  facingMode: string;
}

export interface DfxQualityMetrics {
  illumination: number;
  faceDetected: boolean;
  facePosition: 'centered' | 'off-center' | 'not-detected';
  movement: number;
  fps: number;
}

export type DfxStatus = 
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'capturing'
  | 'processing'
  | 'completed'
  | 'error';

export interface DfxError {
  code: string;
  message: string;
  details?: any;
}