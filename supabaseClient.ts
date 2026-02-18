import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

const isConfigValid = supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl !== 'your_supabase_project_url';

if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = 'Missing Supabase environment variables. Please check your .env file or Vercel environment settings.';
    console.error(errorMsg);
    // In production, we don't want to crash at init time, but we should inform why services will fail.
}

export const supabase = (isConfigValid && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null as any; // Cast as any to allow imports to work, but calls will fail until vars are set.
