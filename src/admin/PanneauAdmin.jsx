// src/admin/PanneauAdmin.jsx — Orchestrateur de l'espace admin
import { useState, useEffect, useCallback } from 'react';
import { LOGO_B64 } from '../lib/logo.js';
import {
  fetchAllTournois, fetchPendingTournois,
  approveTournoi, rejectTournoi, deleteTournoi,
  fetchVisitStats,
  fetchAllSponsors, createSponsor, updateSponsor, deleteSponsor,
  approveSponsor, rejectSponsor, uploadSponsorImages,
  uploadImage,
} from '../services/index.js';
import { SPONSOR_TIERS, SPONSOR_CAPACITY, STATUS } from '../lib/constants.js';
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

function PanneauAdmin({ onBack, onLogout }) {
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
      // Création admin = directement approved (admin a confiance dans ses propres ajouts)
      // Pour rester strict sur le workflow, on laisse "pending" et l'admin valide ensuite.
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
      alert("Erreur : " + err.message);
    }
  }, [reload, sponsors.length]);

  const handlePatchSponsor = useCallback(async (id, patch) => {
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

  const handleApproveSponsor = useCallback(async (id) => {
    try { await approveSponsor(id); await reload(); }
    catch (err) { alert("Erreur : " + err.message); }
  }, [reload]);

  const handleRejectSponsor = useCallback(async (id) => {
    if (!window.confirm("Refuser ce sponsor ?")) return;
    try { await rejectSponsor(id); await reload(); }
    catch (err) { alert("Erreur : " + err.message); }
  }, [reload]);

  /** Upload de la photo principale (image_url) — historique. */
  const handleUploadSponsorImage = useCallback(async (id, file) => {
    try {
      const url = await uploadImage(file, 'sponsors');
      await updateSponsor(id, { image_url: url });
      await reload();
    } catch (err) {
      alert("Erreur upload : " + err.message);
    }
  }, [reload]);

  /** Upload de plusieurs images : ajoutées à la galerie `images`. */
  const handleUploadSponsorImages = useCallback(async (id, files) => {
    if (!files || files.length === 0) return;
    try {
      const urls = await uploadSponsorImages([...files]);
      if (urls.length === 0) return;
      const sponsor = sponsors.find(s => s.id === id);
      const existing = Array.isArray(sponsor?.images) ? sponsor.images : [];
      const merged = [...existing, ...urls];
      // Si pas d'image principale, on prend la première de la galerie
      const patch = { images: merged };
      if (!sponsor?.image_url && merged.length > 0) patch.image_url = merged[0];
      await updateSponsor(id, patch);
      await reload();
    } catch (err) {
      alert("Erreur upload : " + err.message);
    }
  }, [reload, sponsors]);

  /** Suppression d'une image de la galerie (UI only, on garde le fichier en Storage). */
  const handleRemoveSponsorImage = useCallback(async (id, url) => {
    const sponsor = sponsors.find(s => s.id === id);
    if (!sponsor) return;
    const existing = Array.isArray(sponsor.images) ? sponsor.images : [];
    const next = existing.filter(u => u !== url);
    const patch = { images: next };
    if (sponsor.image_url === url) patch.image_url = next[0] || null;
    await handlePatchSponsor(id, patch);
  }, [sponsors, handlePatchSponsor]);

  /** Réordonne une image dans la galerie (Δ = +1 ou -1). */
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

  // ─── Places disponibles par tier (sponsors approved seulement) ────────────
  const sponsorPlaces = {
    gold:   { used: sponsors.filter(s => s.type === 'gold'   && s.status === STATUS.APPROVED).length, total: SPONSOR_CAPACITY.gold   },
    silver: { used: sponsors.filter(s => s.type === 'silver' && s.status === STATUS.APPROVED).length, total: SPONSOR_CAPACITY.silver },
    bronze: { used: sponsors.filter(s => s.type === 'bronze' && s.status === STATUS.APPROVED).length, total: SPONSOR_CAPACITY.bronze },
  };

  // ─── Compteurs badges onglets ─────────────────────────────────────────────
  const counts = {
    pending:  pending.length,
    tournois: allTournois.length,
    sponsors: sponsors.filter(s => s.status === STATUS.APPROVED && s.actif).length,
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
                if (window.confirm('Se déconnecter de l\'espace admin ?')) onLogout?.();
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
        {tab === 'pending'  && <TabPending  pending={pending} onApprove={handleApprove} onReject={handleReject} />}
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
        {tab === 'visites'  && <TabVisits stats={visites} />}
      </div>
    </div>
  );
}

export default PanneauAdmin;
