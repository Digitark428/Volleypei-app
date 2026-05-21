// src/admin/TabTournois.jsx — Liste de tous les tournois (admin)
// v9 : plus de statuts — tous les tournois sont publiés directement.
import { formatDateFR } from '../lib/dates.js';

function TabTournois({ tournois, onDelete }) {
  if (tournois.length === 0) {
    return (
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, marginBottom: 4 }}>Tournois</div>
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t3)' }}>
          Aucun tournoi publié.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, marginBottom: 4 }}>Tournois</div>
      <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 20 }}>
        {tournois.length} tournoi{tournois.length !== 1 ? 's' : ''} publiés
      </div>

      <div style={{
        background: 'var(--s1)', border: '1px solid var(--b1)',
        borderRadius: 14, overflow: 'hidden',
      }}>
        <div className="tbl-head">
          {['Tournoi', 'Lieu', 'Date'].map(h => (
            <div
              key={h}
              style={{
                fontSize: 10, fontWeight: 600, color: 'var(--t3)',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {tournois.map(t => (
          <div key={t.id} className="tbl-row" style={{ alignItems: 'center' }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--t1)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {t.image_url && (
                <img
                  src={t.image_url}
                  alt=""
                  style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.nom}</span>
            </div>

            <div style={{
              fontSize: 12, color: 'var(--t2)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{t.ville || t.lieu}</div>

            <div style={{
              fontSize: 12, color: 'var(--t2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}>
              <span>{formatDateFR(t.date)}</span>
              <button
                onClick={() => onDelete(t.id)}
                style={{
                  background: 'rgba(227,0,0,0.06)', border: 'none', color: 'var(--red)',
                  fontSize: 13, cursor: 'pointer',
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
                title="Supprimer"
                aria-label="Supprimer"
              >✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TabTournois;
