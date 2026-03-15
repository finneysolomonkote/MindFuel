import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '@mindfuel/config';

let supabase: SupabaseClient;

export const initializeSupabase = () => {
  supabase = createClient(config.database.url, config.database.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    throw new Error('Supabase not initialized');
  }
  return supabase;
};
