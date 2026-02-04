/**
 * Custom hook for fetching and managing organization branding
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { OrganizationBranding } from '@/types/branding';

export function useBranding(organizationId: string | undefined) {
  const [branding, setBranding] = useState<OrganizationBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBranding() {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🎨 [useBranding] Fetching branding for organization:', organizationId);
        
        const { data, error: fetchError } = await supabase
          .from('organization_branding')
          .select('*')
          .eq('organization_id', organizationId)
          .single();

        if (fetchError) {
          // If no branding found, use defaults
          if (fetchError.code === 'PGRST116') {
            console.log('⚠️ [useBranding] No branding found, using defaults');
            setBranding(getDefaultBranding(organizationId));
          } else {
            throw fetchError;
          }
        } else {
          console.log('✅ [useBranding] Branding loaded successfully');
          setBranding(data as OrganizationBranding);
          
          // Apply branding colors to CSS variables
          if (data) {
            applyBrandingColors(data as OrganizationBranding);
          }
        }
      } catch (err) {
        console.error('❌ [useBranding] Error fetching branding:', err);
        setError(err as Error);
        // Use default branding on error
        setBranding(getDefaultBranding(organizationId));
      } finally {
        setLoading(false);
      }
    }

    fetchBranding();
  }, [organizationId]);

  return { branding, loading, error };
}

function applyBrandingColors(branding: OrganizationBranding) {
  if (branding.primary_color) {
    document.documentElement.style.setProperty('--brand-primary', branding.primary_color);
  }
  if (branding.secondary_color) {
    document.documentElement.style.setProperty('--brand-secondary', branding.secondary_color);
  }
  if (branding.accent_color) {
    document.documentElement.style.setProperty('--brand-accent', branding.accent_color);
  }
}

function getDefaultBranding(organizationId: string): OrganizationBranding {
  return {
    id: 'default',
    organization_id: organizationId,
    logo_url: null,
    banner_url: null,
    primary_color: '#0EA5E9', // Sky-600
    secondary_color: '#1E40AF', // Blue-800
    accent_color: '#F59E0B', // Amber-500
    company_tagline: 'Tu salud, nuestra prioridad',
    welcome_message: 'Bienvenido a HoloCheck Equilibria',
    mission_statement: 'Mejorar la calidad de vida de nuestros colaboradores a través de tecnología innovadora.',
    vision_statement: 'Ser líderes en bienestar organizacional en América Latina.',
    contact_email: null,
    contact_phone: null,
    website_url: null,
    social_links: null,
    theme_mode: 'light'
  };
}