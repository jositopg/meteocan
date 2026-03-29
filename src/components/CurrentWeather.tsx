import type { Observation } from '../services/aemet'

interface Props {
  obs: Observation | null
  loading: boolean
}

const WIND_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']

function deriveCondition(obs: Observation): { label: string; emoji: string } {
  if (obs.prec > 5)  return { label: 'Lluvia intensa',       emoji: '🌧' }
  if (obs.prec > 0)  return { label: 'Lluvia',               emoji: '🌦' }
  if (obs.hr > 88)   return { label: 'Cubierto',             emoji: '☁' }
  if (obs.hr > 72)   return { label: 'Muy nublado',          emoji: '⛅' }
  if (obs.hr > 55)   return { label: 'Parcialmente nublado', emoji: '🌤' }
  return               { label: 'Despejado',            emoji: '☀' }
}

function Pill({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
      style={{ background: 'var(--surface-sub)', border: '1px solid var(--border)' }}
    >
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>{sub}</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{label}</p>
      </div>
    </div>
  )
}

function Skeleton() {
  const bar = (w: string, h = '1rem') => (
    <div style={{ width: w, height: h, borderRadius: 6, background: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
  )
  return (
    <div className="flex flex-col gap-5 p-8">
      {bar('160px', '0.85rem')}
      <div className="flex items-baseline gap-3">
        {bar('120px', '5rem')}
        {bar('100px', '1.2rem')}
      </div>
      <div className="flex gap-3">{[1,2,3,4].map(i => bar('120px', '3.5rem'))}</div>
    </div>
  )
}

export default function CurrentWeather({ obs, loading }: Props) {
  if (loading) return <Skeleton />

  const cond    = obs ? deriveCondition(obs) : { label: 'Sin datos', emoji: '—' }
  const windDir = obs ? WIND_DIRS[Math.round(obs.dv / 45) % 8] : '—'

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Location */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        📍 {obs?.ubi ?? 'Santa Cruz de Tenerife'}
        <span style={{ marginLeft: 8, color: 'var(--text-dim)' }}>
          {obs ? `${obs.lat.toFixed(3)}°N · ${Math.abs(obs.lon).toFixed(3)}°W · ${obs.alt} m` : '28.464°N · 16.252°W · 35 m'}
        </span>
      </p>

      {/* Big temp + condition */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-baseline gap-2">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '5.5rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
            {obs?.ta ?? '—'}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--text-muted)' }}>°C</span>
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--text)' }}>
            {cond.emoji} {cond.label}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Máx {obs?.tamax ?? '—'}° · Mín {obs?.tamin ?? '—'}°
          </p>
        </div>
      </div>

      {/* Metric pills */}
      <div className="flex flex-wrap gap-3">
        <Pill icon="💨" sub="Viento"      label={obs ? `${Math.round(obs.vv)} km/h ${windDir}` : '—'} />
        <Pill icon="💧" sub="Humedad"     label={obs ? `${obs.hr}%` : '—'} />
        <Pill icon="🌡" sub="Presión"     label={obs ? `${obs.pres} hPa` : '—'} />
        <Pill icon="🌧" sub="Precipitación" label={obs ? `${obs.prec ?? 0} mm` : '—'} />
      </div>
    </div>
  )
}
