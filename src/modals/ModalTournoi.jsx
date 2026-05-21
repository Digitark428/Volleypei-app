// src/modals/ModalTournoi.jsx — Détail d'un tournoi (lecture seule)
import { formatDateFR } from '../lib/dates.js';

function ModalTournoi({ tournoi: t, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Fermer">×</button>

        {t.image_url && (
          <img
            src={t.image_url}
            alt={t.nom}
            style={{
              width: '100%', maxHeight: 240, objectFit: 'cover',
              borderRadius: 12, marginBottom: 16,
            }}
          />
        )}

        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: 'var(--t1)', marginBottom: 14 }}>
          {t.nom}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--t2)', fontSize: 14 }}>
          <div>📅 <strong>{formatDateFR(t.date)}</strong></div>
          <div>📍 {t.lieu}{t.ville && `, ${t.ville}`}</div>
          {t.telephone && (
            <div>
              📞 <a href={`tel:${t.telephone.replace(/\s/g, '')}`} style={{ color: 'var(--blue)' }}>{t.telephone}</a>
            </div>
          )}
          {t.email && (
            <div>
              ✉️ <a href={`mailto:${t.email}`} style={{ color: 'var(--blue)' }}>{t.email}</a>
            </div>
          )}
        </div>

        {t.description && (
          <div style={{
            marginTop: 16, padding: 14, background: 'var(--s3)', borderRadius: 10,
            fontSize: 13, color: 'var(--t2)', lineHeight: 1.6,
          }}>
            {t.description}
          </div>
        )}
      </div>
    </div>
  );
}

export default ModalTournoi;
