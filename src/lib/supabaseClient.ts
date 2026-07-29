import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — check .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Public catalogue reads must not depend on a visitor's persisted auth
// session. An expired session from an older deployment can otherwise make
// these anonymous queries fail and leave the home page looking empty.
export const publicSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
