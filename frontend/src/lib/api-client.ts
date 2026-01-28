import { createClient } from '@metagptx/web-sdk';

const client = createClient();

export interface BiometricMeasurement {
  id: string;
  user_id: string;
  measurement_id?: string;
  heart_rate?: number;
  sdnn?: number;
  rmssd?: number;
  ai_stress?: number;
  ai_fatigue?: number;
  ai_cognitive_load?: number;
  ai_recovery?: number;
  mental_score?: number;
  bio_age_basic?: number;
  created_at?: string;
  vital_index_score?: number;
  physiological_score?: number;
  wellness_index_score?: number;
  mental_stress_index?: number;
  cardiac_load?: number;
  vascular_capacity?: number;
  cv_risk_heart_attack?: number;
  cv_risk_stroke?: number;
  bmi?: number;
  abdominal_circumference_cm?: number;
  waist_height_ratio?: number;
  body_shape_index?: number;
  arrhythmias_detected?: number;
  signal_to_noise_ratio?: number;
  scan_quality_index?: number;
  global_health_score?: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  organization_id: string;
  department_id?: string;
  full_name?: string;
  email: string;
  role: string;
  created_at?: string;
}

export interface Recommendation {
  id: number;
  user_id: string;
  measurement_id?: string;
  analysis_type: string;
  recommendation_text: string;
  priority?: string;
  category?: string;
  status: string;
  created_at: string;
}

class APIClient {
  client = client;

  // User Profiles - USE SPECIALIZED ENDPOINT
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await this.client.apiCall.invoke({
        url: `/api/v1/entities/user_profiles/by-user-id/${userId}`,
        method: 'GET',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Biometric Measurements - USE SPECIALIZED ENDPOINTS
  async getLatestMeasurement(userId: string): Promise<BiometricMeasurement | null> {
    try {
      const response = await this.client.apiCall.invoke({
        url: `/api/v1/entities/biometric_measurements/latest/${userId}`,
        method: 'GET',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching latest measurement:', error);
      return null;
    }
  }

  async getMeasurementHistory(userId: string, limit = 30): Promise<BiometricMeasurement[]> {
    try {
      const response = await this.client.apiCall.invoke({
        url: `/api/v1/entities/biometric_measurements/history/${userId}`,
        method: 'GET',
        data: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching measurement history:', error);
      return [];
    }
  }

  async getAllMeasurements(limit = 100): Promise<BiometricMeasurement[]> {
    try {
      const response = await this.client.entities.biometric_measurements.queryAll({
        sort: '-created_at',
        limit,
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching all measurements:', error);
      return [];
    }
  }

  // Recommendations
  async getUserRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      const response = await this.client.entities.recommendations.query({
        query: { user_id: userId, status: 'active' },
        sort: '-created_at',
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
      return [];
    }
  }

  async getRecommendationById(recommendationId: string): Promise<Recommendation | null> {
    try {
      const response = await this.client.entities.recommendations.get({
        id: recommendationId,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching recommendation ${recommendationId}:`, error);
      return null;
    }
  }

  // Generic entity access
  get entities() {
    return this.client.entities;
  }

  get userProfiles() {
    return this.client.entities.user_profiles;
  }

  get biometricMeasurements() {
    return this.client.entities.biometric_measurements;
  }

  get recommendations() {
    return this.client.entities.recommendations;
  }
}

export const apiClient = new APIClient();