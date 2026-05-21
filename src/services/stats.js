// src/services/stats.js — Tracking & statistiques de visites
//
// ARCHITECTURE :
//   - Table `visites` : 1 ligne par jour (PK = jour) avec un compteur entier.
//   - Fonction SQL `upsert_visite(p_jour)` : incrémente atomiquement.
//   - Côté front : 1 visite/navigateur/jour, dédupliquée par localStorage.
//   - Lecture : agrégation sur N derniers jours (total + moyenne jour/semaine).
//
// DIAGNOSTIC :
//   Si les stats restent à 0, vérifier dans Supabase SQL Editor :
//     select * from visites order by jour desc limit 10;
//     select upsert_visite('2025-01-01');
//   Si la fonction n'existe pas : exécuter le schema.sql complet.

import { supabase, supabaseConfigured } from '../lib/supabase.js';

const VISITED_KEY = 'volleypei_visit'; // clé : "volleypei_visit_2025-12-31"

/** Date du jour en YYYY-MM-DD (timezone navigateur) */
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${j}`;
}

/**
 * Enregistre 1 visite (dédupliquée sur le jour, côté navigateur).
 * Non bloquant : n'expose aucune exception.
 */
export async function trackVisit() {
  if (!supabaseConfigured) return;
  try {
    const today = todayKey();
    const fullKey = `${VISITED_KEY}_${today}`;

    // Déjà compté aujourd'hui sur ce navigateur → on sort
    if (typeof localStorage !== 'undefined' && localStorage.getItem(fullKey) === '1') {
      return;
    }

    const { error } = await supabase.rpc('upsert_visite', { p_jour: today });
    if (error) {
      // Retry simple (réseau capricieux mobile)
      const retry = await supabase.rpc('upsert_visite', { p_jour: today });
      if (retry.error) {
        console.warn('trackVisit: échec persistant —', retry.error.message);
        console.warn('→ Vérifier que la fonction upsert_visite existe dans Supabase.');
        return;
      }
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(fullKey, '1');
      cleanupOldKeys();
    }
  } catch (e) {
    console.warn('trackVisit exception:', e?.message);
  }
}

/** Supprime les clés "volleypei_visit_YYYY-MM-DD" de + de 14 jours. */
function cleanupOldKeys() {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(VISITED_KEY + '_')) {
        const day = k.slice(VISITED_KEY.length + 1);
        if (day < cutoffStr) localStorage.removeItem(k);
      }
    }
  } catch {}
}

/**
 * Récupère les statistiques de visites.
 *
 * @param {number} nbJours - Fenêtre glissante en jours (default 30)
 * @returns {Promise<{
 *   total: number,
 *   moyenne: number,
 *   moyenne_semaine: number,
 *   jours: Array<{jour: string, nb: number}>,
 *   total_global: number
 * }>}
 */
export async function fetchVisitStats(nbJours = 30) {
  const empty = { total: 0, moyenne: 0, moyenne_semaine: 0, jours: [], total_global: 0 };
  if (!supabaseConfigured) return empty;

  try {
    // 1) Total global (toutes les lignes de la table)
    const { data: allData, error: allErr } = await supabase
      .from('visites')
      .select('nb');

    if (allErr) {
      console.warn('fetchVisitStats: erreur lecture visites —', allErr.message);
      return empty;
    }

    const total_global = (allData || []).reduce((s, v) => s + (v.nb || 0), 0);

    // 2) Détail sur la fenêtre glissante
    const depuis = new Date();
    depuis.setDate(depuis.getDate() - nbJours + 1);
    const depuisStr = depuis.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('visites')
      .select('jour, nb')
      .gte('jour', depuisStr)
      .order('jour', { ascending: true });

    if (error) {
      console.warn('fetchVisitStats: erreur fenêtre —', error.message);
      return { ...empty, total_global };
    }

    const jours = data || [];
    const total = jours.reduce((s, v) => s + (v.nb || 0), 0);
    const moyenne = nbJours > 0 ? Math.round(total / nbJours) : 0;
    const nbSemaines = Math.max(1, nbJours / 7);
    const moyenne_semaine = Math.round(total / nbSemaines);

    return { total, moyenne, moyenne_semaine, jours, total_global };
  } catch (e) {
    console.warn('fetchVisitStats exception:', e?.message);
    return empty;
  }
}
