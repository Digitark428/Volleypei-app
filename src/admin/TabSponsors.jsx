// src/admin/TabSponsors.jsx — Gestion des sponsors (CRUD Supabase)
import { useState } from 'react';
import { SPONSOR_TIERS } from '../lib/constants.js';
import { uploadImage } from '../services/storage.js';

const TIER_OPTIONS = [
  { value: SPONSOR_TIERS.GOLD,   label: 'Gold' },
  { value: SPONSOR_TIERS.SILVER, label: 'Silver' },
  { value: SPONSOR_TIERS.BRONZE, label: 'Bronze' },
];

function SponsorRow({ sponsor, onPatch, onDelete, onUpload }) {
  return (
    <div className="sp-slot">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: sponsor.actif ? 'var(--green)' : 'var(--t4)',
          }} />
          <span style={{
            fontSize: 11, fontWeight: 600, color: 'var(--t3)',
            textTransform: 'uppercase', letterSpacing: 0.8,
          }}>
            {sponsor.type}
          </span>
        </div>
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

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div>
          <div className="sp-prev">
            {sponsor.image_url ? <img src={sponsor.image_url} alt="" /> : '🖼️'}
          </div>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
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
            <label className="lbl">Lien (optionnel)</label>
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
            <label className="lbl">Actif</label>
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
          <div style={{ gridColumn: '1/-1' }}>
            <label className="lbl">Photo</label>
            <label className="upzone">
              <span style={{ fontSize: 20 }}>📁</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--blue2)' }}>
                {sponsor.image_url ? 'Changer' : 'Choisir une photo'}
              </span>
              <span style={{ fontSize: 10, color: 'var(--t3)' }}>JPG, PNG · 1000×1000px</span>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && onUpload(sponsor.id, e.target.files[0])}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabSponsors({ sponsors, onPatch, onDelete, onUpload, onAddNew }) {
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    setAdding(true);
    try {
      await onAddNew();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6 }}>
            Gestion des sponsors
          </div>
          <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 4 }}>
            Photo carrée recommandée (1000×1000px). Sponsors actifs visibles sur la page d'accueil.
          </div>
        </div>
        <button onClick={handleAdd} className="btn btn-w btn-sm" disabled={adding}>
          + Nouveau sponsor
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        {sponsors.length === 0 ? (
          <div style={{
            background: 'var(--s1)', border: '1px solid var(--b1)',
            borderRadius: 14, padding: '48px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🏅</div>
            <div style={{ color: 'var(--t3)', fontSize: 14 }}>
              Aucun sponsor pour l'instant. Cliquez sur "Nouveau sponsor" pour en ajouter.
            </div>
          </div>
        ) : (
          sponsors.map(s => (
            <SponsorRow
              key={s.id}
              sponsor={s}
              onPatch={onPatch}
              onDelete={onDelete}
              onUpload={onUpload}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TabSponsors;
