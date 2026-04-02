import type { ForecastDay } from '../services/aemet'

interface Props { days: ForecastDay[]; loading: boolean }

type Condition = 'sunny' | 'partlyCloudy' | 'cloudy' | 'lightRain' | 'rain' | 'storm'

function toCondition(code: string, prob: number): Condition {
  const c = String(code).replace(/n$/, '')
  if (['81','82','83','84','85'].includes(c))                                        return 'storm'
  if (['61','62','63','64','71','72','73','74'].includes(c) || prob >= 60)           return 'rain'
  if (['51','52','53','54'].includes(c) || prob >= 40)                              return 'lightRain'
  if (['14','15','16','17','23','24','25','26','33','34','35','36'].includes(c) || prob >= 20) return 'cloudy'
  if (['12','13','22','32','42'].includes(c) || prob >= 10)                         return 'partlyCloudy'
  return 'sunny'
}

const COND_META = {
  sunny:        { icon: '☀️',  label: 'Soleado',      color: '#f59e0b', bg: '#fffbeb' },
  partlyCloudy: { icon: '⛅', label: 'Algo nublado',  color: '#64748b', bg: '#f8fafc' },
  cloudy:       { icon: '☁️',  label: 'Nublado',      color: '#64748b', bg: '#f1f5f9' },
  lightRain:    { icon: '🌦️', label: 'Lluvia débil',  color: '#3b82f6', bg: '#eff6ff' },
  rain:         { icon: '🌧️', label: 'Lluvia',        color: '#1d4ed8', bg: '#eff6ff' },
  storm:        { icon: '⛈️', label: 'Tormenta',      color: '#dc2626', bg: '#fef2f2' },
}

function uvColor(uv: number) {
  if (uv >= 11) return '#7c3aed'
  if (uv >= 8)  return '#dc2626'
  if (uv >= 6)  return '#f59e0b'
  if (uv >= 3)  return '#65a30d'
  return '#9aabb8'
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
function dayLabel(fecha: string, i: number) {
  if (i === 0) return 'Hoy'
  if (i === 1) return 'Mañ.'
  try { return DAY_NAMES[new Date(fecha).getDay()] } catch { return `D+${i}` }
}

function SkeletonCard() {
  return (
    <div style={{ flex: '1 0 90px', height: 150, borderRadius: 14, background: '#e2e8f0' }} />
  )
}

export default function ForecastStrip({ days, loading }: Props) {
  return (
    <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em',
      }}>
        Próximos 7 días
      </p>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
          : days.map((d, i) => {
              const cond = toCondition(d.estadoCielo, d.probPrecip)
              const meta = COND_META[cond]
              const isToday = i === 0

              return (
                <div
                  key={d.fecha}
                  style={{
                    flex: '1 0 90px',
                    borderRadius: 14,
                    padding: '14px 10px 12px',
                    background: isToday ? 'var(--primary)' : meta.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 7,
                    border: `1px solid ${isToday ? 'transparent' : 'var(--border)'}`,
                    boxShadow: isToday ? '0 4px 12px rgba(27,104,212,0.25)' : 'none',
                  }}
                >
                  {/* Day label */}
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 700,
                    color: isToday ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {dayLabel(d.fecha, i)}
                  </span>

                  {/* Icon */}
                  <span style={{ fontSize: '1.7rem', lineHeight: 1 }}>{meta.icon}</span>

                  {/* Temps */}
                  <div style={{ textAlign: 'center', lineHeight: 1 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700,
                      color: isToday ? '#fff' : 'var(--text)', display: 'block',
                    }}>
                      {d.tempMax}°
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                      color: isToday ? 'rgba(255,255,255,0.6)' : 'var(--text-dim)',
                    }}>
                      {d.tempMin}°
                    </span>
                  </div>

                  {/* Rain prob */}
                  {d.probPrecip > 0 && (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                      color: isToday ? 'rgba(255,255,255,0.75)' : '#1d4ed8',
                    }}>
                      💧 {d.probPrecip}%
                    </span>
                  )}

                  {/* UV index */}
                  {d.uvMax > 0 && (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 600,
                      color: isToday ? 'rgba(255,255,255,0.7)' : uvColor(d.uvMax),
                    }}>
                      UV {d.uvMax}
                    </span>
                  )}

                  {/* Wind */}
                  {d.vientoVel > 0 && (
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                      color: isToday ? 'rgba(255,255,255,0.55)' : 'var(--text-dim)',
                    }}>
                      💨 {d.vientoVel} km/h
                    </span>
                  )}

                  {/* Low-res badge */}
                  {i >= 2 && (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.5rem',
                      color: isToday ? 'rgba(255,255,255,0.35)' : 'var(--text-dim)',
                      letterSpacing: '0.04em',
                    }}>
                      25 km
                    </span>
                  )}
                </div>
              )
            })
        }
      </div>
    </div>
  )
}
