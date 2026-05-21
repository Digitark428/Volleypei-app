// src/admin/TabPending.jsx — Onglet "Tournois en attente"
import { formatDateFR } from '../lib/dates.js';

function EmptyState() {
  return (
    <div style={{
      background: 'var(--s1)', border: '1px solid var(--b1)',
      borderRadius: 14, padding: '48px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
      <div style={{ color: 'var(--t3)', fontSize: 14 }}>Aucun tournoi en attente.</div>
    </div>
  );
}

function PendingCard({ tournoi: t, onApprove, onReject }) {
  return (
    <div style={{
      background: 'var(--s1)', border: '1px solid var(--b1)',
      borderRadius: 14, padding: '18px 20px', marginBottom: 12,
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          width: 70, height: 70, borderRadius: 11, background: 'var(--s3)',
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
        }}>
          {t.image_url
            ? <img src={t.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🏐'
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, marginBottom: 4 }}>
            {t.nom}
          </div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 2 }}>
            📅 {formatDateFR(t.date)}{t.heure && ` · 🕒 ${t.heure}`}
          </div>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>
            📍 {t.lieu}{t.ville && `, ${t.ville}`}
          </div>
          {t.nombre_joueurs > 0 && (
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
              👥 {t.nombre_joueurs} joueurs
            </div>
          )}
        </div>
      </div>

      <div style={{
        background: 'var(--s3)', borderRadius: 10, padding: '10px 12px',
        marginBottom: 12, fontSize: 12, color: 'var(--t2)', lineHeight: 1.7,
      }}>
        <div>📞 <strong>{t.telephone}</strong>{t.email && <> · ✉️ {t.email}</>}</div>
        {t.nom_association && (
          <div>
            🏐 <strong>{t.nom_association}</strong>
            {t.numero_identification && <> · n° {t.numero_identification}</>}
          </div>
        )}
        {t.description && (
          <div style={{ marginTop: 6, color: 'var(--t3)', fontStyle: 'italic' }}>
            "{t.description}"
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={() => onReject(t.id)} className="btn-reject">Refuser</button>
        <button onClick={() => onApprove(t.id)} className="btn-approve">✓ Valider et publier</button>
      </div>
    </div>
  );
}

function TabPending({ pending, onApprove, onReject }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, marginBottom: 4 }}>
        Tournois en attente de validation
      </div>
      <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 20 }}>
        {pending.length === 0
          ? "0 tournoi à vérifier"
          : `${pending.length} tournoi${pending.length > 1 ? 's' : ''} à vérifier avant publication`}
      </div>

      {pending.length === 0
        ? <EmptyState />
        : pending.map(t => (
            <PendingCard key={t.id} tournoi={t} onApprove={onApprove} onReject={onReject} />
          ))
      }
    </div>
  );
}

export default TabPending;
