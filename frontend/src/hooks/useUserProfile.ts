import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin_platform' | 'admin_org' | 'hr' | 'leader' | 'employee';
  organization_id?: string;
  department_id?: string;
  created_at?: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        
        // 1. Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        if (!user) {
          setLoading(false);
          return;
        }

        // 2. Get profile from user_profiles table
        const { data, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(data as UserProfile);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  return { profile, loading, error };
}