// src/services/tournois.js — Service Supabase : table `tournois`
import { supabase, supabaseConfigured } from '../lib/supabase.js';
import { STATUS } from '../lib/constants.js';
import { uploadImage } from './storage.js';

/**
 * Normalise une ligne brute Supabase en objet utilisable côté front.
 * (Pour l'instant : identité — point d'extension futur)
 */
function normalize(row) {
  return row;
}

/**
 * Tournois validés (publics).
 * @returns {Promise<Array>}
 */
export async function fetchApprovedTournois() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('tournois')
    .select('*')
    .eq('status', STATUS.APPROVED)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data || []).map(normalize);
}

/** Tournois en attente de validation (admin). */
export async function fetchPendingTournois() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('tournois')
    .select('*')
    .eq('status', STATUS.PENDING)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalize);
}

/** Tous les tournois, tous statuts (admin). */
export async function fetchAllTournois() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('tournois')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalize);
}

/**
 * Crée un tournoi en `pending`. Upload l'image obligatoire en premier.
 * @param {Object} form - { nom, description, date, ville, lieu, telephone, email, latitude, longitude }
 * @param {File}   imageFile - obligatoire
 * @returns {Promise<Object>} le tournoi créé
 */
export async function createTournoi(form, imageFile) {
  // Upload de l'image (obligatoire — validé en amont mais on re-vérifie ici)
  if (!imageFile) throw new Error("Image obligatoire.");
  const image_url = await uploadImage(imageFile, 'tournois');

  // Mode local sans Supabase configuré : on simule un retour
  if (!supabaseConfigured) {
    return normalize({
      id: Date.now(),
      ...form,
      image_url,
      status: STATUS.PENDING,
      created_at: new Date().toISOString(),
    });
  }

  const { data, error } = await supabase
    .from('tournois')
    .insert({
      nom:         form.nom,
      description: form.description,
      date:        form.date,
      ville:       form.ville,
      lieu:        form.lieu,
      telephone:   form.telephone,
      email:       form.email,
      image_url,
      latitude:    form.latitude ?? null,
      longitude:   form.longitude ?? null,
      status:      STATUS.PENDING,
    })
    .select()
    .single();

  if (error) throw error;
  return normalize(data);
}

/** Valide un tournoi → status `approved`. */
export async function approveTournoi(id) {
  if (!supabaseConfigured) return;
  const { error } = await supabase
    .from('tournois')
    .update({ status: STATUS.APPROVED })
    .eq('id', id);
  if (error) throw error;
}

/** Rejette un tournoi → status `rejected` (conservé pour audit). */
export async function rejectTournoi(id) {
  if (!supabaseConfigured) return;
  const { error } = await supabase
    .from('tournois')
    .update({ status: STATUS.REJECTED })
    .eq('id', id);
  if (error) throw error;
}

/** Supprime définitivement. */
export async function deleteTournoi(id) {
  if (!supabaseConfigured) return;
  const { error } = await supabase.from('tournois').delete().eq('id', id);
  if (error) throw error;
}
