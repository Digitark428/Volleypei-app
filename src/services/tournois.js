// src/services/tournois.js — Service Supabase : table `tournois`
//
// FLOW PUBLIC :
//   - createTournoi(form, imageFile)  → upload image puis insert direct
//   - fetchTournois()                 → liste complète (calendrier public)
//
// FLOW ADMIN :
//   - fetchTournois()      → même liste (tous les tournois)
//   - deleteTournoi(id)    → suppression définitive (admin seulement)
//
// v9 — Plus de système status/pending/approved/rejected.
//      Tout tournoi publié est immédiatement visible dans le calendrier.

import { supabase, supabaseConfigured } from '../lib/supabase.js';
import { uploadImage, deleteImage } from './storage.js';

function normalize(row) {
  return row;
}

/** Tous les tournois, triés par date ASC (vue publique + admin). */
export async function fetchTournois() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('tournois')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return (data || []).map(normalize);
}

/**
 * Crée un tournoi et le publie immédiatement.
 * Upload l'image obligatoire en premier.
 *
 * @param {Object} form      - Données du formulaire (cf. useTournoiForm)
 * @param {File}   imageFile - Affiche obligatoire (déjà validée en amont)
 */
export async function createTournoi(form, imageFile) {
  if (!imageFile) throw new Error('Image obligatoire.');
  const image_url = await uploadImage(imageFile, 'tournois');

  // Mode local sans Supabase configuré → simulation (utile en dev)
  if (!supabaseConfigured) {
    return normalize({
      id: Date.now(),
      ...form,
      image_url,
      created_at: new Date().toISOString(),
    });
  }

  const payload = {
    nom:            form.nom,
    description:    form.description,
    date:           form.date,
    heure:          form.heure || '',
    ville:          form.ville,
    lieu:           form.lieu,
    type:           form.type || '',
    telephone:      form.telephone,
    email:          form.email,
    nombre_joueurs: form.nombre_joueurs ?? null,
    image_url,
    latitude:       form.latitude  ?? null,
    longitude:      form.longitude ?? null,
  };

  const { data, error } = await supabase
    .from('tournois')
    .insert(payload)
    .select()
    .single();

  if (error) {
    // Diagnostic détaillé pour identifier les problèmes de schéma Supabase
    console.error('[createTournoi] échec insert:', error);
    console.error('[createTournoi] code:', error.code, '| message:', error.message);
    console.error('[createTournoi] hint:', error.hint, '| details:', error.details);
    console.error('[createTournoi] payload envoyé:', payload);

    // Erreurs fréquentes côté Supabase si le schéma v9 n'a pas été exécuté :
    if (error.code === '42703' || /column .* does not exist/i.test(error.message || '')) {
      throw new Error(
        "Colonne manquante dans Supabase. Exécutez le schéma v9 dans le SQL Editor."
      );
    }
    if (error.code === '42501' || /policy/i.test(error.message || '') || /row-level security/i.test(error.message || '')) {
      throw new Error(
        "Policy RLS bloque l'insertion. Exécutez le schéma v9 dans le SQL Editor pour corriger les policies."
      );
    }
    throw error;
  }
  return normalize(data);
}

/**
 * Supprime définitivement un tournoi (et son affiche dans Storage).
 * La suppression de l'image est best-effort.
 */
export async function deleteTournoi(id) {
  if (!supabaseConfigured) return;

  const { data: t } = await supabase
    .from('tournois')
    .select('image_url')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('tournois').delete().eq('id', id);
  if (error) throw error;

  if (t?.image_url) {
    await deleteImage(t.image_url);
  }
}

/**
 * Met à jour un tournoi (admin uniquement).
 *
 * @param {string} id    - UUID du tournoi
 * @param {Object} patch - Champs à mettre à jour
 */
export async function updateTournoi(id, patch) {
  if (!supabaseConfigured) return;
  const { error } = await supabase
    .from('tournois')
    .update(patch)
    .eq('id', id);
  if (error) throw error;
}
