// src/services/tournois.js — Service Supabase : table `tournois`
//
// FLOW PUBLIC :
//   - createTournoi(form, imageFile)  → upload image puis insert (status=pending)
//   - fetchApprovedTournois()         → liste publique (calendrier)
//
// FLOW ADMIN :
//   - fetchAllTournois() / fetchPendingTournois()
//   - approveTournoi / rejectTournoi / deleteTournoi
//
// v8 — Schéma simplifié : on a retiré `nom_association` / `numero_identification`
// et ajouté `type`. Le schéma SQL est rétro-compatible (les colonnes supprimées
// restent dans la BDD avec leur default ''). On peut les drop plus tard sans risque.

import { supabase, supabaseConfigured } from '../lib/supabase.js';
import { STATUS } from '../lib/constants.js';
import { uploadImage, deleteImage } from './storage.js';

function normalize(row) {
  // Point d'extension futur (mapping snake_case → camelCase, dates parsées, etc.)
  return row;
}

/** Tournois validés (vue publique du calendrier). */
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

/** Tournois en attente de validation (admin → onglet "En attente"). */
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

/** Tous les tournois, tous statuts (admin → onglet "Tournois"). */
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
 *
 * @param {Object} form      - Données du formulaire (cf. useTournoiForm)
 * @param {File}   imageFile - Affiche obligatoire (déjà validée en amont)
 */
export async function createTournoi(form, imageFile) {
  if (!imageFile) throw new Error("Image obligatoire.");
  const image_url = await uploadImage(imageFile, 'tournois');

  // Mode local sans Supabase configuré → simulation (utile en dev)
  if (!supabaseConfigured) {
    return normalize({
      id: Date.now(),
      ...form,
      image_url,
      status: STATUS.PENDING,
      created_at: new Date().toISOString(),
    });
  }

  // Payload aligné sur le schéma — pas de champs administratifs supprimés.
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
    latitude:       form.latitude ?? null,
    longitude:      form.longitude ?? null,
    status:         STATUS.PENDING,
  };

  const { data, error } = await supabase
    .from('tournois')
    .insert(payload)
    .select()
    .single();

  if (error) {
    // Erreur fréquente : si la migration SQL ajoutant `type` n'a pas été exécutée,
    // on retombe sur un insert sans cette colonne (rétro-compat).
    if (/column "type"/i.test(error.message || '')) {
      console.warn('Colonne `type` absente — fallback sans ce champ.');
      const { type: _omit, ...legacyPayload } = payload;
      const retry = await supabase.from('tournois').insert(legacyPayload).select().single();
      if (retry.error) throw retry.error;
      return normalize(retry.data);
    }
    throw error;
  }
  return normalize(data);
}

/**
 * Valide un tournoi → status `approved`.
 * Re-géocode si lat/lng manquent (best-effort, non bloquant).
 */
export async function approveTournoi(id) {
  if (!supabaseConfigured) return;

  const { data: t, error: e1 } = await supabase
    .from('tournois')
    .select('id, lieu, ville, latitude, longitude')
    .eq('id', id)
    .single();
  if (e1) throw e1;

  const patch = { status: STATUS.APPROVED };

  if ((!t.latitude || !t.longitude) && t.lieu && t.ville) {
    try {
      const { geocode } = await import('./geocoding.js');
      const coords = await geocode(t.lieu, t.ville);
      if (coords) {
        patch.latitude  = coords.latitude;
        patch.longitude = coords.longitude;
      }
    } catch (err) {
      console.warn('Re-géocodage à l\'approval a échoué (non bloquant) :', err);
    }
  }

  const { error } = await supabase
    .from('tournois')
    .update(patch)
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

/**
 * Supprime définitivement un tournoi (et son affiche dans Storage).
 * La suppression de l'image est best-effort : on n'échoue pas si elle rate.
 */
export async function deleteTournoi(id) {
  if (!supabaseConfigured) return;

  // Récupère l'URL de l'image AVANT delete (sinon on ne pourra plus la retrouver)
  const { data: t } = await supabase
    .from('tournois')
    .select('image_url')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('tournois').delete().eq('id', id);
  if (error) throw error;

  // Cleanup Storage (non bloquant)
  if (t?.image_url) {
    await deleteImage(t.image_url);
  }
}
