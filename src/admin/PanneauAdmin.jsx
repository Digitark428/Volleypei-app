// src/admin/PanneauAdmin.jsx — Orchestrateur de l'espace admin
//
// v9 : plus de système de validation pending/approved.
//      L'admin peut : supprimer/modifier des tournois, gérer les sponsors, voir les visites.

import { useState, useEffect, useCallback } from 'react';
import { LOGO_B64 } from '../lib/logo.js';
import {
  fetchTournois, deleteTournoi,
  fetchVisitStats,
  fetchAllSponsors, createSponsor, updateSponsor, deleteSponsor,
  approveSponsor, rejectSponsor, uploadSponsorImages,
  uploadImage,
} from '../services/index.js';
import { SPONSOR_TIERS, SPONSOR_CAPACITY } from '../lib/constants.js';
import TabTournois from './TabTournois.jsx';
import TabSponsors from './TabSponsors.jsx';
import TabVisits   from './TabVisits.jsx';

const TABS = [
  { key: 'tournois', label: 'Tournois' },
  { key: 'sponsors', label: 'Sponsors' },
  { key: 'visites',  label: 'Visites'  },
];

function PanneauAdmin({ onBack, onLogout }) {
  const [tab, setTab]           = useState('tournois');
  const [allTournois, setAll]   = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [visites, setVisites]   = useState(null);

  const reload = useCallback(async () => {
    try {
      const [all, sp, v] = await Promise.all([
        fetchTournois(),
        fetchAllSponsors(),
        fetchVisitStats(30),
      ]);
      setAll(all);
      setSponsors(sp);
      setVisites(v);
    } catch (err) {
      console.error('Chargement admin :', err);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // ─── Tournois ─────────────────────────────────────────────────────────────
  const handleDeleteTournoi = useCallback(async (id) => {
    if (!window.confirm('Supprimer définitivement ce tournoi ?')) return;
    try { await deleteTournoi(id); await reload(); }
    catch (err) { alert('Erreur : ' + err.message); }
  }, [reload]);

  // ─── Sponsors ─────────────────────────────────────────────────────────────
  const handleAddSponsor = useCallback(async () => {
    try {
      await createSponsor({
        nom: 'Nouveau sponsor',
        type: SPONSOR_TIERS.BRONZE,
        slogan: '',
        description_offre: '',
        image_url: null,
        images: [],
        lien: '',
        actif: true,
        ordre: sponsors.length,
      });
      await reload();
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  }, [reload, sponsors.length]);

  const handlePatchSponsor = useCallback(async (id, patch) => {
    setSponsors(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    try {
      await updateSponsor(id, patch);
    } catch (err) {
      alert('Erreur : ' + err.message);
      await reload();
    }
  }, [reload]);

  const handleDeleteSponsor = useCallback(async (id) => {
    if (!window.confirm('Supprimer ce sponsor ?')) return;
    try { await deleteSponsor(id); await reload(); }
    catch (err) { alert('Erreur : ' + err.message); }
  }, [reload]);

  const handleApproveSponsor = useCallback(async (id) => {
    try { await approveSponsor(id); await reload(); }
    catch (err) { alert('Erreur : ' + err.message); }
  }, [reload]);

  const handleRejectSponsor = useCallback(async (id) => {
    if (!window.confirm('Refuser ce sponsor ?')) return;
    try { await rejectSponsor(id); await reload(); }
    catch (err) { alert('Erreur : ' + err.message); }
  }, [reload]);

  const handleUploadSponsorImage = useCallback(async (id, file) => {
    try {
      const url = await uploadImage(file, 'sponsors');
      await updateSponsor(id, { image_url: url });
      await reload();
    } catch (err) {
      alert('Erreur upload : ' + err.message);
    }
  }, [reload]);

  const handleUploadSponsorImages = useCallback(async (id, files) => {
    if (!files || files.length === 0) return;
    try {
      const urls = await uploadSponsorImages([...files]);
      if (urls.length === 0) return;
      const sponsor = sponsors.find(s => s.id === id);
      const existing = Array.isArray(sponsor?.images) ? sponsor.images : [];
      const merged = [...existing, ...urls];
      const patch = { images: merged };
      if (!sponsor?.image_url && merged.length > 0) patch.image_url = merged[0];
      await updateSponsor(id, patch);
      await reload();
    } catch (err) {
      alert('Erreur upload : ' + err.message);
    }
  }, [reload, sponsors]);

  const handleRemoveSponsorImage = useCallback(async (id, url) => {
    const sponsor = sponsors.find(s => s.id === id);
    if (!sponsor) return;
    const existing = Array.isArray(sponsor.images) ? sponsor.images : [];
    const next = existing.filter(u => u !== url);
    const patch = { images: next };
    if (sponsor.image_url === url) patch.image_url = next[0] || null;
    await handlePatchSponsor(id, patch);
  }, [sponsors, handlePatchSponsor]);

  const handleReorderSponsorImage = useCallback(async (id, url, delta) => {
    const sponsor = sponsors.find(s => s.id === id);
    if (!sponsor) return;
    const arr = Array.isArray(sponsor.images) ? [...sponsor.images] : [];
    const idx = arr.indexOf(url);
    if (idx < 0) return;
    const newIdx = Math.max(0, Math.min(arr.length - 1, idx + delta));
    if (newIdx === idx) return;
    arr.splice(idx, 1);
    arr.splice(newIdx, 0, url);
    await handlePatchSponsor(id, { images: arr });
  }, [sponsors, handlePatchSponsor]);

  // ─── Places disponibles par tier ─────────────────────────────────────────
  const sponsorPlaces = {
    gold:   { used: sponsors.filter(s => s.type === 'gold'   && s.status === 'approved').length, total: SPONSOR_CAPACITY.gold   },
    silver: { used: sponsors.filter(s => s.type === 'silver' && s.status === 'approved').length, total: SPONSOR_CAPACITY.silver },
    bronze: { used: sponsors.filter(s => s.type === 'bronze' && s.status === 'approved').length, total: SPONSOR_CAPACITY.bronze },
  };

  const counts = {
    tournois: allTournois.length,
    sponsors: sponsors.filter(s => s.status === 'approved' && s.actif).length,
    visites:  visites?.moyenne ?? 0,
  };

  return (
    <div className="adm-page">
      <nav className="nav">
        <div className="nav-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={LOGO_B64} alt="" style={{ width: 28, height: 28, borderRadius: 7 }} />
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }} className="nl">
              Admin
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={onBack}>← Calendrier</button>
            <button
              className="btn-reject"
              onClick={() => {
                if (window.confirm("Se déconnecter de l'espace admin ?")) onLogout?.();
              }}
              style={{ padding: '7px 14px', fontSize: 12 }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div style={{ background: 'var(--s1)', borderBottom: '1px solid var(--b1)' }}>
        <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 16px', display: 'flex', overflowX: 'auto' }}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`adm-tab ${tab === key ? 'on' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
              <span className={`adm-badge ${tab === key ? 'on' : ''}`}>{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="adm-wrap">
        {tab === 'tournois' && <TabTournois tournois={allTournois} onDelete={handleDeleteTournoi} />}
        {tab === 'sponsors' && (
          <TabSponsors
            sponsors={sponsors}
            places={sponsorPlaces}
            onPatch={handlePatchSponsor}
            onDelete={handleDeleteSponsor}
            onUpload={handleUploadSponsorImage}
            onUploadMultiple={handleUploadSponsorImages}
            onRemoveImage={handleRemoveSponsorImage}
            onReorderImage={handleReorderSponsorImage}
            onApprove={handleApproveSponsor}
            onReject={handleRejectSponsor}
            onAddNew={handleAddSponsor}
          />
        )}
        {tab === 'visites' && <TabVisits stats={visites} />}
      </div>
    </div>
  );
}

export default PanneauAdmin;
