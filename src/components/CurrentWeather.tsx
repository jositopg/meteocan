import type { Observation } from '../services/aemet'

interface Props {
  obs: Observation | null
  loading: boolean
}

const WIND_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']

function windDir(dv: number) { return WIND_DIRS[Math.round(dv / 45) % 8] }

interface MetricProps {
  icon: string
  label: string
  value: string
  sub?: string
  accent?: boolean
}

function Metric({ icon, label, value, sub, accent }: MetricProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      padding: '12px 16px',
      borderRadius: 12,
      background: accent ? 'var(--primary-light)' : 'var(--bg)',
      border: `1px solid ${accent ? 'rgba(27,104,212,0.2)' : 'var(--border)'}`,
    }}>
      <span style={{ fontSize: '1rem', lineHeight: 1 }}>{icon}</span>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 600,
        color: accent ? 'var(--primary)' : 'var(--text-dim)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700,
        color: accent ? 'var(--primary)' : 'var(--text)', lineHeight: 1,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.68rem',
          color: accent ? 'var(--primary)' : 'var(--text-muted)', opacity: 0.8,
        }}>
          {sub}
        </p>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ padding: '20px 24px' }} className="metrics-grid">
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ height: 80, background: '#e2e8f0', borderRadius: 12 }} />
      ))}
    </div>
  )
}

export default function CurrentWeather({ obs, loading }: Props) {
  if (loading || !obs) return <Skeleton />

  const dir = windDir(obs.dv)
  const gustDiff = obs.vmax - obs.vv
  const gustNote = gustDiff > 10 ? ` (racha ${Math.round(obs.vmax)})` : ''

  // Visibility — only show if reported (< 90 km) and noteworthy (< 20 km)
  const showVis = obs.vis > 0 && obs.vis < 20
  const visAccent = obs.vis < 5

  // Dew point comfort
  const dewPointLabel = obs.tpr < 10 ? 'Aire muy seco'
    : obs.tpr < 16 ? 'Aire seco'
    : obs.tpr < 21 ? 'Confortable'
    : 'Húmedo'

  return (
    <div style={{ padding: '20px 24px 24px' }}>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 600,
        color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em',
        marginBottom: 12,
      }}>
        📍 {obs.ubi} · {obs.alt} m s.n.m.
      </p>

      <div className="metrics-grid">
        <Metric
          icon="💨" label="Viento"
          value={`${Math.round(obs.vv)} km/h ${dir}`}
          sub={`Racha máx. ${Math.round(obs.vmax)} km/h${gustNote.includes('racha') ? '' : ''}`}
        />
        <Metric
          icon="💧" label="Humedad"
          value={`${obs.hr}%`}
          sub={`Punto rocío ${Math.round(obs.tpr ?? 0)}° · ${dewPointLabel}`}
        />
        <Metric
          icon="🌡️" label="Presión"
          value={`${obs.pres} hPa`}
          sub={obs.pres > 1020 ? 'Alta — tiempo estable' : obs.pres < 1005 ? 'Baja — tiempo cambiante' : 'Normal'}
        />
        <Metric
          icon="🌧️" label="Precipitación"
          value={`${obs.prec ?? 0} mm`}
          sub={obs.prec > 5 ? 'Lluvia intensa' : obs.prec > 0 ? 'Lluvia activa' : 'Sin lluvia'}
        />
        {showVis && (
          <Metric
            icon="👁️" label="Visibilidad"
            value={`${obs.vis} km`}
            sub={obs.vis < 2 ? 'Niebla densa' : obs.vis < 5 ? 'Calima o niebla' : obs.vis < 10 ? 'Reducida' : 'Buena'}
            accent={visAccent}
          />
        )}
      </div>
    </div>
  )
}
