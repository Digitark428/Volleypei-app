// src/admin/LoginAdmin.jsx — Connexion admin (mot de passe simple côté front)
import { useState } from 'react';
import { LOGO_B64 } from '../lib/logo.js';
import { ADMIN_USER, ADMIN_PWD } from '../lib/constants.js';

function LoginAdmin({ onLogin, onBack }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState(false);

  function go() {
    if (u === ADMIN_USER && p === ADMIN_PWD) {
      onLogin();
    } else {
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
          <div style={{
            width: 44, height: 44, background: 'var(--s4)',
            border: '1px solid var(--b2)', borderRadius: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, margin: '0 auto 14px',
          }}>🔐</div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>Espace Admin</div>
          <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 3 }}>VolleyPéi</div>
        </div>

        {err && <div className="err-box" style={{ textAlign: 'center' }}>Identifiants incorrects</div>}

        <div style={{ marginBottom: 12 }}>
          <label className="lbl">Identifiant</label>
          <input
            type="text"
            value={u}
            onChange={e => setU(e.target.value)}
            className="field"
            onKeyDown={e => e.key === 'Enter' && go()}
            autoComplete="off"
          />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label className="lbl">Mot de passe</label>
          <input
            type="password"
            value={p}
            onChange={e => setP(e.target.value)}
            className="field"
            onKeyDown={e => e.key === 'Enter' && go()}
          />
        </div>

        <button className="btn btn-w" onClick={go} style={{ width: '100%', padding: '13px', fontSize: 15 }}>
          Se connecter
        </button>
        <button onClick={onBack} className="btn btn-ghost" style={{ width: '100%', marginTop: 9, padding: '12px' }}>
          ← Retour
        </button>
      </div>
    </div>
  );
}

export default LoginAdmin;
