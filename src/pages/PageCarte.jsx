// src/pages/PageCarte.jsx — Carte de l'île + liste des tournois localisés
import { useMemo } from 'react';
import { formatDateFR } from '../lib/dates.js';

// Centre approximatif de La Réunion
const REUNION_CENTER = '-21.1151,55.5364';
const REUNION_BBOX   = '55.16,-21.42,55.84,-20.85';

function PageCarte({ tournois }) {
  // Tournois avec coordonnées, dédupliqués
  const lieux = useMemo(() => {
    const seen = new Map();
    tournois.forEach(t => {
      if (t.latitude && t.longitude) {
        const key = `${t.latitude.toFixed(4)},${t.longitude.toFixed(4)}`;
        if (!seen.has(key)) seen.set(key, t);
      }
    });
    return [...seen.values()];
  }, [tournois]);

  // Centre de la carte
  const center = lieux.length > 0
    ? `${lieux[0].latitude},${lieux[0].longitude}`
    : REUNION_CENTER;

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${REUNION_BBOX}&layer=mapnik&marker=${encodeURIComponent(center)}`;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 16px 60px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>
          Carte des tournois
        </div>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>
          {lieux.length > 0
            ? `${lieux.length} lieu${lieux.length > 1 ? 'x' : ''} géolocalisé${lieux.length > 1 ? 's' : ''}`
            : "Tous les lieux de tournois sur l'île"}
        </div>
      </div>

      <div className="map-wrap">
        <iframe
          title="Carte La Réunion"
          src={mapUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          loading="lazy"
        />
      </div>

      {tournois.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'var(--t3)',
            letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
          }}>
            {tournois.length} tournoi{tournois.length !== 1 ? 's' : ''} référencé{tournois.length !== 1 ? 's' : ''}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...tournois].sort((a, b) => a.date.localeCompare(b.date)).map(t => (
              <div
                key={t.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--s1)', border: '1px solid var(--b1)',
                  borderRadius: 12, padding: '12px 14px',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9, background: 'var(--s3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>🏐</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: 'var(--t1)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {t.nom}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                    📍 {t.lieu}{t.ville && `, ${t.ville}`} · 📅 {formatDateFR(t.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PageCarte;
