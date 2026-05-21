// src/admin/PanneauAdmin.jsx — Orchestrateur de l'espace admin
import { useState, useEffect, useCallback } from 'react';
import { LOGO_B64 } from '../lib/logo.js';
import {
  fetchAllTournois, fetchPendingTournois,
  approveTournoi, rejectTournoi, deleteTournoi,
  fetchVisitStats,
  fetchAllSponsors, createSponsor, updateSponsor, deleteSponsor,
  uploadImage,
} from '../services/index.js';
import { SPONSOR_TIERS } from '../lib/constants.js';
import TabPending  from './TabPending.jsx';
import TabTournois from './TabTournois.jsx';
import TabSponsors from './TabSponsors.jsx';
import TabVisits   from './TabVisits.jsx';

const TABS = [
  { key: 'pending',  label: 'En attente' },
  { key: 'tournois', label: 'Tournois' },
  { key: 'sponsors', label: 'Sponsors' },
  { key: 'visites',  label: 'Visites' },
];

function PanneauAdmin({ onBack }) {
  const [tab, setTab]               = useState('pending');
  const [pending, setPending]       = useState([]);
  const [allTournois, setAll]       = useState([]);
  const [sponsors, setSponsors]     = useState([]);
  const [visites, setVisites]       = useState(null);

  const reload = useCallback(async () => {
    try {
      const [p, all, sp, v] = await Promise.all([
        fetchPendingTournois(),
        fetchAllTournois(),
        fetchAllSponsors(),
        fetchVisitStats(30),
      ]);
      setPending(p);
      setAll(all);
      setSponsors(sp);
      setVisites(v);
    } catch (err) {
      console.error('Chargement admin :', err);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // ─── Tournois ─────────────────────────────────────────────────────────────
  const handleApprove = useCallback(async (id) => {
    try { await approveTournoi(id); await reload(); }
    catch (err) { alert("Erreur : " + err.message); }
  }, [reload]);

  const handleReject = useCallback(async (id) => {
    if (!window.confirm("Refuser ce tournoi ?")) return;
    try { await rejectTournoi(id); await reload(); }
    catch (err) { alert("Erreur : " + err.message); }
  }, [reload]);

  const handleDeleteTournoi = useCallback(async (id) => {
    if (!window.confirm("Supprimer définitivement ce tournoi ?")) return;
    try { await deleteTournoi(id); await reload(); }
    catch (err) { alert("Erreur : " + err.message); }
  }, [reload]);

  // ─── Sponsors ─────────────────────────────────────────────────────────────
  const handleAddSponsor = useCallback(async () => {
    try {
      await createSponsor({
        nom: 'Nouveau sponsor',
        type: SPONSOR_TIERS.BRONZE,
        image_url: null,
        lien: '',
        actif: false,
        ordre: sponsors.length,
      });
      await reload();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }, [reload, sponsors.length]);

  const handlePatchSponsor = useCallback(async (id, patch) => {
    // Optimistic update
    setSponsors(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    try {
      await updateSponsor(id, patch);
    } catch (err) {
      alert("Erreur : " + err.message);
      await reload();
    }
  }, [reload]);

  const handleDeleteSponsor = useCallback(async (id) => {
    if (!window.confirm("Supprimer ce sponsor ?")) return;
    try { await deleteSponsor(id); await reload(); }
    catch (err) { alert("Erreur : " + err.message); }
  }, [reload]);

  const handleUploadSponsorImage = useCallback(async (id, file) => {
    try {
      const url = await uploadImage(file, 'sponsors');
      await updateSponsor(id, { image_url: url });
      await reload();
    } catch (err) {
      alert("Erreur upload : " + err.message);
    }
  }, [reload]);

  // ─── Compteurs badges onglets ─────────────────────────────────────────────
  const counts = {
    pending:  pending.length,
    tournois: allTournois.length,
    sponsors: sponsors.filter(s => s.actif).length,
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
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Calendrier</button>
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
        {tab === 'pending'  && <TabPending  pending={pending} onApprove={handleApprove} onReject={handleReject} />}
        {tab === 'tournois' && <TabTournois tournois={allTournois} onDelete={handleDeleteTournoi} />}
        {tab === 'sponsors' && (
          <TabSponsors
            sponsors={sponsors}
            onPatch={handlePatchSponsor}
            onDelete={handleDeleteSponsor}
            onUpload={handleUploadSponsorImage}
            onAddNew={handleAddSponsor}
          />
        )}
        {tab === 'visites'  && <TabVisits stats={visites} />}
      </div>
    </div>
  );
}

export default PanneauAdmin;
