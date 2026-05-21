// src/components/SponsorBlock.jsx — Bloc sponsor pour un tier (gold | silver | bronze)
// Format "photo-dominant" : grande image, overlay nom + slogan, CTA.
// Au clic → onClick(sponsor) (handled par le parent qui ouvre la modal détaillée).
// Affiche un emplacement disponible si `placeholder=true`.

const TIER_CFG = {
  gold: {
    label: 'Partenaire Gold',
    accent: '#92400e',
    bgEmpty: 'linear-gradient(180deg,#fef3c7,#fde68a)',
    borderEmpty: '1px dashed rgba(146,64,14,0.25)',
    badge: 'GOLD',
  },
  silver: {
    label: 'Partenaire Silver',
    accent: '#4b5563',
    bgEmpty: 'linear-gradient(180deg,#f3f4f6,#e5e7eb)',
    borderEmpty: '1px dashed rgba(75,85,99,0.25)',
    badge: 'SILVER',
  },
  bronze: {
    label: 'Partenaire Bronze',
    accent: '#9a3412',
    bgEmpty: 'linear-gradient(180deg,#fed7aa,#fdba74)',
    borderEmpty: '1px dashed rgba(154,52,18,0.25)',
    badge: 'BRONZE',
  },
};

function SponsorBlock({ sponsor, tier, placeholder, onClick }) {
  const cfg = TIER_CFG[tier] || TIER_CFG.bronze;
  if (!sponsor && !placeholder) return null;

  // GOLD : grand format premium photo-dominant
  if (tier === 'gold') {
    return placeholder
      ? <GoldPlaceholder cfg={cfg} />
      : <GoldCard sponsor={sponsor} cfg={cfg} onClick={onClick} />;
  }

  // SILVER / BRONZE : format compact mais photo dominante
  return placeholder
    ? <CompactPlaceholder tier={tier} cfg={cfg} />
    : <CompactCard sponsor={sponsor} tier={tier} cfg={cfg} onClick={onClick} />;
}

// Renvoie la 1re image dispo (image_url → première de la galerie → null)
function pickCover(sponsor) {
  if (sponsor.image_url) return sponsor.image_url;
  if (Array.isArray(sponsor.images) && sponsor.images.length > 0) return sponsor.images[0];
  return null;
}

// ─── GOLD ────────────────────────────────────────────────────────────────────

function GoldPlaceholder({ cfg }) {
  return (
    <div style={{
      background: cfg.bgEmpty, borderRadius: 18, padding: '28px 22px',
      textAlign: 'center', opacity: 0.6, border: cfg.borderEmpty,
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

function GoldCard({ sponsor, cfg, onClick }) {
  const cover = pickCover(sponsor);

  return (
    <div
      className="sponsor-hero"
      onClick={() => onClick?.(sponsor)}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick?.(sponsor)}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        aspectRatio: '16/9',
        background: cover ? '#1d1d1f' : cfg.bgEmpty,
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.08)',
      }}
    >
      {cover ? (
        <img
          src={cover}
          alt={sponsor.nom}
          loading="lazy"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.6s var(--ease)',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60,
        }}>🏅</div>
      )}

      {/* Overlay gradient bas */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.78) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Badge tier en haut à gauche */}
      <div style={{
        position: 'absolute', top: 14, left: 14,
        background: 'rgba(255,255,255,0.92)', color: cfg.accent,
        fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
        padding: '5px 10px', borderRadius: 980,
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      }}>
        ★ {cfg.badge}
      </div>

      {/* Contenu en bas (nom + slogan + CTA) */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '20px 22px 22px',
        color: 'white',
      }}>
        <div style={{
          fontSize: 'clamp(20px, 3.4vw, 30px)',
          fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.1,
          marginBottom: sponsor.slogan ? 6 : 10,
          textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }}>
          {sponsor.nom}
        </div>
        {sponsor.slogan && (
          <div style={{
            fontSize: 14, fontWeight: 400, opacity: 0.92, marginBottom: 12,
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}>
            {sponsor.slogan}
          </div>
        )}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.18)', color: 'white',
          fontSize: 12, fontWeight: 500,
          padding: '6px 14px', borderRadius: 980,
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}>
          Découvrir →
        </span>
      </div>
    </div>
  );
}

// ─── SILVER / BRONZE ─────────────────────────────────────────────────────────

function CompactPlaceholder({ tier, cfg }) {
  return (
    <div style={{
      background: cfg.bgEmpty, borderRadius: 14, padding: '16px 14px',
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

function CompactCard({ sponsor, tier, cfg, onClick }) {
  const cover = pickCover(sponsor);

  return (
    <div
      onClick={() => onClick?.(sponsor)}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick?.(sponsor)}
      style={{
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        aspectRatio: tier === 'silver' ? '4/5' : '1/1',
        minHeight: tier === 'silver' ? 130 : 110,
        background: cover ? '#1d1d1f' : cfg.bgEmpty,
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)',
        transition: 'transform 0.25s var(--ease), box-shadow 0.25s var(--ease)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)'; }}
    >
      {cover ? (
        <img
          src={cover}
          alt={sponsor.nom}
          loading="lazy"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: tier === 'silver' ? 32 : 26,
        }}>🏅</div>
      )}

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.72) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute', top: 8, left: 8,
        background: 'rgba(255,255,255,0.92)', color: cfg.accent,
        fontSize: 8.5, fontWeight: 700, letterSpacing: 1.2,
        padding: '3px 7px', borderRadius: 980,
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      }}>
        {cfg.badge}
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: tier === 'silver' ? '10px 12px 11px' : '8px 10px 9px',
        color: 'white',
      }}>
        <div style={{
          fontSize: tier === 'silver' ? 14 : 12,
          fontWeight: 600, letterSpacing: -0.2, lineHeight: 1.15,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          textShadow: '0 1px 3px rgba(0,0,0,0.45)',
        }}>
          {sponsor.nom}
        </div>
        {sponsor.slogan && tier === 'silver' && (
          <div style={{
            fontSize: 11, opacity: 0.92, marginTop: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textShadow: '0 1px 3px rgba(0,0,0,0.45)',
          }}>
            {sponsor.slogan}
          </div>
        )}
      </div>
    </div>
  );
}

export default SponsorBlock;
