import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Supabase credentials not found in environment variables');
}

export const supabase = createSupabaseClient(
  SUPABASE_URL || '',
  SUPABASE_KEY || ''
)

export const createClient = () => supabase
