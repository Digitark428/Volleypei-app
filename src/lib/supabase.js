// ─────────────────────────────────────────────────────────────────────────────
// src/lib/supabase.js
// Client Supabase — point d'entrée unique pour toute l'app
// ─────────────────────────────────────────────────────────────────────────────
//
// 👉 REMPLACE TES CLÉS :
//    1. Crée un fichier  .env.local  à la racine du projet
//    2. Ajoute ces deux lignes :
//
//       VITE_SUPABASE_URL=https://XXXXXXXXXXXX.supabase.co
//       VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
//
//    3. Sur Vercel → Settings → Environment Variables → ajoute les deux mêmes
//
//    Tes clés sont ici : Supabase Dashboard → Settings → API
//
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

// Fallbacks pour éviter un crash si les variables ne sont pas encore configurées
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://placeholder.supabase.co';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// true = clés réelles présentes, false = mode local sans backend
export const supabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL &&
  !!import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseConfigured) {
  console.warn(
    '⚠️  Supabase non configuré — mode local (données en mémoire uniquement).\n' +
    'Crée .env.local avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
