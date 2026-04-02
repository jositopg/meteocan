import type { ForecastDay } from '../services/aemet'
import { FORECAST_CONFIDENCE } from '../utils/weatherLogic'

interface Props { days: ForecastDay[]; loading: boolean }

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
function shortDay(fecha: string, i: number) {
  if (i === 0) return 'Hoy'
  try { return DAY_NAMES[new Date(fecha).getDay()] } catch { return `D${i}` }
}

function confidenceColor(pct: number) {
  if (pct >= 80) return '#22c55e'
  if (pct >= 55) return '#f59e0b'
  if (pct >= 35) return '#fb923c'
  return '#ef4444'
}

function Skeleton() {
  return (
    <div style={{ padding: '16px 20px 14px' }}>
      <div style={{ height: 12, width: 180, background: '#e2e8f0', borderRadius: 6, marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 44, background: '#e2e8f0', borderRadius: 6 }} />
        ))}
      </div>
    </div>
  )
}

export default function ConfidenceBar({ days, loading }: Props) {
  if (loading || days.length === 0) return <Skeleton />

  return (
    <div style={{ padding: '20px 24px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          fontWeight: 700,
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
        }}>
          Fiabilidad de la previsión
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.72rem',
          color: 'var(--text-dim)',
          fontStyle: 'italic',
        }}>
          Cuanto más lejos, menos certeza
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {days.map((d, i) => {
          const conf = FORECAST_CONFIDENCE[i] ?? 20
          const color = confidenceColor(conf)
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <div style={{
                width: '100%',
                height: 44,
                background: 'var(--bg)',
                borderRadius: 6,
                border: '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${conf}%`,
                  background: color,
                  opacity: 0.25,
                }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color,
                  }}>
                    {conf}%
                  </span>
                </div>
              </div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.68rem',
                color: 'var(--text-dim)',
                textAlign: 'center',
              }}>
                {shortDay(d.fecha, i)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
