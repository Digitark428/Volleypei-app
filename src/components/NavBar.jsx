// src/components/NavBar.jsx — Barre de navigation principale (calendrier / carte / partenaires / admin)
import { LOGO_B64 } from '../lib/logo.js';

function NavBar({ page, onChangePage, onGoAdmin, onGoPartenaires }) {
  return (
    <>
      <nav className="nav">
        <div className="nav-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <img src={LOGO_B64} alt="VolleyPéi" style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }} className="nl">
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
            <button
              onClick={onGoPartenaires}
              className="nav-link"
            >
              Partenaires
            </button>
            <button onClick={onGoAdmin} className="nav-link-admin">
              Admin
            </button>
          </div>
        </div>
      </nav>
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg,var(--re-b) 0% 33%,var(--re-y) 33% 66%,var(--re-r) 66% 100%)',
      }} />
    </>
  );
}

export default NavBar;
