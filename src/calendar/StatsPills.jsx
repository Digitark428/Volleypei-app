// src/calendar/StatsPills.jsx — Pills d'info en haut du calendrier
//
// Affiche le total de visites cumulées et le nombre de tournois publiés.
// `visitesStats` peut être null pendant le chargement initial → on affiche '—'.

function Pill({ label, value, suffix }) {
  return (
    <div style={{
      flex: 1, minWidth: 100,
      background: 'var(--s1)', border: '1px solid var(--b1)',
      borderRadius: 12, padding: '10px 14px',
    }}>
      <div style={{
        fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase',
        letterSpacing: 0.7, fontWeight: 600,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 3 }}>
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
        {suffix && <span style={{ fontSize: 11, color: 'var(--t3)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function StatsPills({ visitesStats, nbTournois }) {
  // Préférence : total_global (toutes périodes) > total (30 jours) > '—'
  const visites = visitesStats?.total_global ?? visitesStats?.total ?? '—';
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
      <Pill label="Visites"  value={visites}    suffix="au total" />
      <Pill label="Tournois" value={nbTournois} suffix="publiés" />
    </div>
  );
}

export default StatsPills;
