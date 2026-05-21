// src/services/sponsors.js — Service Supabase : table `sponsors`
// Workflow validation admin : `pending` → `approved` (ou `rejected`).
import { supabase, supabaseConfigured } from '../lib/supabase.js';
import { STATUS } from '../lib/constants.js';
import { uploadImage } from './storage.js';

/**
 * Sponsors visibles publiquement : status='approved' ET actif=true.
 * Tri par `ordre`.
 */
export async function fetchActiveSponsors() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('actif', true)
    .eq('status', STATUS.APPROVED)
    .order('ordre', { ascending: true });
  if (error) throw error;
  return data || [];
}

/** Tous les sponsors (admin, tous statuts). */
export async function fetchAllSponsors() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Sponsors en attente de validation (admin). */
export async function fetchPendingSponsors() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('status', STATUS.PENDING)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Crée un sponsor (toujours en `pending`). */
export async function createSponsor(sponsor) {
  if (!supabaseConfigured) return null;
  const { data, error } = await supabase
    .from('sponsors')
    .insert({
      nom:               sponsor.nom,
      type:              sponsor.type,
      slogan:            sponsor.slogan ?? '',
      description_offre: sponsor.description_offre ?? '',
      image_url:         sponsor.image_url ?? null,
      images:            sponsor.images ?? [],
      lien:              sponsor.lien ?? '',
      actif:             sponsor.actif ?? true,
      ordre:             sponsor.ordre ?? 0,
      status:            STATUS.PENDING,
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

/** Valide un sponsor → status `approved`. */
export async function approveSponsor(id) {
  if (!supabaseConfigured) return;
  const { error } = await supabase
    .from('sponsors')
    .update({ status: STATUS.APPROVED })
    .eq('id', id);
  if (error) throw error;
}

/** Refuse un sponsor → status `rejected`. */
export async function rejectSponsor(id) {
  if (!supabaseConfigured) return;
  const { error } = await supabase
    .from('sponsors')
    .update({ status: STATUS.REJECTED })
    .eq('id', id);
  if (error) throw error;
}

/** Supprime un sponsor. */
export async function deleteSponsor(id) {
  if (!supabaseConfigured) return;
  const { error } = await supabase.from('sponsors').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Upload multiple fichiers vers le dossier `sponsors/`.
 * Compression best-effort déjà appliquée par uploadImage.
 * @param {File[]} files
 * @returns {Promise<string[]>} URLs publiques (skip les uploads ratés)
 */
export async function uploadSponsorImages(files) {
  if (!files || files.length === 0) return [];
  const results = [];
  for (const f of files) {
    try {
      const url = await uploadImage(f, 'sponsors');
      if (url) results.push(url);
    } catch (e) {
      console.error('uploadSponsorImages: skipped one file', e);
      // best-effort : on continue avec les autres
    }
  }
  return results;
}
