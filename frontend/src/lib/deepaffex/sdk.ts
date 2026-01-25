import { DfxConfig, DfxMeasurement, DfxResults, DfxError, DfxStatus } from './types';

/**
 * DeepAffex SDK Wrapper
 * Provides a simplified interface for biometric measurements using DeepAffex API
 */
class DeepAffexSDK {
  private config: DfxConfig;
  private deviceToken: string | null = null;
  private refreshToken: string | null = null;
  private currentMeasurementId: string | null = null;

  constructor(config: DfxConfig) {
    this.config = config;
  }

  /**
   * Initialize SDK and register license
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔧 [DeepAffex] Initializing SDK...');
      
      const response = await fetch(`https://${this.config.apiUrl}/organizations/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          LicenseKey: this.config.licenseKey,
          DeviceTypeID: 'WEB_BROWSER',
          Name: 'HoloCheck Equilibria',
          Identifier: `web-${Date.now()}`,
          Version: '1.0.0'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to register license: ${response.statusText}`);
      }

      const data = await response.json();
      this.deviceToken = data.Token;
      this.refreshToken = data.RefreshToken;

      console.log('✅ [DeepAffex] SDK initialized successfully');
    } catch (error: any) {
      console.error('❌ [DeepAffex] Initialization failed:', error);
      throw new Error(`SDK initialization failed: ${error.message}`);
    }
  }

  /**
   * Create a new measurement
   */
  async createMeasurement(): Promise<string> {
    if (!this.deviceToken) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    try {
      console.log('📊 [DeepAffex] Creating measurement...');

      const response = await fetch(`https://${this.config.apiUrl}/measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deviceToken}`
        },
        body: JSON.stringify({
          StudyID: this.config.studyId,
          Resolution: 0 // Auto resolution
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create measurement: ${response.statusText}`);
      }

      const data = await response.json();
      this.currentMeasurementId = data.ID;

      console.log('✅ [DeepAffex] Measurement created:', this.currentMeasurementId);
      return this.currentMeasurementId;
    } catch (error: any) {
      console.error('❌ [DeepAffex] Create measurement failed:', error);
      throw new Error(`Failed to create measurement: ${error.message}`);
    }
  }

  /**
   * Add video chunk data to measurement
   */
  async addData(measurementId: string, chunk: any): Promise<void> {
    if (!this.deviceToken) {
      throw new Error('SDK not initialized');
    }

    try {
      const response = await fetch(
        `https://${this.config.apiUrl}/measurements/${measurementId}/data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.deviceToken}`
          },
          body: JSON.stringify(chunk)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add data: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('❌ [DeepAffex] Add data failed:', error);
      throw new Error(`Failed to add data: ${error.message}`);
    }
  }

  /**
   * Get measurement results
   */
  async getResults(measurementId: string): Promise<DfxResults> {
    if (!this.deviceToken) {
      throw new Error('SDK not initialized');
    }

    try {
      console.log('📥 [DeepAffex] Fetching results...');

      const response = await fetch(
        `https://${this.config.apiUrl}/measurements/${measurementId}/results`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.deviceToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get results: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [DeepAffex] Results received');

      return this.parseResults(data);
    } catch (error: any) {
      console.error('❌ [DeepAffex] Get results failed:', error);
      throw new Error(`Failed to get results: ${error.message}`);
    }
  }

  /**
   * Parse raw results into structured format
   */
  private parseResults(rawData: any): DfxResults {
    const results: DfxResults = {};

    // Map all available points
    if (rawData.Results) {
      Object.keys(rawData.Results).forEach(key => {
        const value = rawData.Results[key];
        if (value !== null && value !== undefined) {
          results[key as keyof DfxResults] = parseFloat(value);
        }
      });
    }

    return results;
  }

  /**
   * Subscribe to measurement updates via WebSocket
   */
  subscribeToMeasurement(
    measurementId: string,
    onUpdate: (data: any) => void,
    onError: (error: Error) => void
  ): WebSocket {
    const ws = new WebSocket(
      `${this.config.wsUrl}/measurements/${measurementId}/subscribe?token=${this.deviceToken}`
    );

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (error: any) {
        onError(error);
      }
    };

    ws.onerror = (event) => {
      onError(new Error('WebSocket error'));
    };

    return ws;
  }

  /**
   * Get current measurement ID
   */
  getCurrentMeasurementId(): string | null {
    return this.currentMeasurementId;
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return this.deviceToken !== null;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.currentMeasurementId = null;
    // Keep tokens for reuse
  }
}

// Export singleton instance
let sdkInstance: DeepAffexSDK | null = null;

export function getDeepAffexSDK(): DeepAffexSDK {
  if (!sdkInstance) {
    const config: DfxConfig = {
      apiUrl: import.meta.env.VITE_DEEPAFFEX_API_URL || 'api.na-east.deepaffex.ai',
      licenseKey: import.meta.env.VITE_DEEPAFFEX_LICENSE_KEY || '',
      studyId: import.meta.env.VITE_DEEPAFFEX_STUDY_ID || '',
      wsUrl: import.meta.env.VITE_DEEPAFFEX_WS_URL || 'wss://api.na-east.deepaffex.ai'
    };

    if (!config.licenseKey || !config.studyId) {
      throw new Error('DeepAffex configuration missing. Check environment variables.');
    }

    sdkInstance = new DeepAffexSDK(config);
  }

  return sdkInstance;
}

export { DeepAffexSDK };