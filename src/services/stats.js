// src/services/stats.js — Tracking simple des visites
import { supabase, supabaseConfigured } from '../lib/supabase.js';

const STORAGE_KEY = 'volleypei_visited_today';

/**
 * Enregistre une visite UNE FOIS par jour par navigateur (déduplication via localStorage).
 * Non bloquant — ne lance jamais d'exception.
 */
export async function trackVisit() {
  if (!supabaseConfigured) return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(STORAGE_KEY) === today) return;

    const { error } = await supabase.rpc('upsert_visite', { p_jour: today });
    if (!error) localStorage.setItem(STORAGE_KEY, today);
  } catch {
    // Analytics — non bloquant
  }
}

/**
 * Récupère les statistiques de visites sur les N derniers jours.
 * @param {number} nbJours
 * @returns {Promise<{total: number, moyenne: number, jours: Array<{jour: string, nb: number}>}>}
 */
export async function fetchVisitStats(nbJours = 30) {
  if (!supabaseConfigured) return { total: 0, moyenne: 0, jours: [] };

  const depuis = new Date();
  depuis.setDate(depuis.getDate() - nbJours);
  const depuisStr = depuis.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('visites')
    .select('jour, nb')
    .gte('jour', depuisStr)
    .order('jour', { ascending: true });

  if (error) return { total: 0, moyenne: 0, jours: [] };

  const jours = data || [];
  const total = jours.reduce((s, v) => s + v.nb, 0);
  const moyenne = nbJours > 0 ? Math.round(total / nbJours) : 0;

  return { total, moyenne, jours };
}
