import { supabase } from './supabase';
import { logger } from './logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

// Get auth token from Supabase
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Generic API call function that returns wrapped response
async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const method = options.method || 'GET';
  
  try {
    logger.apiRequest(endpoint, method, options.body ? JSON.parse(options.body as string) : undefined);
    
    const token = await getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const url = `${API_BASE_URL}${endpoint}`;
    logger.debug('API', `Full URL: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    logger.apiResponse(endpoint, response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      logger.apiError(endpoint, { status: response.status, error: errorData });
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    logger.debug('API', `Response data for ${endpoint}`, data);
    return { data };
  } catch (error) {
    logger.apiError(endpoint, error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Helper function that unwraps the response and returns data directly
async function apiCallDirect<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  const response = await apiCall<T>(endpoint, options);
  return response.data || null;
}

// i18n API calls
export const i18nApi = {
  getTranslations: async (screenCode?: string, locale?: string) => {
    logger.i18nLoadTranslations(screenCode || 'all', locale || 'default');
    
    const params = new URLSearchParams();
    if (screenCode) params.append('screen_code', screenCode);
    if (locale) params.append('locale', locale);
    
    const queryString = params.toString();
    const endpoint = `/api/v1/i18n/translations${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiCall(endpoint);
    
    if (response.data) {
      const count = Array.isArray(response.data) ? response.data.length : Object.keys(response.data).length;
      logger.i18nTranslationsLoaded(screenCode || 'all', locale || 'default', count);
    }
    
    return response;
  },
  getLocales: async (screenCode?: string) => {
    const params = new URLSearchParams();
    if (screenCode) params.append('screen_code', screenCode);
    
    const queryString = params.toString();
    const endpoint = `/api/v1/i18n/locales${queryString ? `?${queryString}` : ''}`;
    
    return apiCall<string[]>(endpoint);
  },
  getScreens: async () => {
    return apiCall<string[]>('/api/v1/i18n/screens');
  },
};

// Auth API
export const authApi = {
  me: () => apiCallDirect('/api/v1/auth/me'),
  getUser: () => apiCallDirect('/api/v1/auth/user'),
  getSession: () => apiCallDirect('/api/v1/auth/session'),
};

// User Profiles API
export const userProfilesApi = {
  getMe: () => apiCall('/api/v1/user-profiles/me'),
  getById: (userId: string) => apiCallDirect(`/api/v1/user-profiles/${userId}`),
  get: (userId: string) => apiCallDirect(`/api/v1/user-profiles/${userId}`),
  update: (userId: string, data: any) => 
    apiCall(`/api/v1/user-profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  create: (data: any) =>
    apiCallDirect('/api/v1/user-profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (userId: string) =>
    apiCall(`/api/v1/user-profiles/${userId}`, {
      method: 'DELETE',
    }),
  list: (organizationId?: string) => {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    return apiCallDirect(`/api/v1/user-profiles${params.toString() ? `?${params}` : ''}`);
  },
  listAll: (filters?: any) => {
    const params = new URLSearchParams(filters || {});
    return apiCallDirect(`/api/v1/user-profiles${params.toString() ? `?${params}` : ''}`);
  },
  query: (filters: any) => {
    const params = new URLSearchParams(filters);
    return apiCallDirect(`/api/v1/user-profiles?${params}`);
  },
  getAll: (organizationId?: string, departmentId?: string, role?: string) => {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    if (departmentId) params.append('department_id', departmentId);
    if (role) params.append('role', role);
    
    const queryString = params.toString();
    return apiCall(`/api/v1/user-profiles${queryString ? `?${queryString}` : ''}`);
  },
};

// Departments API
export const departmentsApi = {
  getAll: (organizationId?: string) => {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    
    const queryString = params.toString();
    return apiCall(`/api/v1/departments${queryString ? `?${queryString}` : ''}`);
  },
  list: () => apiCallDirect('/api/v1/departments'),
  listAll: (filters?: any) => {
    const params = new URLSearchParams(filters || {});
    return apiCallDirect(`/api/v1/departments${params.toString() ? `?${params}` : ''}`);
  },
  query: (filters: any) => {
    const params = new URLSearchParams(filters);
    return apiCallDirect(`/api/v1/departments?${params}`);
  },
  getById: (departmentId: string) => apiCall(`/api/v1/departments/${departmentId}`),
  get: (departmentId: string) => apiCallDirect(`/api/v1/departments/${departmentId}`),
  create: (data: any) =>
    apiCallDirect('/api/v1/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (departmentId: string, data: any) =>
    apiCallDirect(`/api/v1/departments/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (departmentId: string) =>
    apiCall(`/api/v1/departments/${departmentId}`, {
      method: 'DELETE',
    }),
};

// Organizations API
export const organizationsApi = {
  list: (filters?: any) => {
    const params = new URLSearchParams(filters || {});
    return apiCallDirect(`/api/v1/organizations${params.toString() ? `?${params}` : ''}`);
  },
  get: (organizationId: string) => apiCallDirect(`/api/v1/organizations/${organizationId}`),
};

// Biometric Indicators API
export const biometricIndicatorsApi = {
  getAll: () => apiCall('/api/v1/biometric-indicators'),
  getById: (indicatorId: string) => apiCallDirect(`/api/v1/biometric-indicators/${indicatorId}`),
};

// Measurements API
export const measurementsApi = {
  create: (data: any) =>
    apiCallDirect('/api/v1/measurements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listAll: (filters?: any) => {
    const params = new URLSearchParams(filters || {});
    return apiCallDirect(`/api/v1/measurements${params.toString() ? `?${params}` : ''}`);
  },
};

// Dashboards API
export const dashboardsApi = {
  getEmployeeDashboard: (userId: string) => 
    apiCall(`/api/v1/dashboards/employee/${userId}`),
  getHRDashboard: (organizationId: string, departmentId?: string) => {
    const params = new URLSearchParams();
    if (departmentId) params.append('department_id', departmentId);
    
    const queryString = params.toString();
    return apiCall(`/api/v1/dashboards/hr/${organizationId}${queryString ? `?${queryString}` : ''}`);
  },
  getLeaderDashboard: (userId: string) =>
    apiCall(`/api/v1/dashboards/leader/${userId}`),
  getOrgDashboard: (organizationId: string) =>
    apiCall(`/api/v1/dashboards/org/${organizationId}`),
  getAdminDashboard: () =>
    apiCall('/api/v1/dashboards/admin'),
  admin: (filters?: any) => {
    const params = new URLSearchParams(filters || {});
    return apiCallDirect(`/api/v1/dashboards/admin${params.toString() ? `?${params}` : ''}`);
  },
  hr: (organizationId: string, departmentId?: string) => {
    const params = new URLSearchParams();
    if (departmentId) params.append('department_id', departmentId);
    return apiCallDirect(`/api/v1/dashboards/hr/${organizationId}${params.toString() ? `?${params}` : ''}`);
  },
  leader: (userId: string) => apiCallDirect(`/api/v1/dashboards/leader/${userId}`),
  getStats: (userId: string) => apiCallDirect(`/api/v1/dashboards/employee/${userId}`),
  
  // Evolution endpoints
  getEmployeeEvolution: (userId: string, indicatorId: string, period: string = '30d') => {
    const params = new URLSearchParams({ period });
    return apiCall(`/api/v1/dashboards/employee/${userId}/evolution/${indicatorId}?${params}`);
  },
  getHREvolution: (organizationId: string, indicatorId: string, period: string = '30d', departmentId?: string) => {
    const params = new URLSearchParams({ period });
    if (departmentId) params.append('department_id', departmentId);
    return apiCall(`/api/v1/dashboards/hr/${organizationId}/evolution/${indicatorId}?${params}`);
  },
  getLeaderEvolution: (userId: string, indicatorId: string, period: string = '30d') => {
    const params = new URLSearchParams({ period });
    return apiCall(`/api/v1/dashboards/leader/${userId}/evolution/${indicatorId}?${params}`);
  },
  getOrgEvolution: (organizationId: string, indicatorId: string, period: string = '30d') => {
    const params = new URLSearchParams({ period });
    return apiCall(`/api/v1/dashboards/org/${organizationId}/evolution/${indicatorId}?${params}`);
  },
  getAdminEvolution: (indicatorId: string, period: string = '30d') => {
    const params = new URLSearchParams({ period });
    return apiCall(`/api/v1/dashboards/admin/evolution/${indicatorId}?${params}`);
  },
};

// Prompts API
export const promptsApi = {
  getAll: (organizationId?: string) => {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    
    const queryString = params.toString();
    return apiCall(`/api/v1/prompts${queryString ? `?${queryString}` : ''}`);
  },
  listAll: (filters?: any) => {
    const params = new URLSearchParams(filters || {});
    return apiCallDirect(`/api/v1/prompts${params.toString() ? `?${params}` : ''}`);
  },
  getById: (promptId: string) => apiCall(`/api/v1/prompts/${promptId}`),
  create: (data: any) =>
    apiCallDirect('/api/v1/prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (promptId: string, data: any) =>
    apiCallDirect(`/api/v1/prompts/${promptId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (promptId: string) =>
    apiCall(`/api/v1/prompts/${promptId}`, {
      method: 'DELETE',
    }),
};

// AI Analyses API
export const aiAnalysesApi = {
  listAll: (filters?: any) => {
    const params = new URLSearchParams(filters || {});
    return apiCallDirect(`/api/v1/ai-analyses${params.toString() ? `?${params}` : ''}`);
  },
};

// Param AI Prompt Configs API
export const paramAiPromptConfigsApi = {
  listAll: () => apiCallDirect('/api/v1/param-ai-prompt-configs'),
};

// Param Prompt Templates API
export const paramPromptTemplatesApi = {
  listAll: () => apiCallDirect('/api/v1/param-prompt-templates'),
};

// Subscription Usage Logs API
export const subscriptionUsageLogsApi = {
  listAll: (filters?: any) => {
    const params = new URLSearchParams(filters || {});
    return apiCallDirect(`/api/v1/subscription-usage-logs${params.toString() ? `?${params}` : ''}`);
  },
};

// Benefits Management API
export const benefitsApi = {
  getBenefits: (organizationId?: string) => {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    
    const queryString = params.toString();
    return apiCall(`/api/v1/benefits${queryString ? `?${queryString}` : ''}`);
  },
  createBenefit: (data: any) =>
    apiCall('/api/v1/benefits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBenefit: (benefitId: string, data: any) =>
    apiCall(`/api/v1/benefits/${benefitId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBenefit: (benefitId: string) =>
    apiCall(`/api/v1/benefits/${benefitId}`, {
      method: 'DELETE',
    }),
  getCategories: () => apiCall('/api/v1/benefit-categories'),
  createCategory: (data: any) =>
    apiCall('/api/v1/benefit-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (categoryId: string, data: any) =>
    apiCall(`/api/v1/benefit-categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (categoryId: string) =>
    apiCall(`/api/v1/benefit-categories/${categoryId}`, {
      method: 'DELETE',
    }),
  getEnrollments: (userId?: string, benefitId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (benefitId) params.append('benefit_id', benefitId);
    
    const queryString = params.toString();
    return apiCall(`/api/v1/benefit-enrollments${queryString ? `?${queryString}` : ''}`);
  },
  createEnrollment: (data: any) =>
    apiCall('/api/v1/benefit-enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEnrollment: (enrollmentId: string, data: any) =>
    apiCall(`/api/v1/benefit-enrollments/${enrollmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEnrollment: (enrollmentId: string) =>
    apiCall(`/api/v1/benefit-enrollments/${enrollmentId}`, {
      method: 'DELETE',
    }),
  getEligibilityRules: (benefitId?: string) => {
    const params = new URLSearchParams();
    if (benefitId) params.append('benefit_id', benefitId);
    
    const queryString = params.toString();
    return apiCall(`/api/v1/benefit-eligibility-rules${queryString ? `?${queryString}` : ''}`);
  },
  createEligibilityRule: (data: any) =>
    apiCall('/api/v1/benefit-eligibility-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEligibilityRule: (ruleId: string, data: any) =>
    apiCall(`/api/v1/benefit-eligibility-rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEligibilityRule: (ruleId: string) =>
    apiCall(`/api/v1/benefit-eligibility-rules/${ruleId}`, {
      method: 'DELETE',
    }),
  getUsageLogs: (userId?: string, benefitId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (benefitId) params.append('benefit_id', benefitId);
    
    const queryString = params.toString();
    return apiCall(`/api/v1/benefit-usage-logs${queryString ? `?${queryString}` : ''}`);
  },
  createUsageLog: (data: any) =>
    apiCall('/api/v1/benefit-usage-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Organization Branding API
export const organizationBrandingApi = {
  getAll: (organizationId?: string) => {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    
    const queryString = params.toString();
    return apiCall(`/api/v1/organization-branding${queryString ? `?${queryString}` : ''}`);
  },
  getByOrganizationId: (organizationId: string) =>
    apiCall(`/api/v1/organization-branding/${organizationId}`),
  create: (data: any) =>
    apiCall('/api/v1/organization-branding', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (brandingId: string, data: any) =>
    apiCall(`/api/v1/organization-branding/${brandingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (brandingId: string) =>
    apiCall(`/api/v1/organization-branding/${brandingId}`, {
      method: 'DELETE',
    }),
};

// Health check API
export const healthApi = {
  check: () => apiCallDirect('/health'),
  checkBackend: () => apiCallDirect('/api/health'),
};

// Create the main API client object with all methods
export const apiClient = {
  // Generic call method - returns data directly
  call: async (endpoint: string, method: string = 'GET', body?: any) => {
    const options: RequestInit = { method };
    if (body) {
      options.body = JSON.stringify(body);
    }
    return apiCallDirect(endpoint, options);
  },
  
  // Helper methods - return data directly
  getCurrentUser: () => authApi.me(),
  getBiometricIndicatorInfo: (code: string) => biometricIndicatorsApi.getById(code),
  getBiometricIndicatorRanges: (code: string) => apiCallDirect(`/api/v1/biometric-indicators/${code}/ranges`),
  getMeasurementHistory: (userId: string, filters?: any) => {
    const params = new URLSearchParams({ user_id: userId, ...filters });
    return apiCallDirect(`/api/v1/measurements?${params}`);
  },
  getAllMeasurements: (limit?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    return apiCallDirect(`/api/v1/measurements${params.toString() ? `?${params}` : ''}`);
  },
  logAudit: (data: any) => apiCallDirect('/api/v1/audit-logs', { method: 'POST', body: JSON.stringify(data) }),
  
  // Module APIs
  i18n: i18nApi,
  auth: authApi,
  userProfiles: userProfilesApi,
  departments: departmentsApi,
  organizations: organizationsApi,
  biometricIndicators: biometricIndicatorsApi,
  measurements: measurementsApi,
  dashboards: dashboardsApi,
  prompts: promptsApi,
  aiAnalyses: aiAnalysesApi,
  paramAiPromptConfigs: paramAiPromptConfigsApi,
  paramPromptTemplates: paramPromptTemplatesApi,
  subscriptionUsageLogs: subscriptionUsageLogsApi,
  benefits: benefitsApi,
  organizationBranding: organizationBrandingApi,
  health: healthApi,
};

// Default export (same as apiClient)
export default apiClient;