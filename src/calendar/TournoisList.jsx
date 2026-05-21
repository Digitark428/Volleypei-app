// src/calendar/TournoisList.jsx — Liste des cartes tournois ou message vide
import TournoiCard from '../components/TournoiCard.jsx';

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t3)' }}>
      <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.4 }}>📅</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--t1)', marginBottom: 4 }}>
        Aucun tournoi pour l'instant
      </div>
      <div style={{ fontSize: 13, color: 'var(--t3)' }}>
        Soyez le premier à publier un tournoi !
      </div>
    </div>
  );
}

function TournoisList({ tournois, onCardClick }) {
  if (tournois.length === 0) return <EmptyState />;
  return (
    <div className="t-cards-grid">
      {tournois.map(t => (
        <TournoiCard key={t.id} tournoi={t} onClick={onCardClick} />
      ))}
    </div>
  );
}

export default TournoisList;
