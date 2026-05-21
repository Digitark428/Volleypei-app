// src/admin/TabTournois.jsx — Liste de tous les tournois (tous statuts)
import { STATUS } from '../lib/constants.js';
import { formatDateFR } from '../lib/dates.js';

const STATUS_BADGE = {
  [STATUS.PENDING]:  { label: 'En attente', bg: 'rgba(245,158,11,0.14)', fg: '#b45309' },
  [STATUS.APPROVED]: { label: 'Validé',     bg: 'rgba(48,166,83,0.1)',   fg: 'var(--green)' },
  [STATUS.REJECTED]: { label: 'Refusé',     bg: 'rgba(227,0,0,0.08)',    fg: 'var(--red)' },
};

function TabTournois({ tournois, onDelete }) {
  if (tournois.length === 0) {
    return (
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, marginBottom: 4 }}>Tournois</div>
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t3)' }}>
          Aucun tournoi
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, marginBottom: 4 }}>Tournois</div>
      <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 20 }}>
        {tournois.length} tournoi{tournois.length !== 1 ? 's' : ''} au total
      </div>

      <div style={{
        background: 'var(--s1)', border: '1px solid var(--b1)',
        borderRadius: 14, overflow: 'hidden',
      }}>
        <div className="tbl-head">
          {['Tournoi', 'Lieu', 'Date', 'Statut'].map(h => (
            <div
              key={h}
              style={{
                fontSize: 10, fontWeight: 600, color: 'var(--t3)',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}
              className={h === 'Statut' ? 'hc' : ''}
            >
              {h}
            </div>
          ))}
        </div>

        {tournois.map(t => {
          const badge = STATUS_BADGE[t.status] || STATUS_BADGE[STATUS.PENDING];
          return (
            <div key={t.id} className="tbl-row">
              <div style={{
                fontSize: 13, fontWeight: 600, color: 'var(--t1)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{t.nom}</div>

              <div style={{
                fontSize: 12, color: 'var(--t2)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{t.ville || t.lieu}</div>

              <div style={{ fontSize: 12, color: 'var(--t2)' }}>{formatDateFR(t.date)}</div>

              <div
                style={{
                  fontSize: 12, color: 'var(--t3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                }}
                className="hc"
              >
                <span style={{
                  background: badge.bg, color: badge.fg,
                  borderRadius: 980, padding: '3px 10px',
                  fontSize: 11, fontWeight: 600,
                }}>
                  {badge.label}
                </span>
                <button
                  onClick={() => onDelete(t.id)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--red)',
                    fontSize: 14, cursor: 'pointer', padding: '2px 5px', flexShrink: 0,
                  }}
                  title="Supprimer"
                >✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TabTournois;
