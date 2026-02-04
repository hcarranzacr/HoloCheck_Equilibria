export interface OrganizationBranding {
  id: string;
  organization_id: string;
  organization_name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  custom_css?: string;
  slug?: string;
  banner_url?: string;
  favicon_url?: string;
  background_image_url?: string;
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
}

export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
  department_id?: string;
  organization_name?: string;
  department_name?: string;
  created_at?: string;
}

export interface BrandingContextType {
  branding: OrganizationBranding | null;
  userProfile?: UserProfile | null;
  loading: boolean;
  error?: string | null;
  loadBrandingByOrgId?: (organizationId: string) => Promise<void>;
  clearBranding?: () => void;
  refreshBranding?: () => Promise<void>;
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