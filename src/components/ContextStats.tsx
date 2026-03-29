import type { Observation, ForecastDay } from '../services/aemet'
import { getContext } from '../utils/weatherLogic'

interface Props { obs: Observation | null; forecast: ForecastDay[]; loading: boolean }

function Skeleton() {
  return (
    <div style={{ padding: '20px 20px 16px', display: 'flex', gap: 12 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 76, background: '#e2e8f0', borderRadius: 10 }} />
      ))}
    </div>
  )
}

export default function ContextStats({ obs, forecast, loading }: Props) {
  if (loading || !obs) return <Skeleton />

  const items = getContext(obs, forecast)
  if (items.length === 0) return null

  const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date())

  return (
    <div style={{ padding: '20px 20px 16px' }}>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: 14,
      }}>
        Comparado con lo normal en {month}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {items.map(item => (
          <div
            key={item.label}
            style={{
              background: item.isUnusual ? '#fef9c3' : 'var(--bg)',
              border: `1px solid ${item.isUnusual ? '#fde047' : 'var(--border)'}`,
              borderRadius: 10,
              padding: '14px 14px 12px',
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
