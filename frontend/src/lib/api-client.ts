import { createClient } from '@metagptx/web-sdk';

const client = createClient();

export interface BiometricMeasurement {
  id: string;
  user_id: string;
  scan_id: string;
  measurement_timestamp: string;
  heart_rate?: number;
  respiratory_rate?: number;
  blood_pressure?: number;
  sdnn?: number;
  rmssd?: number;
  mental_stress_index?: number;
  physiological_score?: number;
  mental_score?: number;
  physical_score?: number;
  vital_index_score?: number;
  risk_score?: number;
  bmi?: number;
  waist_height_ratio?: number;
  body_shape_index?: number;
  abdominal_circumference_cm?: number;
  global_health_score?: number;
  wellness_index_score?: number;
  ai_stress?: number;
  ai_fatigue?: number;
  ai_recovery?: number;
  ai_cognitive_load?: number;
  cardiac_load?: number;
  vascular_capacity?: number;
  cv_risk_heart_attack?: number;
  cv_risk_stroke?: number;
  bio_age_basic?: number;
  arrhythmias_detected?: boolean;
  signal_to_noise_ratio?: number;
  scan_quality_index?: number;
  created_at: string;
}

export interface BiometricIndicatorInfo {
  indicator_code: string;
  display_name: string;
  unit: string | null;
  min_value: string;
  max_value: string;
  description: string;
  interpretation: string;
  influencing_factors: string;
  tips: string;
  risk_ranges: Record<string, [number, number]> | null;
  is_clinical: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department?: string;
  position?: string;
  hire_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  partnership_id: string;
  recommendation_type: string;
  priority: string;
  title: string;
  description: string;
  benefits: string[];
  estimated_impact: string;
  validity_start: string;
  validity_end: string;
  is_active: boolean;
  created_at: string;
  partnership?: {
    id: string;
    company_name: string;
    category: string;
    logo_url?: string;
  };
}

class ApiClient {
  private client = client;

  // Auth namespace for compatibility
  auth = {
    me: async () => {
      const user = await this.client.auth.me();
      return user.data;
    },
    toLogin: async () => {
      await this.client.auth.toLogin();
    },
    logout: async () => {
      await this.client.auth.logout();
    }
  };

  // Auth methods
  async getCurrentUser() {
    const user = await this.client.auth.me();
    return user.data;
  }

  async login() {
    await this.client.auth.toLogin();
  }

  async logout() {
    await this.client.auth.logout();
  }

  // User Profiles namespace for compatibility
  userProfiles = {
    query: async (params: any) => {
      const response = await this.client.entities.user_profiles.query(params);
      return { data: response.data, items: response.data.items };
    },
    get: async (params: any) => {
      const response = await this.client.entities.user_profiles.get(params);
      return response.data;
    },
    list: async (organizationId?: string) => {
      const query = organizationId ? { organization_id: organizationId } : {};
      const response = await this.client.entities.user_profiles.query({ query });
      return { data: response.data, items: response.data.items };
    },
    listAll: async () => {
      const response = await this.client.entities.user_profiles.queryAll({});
      return { data: response.data, items: response.data.items };
    },
    create: async (data: any) => {
      const response = await this.client.entities.user_profiles.create({ data });
      return response.data;
    },
    update: async (id: string, data: any) => {
      const response = await this.client.entities.user_profiles.update({ id, data });
      return response.data;
    },
    delete: async (params: any) => {
      return await this.client.entities.user_profiles.delete(params);
    }
  };

  // Organizations namespace
  organizations = {
    query: async (params: any) => {
      const response = await this.client.entities.organizations.query(params);
      return { data: response.data, items: response.data.items };
    },
    queryAll: async (params: any) => {
      const response = await this.client.entities.organizations.queryAll(params);
      return { data: response.data, items: response.data.items };
    },
    list: async () => {
      const response = await this.client.entities.organizations.queryAll({});
      return { data: response.data, items: response.data.items };
    },
    get: async (id: string) => {
      const response = await this.client.entities.organizations.get({ id });
      return response.data;
    }
  };

  // Departments namespace
  departments = {
    query: async (params: any) => {
      const response = await this.client.entities.departments.query(params);
      return { data: response.data, items: response.data.items };
    },
    queryAll: async (params: any) => {
      const response = await this.client.entities.departments.queryAll(params);
      return { data: response.data, items: response.data.items };
    },
    list: async () => {
      const response = await this.client.entities.departments.queryAll({});
      return { data: response.data, items: response.data.items };
    },
    listAll: async () => {
      const response = await this.client.entities.departments.queryAll({});
      return { data: response.data, items: response.data.items };
    },
    get: async (id: string) => {
      const response = await this.client.entities.departments.get({ id });
      return response.data;
    },
    create: async (params: any) => {
      const response = await this.client.entities.departments.create(params);
      return response.data;
    },
    update: async (params: any) => {
      const response = await this.client.entities.departments.update(params);
      return response.data;
    },
    delete: async (params: any) => {
      return await this.client.entities.departments.delete(params);
    }
  };

