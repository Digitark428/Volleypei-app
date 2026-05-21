// src/App.jsx — Composant racine
//
// RESPONSABILITÉS :
//   1. Injecter le CSS global (style tag — pas d'étape de build CSS)
//   2. Charger les hooks data (tournois, sponsors, stats de visites)
//   3. Gérer la session admin persistante (localStorage)
//   4. Router entre les pages : home / carte / partenaires / login / admin
//
// La session admin survit aux rechargements et changements d'onglets.

import { useState, useCallback } from 'react';
import { CSS } from './lib/styles.js';

import { useTournois }     from './hooks/useTournois.js';
import { useSponsors }     from './hooks/useSponsors.js';
import { useVisitStats }   from './hooks/useVisitStats.js';
import { useAdminSession } from './hooks/useAdminSession.js';

import SplashScreen    from './components/SplashScreen.jsx';
import NavBar          from './components/NavBar.jsx';
import PageCalendrier  from './calendar/PageCalendrier.jsx';
import PageCarte       from './pages/PageCarte.jsx';
import PagePartenaires from './pages/PagePartenaires.jsx';
import LoginAdmin      from './admin/LoginAdmin.jsx';
import PanneauAdmin    from './admin/PanneauAdmin.jsx';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  // Si l'admin est déjà connecté (localStorage), on l'amène direct au panneau
  const { isAdmin, login, logout } = useAdminSession();
  const [page, setPage] = useState(isAdmin ? 'admin' : 'home');

  const { tournois, reload: reloadTournois } = useTournois();
  const { sponsors }                         = useSponsors();
  const visitesStats                         = useVisitStats(30);

  const goAdmin       = useCallback(() => setPage(isAdmin ? 'admin' : 'login'), [isAdmin]);
  const goPartenaires = useCallback(() => setPage('partenaires'), []);
  const goHome        = useCallback(() => setPage('home'), []);

  const onLoggedIn = useCallback(() => {
    login();
    setPage('admin');
  }, [login]);

  const onAdminBack = useCallback(() => {
    // "Retour au calendrier" : on garde la session active
    reloadTournois();
    setPage('home');
  }, [reloadTournois]);

  const onAdminLogout = useCallback(() => {
    // "Déconnexion" explicite : on coupe la session
    logout();
    setPage('home');
  }, [logout]);

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
        <PanneauAdmin onBack={onAdminBack} onLogout={onAdminLogout} />
      ) : (
        <div className="page">
          <NavBar
            page={page}
            onChangePage={setPage}
            onGoAdmin={goAdmin}
            onGoPartenaires={goPartenaires}
            isAdmin={isAdmin}
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
