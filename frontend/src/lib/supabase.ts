import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nmwbfvvacilgyxbwvnqb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2JmdnZhY2lsZ3l4Ynd2bnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzQyNjksImV4cCI6MjA4NDQxMDI2OX0.zRBKuf5kcW2W-h0Xdrop4WdFNkHFTZ0APk5vLLzwkWg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});