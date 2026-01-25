import { supabase } from './supabase';

// Organizations
export async function getOrganizations() {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Sectors
export async function getSectors() {
  const { data, error } = await supabase
    .from('param_sectors')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Industries
export async function getIndustries() {
  const { data, error } = await supabase
    .from('param_industries')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Subscription Plans
export async function getSubscriptionPlans() {
  const { data, error } = await supabase
    .from('param_subscription_plans')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// User Profiles
export async function getUserProfiles() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Departments
export async function getDepartments() {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Biometric Measurements
export async function getBiometricMeasurements() {
  const { data, error } = await supabase
    .from('biometric_measurements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data || [];
}

// AI Analysis Results
export async function getAIAnalyses() {
  const { data, error } = await supabase
    .from('ai_analysis_results')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data || [];
}

// Department Insights
export async function getDepartmentInsights() {
  const { data, error } = await supabase
    .from('department_insights')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Subscription Usage Logs
export async function getSubscriptionUsageLogs() {
  const { data, error } = await supabase
    .from('subscription_usage_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error) throw error;
  return data || [];
}

// Prompts
export async function getPrompts() {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createPrompt(prompt: any) {
  const { data, error } = await supabase
    .from('prompts')
    .insert(prompt)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// System Logs
export async function getSystemLogs() {
  const { data, error } = await supabase
    .from('system_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error) throw error;
  return data || [];
}

// App Settings
export async function getAppSettings() {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .limit(1);
  
  if (error) throw error;
  return data || [];
}

export async function updateAppSettings(id: string, settings: any) {
  const { data, error } = await supabase
    .from('app_settings')
    .update(settings)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}