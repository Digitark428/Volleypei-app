// src/calendar/PublishBanner.jsx — Bannière de confirmation après publication directe

function PublishBanner() {
  return (
    <div style={{
      background: 'rgba(48,166,83,0.08)',
      border: '1px solid rgba(48,166,83,0.25)',
      borderRadius: 14, padding: '14px 18px', marginBottom: 18,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 32, height: 32,
        background: 'rgba(48,166,83,0.15)', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
      }}>✓</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
          Tournoi publié avec succès !
        </div>
        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
          Votre tournoi est maintenant visible dans le calendrier.
        </div>
      </div>
    </div>
  );
}

export default PublishBanner;
