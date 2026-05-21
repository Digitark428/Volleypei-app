// src/lib/constants.js — Constantes partagées (zéro logique métier)

/** Statuts tournoi — alignés avec la contrainte SQL */
export const STATUS = {
  PENDING:  'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

/** Authentification admin — front-end seulement */
export const ADMIN_USER = 'kevinjuju';
export const ADMIN_PWD  = 'kevinjuju974';

/** Mot de passe d'accès à la page Partenaires (aperçu) */
export const PARTENAIRES_PWD = 'partenaires974';

/** Niveaux de partenariat */
export const SPONSOR_TIERS = {
  GOLD:   'gold',
  SILVER: 'silver',
  BRONZE: 'bronze',
};

/** Configuration des emplacements sponsors */
export const SPONSOR_SLOTS_CONFIG = [
  { tier: 'gold',   label: 'Gold',     count: 1 },
  { tier: 'silver', label: 'Silver',   count: 2 },
  { tier: 'bronze', label: 'Bronze',   count: 3 },
];

/** Sponsors fictifs pour l'aperçu page Partenaires */
export const FAKE_SPONSORS = [
  { id: 1, nom: 'Decathlon Réunion',  type: 'gold',   image_url: null, lien: '', actif: true, ordre: 0 },
  { id: 2, nom: 'Red Bull',           type: 'silver', image_url: null, lien: '', actif: true, ordre: 1 },
  { id: 3, nom: 'Beach Store 974',    type: 'silver', image_url: null, lien: '', actif: true, ordre: 2 },
  { id: 4, nom: 'Rhum Charrette',     type: 'bronze', image_url: null, lien: '', actif: true, ordre: 3 },
  { id: 5, nom: 'Réunion Tourisme',   type: 'bronze', image_url: null, lien: '', actif: true, ordre: 4 },
  { id: 6, nom: 'Royal Bourbon',      type: 'bronze', image_url: null, lien: '', actif: true, ordre: 5 },
];

/** Mois et abréviations */
export const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export const JOURS_COURTS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
