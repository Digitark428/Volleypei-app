// src/components/SplashScreen.jsx — Écran d'accueil animé
import { useState, useEffect } from 'react';
import { LOGO_B64 } from '../lib/logo.js';

function SplashScreen({ onDone }) {
  const [out, setOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), 2000);
    const t2 = setTimeout(() => onDone(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, opacity: out ? 0 : 1,
      transition: 'opacity 500ms cubic-bezier(0.22,1,0.36,1)',
      fontFamily: 'Inter,-apple-system,sans-serif',
    }}>
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(37,99,235,0.08) 0%,transparent 70%)',
        animation: 'splLogo 1.2s ease both' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <div className="strip" />
      </div>
      <div style={{ position: 'relative', animation: 'splLogo 0.9s cubic-bezier(0.22,1,0.36,1) both' }}>
        <img src={LOGO_B64} alt="VolleyPéi" style={{
          width: 96, height: 96, borderRadius: 22,
          boxShadow: '0 16px 48px rgba(37,99,235,0.25)',
          position: 'relative', zIndex: 2,
        }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden', zIndex: 3 }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '35%',
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)',
            animation: 'splFlare 2s ease 0.8s both' }} />
        </div>
      </div>
      <div style={{ marginTop: 24, fontSize: 22, fontWeight: 800, letterSpacing: -0.6,
        color: 'var(--t1)', animation: 'splTxt 0.6s ease 0.5s both' }}>
        VolleyPéi
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: 'var(--t3)',
        animation: 'splTxt 0.6s ease 0.7s both' }}>
        Le calendrier du volley péi 🏐
      </div>
      <div style={{ marginTop: 36, display: 'flex', gap: 7,
        animation: 'splTxt 0.6s ease 0.9s both' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%', background: 'var(--t4)',
            animation: `splDot 1.3s ease-in-out ${i * 0.14}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

export default SplashScreen;
