/**
 * DeepAffex SDK Wrapper
 * Provides a clean interface for biometric measurements using NuraLogix DeepAffex SDK
 */

type WmeaModule = {
  default: any;
  faceAttributeValue: any;
};

declare global {
  var __WMEA_SDK__: Promise<WmeaModule> | undefined;
}

const SDK_URL = "https://unpkg.com/@nuralogix.ai/web-measurement-embedded-app/lib/index.mjs";
const CDN_DIST = "https://unpkg.com/@nuralogix.ai/web-measurement-embedded-app/dist";

export interface DeepAffexConfig {
  apiUrl: string;
  licenseKey: string;
  studyId: string;
  wsUrl?: string;
}

export interface MeasurementProfile {
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  smoker?: boolean;
  diabetic?: boolean;
  bloodPressureMedication?: boolean;
}

export interface MeasurementResults {
  measurementId: string;
  measurementResultId?: string;
  statusId: string;
  points: Record<string, any>;
  resultsOrder?: string[];
  finalChunkNumber?: number;
  errors?: {
    code: string;
    message: string;
  };
}

export interface MeasurementCallbacks {
  onResults?: (results: MeasurementResults) => void;
  onError?: (error: any) => void;
  onEvent?: (event: string) => void;
  onProgress?: (progress: number) => void;
}

/**
 * Load DeepAffex SDK (singleton pattern)
 */
export function loadWmeaSdk(): Promise<WmeaModule> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("WMEA SDK can only be loaded in the browser"));
  }

  if (!globalThis.__WMEA_SDK__) {
    globalThis.__WMEA_SDK__ = import(
      /* webpackIgnore: true */
      SDK_URL
    ) as Promise<WmeaModule>;
  }

  return globalThis.__WMEA_SDK__!;
}

/**
 * Get DeepAffex configuration from environment
 */
export function getDeepAffexConfig(): DeepAffexConfig {
  const apiUrl = import.meta.env.VITE_DEEPAFFEX_API_URL;
  const licenseKey = import.meta.env.VITE_DEEPAFFEX_LICENSE_KEY;
  const studyId = import.meta.env.VITE_DEEPAFFEX_STUDY_ID;
  const wsUrl = import.meta.env.VITE_DEEPAFFEX_WS_URL;

  if (!apiUrl || !licenseKey || !studyId) {
    throw new Error('Missing DeepAffex configuration. Please check your .env file.');
  }

  return {
    apiUrl,
    licenseKey,
    studyId,
    wsUrl,
  };
}

/**
 * Register license and get tokens
 */
export async function registerLicense(config: DeepAffexConfig): Promise<{
  token: string;
  refreshToken: string;
}> {
  const response = await fetch(`https://${config.apiUrl}/api/v2/organizations/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      licenseKey: config.licenseKey,
      deviceTypeId: 'WEB',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to register license: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    token: data.Token,
    refreshToken: data.RefreshToken,
  };
}

/**
 * Create measurement session
 */
export async function createMeasurement(
  config: DeepAffexConfig,
  token: string
): Promise<string> {
  const response = await fetch(`https://${config.apiUrl}/api/v2/measurements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      studyId: config.studyId,
      resolution: 1280,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create measurement: ${response.statusText}`);
  }

  const data = await response.json();
  return data.ID;
}

/**
 * DeepAffex SDK Manager Class
 */
export class DeepAffexManager {
  private app: any = null;
  private config: DeepAffexConfig;
  private callbacks: MeasurementCallbacks = {};

  constructor(config?: DeepAffexConfig) {
    this.config = config || getDeepAffexConfig();
  }

  /**
   * Initialize SDK
   */
  async initialize(
    container: HTMLElement,
    profile: MeasurementProfile,
    callbacks: MeasurementCallbacks
  ): Promise<void> {
    this.callbacks = callbacks;

    // Load SDK
    const { default: MeasurementEmbeddedApp } = await loadWmeaSdk();

    // Get tokens
    const { token, refreshToken } = await registerLicense(this.config);

    // Create app instance
    this.app = new MeasurementEmbeddedApp();

    // Setup callbacks
    this.app.on.results = (results: any) => {
      if (this.callbacks.onResults) {
        this.callbacks.onResults(results);
      }
    };

    this.app.on.error = (error: any) => {
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    };

    this.app.on.event = (event: string) => {
      if (this.callbacks.onEvent) {
        this.callbacks.onEvent(event);
      }
    };

    // Initialize app
    await this.app.init({
      container,
      appPath: CDN_DIST,
      settings: {
        token,
        refreshToken,
        studyId: this.config.studyId,
      },
      profile,
      config: {
        cameraFacingMode: 'user',
        cameraAutoStart: true,
        measurementAutoStart: false,
        checkConstraints: true,
        cancelWhenLowSNR: false,
      },
    });
  }

  /**
   * Start measurement
   */
  async start(): Promise<void> {
    if (!this.app) {
      throw new Error('SDK not initialized');
    }

    if (typeof this.app.start === 'function') {
      await this.app.start();
    }
  }

  /**
   * Stop measurement
   */
  async stop(): Promise<void> {
    if (!this.app) return;

    try {
      if (typeof this.app.cancel === 'function') {
        await this.app.cancel(true);
      } else if (typeof this.app.stop === 'function') {
        await this.app.stop();
      }
    } catch (error) {
      console.error('Error stopping measurement:', error);
    }
  }

  /**
   * Destroy SDK instance
   */
  destroy(): void {
    if (!this.app) return;

    try {
      if (typeof this.app.destroy === 'function') {
        this.app.destroy();
      }
    } catch (error) {
      console.error('Error destroying SDK:', error);
    }

    this.app = null;
  }

  /**
   * Get current app instance
   */
  getApp(): any {
    return this.app;
  }
}

/**
 * Parse DeepAffex results into structured format
 */
export function parseDeepAffexResults(results: MeasurementResults) {
  const points = results.points || {};

  return {
    // Vital Signs
    heartRate: points.HR_BPM?.value || null,
    respirationRate: points.BR_BPM?.value || null,
    bpSystolic: points.BP_SYSTOLIC?.value || null,
    bpDiastolic: points.BP_DIASTOLIC?.value || null,

    // Physiological
    sdnn: points.HRV_SDNN?.value || null,
    rmssd: points.HRV_RMSSD?.value || null,

    // Mental/Emotional
    stressIndex: points.MSI?.value || null,
    mentalScore: points.MENTAL_SCORE?.value || null,

    // Physical
    bmi: points.BMI_CALC?.value || null,
    facialSkinAge: points['Facial Skin Age']?.value || null,

    // Risks
    cvdRisk: points.BP_CVD?.value || null,
    heartAttackRisk: points.BP_HEART_ATTACK?.value || null,
    strokeRisk: points.BP_STROKE?.value || null,

    // Scores
    healthScore: points.HEALTH_SCORE?.value || null,
    vitalScore: points.VITAL_SCORE?.value || null,
    physioScore: points.PHYSIO_SCORE?.value || null,
    risksScore: points.RISKS_SCORE?.value || null,

    // Metadata
    measurementId: results.measurementId,
    measurementResultId: results.measurementResultId,
    statusId: results.statusId,
    allPoints: points,
  };
}