// src/services/sponsors.js — Service Supabase : table `sponsors`
import { supabase, supabaseConfigured } from '../lib/supabase.js';

/**
 * Liste des sponsors ACTIFS (visibles publiquement).
 * Tri par tier (gold > silver > bronze) puis par `ordre`.
 */
export async function fetchActiveSponsors() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('actif', true)
    .order('ordre', { ascending: true });
  if (error) throw error;
  return data || [];
}

/** Tous les sponsors (admin, actifs ou non). */
export async function fetchAllSponsors() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('ordre', { ascending: true });
  if (error) throw error;
  return data || [];
}

/** Crée un sponsor. */
export async function createSponsor(sponsor) {
  if (!supabaseConfigured) return null;
  const { data, error } = await supabase
    .from('sponsors')
    .insert({
      nom:       sponsor.nom,
      type:      sponsor.type,
      image_url: sponsor.image_url ?? null,
      lien:      sponsor.lien ?? '',
      actif:     sponsor.actif ?? true,
      ordre:     sponsor.ordre ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Met à jour un sponsor (champs partiels acceptés). */
export async function updateSponsor(id, patch) {
  if (!supabaseConfigured) return null;
  const { data, error } = await supabase
    .from('sponsors')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Supprime un sponsor. */
export async function deleteSponsor(id) {
  if (!supabaseConfigured) return;
  const { error } = await supabase.from('sponsors').delete().eq('id', id);
  if (error) throw error;
}
