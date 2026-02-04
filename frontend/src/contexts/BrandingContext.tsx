import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OrganizationBranding, UserProfile, BrandingContextType } from '@/types/branding';
import { apiClient } from '@/lib/api-client';

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<OrganizationBranding | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBranding = async () => {
    try {
      setLoading(true);

      // Get current user
      const user = await apiClient.getCurrentUser();
      if (!user) {
        console.log('No authenticated user');
        setLoading(false);
        return;
      }

      // Get user profile via apiClient
      const profileResponse = await apiClient.userProfiles.query({
        query: { user_id: user.id },
        limit: 1,
      });

      const profile = profileResponse.items?.[0];
      if (!profile) {
        console.log('No user profile found');
        setLoading(false);
        return;
      }

      setUserProfile(profile as any);

      // Get organization branding via apiClient
      if (profile.organization_id) {
        try {
          const brandingResponse = await apiClient.call(
            `/api/v1/organization-branding?organization_id=${profile.organization_id}`,
            'GET'
          );

          const brandingData = brandingResponse.items?.[0] || brandingResponse[0];
          
          if (brandingData) {
            // Get organization name
            const org = await apiClient.organizations.get(profile.organization_id);
            
            setBranding({
              ...brandingData,
              organization_name: org?.name || 'Organization',
            });

            // Apply branding
            applyBranding(brandingData);
          }
        } catch (error) {
          console.error('Error loading branding:', error);
        }
      }
    } catch (error) {
      console.error('Error loading branding context:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyBranding = (brandingData: OrganizationBranding) => {
    const root = document.documentElement;

    if (brandingData.primary_color) {
      root.style.setProperty('--primary-color', brandingData.primary_color);
    }

    if (brandingData.secondary_color) {
      root.style.setProperty('--secondary-color', brandingData.secondary_color);
    }

    if (brandingData.font_family) {
      root.style.setProperty('--font-family', brandingData.font_family);
    }

    if (brandingData.custom_css) {
      const styleId = 'custom-branding-styles';
      let styleElement = document.getElementById(styleId);
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = brandingData.custom_css;
    }
  };

  useEffect(() => {
    loadBranding();
  }, []);

  const refreshBranding = async () => {
    await loadBranding();
  };

  return (
    <BrandingContext.Provider value={{ branding, userProfile, loading, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}