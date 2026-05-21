// src/services/stats.js — Tracking & statistiques de visites
//
// ARCHITECTURE :
//   - Table `visites` : 1 ligne par jour (PK = jour) avec un compteur entier.
//   - Fonction `upsert_visite(p_jour)` : incrémente atomiquement.
//   - Côté front : 1 visite/navigateur/jour, dédupliquée par localStorage.
//   - Lecture : agrégation sur N derniers jours (total + moyenne jour/semaine).
//
// ROBUSTESSE :
//   - Pas de doublon abusif (clé localStorage `volleypei_visited_YYYY-MM-DD`)
//   - Si Supabase non configuré → retourne des stats à 0 sans planter
//   - Si la RPC échoue → on retente une fois (best-effort)
//   - Le tracking est totalement non bloquant (try/catch silencieux)

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
        console.warn('trackVisit: échec persistant', retry.error.message);
        return;
      }
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(fullKey, '1');
      // Nettoyage des anciennes clés (>14j) pour ne pas remplir localStorage
      cleanupOldKeys();
    }
  } catch (e) {
    // Analytics — non bloquant
    console.warn('trackVisit: exception', e?.message);
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
 * Récupère les statistiques de visites sur les N derniers jours + total global.
 *
 * @param {number} nbJours - Nombre de jours pour la fenêtre glissante (default 30)
 * @returns {Promise<{total: number, moyenne: number, moyenne_semaine: number, jours: Array<{jour: string, nb: number}>, total_global: number}>}
 *   - total          : visites sur la fenêtre [today-nbJours, today]
 *   - moyenne        : total / nbJours
 *   - moyenne_semaine: total / (nbJours/7)
 *   - jours          : détail par jour (ASC)
 *   - total_global   : visites cumulées DEPUIS LE DÉBUT (toutes les lignes)
 */
export async function fetchVisitStats(nbJours = 30) {
  const empty = { total: 0, moyenne: 0, moyenne_semaine: 0, jours: [], total_global: 0 };
  if (!supabaseConfigured) return empty;

  try {
    // 1) Total global (toutes les lignes) — requête séparée mais légère
    const { data: allData, error: allErr } = await supabase
      .from('visites')
      .select('nb');
    const total_global = allErr ? 0 : (allData || []).reduce((s, v) => s + (v.nb || 0), 0);

    // 2) Détail sur la fenêtre glissante
    const depuis = new Date();
    depuis.setDate(depuis.getDate() - nbJours + 1); // +1 pour inclure aujourd'hui
    const depuisStr = depuis.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('visites')
      .select('jour, nb')
      .gte('jour', depuisStr)
      .order('jour', { ascending: true });

    if (error) return { ...empty, total_global };

    const jours = data || [];
    const total = jours.reduce((s, v) => s + (v.nb || 0), 0);
    const moyenne = nbJours > 0 ? Math.round(total / nbJours) : 0;
    const nbSemaines = Math.max(1, nbJours / 7);
    const moyenne_semaine = Math.round(total / nbSemaines);

    return { total, moyenne, moyenne_semaine, jours, total_global };
  } catch (e) {
    console.warn('fetchVisitStats:', e?.message);
    return empty;
  }
}
