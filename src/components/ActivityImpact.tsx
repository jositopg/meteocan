import type { Observation, ForecastDay, IslandId } from '../services/aemet'
import { assessActivities, type ActivityStatus } from '../utils/weatherLogic'

interface Props { obs: Observation | null; forecast: ForecastDay[]; loading: boolean; islandId: IslandId }

const STATUS_CONFIG: Record<ActivityStatus, { label: string; color: string; bg: string; border: string }> = {
  great:   { label: 'Perfecto',  color: '#065f46', bg: '#d1fae5', border: '#6ee7b7' },
  ok:      { label: 'Bien',      color: '#1d4ed8', bg: 'var(--primary-light)', border: '#93c5fd' },
  caution: { label: 'Cuidado',   color: '#92400e', bg: '#fef3c7', border: '#fcd34d' },
  avoid:   { label: 'Evitar',    color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
}

function Skeleton() {
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ height: 14, width: 140, background: '#e2e8f0', borderRadius: 6, marginBottom: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ height: 88, background: '#e2e8f0', borderRadius: 12 }} />
        ))}
      </div>
    </div>
  )
}

export default function ActivityImpact({ obs, forecast, loading, islandId }: Props) {
  if (loading || !obs) return <Skeleton />

  const activities = assessActivities(obs, forecast, islandId)

  return (
    <div style={{ padding: '20px 24px 24px' }}>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700,
        color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.14em',
        marginBottom: 16,
      }}>
        ¿Qué significa para ti hoy?
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {activities.map(act => {
          const cfg = STATUS_CONFIG[act.status]
          return (
            <div
              key={act.id}
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: 14,
                padding: '14px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.3rem' }}>{act.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 700,
                  color: cfg.color, background: 'rgba(255,255,255,0.7)',
                  padding: '1px 6px', borderRadius: 8, whiteSpace: 'nowrap',
                }}>
                  {cfg.label}
                </span>
              </div>

              <p style={{
                fontFamily: 'var(--font-display)', fontSize: '0.78rem',
                fontWeight: 600, color: cfg.color,
              }}>
                {act.name}
              </p>

              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.7rem',
                color: cfg.color, opacity: 0.85, lineHeight: 1.45,
              }}>
                {act.reason}
              </p>

              {act.tip && (
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                  color: cfg.color, opacity: 0.7, lineHeight: 1.4,
                  borderTop: `1px solid ${cfg.border}`, paddingTop: 6, marginTop: 2,
                }}>
                  💡 {act.tip}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
