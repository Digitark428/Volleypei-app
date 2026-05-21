// src/pages/PagePartenaires.jsx — Aperçu interne avec tous les emplacements
import { useState } from 'react';
import { LOGO_B64 } from '../lib/logo.js';
import { PARTENAIRES_PWD } from '../lib/constants.js';
import PageCalendrier from '../calendar/PageCalendrier.jsx';

function PartenairesPasswordGate({ onUnlock, onBack }) {
  const [pw, setPw]     = useState('');
  const [err, setErr]   = useState(false);

  function check() {
    if (pw === PARTENAIRES_PWD) onUnlock();
    else {
      setErr(true);
      setTimeout(() => setErr(false), 2000);
    }
  }

  return (
    <div className="intro-page">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <div className="strip" />
      </div>
      <div className="intro-card" style={{ maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src={LOGO_B64} alt="VolleyPéi" style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 14px',
            display: 'block', boxShadow: '0 6px 24px rgba(37,99,235,0.2)',
          }} />
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.4, marginBottom: 4 }}>
            Espace Partenaires
          </div>
          <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.5 }}>
            Aperçu exclusif réservé aux partenaires
          </div>
        </div>

        {err && <div className="err-box" style={{ textAlign: 'center' }}>Code d'accès incorrect</div>}

        <div style={{ marginBottom: 20 }}>
          <label className="lbl">Code d'accès</label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()}
            className="field"
            placeholder="••••••••••••"
            style={{ fontSize: 16 }}
          />
        </div>

        <button className="btn btn-w" onClick={check} style={{ width: '100%', padding: '13px', fontSize: 15 }}>
          Accéder →
        </button>
        <button onClick={onBack} className="btn btn-ghost" style={{ width: '100%', marginTop: 9, padding: '12px' }}>
          ← Retour
        </button>
        <p style={{ fontSize: 11, color: 'var(--t4)', textAlign: 'center', marginTop: 12 }}>
          Accès réservé · Confidentiel
        </p>
      </div>
    </div>
  );
}

function PagePartenaires({ onBack, tournois }) {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <PartenairesPasswordGate onUnlock={() => setUnlocked(true)} onBack={onBack} />;
  }

  return (
    <div style={{
      background: 'var(--bg)',
      minHeight: '100vh',
      minHeight: '100dvh',
      paddingTop: 'calc(var(--nav-h) + var(--safe-top))',
      paddingBottom: 'var(--safe-bottom)',
      paddingLeft: 'var(--safe-left)',
      paddingRight: 'var(--safe-right)',
    }}>
      <nav className="nav">
        <div className="nav-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <img src={LOGO_B64} alt="VolleyPéi" style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }} className="nl">
              VolleyPéi
            </span>
          </div>
          <button onClick={onBack} className="nav-link-admin">← Retour</button>
        </div>
      </nav>

      <div className="strip" />

      {/* Bandeau aperçu */}
      <div style={{
        background: 'linear-gradient(90deg,rgba(0,102,204,0.06),rgba(48,166,83,0.04))',
        borderBottom: '1px solid rgba(0,102,204,0.12)',
        padding: '10px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--blue)', animation: 'pulse 1.8s infinite',
        }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--blue)', letterSpacing: 0.2, textAlign: 'center' }}>
          Aperçu partenaires · Tous les emplacements sont affichés
        </span>
      </div>

      <PageCalendrier
        tournois={tournois}
        sponsors={[]}
        showEmpty={true}
      />
    </div>
  );
}

export default PagePartenaires;
