// src/lib/dates.js — Helpers pure-functions pour les dates (pas de side-effects)

/**
 * Calcule la grille du mois : tableau de 7×N cases où chaque case est
 * soit `null` (espace vide en début/fin) soit le numéro du jour.
 */
export function getMonthGrid(annee, mois) {
  const premierJour = new Date(annee, mois, 1);
  const dernierJour = new Date(annee, mois + 1, 0);
  const cells = [];

  // ⚠️ getDay() : 0=dimanche, on veut lundi en premier
  const offset = (premierJour.getDay() + 6) % 7;
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let j = 1; j <= dernierJour.getDate(); j++) cells.push(j);

  return cells;
}

/**
 * Formate une date au format ISO YYYY-MM-DD.
 */
export function formatDateISO(annee, mois, jour) {
  return `${annee}-${String(mois + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
}

/**
 * Formate une date ISO (YYYY-MM-DD) en français : DD/MM/YYYY
 */
export function formatDateFR(iso) {
  if (!iso) return '';
  return iso.split('-').reverse().join('/');
}

/**
 * Renvoie la date du jour au format ISO.
 */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
