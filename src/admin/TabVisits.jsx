// src/admin/TabVisits.jsx — Stats des visites

function TabVisits({ stats }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, marginBottom: 4 }}>
        Statistiques de visites
      </div>
      <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 24 }}>
        30 derniers jours
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
        gap: 14, marginBottom: 32,
      }}>
        {[
          { label: 'Visites totales (toutes périodes)', val: stats?.total_global ?? '—', icon: '🌍' },
          { label: 'Visites · 30 jours', val: stats?.total ?? '—',           icon: '👁️' },
          { label: 'Moyenne / jour',   val: stats?.moyenne ?? '—',         icon: '📈' },
          { label: 'Moyenne / semaine', val: stats?.moyenne_semaine ?? '—', icon: '📊' },
        ].map(({ label, val, icon }) => (
          <div
            key={label}
            style={{
              background: 'var(--s1)', border: '1px solid var(--b1)',
              borderRadius: 14, padding: '20px 18px',
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, marginBottom: 4 }}>
              {val}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {stats?.jours?.length > 0 ? (
        <div style={{
          background: 'var(--s1)', border: '1px solid var(--b1)',
          borderRadius: 14, padding: '22px 20px',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>Visites par jour</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80, overflowX: 'auto' }}>
            {(() => {
              const max = Math.max(...stats.jours.map(j => j.nb), 1);
              return stats.jours.map(j => (
                <div
                  key={j.jour}
                  title={`${j.jour} : ${j.nb} visites`}
                  style={{
                    flex: '0 0 auto', width: 18,
                    height: `${Math.max(4, (j.nb / max) * 76)}px`,
                    background: 'var(--blue)', borderRadius: '4px 4px 0 0',
                    opacity: 0.8, transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
                />
              ));
            })()}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: 6, fontSize: 10, color: 'var(--t4)',
          }}>
            <span>{stats.jours[0]?.jour}</span>
            <span>{stats.jours[stats.jours.length - 1]?.jour}</span>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--s1)', border: '1px solid var(--b1)',
          borderRadius: 14, padding: '48px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📊</div>
          <div style={{ color: 'var(--t3)', fontSize: 14 }}>
            Pas encore de données de visites.
          </div>
        </div>
      )}
    </div>
  );
}

export default TabVisits;
