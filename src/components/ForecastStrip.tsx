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
  sunny:        { icon: '☀',  label: 'Soleado',      color: '#f59e0b', bg: '#fffbeb' },
  partlyCloudy: { icon: '⛅', label: 'Algo nublado', color: '#64748b', bg: '#f8fafc' },
  cloudy:       { icon: '☁',  label: 'Nublado',      color: '#64748b', bg: '#f1f5f9' },
  lightRain:    { icon: '🌦', label: 'Lluvia débil', color: '#3b82f6', bg: '#eff6ff' },
  rain:         { icon: '🌧', label: 'Lluvia',       color: '#1d4ed8', bg: '#eff6ff' },
  storm:        { icon: '⛈', label: 'Tormenta',     color: '#dc2626', bg: '#fef2f2' },
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
function dayLabel(fecha: string, i: number) {
  if (i === 0) return 'Hoy'
  if (i === 1) return 'Mañana'
  try { return DAY_NAMES[new Date(fecha).getDay()] } catch { return `D+${i}` }
}

function SkeletonCard() {
  return (
    <div style={{ flex: '1 0 90px', height: 130, borderRadius: 12, background: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
  )
}

export default function ForecastStrip({ days, loading }: Props) {
  return (
    <div className="p-6 flex flex-col gap-4">
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Próximos 7 días
      </p>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
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
                    borderRadius: 12,
                    padding: '14px 10px',
                    background: isToday ? 'var(--primary)' : meta.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    border: '1px solid var(--border)',
                    transition: 'transform 0.15s',
                    cursor: 'default',
                  }}
                >
                  {/* Day */}
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {dayLabel(d.fecha, i)}
                  </span>

                  {/* Icon */}
                  <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{meta.icon}</span>

                  {/* Temps */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: isToday ? '#fff' : 'var(--text)',
                      display: 'block',
                    }}>
                      {d.tempMax}°
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8rem',
                      color: isToday ? 'rgba(255,255,255,0.65)' : 'var(--text-dim)',
                    }}>
                      {d.tempMin}°
                    </span>
                  </div>

                  {/* Rain prob */}
                  {d.probPrecip > 0 && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      color: isToday ? 'rgba(255,255,255,0.75)' : 'var(--rain)',
                      fontWeight: 500,
                    }}>
                      💧{d.probPrecip}%
                    </span>
                  )}

                  {/* Low-res badge */}
                  {i >= 2 && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.52rem',
                      color: isToday ? 'rgba(255,255,255,0.4)' : 'var(--text-dim)',
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
