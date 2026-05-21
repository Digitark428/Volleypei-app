// src/components/NavBar.jsx — Barre de navigation principale
//
// Présente dans la home (Calendrier / Carte) avec liens vers Partenaires et Admin.
// Le bouton Admin se transforme en "Admin ✓" lorsque la session est active.

import { LOGO_B64 } from '../lib/logo.js';

function NavBar({ page, onChangePage, onGoAdmin, onGoPartenaires, isAdmin }) {
  return (
    <>
      <nav className="nav">
        <div className="nav-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <img
              src={LOGO_B64}
              alt="VolleyPéi"
              style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0 }}
            />
            <span
              style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}
              className="nl"
            >
              VolleyPéi
            </span>
          </div>
          <div className="nav-tabs">
            <button
              className={`nav-tab ${page === 'home' ? 'on' : ''}`}
              onClick={() => onChangePage('home')}
            >
              Calendrier
            </button>
            <button
              className={`nav-tab ${page === 'carte' ? 'on' : ''}`}
              onClick={() => onChangePage('carte')}
            >
              Carte
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={onGoPartenaires} className="nav-link">
              Partenaires
            </button>
            <button
              onClick={onGoAdmin}
              className="nav-link-admin"
              title={isAdmin ? "Session admin active" : "Accès admin"}
            >
              {isAdmin ? 'Admin ✓' : 'Admin'}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
