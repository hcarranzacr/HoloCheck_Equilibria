import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { OrganizationBranding, BrandingContextType } from '@/types/branding';

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<OrganizationBranding | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBrandingByOrgId = useCallback(async (organizationId: string) => {
    if (!organizationId) {
      console.warn('⚠️ [BrandingContext] No organization_id provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🎨 [BrandingContext] Loading branding for organization: ${organizationId}`);
      
      // Call backend API to get branding by organization_id
      const response = await fetch(
        `/api/v1/organization-branding/by-organization/${organizationId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load branding: ${response.statusText}`);
      }

      const data: OrganizationBranding = await response.json();
      
      console.log('✅ [BrandingContext] Branding loaded:', {
        slug: data.slug,
        primaryColor: data.primary_color,
        logo: data.logo_url,
      });

      setBranding(data);
      
      // Apply branding to document
      applyBrandingToDocument(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load branding';
      console.error('❌ [BrandingContext] Error loading branding:', err);
      setError(errorMessage);
      
      // Set default branding on error
      setBranding(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearBranding = useCallback(() => {
    console.log('🧹 [BrandingContext] Clearing branding');
    setBranding(null);
    setError(null);
    
    // Reset document to defaults
    document.documentElement.style.removeProperty('--primary-color');
    document.documentElement.style.removeProperty('--secondary-color');
    document.title = 'HoloCheck Equilibria';
    
    // Reset favicon to default
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = '/favicon.ico';
    }
  }, []);

  const applyBrandingToDocument = (brandingData: OrganizationBranding) => {
    // Apply CSS variables for colors
    if (brandingData.primary_color) {
      document.documentElement.style.setProperty('--primary-color', brandingData.primary_color);
    }
    if (brandingData.secondary_color) {
      document.documentElement.style.setProperty('--secondary-color', brandingData.secondary_color);
    }

    // Update document title
    if (brandingData.organization_name) {
      document.title = `${brandingData.organization_name} - HoloCheck Equilibria`;
    }

    // Update favicon
    if (brandingData.favicon_url) {
      let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = brandingData.favicon_url;
    }

    // Apply font family if specified
    if (brandingData.font_family) {
      document.documentElement.style.setProperty('--font-family', brandingData.font_family);
    }
  };

  return (
    <BrandingContext.Provider
      value={{
        branding,
        loading,
        error,
        loadBrandingByOrgId,
        clearBranding,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
}