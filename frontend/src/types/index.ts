// User Roles
export enum UserRole {
  ADMIN_GLOBAL = 'admin_global',
  ADMIN_ORG = 'admin_org',
  RRHH = 'rrhh',
  LEADER = 'leader',
  EMPLOYEE = 'employee'
}

// Tenant
export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  locale?: string;
  timezone?: string;
  active: boolean;
  created_at: string;
}

// Tenant Settings
export interface TenantSettings {
  id: number;
  tenant_id: string;
  ai_enabled: boolean;
  ai_model?: string;
  visualization_enabled: boolean;
  custom_prompts_enabled: boolean;
  global_prompt_employee?: string;
  global_prompt_department?: string;
  global_prompt_organization?: string;
  reminder_frequency?: string;
  report_frequency?: string;
  created_at: string;
  updated_at: string;
}

// User Profile
export interface UserProfile {
  id: string;
  user_id: string;
  organization_id: string;
  department_id?: string;
  full_name: string;
  email: string;
  role: UserRole;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

// Organization
export interface Organization {
  id: string;
  name: string;
  sector_id?: number;
  industry_id?: number;
  subscription_plan_id?: number;
  logo_url?: string;
  brand_slogan?: string;
  welcome_message?: string;
  primary_color?: string;
  secondary_color?: string;
  created_at: string;
}

// Department
export interface Department {
  id: string;
  organization_id: string;
  name: string;
  leader_id?: string;
  created_at: string;
}

// Biometric Measurement
export interface BiometricMeasurement {
  id: string;
  user_id: string;
  measurement_id: string;
  heart_rate?: number;
  respiration_rate?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  sdnn?: number;
  rmssd?: number;
  ai_stress?: number;
  ai_fatigue?: number;
  ai_cognitive_load?: number;
  ai_recovery?: number;
  mental_score?: number;
  bio_age_basic?: number;
  cvd_risk?: number;
  health_score?: number;
  vital_score?: number;
  physio_score?: number;
  risks_score?: number;
  quality_score?: number;
  raw_data?: Record<string, any>;
  created_at: string;
}

// AI Analysis Result
export interface AIAnalysisResult {
  id: string;
  user_id: string;
  measurement_id?: string;
  department_id?: string;
  organization_id?: string;
  analysis_type: 'individual' | 'department' | 'organization';
  interpretation?: string;
  recommendations?: string[];
  alert_level?: 'optimal' | 'attention' | 'critical';
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  created_at: string;
}

// Department Insight
export interface DepartmentInsight {
  id: string;
  user_id: string;
  department_id: string;
  period_start?: string;
  period_end?: string;
  avg_health_score?: number;
  avg_stress?: number;
  avg_recovery?: number;
  participation_rate?: number;
  high_risk_count?: number;
  summary?: string;
  recommendations?: string[];
  created_at: string;
}

// Subscription Usage Log
export interface SubscriptionUsageLog {
  id: number;
  user_id: string;
  organization_id: string;
  scan_type: 'employee_scan' | 'department_analysis' | 'organization_analysis';
  department_id?: string;
  used_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  healthScore: number;
  stressLevel: number;
  recoveryScore: number;
  mentalScore: number;
  participationRate: number;
  highRiskCount: number;
}

// Trend Data
export interface TrendData {
  date: string;
  value: number;
  label: string;
}

// Alert
export interface Alert {
  id: string;
  userId: string;
  userName: string;
  level: 'optimal' | 'attention' | 'critical';
  message: string;
  timestamp: string;
}

// Navigation Item
export interface NavigationItem {
  label: string;
  path?: string;
  icon?: any;
  children?: NavigationItem[];
}