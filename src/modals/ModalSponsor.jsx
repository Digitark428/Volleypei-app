// src/modals/ModalSponsor.jsx — Détail d'un sponsor avec galerie et CTA
// Style : cohérent avec le thème clair Apple existant (décision user).
import { useState, useMemo, useEffect, useCallback } from 'react';

const TIER_CFG = {
  gold:   { label: 'Partenaire Gold',   badge: 'GOLD',   accent: '#92400e' },
  silver: { label: 'Partenaire Silver', badge: 'SILVER', accent: '#4b5563' },
  bronze: { label: 'Partenaire Bronze', badge: 'BRONZE', accent: '#9a3412' },
};

function ModalSponsor({ sponsor, onClose }) {
  const cfg = TIER_CFG[sponsor?.type] || TIER_CFG.bronze;

  // Galerie = images[] complétée par image_url si elle n'y est pas déjà
  const gallery = useMemo(() => {
    if (!sponsor) return [];
    const arr = Array.isArray(sponsor.images) ? [...sponsor.images] : [];
    if (sponsor.image_url && !arr.includes(sponsor.image_url)) {
      arr.unshift(sponsor.image_url);
    }
    return arr.filter(Boolean);
  }, [sponsor]);

  const [idx, setIdx] = useState(0);

  const next = useCallback(() => {
    if (gallery.length <= 1) return;
    setIdx(i => (i + 1) % gallery.length);
  }, [gallery.length]);

  const prev = useCallback(() => {
    if (gallery.length <= 1) return;
    setIdx(i => (i - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  // Clavier : flèches gauche/droite + Échap
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape')     onClose?.();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, onClose]);

  if (!sponsor) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 560, padding: 0, overflow: 'hidden' }}
      >
        {/* ─── Galerie ─────────────────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          background: '#1d1d1f',
          aspectRatio: '16/10',
          overflow: 'hidden',
        }}>
          {gallery.length > 0 ? (
            <img
              src={gallery[idx]}
              alt={sponsor.nom}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                animation: 'fadeImg 0.35s var(--ease)',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 60, color: 'rgba(255,255,255,0.4)',
            }}>🏅</div>
          )}

          {/* Boutons précédent / suivant */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Photo précédente"
                style={navArrowStyle('left')}
              >‹</button>
              <button
                onClick={next}
                aria-label="Photo suivante"
                style={navArrowStyle('right')}
              >›</button>

              {/* Indicateurs */}
              <div style={{
                position: 'absolute', bottom: 12, left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex', gap: 6,
                background: 'rgba(0,0,0,0.4)', borderRadius: 980, padding: '5px 10px',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              }}>
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    aria-label={`Photo ${i + 1}`}
                    style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: i === idx ? 'white' : 'rgba(255,255,255,0.45)',
                      border: 'none', cursor: 'pointer', padding: 0,
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badge tier */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: 'rgba(255,255,255,0.92)', color: cfg.accent,
            fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
            padding: '5px 11px', borderRadius: 980,
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            ★ {cfg.badge}
          </div>

          {/* Bouton close */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', color: 'white',
              border: 'none', cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            }}
          >×</button>
        </div>

        {/* ─── Contenu ─────────────────────────────────────────────────── */}
        <div style={{ padding: '24px 28px 28px' }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: 'var(--t1)', marginBottom: 4 }}>
            {sponsor.nom}
          </div>
          {sponsor.slogan && (
            <div style={{ fontSize: 15, color: 'var(--t3)', fontStyle: 'italic', marginBottom: 18 }}>
              « {sponsor.slogan} »
            </div>
          )}

          {sponsor.description_offre && (
            <div style={{
              fontSize: 14, color: 'var(--t2)', lineHeight: 1.6,
              padding: 16, background: 'var(--s3)', borderRadius: 12,
              marginBottom: 18, whiteSpace: 'pre-wrap',
            }}>
              {sponsor.description_offre}
            </div>
          )}

          {sponsor.lien ? (
            <a
              href={sponsor.lien}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-w"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                width: '100%', justifyContent: 'center',
                padding: '13px 22px', fontSize: 15, fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Visiter le site →
            </a>
          ) : (
            <button
              className="btn btn-ghost"
              onClick={onClose}
              style={{ width: '100%', padding: '13px 22px', fontSize: 15 }}
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function navArrowStyle(side) {
  return {
    position: 'absolute', top: '50%', [side]: 10,
    transform: 'translateY(-50%)',
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(0,0,0,0.45)', color: 'white',
    border: 'none', cursor: 'pointer',
    fontSize: 22, lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    transition: 'background 0.15s',
  };
}

export default ModalSponsor;
