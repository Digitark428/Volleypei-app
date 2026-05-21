// src/calendar/StatsPills.jsx — Deux pills d'info en haut du calendrier

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
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>{value}</span>
        {suffix && <span style={{ fontSize: 11, color: 'var(--t3)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function StatsPills({ visitesStats, nbTournois }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
      <Pill label="Visites · 30j"  value={visitesStats?.total ?? '—'}  suffix="au total" />
      <Pill label="Tournois"       value={nbTournois}                    suffix="publiés" />
    </div>
  );
}

export default StatsPills;
