// src/calendar/PageCalendrier.jsx — Orchestrateur de la page principale (calendrier + publication)
import { useState, useMemo, useCallback } from 'react';
import { todayISO } from '../lib/dates.js';
import ModalTournoi      from '../modals/ModalTournoi.jsx';
import ModalFormTournoi  from '../modals/ModalFormTournoi.jsx';
import ModalSponsor      from '../modals/ModalSponsor.jsx';
import MonthGrid         from './MonthGrid.jsx';
import StatsPills        from './StatsPills.jsx';
import PublishBanner     from './PublishBanner.jsx';
import SelectedDateBar   from './SelectedDateBar.jsx';
import TournoisList      from './TournoisList.jsx';
import { SponsorGold, SponsorSilverRow, SponsorBronzeRow } from './SponsorSlots.jsx';

function PageCalendrier({ tournois, sponsors, showEmpty, visitesStats, onReload }) {
  const today = new Date();
  const [annee, setAnnee]                       = useState(today.getFullYear());
  const [mois, setMois]                         = useState(today.getMonth());
  const [selected, setSelected]                 = useState(null);
  const [showDetail, setShowDetail]             = useState(null);
  const [showForm, setShowForm]                 = useState(false);
  const [preselectedDate, setPreselectedDate]   = useState(null);
  const [showPublishBanner, setShowPublishBanner] = useState(false);
  const [selectedSponsor, setSelectedSponsor]   = useState(null);

  // ─── Données dérivées ─────────────────────────────────────────────────────
  const tournoisByDate = useMemo(() => {
    const map = {};
    tournois.forEach(t => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [tournois]);

  const upcomingTournois = useMemo(() => {
    const today = todayISO();
    return [...tournois]
      .filter(t => t.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [tournois]);

  const selectedTournois = selected ? (tournoisByDate[selected] || []) : [];
  const displayList      = selected ? selectedTournois : upcomingTournois;

  // ─── Navigation calendrier ────────────────────────────────────────────────
  const onPrevMonth = useCallback(() => {
    setMois(m => {
      if (m === 0) { setAnnee(a => a - 1); return 11; }
      return m - 1;
    });
    setSelected(null);
  }, []);

  const onNextMonth = useCallback(() => {
    setMois(m => {
      if (m === 11) { setAnnee(a => a + 1); return 0; }
      return m + 1;
    });
    setSelected(null);
  }, []);

  const onSelectDate = useCallback(d => setSelected(prev => prev === d ? null : d), []);

  // ─── Soumission formulaire ────────────────────────────────────────────────
  const onPublished = useCallback(() => {
    setShowForm(false);
    setPreselectedDate(null);
    setShowPublishBanner(true);
    setTimeout(() => setShowPublishBanner(false), 6000);
    // Recharger la liste pour afficher immédiatement le nouveau tournoi
    onReload?.();
  }, [onReload]);

  const onAddTournoi = useCallback(() => {
    setShowForm(true);
    setPreselectedDate(selected);
  }, [selected]);

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 16px 60px' }}>
      {showDetail && <ModalTournoi tournoi={showDetail} onClose={() => setShowDetail(null)} />}
      {selectedSponsor && (
        <ModalSponsor sponsor={selectedSponsor} onClose={() => setSelectedSponsor(null)} />
      )}
      {showForm && (
        <ModalFormTournoi
          tournois={tournois}
          initialDate={preselectedDate}
          onClose={() => { setShowForm(false); setPreselectedDate(null); }}
          onPublished={onPublished}
        />
      )}

      <SponsorGold sponsors={sponsors} showEmpty={showEmpty} onSponsorClick={setSelectedSponsor} />

      {showPublishBanner && <PublishBanner />}

      <div style={{ textAlign: 'center', padding: '6px 0 22px' }}>
        <button className="btn btn-w" onClick={() => setShowForm(true)} style={{ width: '100%' }}>
          + Publier un tournoi
        </button>
      </div>

      <StatsPills visitesStats={visitesStats} nbTournois={tournois.length} />

      <MonthGrid
        annee={annee}
        mois={mois}
        selected={selected}
        eventsByDate={tournoisByDate}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        onSelect={onSelectDate}
      />

      <SelectedDateBar
        date={selected}
        nbEvents={selectedTournois.length}
        onClear={() => setSelected(null)}
        onAddTournoi={onAddTournoi}
      />

      <SponsorSilverRow sponsors={sponsors} showEmpty={showEmpty} onSponsorClick={setSelectedSponsor} />

      <TournoisList tournois={displayList} onCardClick={setShowDetail} />

      <SponsorBronzeRow sponsors={sponsors} showEmpty={showEmpty} onSponsorClick={setSelectedSponsor} />
    </div>
  );
}

export default PageCalendrier;
