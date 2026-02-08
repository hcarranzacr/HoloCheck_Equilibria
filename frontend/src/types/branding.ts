export interface OrganizationBranding {
  id: string;
  organization_id: string;
  organization_name?: string;
  logo_url?: string;
  background_image_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  custom_css?: string;
  slug?: string;
  banner_url?: string;
  favicon_url?: string;
  accent_color?: string;
  company_tagline?: string;
  welcome_message?: string;
  mission_statement?: string;
  vision_statement?: string;
  slogan?: string;
  message?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  social_links?: {
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  custom_fonts?: {
    heading?: string;
    body?: string;
    url?: string;
  };
  theme_mode?: 'light' | 'dark' | 'auto';
  created_at?: string;
  updated_at?: string;
  
  // New fields from branding table
  login_message?: string;
  dashboard_welcome_text?: string;
  meta_description?: string;
  custom_terms_url?: string;
  custom_privacy_url?: string;
  login_layout_style?: string;
  branding_mode?: string;
  preferred_locale?: string;
  fallback_locale?: string;
  date_format?: string;
  time_format?: string;
  number_locale?: string;
  currency_code?: string;
  first_day_of_week?: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  full_name?: string;
  department_id?: string;
  organization_name?: string;
  department_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BrandingContextType {
  branding: OrganizationBranding | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error?: string | null;
  refreshBranding: () => Promise<void>;
  loadBrandingByOrgId: (organizationId: string) => Promise<void>;
  clearBranding: () => void;
}

export const ROLE_ROUTES: Record<string, string> = {
  'org_admin': '/org/dashboard',
  'hr_manager': '/hr/dashboard',
  'rrhh': '/hr/dashboard',
  'leader': '/leader/dashboard',
  'employee': '/employee/dashboard',
  'admin': '/admin/organizations',
  'admin_global': '/admin/organizations'
};

export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  'org_admin': 'Administrador de Organización',
  'hr_manager': 'Gerente de Recursos Humanos',
  'rrhh': 'Gerente de Recursos Humanos',
  'leader': 'Líder de Departamento',
  'employee': 'Empleado',
  'admin': 'Administrador de Plataforma',
  'admin_global': 'Administrador de Plataforma'
};