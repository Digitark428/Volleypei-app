// ─────────────────────────────────────────────────────────────────────────────
// src/lib/api.js
// Toutes les fonctions Supabase de l'application VolleyPéi
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabase.js';

// ═════════════════════════════════════════════════════════════════════════════
// JOUEURS
// ═════════════════════════════════════════════════════════════════════════════

/** Cherche un joueur par email. Retourne null si inexistant. */
export async function getJoueurByEmail(email) {
  const { data, error } = await supabase
    .from('joueurs')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Crée un nouveau joueur. Retourne le joueur créé. */
export async function createJoueur({ prenom, nom, email, ville }) {
  const { data, error } = await supabase
    .from('joueurs')
    .insert({
      prenom: prenom.trim(),
      nom:    nom.trim(),
      email:  email.toLowerCase().trim(),
      ville:  (ville || '').trim(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Retourne tous les joueurs (admin). */
export async function getAllJoueurs() {
  const { data, error } = await supabase
    .from('joueurs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ═════════════════════════════════════════════════════════════════════════════
// AUTHENTIFICATION ORGANISATEUR (Supabase Auth)
// ═════════════════════════════════════════════════════════════════════════════

/** Connexion organisateur via Supabase Auth (email + mot de passe). */
export async function signInOrganisateur(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email:    email.toLowerCase().trim(),
    password,
  });
  if (error) throw error;
  return data; // { user, session }
}

/** Déconnexion organisateur. */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Session courante (pour restaurer la session au rechargement). */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Retourne le profil organisateur depuis la table `organisateurs`. */
export async function getOrganisateurByEmail(email) {
  const { data, error } = await supabase
    .from('organisateurs')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Retourne tous les organisateurs validés (admin). */
export async function getAllOrganisateurs() {
  const { data, error } = await supabase
    .from('organisateurs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ═════════════════════════════════════════════════════════════════════════════
// ADHÉSIONS (demandes organisateur)
// ═════════════════════════════════════════════════════════════════════════════

/** Soumet une nouvelle demande d'adhésion organisateur. */
export async function soumettreDemande({ prenom, nom, association, email, mdp }) {
  // Vérifie si une demande existe déjà
  const { data: existing } = await supabase
    .from('adhesions')
    .select('id, statut')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (existing) {
    if (existing.statut === 'en_attente') throw new Error('UNE_DEMANDE_EN_ATTENTE');
    if (existing.statut === 'validee')    throw new Error('DEJA_VALIDEE');
    // Si refusée → on met à jour
    const { error } = await supabase
      .from('adhesions')
      .update({
        prenom, nom, association,
        mdp_tmp:    mdp,
        statut:     'en_attente',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('adhesions')
    .insert({
      prenom:      prenom.trim(),
      nom:         nom.trim(),
      association: association.trim(),
      email:       email.toLowerCase().trim(),
      mdp_tmp:     mdp,
      statut:      'en_attente',
    });
  if (error) throw error;
}

/** Retourne toutes les demandes d'adhésion (admin). */
export async function getAllAdhesions() {
  const { data, error } = await supabase
    .from('adhesions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Valide une adhésion via l'Edge Function Supabase.
 * L'Edge Function crée le compte Auth + insère dans `organisateurs`.
 */
export async function validerAdhesion(adhesionId) {
  const { error } = await supabase.functions.invoke('valider-adhesion', {
    body: { adhesion_id: adhesionId },
  });
  if (error) throw error;
}

/** Refuse une demande d'adhésion. */
export async function refuserAdhesion(adhesionId) {
  const { error } = await supabase
    .from('adhesions')
    .update({ statut: 'refusee', updated_at: new Date().toISOString() })
    .eq('id', adhesionId);
  if (error) throw error;
}

// ═════════════════════════════════════════════════════════════════════════════
// TOURNOIS
// ═════════════════════════════════════════════════════════════════════════════

/** Retourne tous les tournois triés par date. */
export async function getAllTournois() {
  const { data, error } = await supabase
    .from('tournois')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  // Mappe affiche_url → affiche pour compatibilité avec l'UI existante
  return (data || []).map(t => ({ ...t, affiche: t.affiche_url || null }));
}

/** Crée un tournoi. `afficheFile` = File object ou null. */
export async function createTournoi(form, afficheFile, organisateurEmail) {
  let affiche_url = null;

  // Upload de l'affiche si un fichier est fourni
  if (afficheFile) {
    affiche_url = await uploadAffiche(afficheFile);
  }

  const { data, error } = await supabase
    .from('tournois')
    .insert({
      nom:          form.nom,
      date:         form.date,
      heure:        form.heure || null,
      lieu:         form.lieu,
      ville:        form.ville || '',
      type:         form.type,
      joueurs:      parseInt(form.joueurs) || 0,
      contact:      form.contact,
      organisateur: form.organisateur,
      description:  form.description || '',
      affiche_url,
      lat:          form.lat  ? parseFloat(form.lat)  : null,
      lng:          form.lng  ? parseFloat(form.lng)  : null,
      created_by:   organisateurEmail || '',
    })
    .select()
    .single();

  if (error) throw error;
  return { ...data, affiche: data.affiche_url || null };
}

/** Supprime un tournoi par id. */
export async function deleteTournoi(id) {
  const { error } = await supabase
    .from('tournois')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ═════════════════════════════════════════════════════════════════════════════
// STORAGE — Upload affiches
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Upload une affiche dans le bucket Supabase Storage "volleypei".
 * Retourne l'URL publique.
 */
export async function uploadAffiche(file) {
  const ext  = file.name.split('.').pop();
  const path = `affiches/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from('volleypei')
    .upload(path, file, { upsert: false });

  if (upErr) throw upErr;

  const { data } = supabase.storage
    .from('volleypei')
    .getPublicUrl(path);

  return data.publicUrl;
}

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═════════════════════════════════════════════════════════════════════════════

/** Retourne { nbJoueurs, nbOrganisateurs, nbTournois } en parallèle. */
export async function getDashboardStats() {
  const [
    { count: nbJoueurs,       error: e1 },
    { count: nbOrganisateurs, error: e2 },
    { count: nbTournois,      error: e3 },
  ] = await Promise.all([
    supabase.from('joueurs').select('*',       { count: 'exact', head: true }),
    supabase.from('organisateurs').select('*', { count: 'exact', head: true }),
    supabase.from('tournois').select('*',      { count: 'exact', head: true }),
  ]);

  if (e1 || e2 || e3) console.error('Stats error:', e1, e2, e3);
  return {
    nbJoueurs:       nbJoueurs       || 0,
    nbOrganisateurs: nbOrganisateurs || 0,
    nbTournois:      nbTournois      || 0,
  };
}
