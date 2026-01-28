import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useBranding } from './BrandingContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  login: () => Promise<void>;
  organizationId: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isAdmin: false,
  login: async () => {},
  organizationId: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const { loadBrandingByOrgId, clearBranding } = useBranding();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkAdminStatusAndLoadBranding(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkAdminStatusAndLoadBranding(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatusAndLoadBranding = async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      setOrganizationId(null);
      clearBranding();
      return;
    }

    try {
      console.log('🔍 [AuthContext] Loading user profile for:', currentUser.id);
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, organization_id')
        .eq('user_id', currentUser.id)
        .single();

      if (profile) {
        console.log('✅ [AuthContext] User profile loaded:', {
          role: profile.role,
          organizationId: profile.organization_id,
        });
        
        setIsAdmin(profile.role === 'admin');
        setOrganizationId(profile.organization_id);
        
        // Load branding automatically based on organization_id
        if (profile.organization_id) {
          console.log('🎨 [AuthContext] Loading branding for organization:', profile.organization_id);
          await loadBrandingByOrgId(profile.organization_id);
        } else {
          console.warn('⚠️ [AuthContext] User has no organization_id, skipping branding load');
        }
      } else {
        console.warn('⚠️ [AuthContext] No user profile found');
        setIsAdmin(false);
        setOrganizationId(null);
      }
    } catch (error) {
      console.error('❌ [AuthContext] Error checking admin status:', error);
      setIsAdmin(false);
      setOrganizationId(null);
    }
  };

  const login = async () => {
    // Redirect to login page
    window.location.href = '/login';
  };

  const signOut = async () => {
    console.log('👋 [AuthContext] Signing out, clearing branding');
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setOrganizationId(null);
    clearBranding();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isAdmin, login, organizationId }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};