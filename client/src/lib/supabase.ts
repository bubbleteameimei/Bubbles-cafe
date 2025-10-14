import { createClient } from '@supabase/supabase-js';

const url = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Log but do not throw to avoid breaking the app; login calls will fail gracefully
  try { console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY'); } catch {}
}

export const supabase = createClient(url || '', anonKey || '');