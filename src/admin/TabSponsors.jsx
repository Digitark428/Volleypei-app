// src/admin/TabSponsors.jsx — Gestion complète des sponsors (CRUD + workflow + galerie)
import { useRef, useState } from 'react';
import { SPONSOR_TIERS, STATUS } from '../lib/constants.js';

const TIER_OPTIONS = [
  { value: SPONSOR_TIERS.GOLD,   label: 'Gold' },
  { value: SPONSOR_TIERS.SILVER, label: 'Silver' },
  { value: SPONSOR_TIERS.BRONZE, label: 'Bronze' },
];

// ─── En-tête : places disponibles par tier ──────────────────────────────────
function PlacesHeader({ places }) {
  const items = [
    { tier: 'gold',   label: 'Gold',   color: '#92400e', bg: 'linear-gradient(180deg,#fef3c7,#fde68a)' },
    { tier: 'silver', label: 'Silver', color: '#4b5563', bg: 'linear-gradient(180deg,#f3f4f6,#e5e7eb)' },
    { tier: 'bronze', label: 'Bronze', color: '#9a3412', bg: 'linear-gradient(180deg,#fed7aa,#fdba74)' },
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: 10, marginBottom: 20,
    }}>
      {items.map(({ tier, label, color, bg }) => {
        const p = places?.[tier] || { used: 0, total: 0 };
        const remaining = Math.max(0, p.total - p.used);
        const pct = p.total > 0 ? Math.min(100, (p.used / p.total) * 100) : 0;
        return (
          <div key={tier} style={{
            background: bg, borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color, letterSpacing: 1.2,
              textTransform: 'uppercase', marginBottom: 6,
            }}>
              {label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1d1d1f', lineHeight: 1.1 }}>
              {p.used} <span style={{ fontSize: 14, fontWeight: 600, color: '#6e6e73' }}>/ {p.total}</span>
            </div>
            <div style={{ fontSize: 11, color, opacity: 0.85, marginTop: 2 }}>
              {remaining} place{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}
            </div>
            <div style={{
              marginTop: 8, height: 4, borderRadius: 2,
              background: 'rgba(0,0,0,0.08)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: color, borderRadius: 2,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Galerie d'images d'un sponsor (multi-upload, reorder, delete) ─────────
function SponsorGallery({ sponsor, onUploadMultiple, onRemoveImage, onReorderImage }) {
  const inputRef = useRef(null);
  const images = Array.isArray(sponsor.images) ? sponsor.images : [];

  return (
    <div>
      <label className="lbl">Galerie photos ({images.length})</label>

      {images.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: 8, marginBottom: 10,
        }}>
          {images.map((url, idx) => (
            <div
              key={url}
              style={{
                position: 'relative', aspectRatio: '1/1',
                borderRadius: 8, overflow: 'hidden',
                border: idx === 0 ? '2px solid var(--blue)' : '1px solid var(--b1)',
                background: 'var(--s2)',
              }}
              title={idx === 0 ? 'Photo principale' : ''}
            >
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

              {/* Badge "1" pour la principale */}
              {idx === 0 && (
                <div style={{
                  position: 'absolute', top: 3, left: 3,
                  background: 'var(--blue)', color: 'white',
                  fontSize: 9, fontWeight: 700,
                  padding: '2px 5px', borderRadius: 4,
                  letterSpacing: 0.3,
                }}>
                  PRINCIPALE
                </div>
              )}

              {/* Boutons reorder + delete (overlay au hover/tap) */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                padding: 4, gap: 2,
                background: 'linear-gradient(180deg,rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)',
              }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button
                    onClick={() => onReorderImage(sponsor.id, url, -1)}
                    disabled={idx === 0}
                    title="Avancer"
                    style={galleryBtnStyle(idx === 0)}
                  >‹</button>
                  <button
                    onClick={() => onReorderImage(sponsor.id, url, +1)}
                    disabled={idx === images.length - 1}
                    title="Reculer"
                    style={galleryBtnStyle(idx === images.length - 1)}
                  >›</button>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Supprimer cette photo de la galerie ?')) {
                      onRemoveImage(sponsor.id, url);
                    }
                  }}
                  title="Supprimer"
                  style={{
                    ...galleryBtnStyle(false),
                    background: 'rgba(220,38,38,0.92)', color: 'white',
                  }}
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="upzone" style={{ minHeight: 60, padding: '10px 14px' }}>
        <span style={{ fontSize: 18 }}>📷</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--blue2)' }}>
          {images.length === 0 ? 'Ajouter des photos' : 'Ajouter d\'autres photos'}
        </span>
        <span style={{ fontSize: 10, color: 'var(--t3)' }}>
          Multi-sélection acceptée · JPG / PNG
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={async e => {
            const files = e.target.files;
            if (files && files.length > 0) {
              await onUploadMultiple(sponsor.id, files);
            }
            // reset pour pouvoir re-uploader le même fichier ensuite
            if (inputRef.current) inputRef.current.value = '';
          }}
        />
      </label>
    </div>
  );
}

function galleryBtnStyle(disabled) {
  return {
    width: 20, height: 20, borderRadius: 4,
    background: 'rgba(255,255,255,0.92)', color: '#1d1d1f',
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 14, lineHeight: 1, padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: disabled ? 0.4 : 1,
    fontFamily: 'inherit', fontWeight: 700,
  };
}

// ─── Card d'un sponsor ──────────────────────────────────────────────────────
function SponsorRow({ sponsor, onPatch, onDelete, onApprove, onReject,
                     onUploadMultiple, onRemoveImage, onReorderImage }) {
  const isPending  = sponsor.status === STATUS.PENDING;
  const isRejected = sponsor.status === STATUS.REJECTED;
  const isApproved = sponsor.status === STATUS.APPROVED;

  const statusColor = isPending ? '#d97706' : isApproved ? '#16a34a' : '#dc2626';
  const statusBg    = isPending ? '#fef3c7' : isApproved ? '#dcfce7' : '#fee2e2';
  const statusLabel = isPending ? 'En attente' : isApproved ? 'Validé' : 'Refusé';

  return (
    <div className="sp-slot">
      {/* En-tête : tier + statut + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: sponsor.actif ? 'var(--green)' : 'var(--t4)',
            }} />
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--t3)',
              textTransform: 'uppercase', letterSpacing: 0.8,
            }}>
              {sponsor.type}
            </span>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, color: statusColor,
            background: statusBg, padding: '3px 8px', borderRadius: 980,
            letterSpacing: 0.5, textTransform: 'uppercase',
          }}>
            {statusLabel}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isPending && (
            <>
              <button
                onClick={() => onApprove(sponsor.id)}
                style={{
                  background: 'var(--green)', color: 'white',
                  border: 'none', borderRadius: 8, padding: '6px 12px',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                ✓ Valider
              </button>
              <button
                onClick={() => onReject(sponsor.id)}
                style={{
                  background: 'none', border: '1px solid var(--b1)',
                  borderRadius: 8, padding: '6px 12px',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  color: 'var(--t2)', fontFamily: 'inherit',
                }}
              >
                Refuser
              </button>
            </>
          )}
          {isRejected && (
            <button
              onClick={() => onApprove(sponsor.id)}
              style={{
                background: 'none', border: '1px solid var(--b1)',
                borderRadius: 8, padding: '6px 12px',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                color: 'var(--t2)', fontFamily: 'inherit',
              }}
            >
              Re-valider
            </button>
          )}
          <button
            onClick={() => onDelete(sponsor.id)}
            style={{
              background: 'none', border: 'none', color: 'var(--red)',
              fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Supprimer
          </button>
        </div>
      </div>

      {/* Champs principaux */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 14 }}>
        <div>
          <label className="lbl">Nom</label>
          <input
            type="text"
            value={sponsor.nom || ''}
            onChange={e => onPatch(sponsor.id, { nom: e.target.value })}
            className="field"
            style={{ fontSize: 12, padding: '9px 11px' }}
          />
        </div>
        <div>
          <label className="lbl">Type</label>
          <select
            value={sponsor.type}
            onChange={e => onPatch(sponsor.id, { type: e.target.value })}
            className="field"
            style={{ fontSize: 12, padding: '9px 11px' }}
          >
            {TIER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div style={{ gridColumn: '1/-1' }}>
          <label className="lbl">Slogan (court)</label>
          <input
            type="text"
            value={sponsor.slogan || ''}
            onChange={e => onPatch(sponsor.id, { slogan: e.target.value })}
            className="field"
            placeholder="Donne des ailes"
            style={{ fontSize: 12, padding: '9px 11px' }}
          />
        </div>

        <div style={{ gridColumn: '1/-1' }}>
          <label className="lbl">Description de l'offre</label>
          <textarea
            rows={3}
            value={sponsor.description_offre || ''}
            onChange={e => onPatch(sponsor.id, { description_offre: e.target.value })}
            className="field"
            placeholder="Détaille ce que ce sponsor propose, ses avantages, etc."
            style={{ fontSize: 12, padding: '9px 11px', resize: 'vertical' }}
          />
        </div>

        <div style={{ gridColumn: '1/-1' }}>
          <label className="lbl">Lien site web</label>
          <input
            type="text"
            value={sponsor.lien || ''}
            onChange={e => onPatch(sponsor.id, { lien: e.target.value })}
            className="field"
            placeholder="https://…"
            style={{ fontSize: 12, padding: '9px 11px' }}
          />
        </div>
        <div>
          <label className="lbl">Ordre</label>
          <input
            type="number"
            value={sponsor.ordre || 0}
            onChange={e => onPatch(sponsor.id, { ordre: parseInt(e.target.value) || 0 })}
            className="field"
            style={{ fontSize: 12, padding: '9px 11px' }}
          />
        </div>
        <div>
          <label className="lbl">Visibilité</label>
          <select
            value={sponsor.actif ? '1' : '0'}
            onChange={e => onPatch(sponsor.id, { actif: e.target.value === '1' })}
            className="field"
            style={{ fontSize: 12, padding: '9px 11px' }}
          >
            <option value="1">Visible</option>
            <option value="0">Masqué</option>
          </select>
        </div>
      </div>

      {/* Galerie */}
      <SponsorGallery
        sponsor={sponsor}
        onUploadMultiple={onUploadMultiple}
        onRemoveImage={onRemoveImage}
        onReorderImage={onReorderImage}
      />
    </div>
  );
}

// ─── Tab principal ──────────────────────────────────────────────────────────
function TabSponsors({
  sponsors,
  places,
  onPatch, onDelete, onApprove, onReject,
  onUploadMultiple, onRemoveImage, onReorderImage,
  onAddNew,
}) {
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('all'); // all | pending | approved | rejected

  async function handleAdd() {
    setAdding(true);
    try { await onAddNew(); }
    finally { setAdding(false); }
  }

  const filtered = filter === 'all'
    ? sponsors
    : sponsors.filter(s => s.status === filter);

  const counts = {
    all:      sponsors.length,
    pending:  sponsors.filter(s => s.status === STATUS.PENDING).length,
    approved: sponsors.filter(s => s.status === STATUS.APPROVED).length,
    rejected: sponsors.filter(s => s.status === STATUS.REJECTED).length,
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6 }}>
            Gestion des sponsors
          </div>
          <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 4 }}>
            Validez les nouveaux sponsors, ajoutez des photos, gérez les emplacements.
          </div>
        </div>
        <button onClick={handleAdd} className="btn btn-w btn-sm" disabled={adding}>
          + Nouveau sponsor
        </button>
      </div>

      {/* Places disponibles */}
      <PlacesHeader places={places} />

      {/* Filtre statut */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'all',      label: 'Tous' },
          { key: 'pending',  label: 'En attente' },
          { key: 'approved', label: 'Validés' },
          { key: 'rejected', label: 'Refusés' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '6px 12px', borderRadius: 980,
              border: '1px solid ' + (filter === key ? 'var(--t1)' : 'var(--b1)'),
              background: filter === key ? 'var(--t1)' : 'transparent',
              color: filter === key ? 'white' : 'var(--t2)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {label} <span style={{ opacity: 0.65, marginLeft: 4 }}>{counts[key]}</span>
          </button>
        ))}
      </div>

      <div>
        {filtered.length === 0 ? (
          <div style={{
            background: 'var(--s1)', border: '1px solid var(--b1)',
            borderRadius: 14, padding: '48px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🏅</div>
            <div style={{ color: 'var(--t3)', fontSize: 14 }}>
              {filter === 'all'
                ? 'Aucun sponsor pour l\'instant. Cliquez sur "Nouveau sponsor" pour en ajouter.'
                : `Aucun sponsor avec le statut "${filter}".`}
            </div>
          </div>
        ) : (
          filtered.map(s => (
            <SponsorRow
              key={s.id}
              sponsor={s}
              onPatch={onPatch}
              onDelete={onDelete}
              onApprove={onApprove}
              onReject={onReject}
              onUploadMultiple={onUploadMultiple}
              onRemoveImage={onRemoveImage}
              onReorderImage={onReorderImage}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TabSponsors;