  // Measurements namespace
  measurements = {
    query: async (params: any) => {
      const response = await this.client.entities.biometric_measurements.query(params);
      return { data: response.data, items: response.data.items };
    },
    queryAll: async (params: any) => {
      const response = await this.client.entities.biometric_measurements.queryAll(params);
      return { data: response.data, items: response.data.items };
    },
    create: async (data: any) => {
      const response = await this.client.entities.biometric_measurements.create({ data });
      return response.data;
    }
  };

  // Dashboards namespace
  dashboards = {
    getStats: async (params: any) => {
      return await this.client.apiCall.invoke({
        url: '/api/v1/dashboards/stats',
        method: 'GET',
        data: params
      });
    },
    hr: async (params: any) => {
      return await this.client.apiCall.invoke({
        url: '/api/v1/dashboards/hr',
        method: 'GET',
        data: params
      });
    },
    leader: async (params: any) => {
      return await this.client.apiCall.invoke({
        url: '/api/v1/dashboards/leader',
        method: 'GET',
        data: params
      });
    }
  };

  // AI Analyses namespace
  aiAnalyses = {
    query: async (params: any) => {
      const response = await this.client.entities.ai_analyses.query(params);
      return { data: response.data, items: response.data.items };
    },
    queryAll: async (params: any) => {
      const response = await this.client.entities.ai_analyses.queryAll(params);
      return { data: response.data, items: response.data.items };
    }
  };

  // Prompts namespace
  prompts = {
    query: async (params: any) => {
      const response = await this.client.entities.prompts.query(params);
      return { data: response.data, items: response.data.items };
    },
    queryAll: async (params: any) => {
      const response = await this.client.entities.prompts.queryAll(params);
      return { data: response.data, items: response.data.items };
    },
    create: async (params: any) => {
      const response = await this.client.entities.prompts.create(params);
      return response.data;
    },
    update: async (params: any) => {
      const response = await this.client.entities.prompts.update(params);
      return response.data;
    },
    delete: async (params: any) => {
      return await this.client.entities.prompts.delete(params);
    }
  };

  // Audit log method - updated signature to match usage
  async logAudit(userId: string, action: string, entityType: string, details: any) {
    try {
      await this.client.apiCall.invoke({
        url: '/api/v1/audit-logs',
        method: 'POST',
        data: { user_id: userId, action, entity_type: entityType, details }
      });
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  }

  // Biometric measurements
  async getLatestMeasurement(userId: string): Promise<BiometricMeasurement | null> {
    try {
      const response = await this.client.entities.biometric_measurements.query({
        query: { user_id: userId },
        sort: '-measurement_timestamp',
        limit: 1,
      });
      return response.data.items[0] || null;
    } catch (error) {
      console.error('Error fetching latest measurement:', error);
      return null;
    }
  }

  async getMeasurementHistory(userId: string, limit = 10): Promise<BiometricMeasurement[]> {
    try {
      const response = await this.client.entities.biometric_measurements.query({
        query: { user_id: userId },
        sort: '-measurement_timestamp',
        limit,
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching measurement history:', error);
      return [];
    }
  }

  async getAllMeasurements(limit = 100): Promise<BiometricMeasurement[]> {
    try {
      const response = await this.client.entities.biometric_measurements.queryAll({
        sort: '-measurement_timestamp',
        limit,
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching all measurements:', error);
      return [];
    }
  }

  // Biometric indicator ranges - NEW METHOD
  async getBiometricIndicatorRanges(): Promise<Record<string, Record<string, [number, number]>>> {
    try {
      const response = await this.client.apiCall.invoke({
        url: '/api/v1/biometric-indicators/ranges',
        method: 'GET',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching biometric indicator ranges:', error);
      return {};
    }
  }

  // Biometric indicator info
  async getBiometricIndicatorInfo(indicatorCode: string): Promise<BiometricIndicatorInfo | null> {
    try {
      const response = await this.client.apiCall.invoke({
        url: `/api/v1/biometric-indicators/info/${indicatorCode}`,
        method: 'GET',
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching indicator info for ${indicatorCode}:`, error);
      return null;
    }
  }

  // Users
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await this.client.entities.users.queryAll({
        sort: '-created_at',
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await this.client.entities.users.get({
        id: userId,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }

  // Recommendations
  async getUserRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      const response = await this.client.entities.recommendations.query({
        query: { user_id: userId, is_active: true },
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

  // Partnerships
  async getAllPartnerships() {
    try {
      const response = await this.client.entities.partnerships.queryAll({
        sort: '-created_at',
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching partnerships:', error);
      return [];
    }
  }

  async createPartnership(data: any) {
    try {
      const response = await this.client.entities.partnerships.create({
        data,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating partnership:', error);
      throw error;
    }
  }

  async updatePartnership(id: string, data: any) {
    try {
      const response = await this.client.entities.partnerships.update({
        id,
        data,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating partnership:', error);
      throw error;
    }
  }

  async deletePartnership(id: string) {
    try {
      await this.client.entities.partnerships.delete({ id });
    } catch (error) {
      console.error('Error deleting partnership:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
export const api = apiClient; // Alias for compatibility