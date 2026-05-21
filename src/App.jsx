// src/App.jsx — Composant racine
// Responsabilité : injecter le CSS et router entre les pages.
import { useState, useCallback } from 'react';
import { CSS } from './lib/styles.js';

import { useTournois }    from './hooks/useTournois.js';
import { useSponsors }    from './hooks/useSponsors.js';
import { useVisitStats }  from './hooks/useVisitStats.js';

import SplashScreen    from './components/SplashScreen.jsx';
import NavBar          from './components/NavBar.jsx';
import PageCalendrier  from './calendar/PageCalendrier.jsx';
import PageCarte       from './pages/PageCarte.jsx';
import PagePartenaires from './pages/PagePartenaires.jsx';
import LoginAdmin      from './admin/LoginAdmin.jsx';
import PanneauAdmin    from './admin/PanneauAdmin.jsx';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage]             = useState('home');

  const { tournois, reload: reloadTournois } = useTournois();
  const { sponsors }                         = useSponsors();
  const visitesStats                         = useVisitStats(30);

  const goAdmin       = useCallback(() => setPage('login'), []);
  const goPartenaires = useCallback(() => setPage('partenaires'), []);
  const goHome        = useCallback(() => setPage('home'), []);
  const onLoggedIn    = useCallback(() => setPage('admin'), []);
  const onAdminBack   = useCallback(() => { reloadTournois(); setPage('home'); }, [reloadTournois]);

  return (
    <>
      <style>{CSS}</style>

      {showSplash ? (
        <SplashScreen onDone={() => setShowSplash(false)} />
      ) : page === 'partenaires' ? (
        <PagePartenaires onBack={goHome} tournois={tournois} />
      ) : page === 'login' ? (
        <LoginAdmin onLogin={onLoggedIn} onBack={goHome} />
      ) : page === 'admin' ? (
        <PanneauAdmin onBack={onAdminBack} />
      ) : (
        <div className="page">
          <NavBar
            page={page}
            onChangePage={setPage}
            onGoAdmin={goAdmin}
            onGoPartenaires={goPartenaires}
          />
          {page === 'home'  && (
            <PageCalendrier
              tournois={tournois}
              sponsors={sponsors}
              visitesStats={visitesStats}
            />
          )}
          {page === 'carte' && <PageCarte tournois={tournois} />}
        </div>
      )}
    </>
  );
}
