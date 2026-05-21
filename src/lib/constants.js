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

/**
 * Capacité totale par tier (places disponibles affichées dans l'admin).
 * 👉 Modifie ces valeurs pour ajuster les places sans toucher au reste du code.
 */
export const SPONSOR_CAPACITY = {
  gold:   5,
  silver: 10,
  bronze: 20,
};

/** Configuration des emplacements sponsors sur la home */
export const SPONSOR_SLOTS_CONFIG = [
  { tier: 'gold',   label: 'Gold',     count: 1 },
  { tier: 'silver', label: 'Silver',   count: 2 },
  { tier: 'bronze', label: 'Bronze',   count: 3 },
];

/** Sponsors fictifs pour l'aperçu page Partenaires */
export const FAKE_SPONSORS = [
  { id: 1, nom: 'Decathlon Réunion',  type: 'gold',   image_url: null, images: [], slogan: 'Le sport, ensemble',          description_offre: '', lien: '', actif: true, ordre: 0, status: 'approved' },
  { id: 2, nom: 'Red Bull',           type: 'silver', image_url: null, images: [], slogan: 'Donne des ailes',              description_offre: '', lien: '', actif: true, ordre: 1, status: 'approved' },
  { id: 3, nom: 'Beach Store 974',    type: 'silver', image_url: null, images: [], slogan: 'L\'esprit océan',              description_offre: '', lien: '', actif: true, ordre: 2, status: 'approved' },
  { id: 4, nom: 'Rhum Charrette',     type: 'bronze', image_url: null, images: [], slogan: 'L\'authentique péi',           description_offre: '', lien: '', actif: true, ordre: 3, status: 'approved' },
  { id: 5, nom: 'Réunion Tourisme',   type: 'bronze', image_url: null, images: [], slogan: 'L\'île intense',               description_offre: '', lien: '', actif: true, ordre: 4, status: 'approved' },
  { id: 6, nom: 'Royal Bourbon',      type: 'bronze', image_url: null, images: [], slogan: 'Le goût du soleil',            description_offre: '', lien: '', actif: true, ordre: 5, status: 'approved' },
];

/** Mois et abréviations */
export const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export const JOURS_COURTS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
