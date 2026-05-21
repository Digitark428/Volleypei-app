// src/modals/ModalTournoi.jsx — Détail d'un tournoi (lecture seule)
//
// Vue mobile-first :
//   - Affiche en grand
//   - Infos clés (date, heure, lieu, type, joueurs)
//   - Liens tel: et mailto: actionnables (un tap suffit)
//   - Description en bloc séparé pour lisibilité

import { formatDateFR } from '../lib/dates.js';

function ModalTournoi({ tournoi: t, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ paddingTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button className="close-btn" onClick={onClose} aria-label="Fermer">×</button>
        </div>

        {t.image_url && (
          <img
            src={t.image_url}
            alt={t.nom}
            style={{
              width: '100%', maxHeight: 280, objectFit: 'cover',
              borderRadius: 12, marginBottom: 16, display: 'block',
              background: '#f5f5f7',
            }}
          />
        )}

        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: 'var(--t1)', marginBottom: 10, lineHeight: 1.2 }}>
          {t.nom}
        </div>

        {/* Tags */}
        {(t.type || t.nombre_joueurs > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {t.type && <span className="tag tag-b">{t.type}</span>}
            {t.nombre_joueurs > 0 && <span className="tag">👥 {t.nombre_joueurs} joueurs</span>}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--t2)', fontSize: 14 }}>
          <div>
            📅 <strong>{formatDateFR(t.date)}</strong>
            {t.heure && <> · 🕒 <strong>{t.heure}</strong></>}
          </div>
          <div style={{ wordBreak: 'break-word' }}>
            📍 {t.lieu}{t.ville && `, ${t.ville}`}
          </div>
          {t.telephone && (
            <div>
              📞 <a href={`tel:${t.telephone.replace(/\s/g, '')}`} style={{ color: 'var(--blue)', textDecoration: 'none' }}>
                {t.telephone}
              </a>
            </div>
          )}
          {t.email && (
            <div style={{ wordBreak: 'break-all' }}>
              ✉️ <a href={`mailto:${t.email}`} style={{ color: 'var(--blue)', textDecoration: 'none' }}>
                {t.email}
              </a>
            </div>
          )}
        </div>

        {t.description && (
          <div style={{
            marginTop: 16, padding: 14, background: 'var(--s3)', borderRadius: 10,
            fontSize: 13, color: 'var(--t2)', lineHeight: 1.6,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {t.description}
          </div>
        )}
      </div>
    </div>
  );
}

export default ModalTournoi;
