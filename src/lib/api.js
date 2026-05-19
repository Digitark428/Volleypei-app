// src/lib/api.js — Fonctions Supabase avec fallback mode local
import { supabase, supabaseConfigured } from './supabase.js';

// ══════════════════════════ JOUEURS ══════════════════════════════════════════

export async function getJoueurByEmail(email) {
  if (!supabaseConfigured) return null;
  const { data, error } = await supabase
    .from('joueurs').select('*')
    .eq('email', email.toLowerCase().trim()).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createJoueur({ prenom, nom, email, ville }) {
  if (!supabaseConfigured)
    return { id: Date.now(), prenom, nom, email: email.toLowerCase().trim(), ville: ville||'', created_at: new Date().toISOString() };
  const { data, error } = await supabase.from('joueurs')
    .insert({ prenom: prenom.trim(), nom: nom.trim(), email: email.toLowerCase().trim(), ville: (ville||'').trim() })
    .select().single();
  if (error) throw error;
  return data;
}

export async function getAllJoueurs() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase.from('joueurs').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ══════════════════════ AUTH ORGANISATEUR ════════════════════════════════════

export async function signInOrganisateur(email, password) {
  if (!supabaseConfigured) throw new Error('Supabase non configuré');
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.toLowerCase().trim(), password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabaseConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  if (!supabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getOrganisateurByEmail(email) {
  if (!supabaseConfigured) return null;
  const { data, error } = await supabase.from('organisateurs').select('*')
    .eq('email', email.toLowerCase().trim()).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAllOrganisateurs() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase.from('organisateurs').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ══════════════════════════ ADHÉSIONS ════════════════════════════════════════

export async function soumettreDemande({ prenom, nom, association, email, mdp }) {
  if (!supabaseConfigured) return;
  const { data: existing } = await supabase.from('adhesions').select('id, statut')
    .eq('email', email.toLowerCase().trim()).maybeSingle();
  if (existing) {
    if (existing.statut === 'en_attente') throw new Error('UNE_DEMANDE_EN_ATTENTE');
    if (existing.statut === 'validee')    throw new Error('DEJA_VALIDEE');
    const { error } = await supabase.from('adhesions')
      .update({ prenom, nom, association, mdp_tmp: mdp, statut: 'en_attente', updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from('adhesions')
    .insert({ prenom: prenom.trim(), nom: nom.trim(), association: association.trim(), email: email.toLowerCase().trim(), mdp_tmp: mdp, statut: 'en_attente' });
  if (error) throw error;
}

export async function getAllAdhesions() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase.from('adhesions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function validerAdhesion(adhesionId) {
  if (!supabaseConfigured) return;
  const { error } = await supabase.functions.invoke('valider-adhesion', { body: { adhesion_id: adhesionId } });
  if (error) throw error;
}

export async function refuserAdhesion(adhesionId) {
  if (!supabaseConfigured) return;
  const { error } = await supabase.from('adhesions')
    .update({ statut: 'refusee', updated_at: new Date().toISOString() }).eq('id', adhesionId);
  if (error) throw error;
}

// ══════════════════════════ TOURNOIS ═════════════════════════════════════════

export async function getAllTournois() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase.from('tournois').select('*').order('date', { ascending: true });
  if (error) throw error;
  return (data || []).map(t => ({ ...t, affiche: t.affiche_url || null }));
}

export async function createTournoi(form, afficheFile, organisateurEmail) {
  let affiche_url = null;
  if (afficheFile && supabaseConfigured) affiche_url = await uploadAffiche(afficheFile);

  if (!supabaseConfigured)
    return { id: Date.now(), ...form, affiche_url: null, affiche: form.affiche || null,
             joueurs: parseInt(form.joueurs)||0, created_at: new Date().toISOString() };

  const { data, error } = await supabase.from('tournois')
    .insert({
      nom: form.nom, date: form.date, heure: form.heure||null, lieu: form.lieu,
      ville: form.ville||'', type: form.type, joueurs: parseInt(form.joueurs)||0,
      contact: form.contact, organisateur: form.organisateur, description: form.description||'',
      affiche_url, lat: form.lat ? parseFloat(form.lat) : null, lng: form.lng ? parseFloat(form.lng) : null,
      created_by: organisateurEmail||'',
    })
    .select().single();
  if (error) throw error;
  return { ...data, affiche: data.affiche_url || null };
}

export async function deleteTournoi(id) {
  if (!supabaseConfigured) return;
  const { error } = await supabase.from('tournois').delete().eq('id', id);
  if (error) throw error;
}

// ══════════════════════════ STORAGE ══════════════════════════════════════════

export async function uploadAffiche(file) {
  const ext  = file.name.split('.').pop();
  const path = `affiches/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('volleypei').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('volleypei').getPublicUrl(path);
  return data.publicUrl;
}

// ══════════════════════════ STATS ════════════════════════════════════════════

export async function getDashboardStats() {
  if (!supabaseConfigured) return { nbJoueurs: 0, nbOrganisateurs: 0, nbTournois: 0 };
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
  return { nbJoueurs: nbJoueurs||0, nbOrganisateurs: nbOrganisateurs||0, nbTournois: nbTournois||0 };
}

// ══════════════════════ SIGNUP JOUEUR (Auth + profil) ════════════════════════

export async function signUpJoueur({ prenom, nom, email, ville, password }) {
  if (!supabaseConfigured)
    return { id: Date.now(), prenom, nom, email: email.toLowerCase().trim(), ville: ville||'', role: 'joueur' };

  // 1. Crée le compte Auth
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: { data: { prenom, nom, ville, role: 'joueur' } },
  });
  if (authErr) throw authErr;

  // 2. Crée le profil dans la table joueurs
  const { data: profil, error: profilErr } = await supabase
    .from('joueurs')
    .insert({ prenom: prenom.trim(), nom: nom.trim(), email: email.toLowerCase().trim(), ville: (ville||'').trim(), auth_user_id: authData.user.id })
    .select().single();
  if (profilErr) throw profilErr;

  return { ...profil, role: 'joueur', session: authData.session };
}

export async function signInJoueur(email, password) {
  if (!supabaseConfigured) throw new Error('Supabase non configuré');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });
  if (error) throw error;

  // Récupère le profil joueur
  const { data: profil } = await supabase
    .from('joueurs')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  return { ...data, profil: { ...profil, role: 'joueur' } };
}

// ══════════════════════════ VISITES ══════════════════════════════════════════

/** Enregistre une visite pour aujourd'hui (upsert par jour). */
export async function enregistrerVisite() {
  if (!supabaseConfigured) return;
  const aujourd_hui = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  // Tente d'insérer — si le jour existe déjà, incrémente nb
  const { error } = await supabase.rpc('upsert_visite', { p_jour: aujourd_hui });
  if (error) {
    // Fallback si la RPC n'existe pas : insert simple
    await supabase.from('visites').upsert({ jour: aujourd_hui, nb: 1 }, { onConflict: 'jour', ignoreDuplicates: false });
  }
}

/** Retourne les visites des N derniers jours + moyenne/jour. */
export async function getVisitesStats(nbJours = 30) {
  if (!supabaseConfigured) return { total: 0, moyenne: 0, jours: [] };

  const depuis = new Date();
  depuis.setDate(depuis.getDate() - nbJours);
  const depuisStr = depuis.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('visites')
    .select('jour, nb')
    .gte('jour', depuisStr)
    .order('jour', { ascending: true });

  if (error) return { total: 0, moyenne: 0, jours: [] };

  const jours = data || [];
  const total = jours.reduce((s, v) => s + v.nb, 0);
  const moyenne = jours.length > 0 ? Math.round(total / nbJours) : 0;

  return { total, moyenne, jours };
}
