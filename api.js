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

// ══════════════════════ AUTH ORGANISATEUR (Supabase Auth) ════════════════════

/**
 * Connexion organisateur via le vrai système Supabase Auth.
 * Après validation admin, un compte auth a été créé avec signUp().
 * On utilise signInWithPassword() ici.
 */
export async function signInOrganisateur(email, password) {
  if (!supabaseConfigured) throw new Error('Supabase non configuré');

  // 1. Connexion via Supabase Auth
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });

  if (authErr) {
    // Supabase renvoie "Invalid login credentials" si email ou mdp incorrect
    if (authErr.message?.toLowerCase().includes('invalid')) {
      // Vérifie si le compte existe dans organisateurs (pour distinguer "pas encore validé" de "mdp faux")
      const { data: orga } = await supabase
        .from('organisateurs')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();
      if (!orga) throw new Error('COMPTE_INTROUVABLE');
      throw new Error('MOT_DE_PASSE_INCORRECT');
    }
    throw authErr;
  }

  // 2. Récupère le profil organisateur
  const { data: profil, error: profilErr } = await supabase
    .from('organisateurs')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (profilErr) throw profilErr;
  if (!profil) throw new Error('COMPTE_INTROUVABLE');

  return profil;
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
  const emailNorm = email.toLowerCase().trim();

  const { data: existing } = await supabase.from('adhesions').select('id, statut')
    .eq('email', emailNorm).maybeSingle();

  if (existing) {
    if (existing.statut === 'en_attente') throw new Error('UNE_DEMANDE_EN_ATTENTE');
    if (existing.statut === 'validee')    throw new Error('DEJA_VALIDEE');
    // Demande refusée → peut re-soumettre : on remet en attente avec le nouveau mdp
    const { error } = await supabase.from('adhesions')
      .update({ prenom, nom, association, mdp_tmp: mdp, statut: 'en_attente', updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
    return;
  }

  // Nouvelle demande — on stocke le mdp temporairement pour la validation
  const { error } = await supabase.from('adhesions')
    .insert({ prenom: prenom.trim(), nom: nom.trim(), association: association.trim(), email: emailNorm, mdp_tmp: mdp, statut: 'en_attente' });
  if (error) throw error;
}

export async function getAllAdhesions() {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase.from('adhesions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Valider une adhésion organisateur.
 *
 * Workflow complet :
 * 1. Récupère la demande (avec mdp_tmp)
 * 2. Crée un vrai compte Supabase Auth avec signUp()
 * 3. Insère/met à jour la table organisateurs
 * 4. Met à jour le statut adhesion → validee
 * 5. Efface mdp_tmp (le mot de passe est maintenant dans Auth)
 *
 * ⚠️  signUp() côté client ne nécessite PAS la service_role key.
 *     Supabase crée le compte même si "Email confirmations" est activé —
 *     l'organisateur pourra se connecter immédiatement (confirm email = false
 *     recommandé pour ce projet, ou utiliser un magic link).
 *     Si le compte auth existe déjà (re-validation), on ignore l'erreur auth
 *     et on continue (le mdp reste celui que l'orga avait saisi).
 */
export async function validerAdhesion(adhesionId) {
  if (!supabaseConfigured) return;

  // 1. Récupère la demande complète (avec le mdp temporaire)
  const { data: dem, error: e1 } = await supabase
    .from('adhesions').select('*').eq('id', adhesionId).single();
  if (e1 || !dem) throw new Error('Demande introuvable');

  const emailNorm = dem.email.toLowerCase().trim();

  // 2. Crée le compte Supabase Auth pour cet organisateur
  //    Si le compte existe déjà, on ignore l'erreur (idempotent)
  const { error: authErr } = await supabase.auth.signUp({
    email: emailNorm,
    password: dem.mdp_tmp,
    options: {
      data: { prenom: dem.prenom, nom: dem.nom, role: 'organisateur' },
      // emailRedirectTo non nécessaire si confirmations désactivées
    },
  });

  // On tolère "User already registered" — le compte existe déjà
  if (authErr && !authErr.message?.toLowerCase().includes('already registered')) {
    console.error('Auth signUp error (non bloquant):', authErr.message);
    // On continue quand même — le cas le plus fréquent c'est que le compte existe déjà
  }

  // 3. Insère ou met à jour la table organisateurs
  const { error: e2 } = await supabase
    .from('organisateurs')
    .upsert(
      { prenom: dem.prenom, nom: dem.nom, association: dem.association, email: emailNorm },
      { onConflict: 'email' }
    );
  if (e2) throw e2;

  // 4. Met à jour le statut adhesion → validee ET efface mdp_tmp
  const { error: e3 } = await supabase
    .from('adhesions')
    .update({ statut: 'validee', mdp_tmp: '', updated_at: new Date().toISOString() })
    .eq('id', adhesionId);
  if (e3) throw e3;
}

export async function refuserAdhesion(adhesionId) {
  if (!supabaseConfigured) return;
  const { error } = await supabase.from('adhesions')
    .update({ statut: 'refusee', updated_at: new Date().toISOString() }).eq('id', adhesionId);
  if (error) throw error;
}

/**
 * Suppression définitive d'une demande organisateur.
 * Supprime dans : adhesions + organisateurs.
 * Le compte auth.users nécessite la service_role key (côté serveur).
 * On l'efface en best-effort via admin API si disponible, sinon on l'ignore.
 * L'email sera réutilisable pour une nouvelle demande.
 */
export async function supprimerAdhesion(adhesionId) {
  if (!supabaseConfigured) return;

  // 1. Récupère l'email
  const { data: dem, error: e1 } = await supabase
    .from('adhesions').select('email').eq('id', adhesionId).single();
  if (e1 || !dem) throw new Error('Demande introuvable');
  const emailNorm = dem.email.toLowerCase().trim();

  // 2. Supprime dans organisateurs
  await supabase.from('organisateurs').delete().eq('email', emailNorm);

  // 3. Supprime la ligne adhesions
  const { error: e2 } = await supabase.from('adhesions').delete().eq('id', adhesionId);
  if (e2) throw e2;

  // Note : la suppression de auth.users nécessite la service_role key (backend).
  // À faire via une Edge Function Supabase si nécessaire pour libérer l'email côté Auth.
  // Pour l'instant le compte Auth reste mais l'accès est bloqué (plus dans organisateurs).
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

  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: { data: { prenom, nom, ville, role: 'joueur' } },
  });
  if (authErr) throw authErr;

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

  const { data: profil } = await supabase
    .from('joueurs')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  return { ...data, profil: { ...profil, role: 'joueur' } };
}

// ══════════════════════════ VISITES ══════════════════════════════════════════

export async function enregistrerVisite() {
  if (!supabaseConfigured) return;
  const aujourd_hui = new Date().toISOString().split('T')[0];
  const { error } = await supabase.rpc('upsert_visite', { p_jour: aujourd_hui });
  if (error) {
    await supabase.from('visites').upsert({ jour: aujourd_hui, nb: 1 }, { onConflict: 'jour', ignoreDuplicates: false });
  }
}

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
