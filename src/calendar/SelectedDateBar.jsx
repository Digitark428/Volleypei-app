// src/calendar/SelectedDateBar.jsx — Barre d'info date sélectionnée + bouton "Ajouter ici"
import { formatDateFR } from '../lib/dates.js';

function SelectedDateBar({ date, nbEvents, onClear, onAddTournoi }) {
  if (!date) return null;
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18, padding: '0 4px',
      }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--t1)', letterSpacing: -0.3 }}>
          {nbEvents > 0
            ? `${nbEvents} tournoi${nbEvents > 1 ? 's' : ''} · ${formatDateFR(date)}`
            : `Aucun tournoi le ${formatDateFR(date)}`}
        </div>
        <button onClick={onClear} className="link link-sm">Tout voir</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button onClick={onAddTournoi} className="add-here-btn">
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: 'var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: 'white', fontSize: 18, lineHeight: 1 }}>+</span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)' }}>
              Ajouter un tournoi ici
            </div>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>
              Le {formatDateFR(date)}
            </div>
          </div>
        </button>
      </div>
    </>
  );
}

export default SelectedDateBar;
