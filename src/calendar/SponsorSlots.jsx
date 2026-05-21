// src/calendar/SponsorSlots.jsx — Affichage des 3 tiers de sponsors
//
// Renvoie 3 composants : SponsorGold, SponsorSilverRow, SponsorBronzeRow.
// Tous propagent `onSponsorClick(sponsor)` quand l'utilisateur clique.
//
// COMPORTEMENT RACINE :
//   - Sur la page d'accueil (showEmpty=false / undefined) : AUCUN bloc n'apparaît
//     tant qu'aucun sponsor n'a été ajouté en admin. Pas de placeholder, pas
//     d'emplacement vide visible.
//   - Sur la page Partenaires (showEmpty=true) : on remplit les slots vides
//     avec des placeholders + FAKE_SPONSORS pour l'aperçu commercial.

import SponsorBlock from '../components/SponsorBlock.jsx';
import { FAKE_SPONSORS } from '../lib/constants.js';

/**
 * Filtre les sponsors par tier.
 * Si `showEmpty=true`, complète avec FAKE_SPONSORS pour l'aperçu Partenaires.
 * `sponsors` est déjà filtré par status=approved & actif=true en amont
 * (cf. service fetchActiveSponsors).
 */
function pickByTier(sponsors, tier, count, showEmpty) {
  const list = Array.isArray(sponsors) ? sponsors : [];
  const real = list.filter(s => s.type === tier).slice(0, count);
  if (!showEmpty) return Array(count).fill(null).map((_, i) => real[i] || null);

  const fakes = FAKE_SPONSORS.filter(s => s.type === tier);
  return Array(count).fill(null).map((_, i) => real[i] || fakes[i % fakes.length] || null);
}

/** ── GOLD : 1 emplacement principal ───────────────────────────────────── */
export function SponsorGold({ sponsors, showEmpty, onSponsorClick }) {
  const [gold] = pickByTier(sponsors, 'gold', 1, showEmpty);
  // Page d'accueil + aucun sponsor gold → on n'affiche rien du tout
  if (!gold && !showEmpty) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <SponsorBlock
        sponsor={gold}
        tier="gold"
        placeholder={!gold && showEmpty}
        onClick={onSponsorClick}
      />
    </div>
  );
}

/** ── SILVER : 2 emplacements côte à côte ──────────────────────────────── */
export function SponsorSilverRow({ sponsors, showEmpty, onSponsorClick }) {
  const slots = pickByTier(sponsors, 'silver', 2, showEmpty);
  // Aucun slot rempli ET pas en mode aperçu → rien du tout
  if (slots.every(s => !s) && !showEmpty) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
      {slots.map((s, i) => (
        <SponsorBlock
          key={s?.id ?? `silver-${i}`}
          sponsor={s}
          tier="silver"
          placeholder={!s && showEmpty}
          onClick={onSponsorClick}
        />
      ))}
    </div>
  );
}

/** ── BRONZE : 3 emplacements responsifs ───────────────────────────────── */
export function SponsorBronzeRow({ sponsors, showEmpty, onSponsorClick }) {
  const slots = pickByTier(sponsors, 'bronze', 3, showEmpty);
  if (slots.every(s => !s) && !showEmpty) return null;
  return (
    <div style={{
      marginTop: 32,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: 10,
    }}>
      {slots.map((s, i) => (
        <SponsorBlock
          key={s?.id ?? `bronze-${i}`}
          sponsor={s}
          tier="bronze"
          placeholder={!s && showEmpty}
          onClick={onSponsorClick}
        />
      ))}
    </div>
  );
}
