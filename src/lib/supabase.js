// src/lib/supabase.js — Client Supabase unique pour toute l'app
//
// Configuration via .env.local :
//   VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
//   VITE_SUPABASE_ANON_KEY=...
//
// Si les variables d'env ne sont pas définies, on tombe sur un client "placeholder"
// qui retourne des données vides — l'app continue de fonctionner en mode dégradé
// (lecture seule, pas de tracking, pas d'upload).

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://placeholder.supabase.co';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL &&
  !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

if (!supabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[VolleyPéi] Supabase non configuré — mode local (lecture seule). ' +
    'Crée .env.local avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY, ' +
    'puis redémarre `npm run dev`.'
  );
}

// Création du client.
// - persistSession=false : on n'utilise pas l'auth Supabase (système simplifié sans comptes).
// - autoRefreshToken=false : idem, économise une horloge de refresh.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
