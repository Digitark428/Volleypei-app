// src/pages/PageCarte.jsx — Carte Leaflet + liste des tournois localisés
// Leaflet est chargé via CDN dans index.html (window.L).
import { useMemo, useEffect, useRef } from 'react';
import { formatDateFR } from '../lib/dates.js';

// Centre approximatif de La Réunion
const REUNION_CENTER = [-21.1151, 55.5364];
const REUNION_ZOOM   = 10;

/** Attend que window.L soit dispo (Leaflet est en `defer`). */
function waitForLeaflet(maxMs = 4000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function check() {
      if (typeof window !== 'undefined' && window.L) return resolve(window.L);
      if (Date.now() - start > maxMs)               return reject(new Error('Leaflet introuvable'));
      setTimeout(check, 50);
    })();
  });
}

function PageCarte({ tournois }) {
  const mapRef       = useRef(null);  // div container
  const leafletRef   = useRef(null);  // instance Leaflet
  const layerRef     = useRef(null);  // LayerGroup pour markers

  // Tournois géolocalisés (dédupliqués par coords arrondies)
  const lieux = useMemo(() => {
    const seen = new Map();
    tournois.forEach(t => {
      if (t.latitude && t.longitude) {
        const key = `${Number(t.latitude).toFixed(4)},${Number(t.longitude).toFixed(4)}`;
        if (!seen.has(key)) seen.set(key, t);
      }
    });
    return [...seen.values()];
  }, [tournois]);

  // ─── Initialisation Leaflet (une seule fois) ─────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const L = await waitForLeaflet();
        if (cancelled || !mapRef.current || leafletRef.current) return;

        const map = L.map(mapRef.current, {
          center: REUNION_CENTER,
          zoom:   REUNION_ZOOM,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap',
        }).addTo(map);

        leafletRef.current = map;
        layerRef.current   = L.layerGroup().addTo(map);

        // Léger délai pour que le container ait sa hauteur finale (mobile)
        setTimeout(() => map.invalidateSize(), 50);
      } catch (err) {
        console.error('Leaflet init :', err);
      }
    })();

    return () => {
      cancelled = true;
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
        layerRef.current   = null;
      }
    };
  }, []);

  // ─── Re-dessine les markers quand les lieux changent ─────────────────────
  useEffect(() => {
    const L = typeof window !== 'undefined' ? window.L : null;
    if (!L || !leafletRef.current || !layerRef.current) return;

    layerRef.current.clearLayers();

    if (lieux.length === 0) {
      leafletRef.current.setView(REUNION_CENTER, REUNION_ZOOM);
      return;
    }

    const bounds = [];
    lieux.forEach(t => {
      const lat = Number(t.latitude);
      const lng = Number(t.longitude);
      const marker = L.marker([lat, lng]);

      const popupHtml = `
        <div style="font-family:inherit;min-width:170px">
          <div style="font-weight:600;font-size:13px;color:#1d1d1f;margin-bottom:4px">
            ${escapeHtml(t.nom)}
          </div>
          <div style="font-size:11px;color:#6e6e73;line-height:1.5">
            📅 ${escapeHtml(formatDateFR(t.date))}${t.heure ? ` · 🕒 ${escapeHtml(t.heure)}` : ''}<br/>
            📍 ${escapeHtml(t.lieu)}${t.ville ? `, ${escapeHtml(t.ville)}` : ''}
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);
      marker.addTo(layerRef.current);
      bounds.push([lat, lng]);
    });

    if (bounds.length === 1) {
      leafletRef.current.setView(bounds[0], 13);
    } else {
      leafletRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [lieux]);

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
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {tournois.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'var(--t3)',
            letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
          }}>
            {tournois.length} tournoi{tournois.length !== 1 ? 's' : ''} référencé{tournois.length !== 1 ? 's' : ''}
            {lieux.length < tournois.length && (
              <span style={{ color: 'var(--t4)', textTransform: 'none', letterSpacing: 0, marginLeft: 6, fontWeight: 400 }}>
                · {tournois.length - lieux.length} sans localisation
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...tournois].sort((a, b) => a.date.localeCompare(b.date)).map(t => {
              const localized = !!(t.latitude && t.longitude);
              return (
                <div
                  key={t.id}
                  onClick={() => localized && focusOn(leafletRef.current, t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--s1)', border: '1px solid var(--b1)',
                    borderRadius: 12, padding: '12px 14px',
                    cursor: localized ? 'pointer' : 'default',
                    opacity: localized ? 1 : 0.7,
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
                      {!localized && <span style={{ marginLeft: 6, color: 'var(--t4)' }}>· non localisé</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** Recentre la map sur un tournoi et ouvre son popup. */
function focusOn(map, t) {
  if (!map || !t.latitude || !t.longitude) return;
  const lat = Number(t.latitude);
  const lng = Number(t.longitude);
  map.setView([lat, lng], 14, { animate: true });
  // scroll vers la carte (mobile : la liste est sous la carte)
  const el = document.querySelector('.map-wrap');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default PageCarte;
