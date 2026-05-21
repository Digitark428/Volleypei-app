// src/components/TournoiCard.jsx — Carte d'un tournoi public (lecture)
import { formatDateFR } from '../lib/dates.js';

function TournoiCard({ tournoi, onClick }) {
  return (
    <div className="t-card" onClick={() => onClick(tournoi)}>
      {tournoi.image_url ? (
        <img src={tournoi.image_url} alt="" className="t-card-cover" loading="lazy" />
      ) : (
        <div className="t-card-cover" style={{ background: 'linear-gradient(180deg,#dbeafe,#bfdbfe)' }}>
          🏐
        </div>
      )}
      <div className="t-card-body">
        <div className="t-card-name" style={{ marginBottom: 10 }}>{tournoi.nom}</div>

        <div className="t-card-meta">
          <div className="t-meta-row">
            <span>📅</span>
            <span>
              {formatDateFR(tournoi.date)}
              {tournoi.heure && ` · ${tournoi.heure}`}
            </span>
          </div>
          <div className="t-meta-row">
            <span>📍</span>
            <span style={{ wordBreak: 'break-word' }}>
              {tournoi.lieu}{tournoi.ville && `, ${tournoi.ville}`}
            </span>
          </div>
          {(tournoi.type || tournoi.nombre_joueurs > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {tournoi.type && <span className="tag tag-b">{tournoi.type}</span>}
              {tournoi.nombre_joueurs > 0 && (
                <span className="tag">👥 {tournoi.nombre_joueurs}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TournoiCard;
