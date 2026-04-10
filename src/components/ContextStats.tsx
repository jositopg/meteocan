import type { Observation, ForecastDay, IslandId } from '../services/aemet'
import { getContext } from '../utils/weatherLogic'

interface Props { obs: Observation | null; forecast: ForecastDay[]; loading: boolean; islandId: IslandId }

function Skeleton() {
  return (
    <div style={{ padding: '20px 20px 16px', display: 'flex', gap: 12 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 76, background: '#e2e8f0', borderRadius: 10 }} />
      ))}
    </div>
  )
}

export default function ContextStats({ obs, forecast, loading, islandId }: Props) {
  if (loading || !obs) return <Skeleton />

  const items = getContext(obs, forecast, islandId)
  if (items.length === 0) return null

  const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date())

  return (
    <div style={{ padding: '20px 24px 24px' }}>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.62rem',
        fontWeight: 700,
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        marginBottom: 16,
      }}>
        ¿Es normal este tiempo en {month}?
      </p>

      <div className="grid-3col">
        {items.map(item => (
          <div
            key={item.label}
            style={{
              background: item.isUnusual ? '#fef9c3' : 'var(--bg)',
              border: `1px solid ${item.isUnusual ? '#fde047' : 'var(--border)'}`,
              borderRadius: 14,
              padding: '16px 16px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                {item.label}
              </p>
              <span style={{ fontSize: '0.85rem' }}>{item.emoji}</span>
            </div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 4,
            }}>
              {item.value}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.73rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
            }}>
              {item.context}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
