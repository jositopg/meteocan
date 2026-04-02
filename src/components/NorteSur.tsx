import type { Observation } from '../services/aemet'

interface Props {
  obsNorth: Observation | null
  obsSouth: Observation | null
  loading: boolean
}

function Skeleton() {
  return (
    <div style={{ padding: '20px 24px 24px' }}>
      <div style={{ height: 13, width: 160, background: '#e2e8f0', borderRadius: 6, marginBottom: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ height: 120, background: '#e2e8f0', borderRadius: 14 }} />
        <div style={{ height: 120, background: '#e2e8f0', borderRadius: 14 }} />
      </div>
    </div>
  )
}

function Side({
  label, emoji, obs, accent,
}: { label: string; emoji: string; obs: Observation; accent: string }) {
  const WIND_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  const dir = WIND_DIRS[Math.round(obs.dv / 45) % 8]

  const condition = obs.prec > 0 ? '🌧️ Lluvia'
    : obs.hr > 85 ? '☁️ Cubierto'
    : obs.hr > 65 ? '⛅ Nubes'
    : '☀️ Despejado'

  return (
    <div style={{
      borderRadius: 14,
      border: `1.5px solid ${accent}30`,
      background: `${accent}08`,
      padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700,
          color: accent, textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          {label}
        </p>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {condition}
        </span>
      </div>

      {/* Big temp */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 800,
          color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.04em',
        }}>
          {Math.round(obs.ta)}°
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
          HR {obs.hr}%
        </span>
      </div>

      {/* Details row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          💨 {Math.round(obs.vv)} km/h {dir}
        </span>
        {obs.prec > 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#3b82f6' }}>
            🌧️ {obs.prec} mm
          </span>
        )}
        {obs.vis < 15 && obs.vis > 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#f59e0b' }}>
            👁️ {obs.vis} km
          </span>
        )}
      </div>

      {/* Station */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
        📍 {obs.ubi} · {obs.alt} m
      </p>
    </div>
  )
}

export default function NorteSur({ obsNorth, obsSouth, loading }: Props) {
  if (loading) return <Skeleton />
  if (!obsNorth && !obsSouth) return null

  // Calculate the difference if both are available
  const tempDiff = obsNorth && obsSouth
    ? Math.abs(Math.round(obsSouth.ta - obsNorth.ta))
    : null

  return (
    <div style={{ padding: '20px 24px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700,
          color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>
          El efecto Föhn: norte vs sur
        </p>
        {tempDiff !== null && tempDiff >= 2 && (
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600,
            color: '#f59e0b', background: '#fffbeb',
            border: '1px solid #fde68a', borderRadius: 8,
            padding: '3px 10px',
          }}>
            {tempDiff}°C de diferencia entre zonas
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {obsNorth && (
          <Side label="Zona Norte" emoji="🌧️" obs={obsNorth} accent="#3b82f6" />
        )}
        {obsSouth && (
          <Side label="Zona Sur" emoji="☀️" obs={obsSouth} accent="#f59e0b" />
        )}
      </div>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-dim)',
        marginTop: 12, lineHeight: 1.55, textAlign: 'center',
      }}>
        El alisio sube por el norte, pierde humedad en las cumbres y baja seco y caliente por el sur.
      </p>
    </div>
  )
}
