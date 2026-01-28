export interface OrganizationBranding {
  id: string;
  organization_id: string;
  organization_name?: string;
  logo_url: string;
  primary_color: string;
  secondary_color?: string;
  slogan: string;
  message: string;
  slug: string;
  favicon_url?: string;
  font_family?: string;
  background_image_url?: string;
  login_message?: string;
  dashboard_welcome_text?: string;
  meta_description?: string;
  contact_email?: string;
  contact_phone?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  custom_terms_url?: string;
  custom_privacy_url?: string;
  login_layout_style: 'centered' | 'split' | 'left-panel';
  branding_mode: string;
  created_at: string;
}

export interface BrandingContextType {
  branding: OrganizationBranding | null;
  loading: boolean;
  error: string | null;
  loadBrandingByOrgId: (organizationId: string) => Promise<void>;
  clearBranding: () => void;
}