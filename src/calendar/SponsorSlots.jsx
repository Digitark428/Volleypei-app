// src/calendar/SponsorSlots.jsx — Affichage des 3 tiers de sponsors
// Renvoie 3 composants : SponsorGold, SponsorSilverRow, SponsorBronzeRow.
import SponsorBlock from '../components/SponsorBlock.jsx';
import { FAKE_SPONSORS } from '../lib/constants.js';

/**
 * Filtre les sponsors par tier.
 * Si `showEmpty=true`, complète avec FAKE_SPONSORS pour l'aperçu.
 */
function pickByTier(sponsors, tier, count, showEmpty) {
  const real = sponsors.filter(s => s.type === tier && s.actif).slice(0, count);
  if (!showEmpty) return Array(count).fill(null).map((_, i) => real[i] || null);

  // Aperçu : remplir avec des fake sponsors si pas assez de vrais
  const fakes = FAKE_SPONSORS.filter(s => s.type === tier);
  return Array(count).fill(null).map((_, i) => real[i] || fakes[i % fakes.length] || null);
}

/** ── GOLD : 1 emplacement principal ────────────────────────────────────── */
export function SponsorGold({ sponsors, showEmpty }) {
  const [gold] = pickByTier(sponsors, 'gold', 1, showEmpty);
  if (!gold && !showEmpty) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <SponsorBlock sponsor={gold} tier="gold" placeholder={!gold && showEmpty} />
    </div>
  );
}

/** ── SILVER : 2 emplacements côte à côte ────────────────────────────── */
export function SponsorSilverRow({ sponsors, showEmpty }) {
  const slots = pickByTier(sponsors, 'silver', 2, showEmpty);
  if (slots.every(s => !s)) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
      {slots.map((s, i) => (
        <SponsorBlock key={i} sponsor={s} tier="silver" placeholder={!s && showEmpty} />
      ))}
    </div>
  );
}

/** ── BRONZE : 3 emplacements responsifs ─────────────────────────────── */
export function SponsorBronzeRow({ sponsors, showEmpty }) {
  const slots = pickByTier(sponsors, 'bronze', 3, showEmpty);
  if (slots.every(s => !s)) return null;
  return (
    <div style={{
      marginTop: 32,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: 10,
    }}>
      {slots.map((s, i) => (
        <SponsorBlock key={i} sponsor={s} tier="bronze" placeholder={!s && showEmpty} />
      ))}
    </div>
  );
}
