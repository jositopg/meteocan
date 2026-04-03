import type { Observation, ForecastDay, IslandId } from '../services/aemet'
import { ISLAND_CONFIG } from '../services/aemet'
import { generateSummary } from '../utils/weatherLogic'

interface Props { obs: Observation | null; forecast: ForecastDay[]; loading: boolean; islandId: IslandId }

function Skeleton() {
  return (
    <div style={{ padding: '28px 28px 24px' }}>
      <div style={{ height: 14, width: 120, background: '#e2e8f0', borderRadius: 6, marginBottom: 14 }} />
      <div style={{ height: 18, width: '90%', background: '#e2e8f0', borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 18, width: '70%', background: '#e2e8f0', borderRadius: 6 }} />
    </div>
  )
}

export default function DailySummary({ obs, forecast, loading, islandId }: Props) {
  if (loading || !obs) return <Skeleton />

  const summary = generateSummary(obs, forecast, islandId)
  const capital = ISLAND_CONFIG[islandId].capital

  return (
    <div style={{ padding: '24px 24px 20px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Temp block */}
      <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 80 }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '3.6rem',
          fontWeight: 800,
          color: 'var(--text)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}>
          {Math.round(obs.ta)}°
        </p>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: 'var(--text-dim)',
          marginTop: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          {capital}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          marginTop: 4,
        }}>
          ↑{obs.tamax}° ↓{obs.tamin}°
        </p>
      </div>

      {/* Divider */}
      <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)', flexShrink: 0 }} />

      {/* Narrative */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          fontWeight: 700,
          color: 'var(--primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
        }}>
          Resumen del día
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.93rem',
          color: 'var(--text)',
          lineHeight: 1.75,
        }}>
          {summary}
        </p>
      </div>
    </div>
  )
}
