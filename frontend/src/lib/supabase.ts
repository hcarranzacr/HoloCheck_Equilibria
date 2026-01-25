import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [Supabase] Missing environment variables');
  console.error('📋 [Supabase] VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('📋 [Supabase] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  throw new Error('Missing Supabase environment variables');
}

console.log('✅ [Supabase] Initializing client');
console.log('📍 [Supabase] URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ [Supabase] Client initialized successfully');

export const authHelpers = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    console.log('🔐 [Auth] Sign in attempt');
    console.log('📧 [Auth] Email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ [Auth] Sign in failed');
      console.error('📋 [Auth] Error:', error.message);
      console.error('📋 [Auth] Error details:', error);
      throw error;
    }

    console.log('✅ [Auth] Sign in successful');
    console.log('👤 [Auth] User ID:', data.user?.id);
    console.log('📋 [Auth] Session expires at:', data.session?.expires_at);

    return { session: data.session, user: data.user };
  },

  /**
   * Sign out
   */
  signOut: async () => {
    console.log('🔐 [Auth] Sign out attempt');
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ [Auth] Sign out failed');
      console.error('📋 [Auth] Error:', error.message);
      throw error;
    }

    console.log('✅ [Auth] Sign out successful');
  },

  /**
   * Get current session
   */
  getSession: async () => {
    console.log('🔐 [Auth] Getting current session');
    
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ [Auth] Get session failed');
      console.error('📋 [Auth] Error:', error.message);
      throw error;
    }

    if (data.session) {
      console.log('✅ [Auth] Session found');
      console.log('👤 [Auth] User ID:', data.session.user.id);
      console.log('📋 [Auth] Session expires at:', data.session.expires_at);
    } else {
      console.warn('⚠️ [Auth] No active session');
    }

    return data.session;
  },

  /**
   * Get user profile from user_profiles table
   */
  getUserProfile: async (userId: string) => {
    console.log('👤 [Profile] Fetching user profile');
    console.log('📋 [Profile] User ID:', userId);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ [Profile] Failed to fetch profile');
      console.error('📋 [Profile] Error:', error.message);
      console.error('📋 [Profile] Error details:', error);
      throw error;
    }

    if (data) {
      console.log('✅ [Profile] Profile loaded successfully');
      console.log('🎭 [Profile] Role:', data.role);
      console.log('👤 [Profile] Full name:', data.full_name);
      console.log('🏢 [Profile] Organization ID:', data.organization_id);
      console.log('📋 [Profile] Profile data:', data);
    } else {
      console.warn('⚠️ [Profile] No profile found for user');
    }

    return data;
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    console.log('👤 [Auth] Getting current user');
    
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('❌ [Auth] Get user failed');
      console.error('📋 [Auth] Error:', error.message);
      throw error;
    }

    if (data.user) {
      console.log('✅ [Auth] Current user found');
      console.log('👤 [Auth] User ID:', data.user.id);
      console.log('📧 [Auth] Email:', data.user.email);
    } else {
      console.warn('⚠️ [Auth] No current user');
    }

    return data.user;
  },
};