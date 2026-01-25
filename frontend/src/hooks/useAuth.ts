import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email?: string;
}

interface UserProfile {
  user_id: string;
  organization_id?: string;
  department_id?: string;
  full_name?: string;
  email?: string;
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string) => {
    return profile?.role === role;
  };

  const hasPermission = (permission: string) => {
    // Implementar lógica de permisos según roles
    const rolePermissions: Record<string, string[]> = {
      admin_global: ['*'],
      admin_org: ['view_org', 'edit_org', 'view_users', 'edit_users'],
      rrhh: ['view_org', 'view_users', 'view_biometrics'],
      leader: ['view_dept', 'view_dept_users', 'view_dept_biometrics'],
      employee: ['view_own', 'edit_own']
    };

    const permissions = rolePermissions[profile?.role || ''] || [];
    return permissions.includes('*') || permissions.includes(permission);
  };

  return {
    user,
    profile,
    loading,
    hasRole,
    hasPermission
  };
}