// src/components/SponsorBlock.jsx — Bloc sponsor pour un tier (gold | silver | bronze)
// Affiche un emplacement disponible si `placeholder=true`.

const TIER_CFG = {
  gold: {
    label: 'Partenaire Gold',
    gradient: 'linear-gradient(180deg,#fef3c7,#fde68a)',
    accent: '#92400e',
    badge: 'GOLD',
  },
  silver: {
    label: 'Partenaire Silver',
    gradient: 'linear-gradient(180deg,#f3f4f6,#e5e7eb)',
    accent: '#4b5563',
    badge: 'SILVER',
  },
  bronze: {
    label: 'Partenaire Bronze',
    gradient: 'linear-gradient(180deg,#fed7aa,#fdba74)',
    accent: '#9a3412',
    badge: 'BRONZE',
  },
};

function SponsorBlock({ sponsor, tier, placeholder }) {
  const cfg = TIER_CFG[tier] || TIER_CFG.bronze;

  if (!sponsor && !placeholder) return null;

  // GOLD = format mis en valeur
  if (tier === 'gold') {
    return placeholder ? <GoldPlaceholder cfg={cfg} /> : <GoldCard sponsor={sponsor} cfg={cfg} />;
  }

  // SILVER / BRONZE = format compact
  return placeholder
    ? <CompactPlaceholder tier={tier} cfg={cfg} />
    : <CompactCard sponsor={sponsor} tier={tier} cfg={cfg} />;
}

// ─── GOLD ────────────────────────────────────────────────────────────────────

function GoldPlaceholder({ cfg }) {
  return (
    <div style={{
      background: cfg.gradient, borderRadius: 18, padding: '28px 22px',
      textAlign: 'center', opacity: 0.6, border: '1px dashed rgba(146,64,14,0.2)',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, color: cfg.accent,
        letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8,
      }}>
        {cfg.label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#1d1d1f', letterSpacing: -0.3, marginBottom: 6, opacity: 0.7 }}>
        Emplacement disponible
      </div>
      <div style={{ fontSize: 14, color: '#1d1d1f', opacity: 0.55 }}>
        Votre marque ici · Contactez-nous
      </div>
    </div>
  );
}

function GoldCard({ sponsor, cfg }) {
  const Content = (
    <div
      style={{
        background: cfg.gradient, borderRadius: 18, padding: '28px 22px',
        textAlign: 'center', cursor: sponsor.lien ? 'pointer' : 'default',
        transition: 'all 0.4s var(--ease)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 24px 48px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{
        fontSize: 10, fontWeight: 600, color: cfg.accent,
        letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10,
      }}>
        {cfg.label}
      </div>
      <div style={{
        width: 54, height: 54, borderRadius: 14,
        background: 'rgba(255,255,255,0.5)', margin: '0 auto 12px',
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
      }}>
        {sponsor.image_url
          ? <img src={sponsor.image_url} alt={sponsor.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '🏅'
        }
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, color: '#1d1d1f', letterSpacing: -0.3, marginBottom: 6, lineHeight: 1.1 }}>
        {sponsor.nom}
      </div>
      {sponsor.lien && <div className="link link-sm">En savoir plus</div>}
    </div>
  );

  return sponsor.lien
    ? <a href={sponsor.lien} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>{Content}</a>
    : Content;
}

// ─── SILVER / BRONZE ─────────────────────────────────────────────────────────

function CompactPlaceholder({ tier, cfg }) {
  return (
    <div style={{
      background: cfg.gradient, borderRadius: 14, padding: '16px 14px',
      textAlign: 'center', opacity: 0.55,
      minHeight: tier === 'silver' ? 110 : 90,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5,
    }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: cfg.accent, letterSpacing: 1.2, textTransform: 'uppercase' }}>
        {cfg.badge}
      </div>
      <div style={{ fontSize: tier === 'silver' ? 13 : 11, fontWeight: 600, color: '#1d1d1f', opacity: 0.6 }}>
        Emplacement disponible
      </div>
    </div>
  );
}

function CompactCard({ sponsor, tier, cfg }) {
  const Content = (
    <div
      style={{
        background: cfg.gradient, borderRadius: 14, padding: '16px 14px',
        textAlign: 'center', cursor: sponsor.lien ? 'pointer' : 'default',
        transition: 'all 0.3s var(--ease)',
        minHeight: tier === 'silver' ? 110 : 90,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        gap: tier === 'silver' ? 6 : 4,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ fontSize: 9, fontWeight: 600, color: cfg.accent, letterSpacing: 1.2, textTransform: 'uppercase' }}>
        {cfg.badge}
      </div>
      <div style={{
        width: tier === 'silver' ? 38 : 28,
        height: tier === 'silver' ? 38 : 28,
        borderRadius: 9, overflow: 'hidden',
        background: 'rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: tier === 'silver' ? 20 : 14,
      }}>
        {sponsor.image_url
          ? <img src={sponsor.image_url} alt={sponsor.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '🏅'
        }
      </div>
      <div style={{
        fontSize: tier === 'silver' ? 14 : 11, fontWeight: 600, color: '#1d1d1f',
        letterSpacing: -0.2, maxWidth: '100%',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {sponsor.nom}
      </div>
    </div>
  );

  return sponsor.lien
    ? <a href={sponsor.lien} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>{Content}</a>
    : Content;
}

export default SponsorBlock;
