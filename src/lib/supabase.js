// src/lib/supabase.js
// Client Supabase — point d'entrée unique pour toute l'app.
// Configure tes clés via .env.local :
//   VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
//   VITE_SUPABASE_ANON_KEY=...

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://placeholder.supabase.co';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL &&
  !!import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    'Supabase non configuré — mode local (lecture seule). ' +
    'Crée .env.local avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
