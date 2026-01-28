import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './index.css';
import App from './App.tsx';

// Initialize Supabase client and make it globally available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nmwbfvvacilgyxbwvnqb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bv9N5FWT448fasDBMBD8Og_jM3cc4pj';

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Make Supabase client globally available
(window as any).supabaseClient = supabaseClient;

console.log('✅ Supabase client initialized');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);