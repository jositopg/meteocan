import type { ForecastDay as ApiForecastDay } from '../services/aemet'

interface ForecastBarProps {
  days: ApiForecastDay[]
  loading: boolean
}

type Condition = 'sunny' | 'partlyCloudy' | 'cloudy' | 'lightRain' | 'rain' | 'storm'

interface ConditionMeta {
  icon: string
  label: string
  color: string
  bg: string
}

const CONDITIONS: Record<Condition, ConditionMeta> = {
  sunny:        { icon: '☀',  label: 'Soleado',       color: '#ffb95a', bg: 'rgba(255,185,90,0.08)'  },
  partlyCloudy: { icon: '⛅', label: 'Algo nublado',  color: '#8bd1e8', bg: 'rgba(139,209,232,0.07)' },
  cloudy:       { icon: '☁',  label: 'Nublado',       color: '#8892a4', bg: 'rgba(136,146,164,0.08)' },
  lightRain:    { icon: '🌦', label: 'Lluvia débil',  color: '#4a9ece', bg: 'rgba(74,158,206,0.10)'  },
  rain:         { icon: '🌧', label: 'Lluvia',        color: '#3a7ab8', bg: 'rgba(58,122,184,0.12)'  },
  storm:        { icon: '⛈', label: 'Tormenta',      color: '#ffb95a', bg: 'rgba(255,185,90,0.10)'  },
}

// Map AEMET codes + probability to a plain-language condition
function toCondition(code: string, probPrecip: number): Condition {
  const c = String(code).replace(/n$/, '')
  if (['81','82','83','84','85'].includes(c)) return 'storm'
  if (['61','62','63','64','71','72','73','74'].includes(c)) return 'rain'
  if (['51','52','53','54'].includes(c) || probPrecip >= 50) return 'lightRain'
  if (['14','15','16','17','23','24','25','26','33','34','35','36','43','44','45','46'].includes(c) || probPrecip >= 25) return 'cloudy'
  if (['12','13','22','32','42'].includes(c) || probPrecip >= 10) return 'partlyCloudy'
  return 'sunny'
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function dayLabel(fecha: string, i: number): string {
  if (i === 0) return 'Hoy'
  if (i === 1) return 'Mañana'
  try { return DAY_NAMES[new Date(fecha).getDay()] } catch { return `D+${i}` }
}

function SkeletonBar() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 h-28 rounded-lg animate-pulse" style={{ background: 'var(--surface-container-high)' }} />
      ))}
    </div>
  )
}

export default function ForecastBar({ days, loading }: ForecastBarProps) {
  if (loading) return <SkeletonBar />

  return (
    <div className="flex gap-2">
      {days.map((d, i) => {
        const cond = toCondition(d.estadoCielo, d.probPrecip)
        const meta = CONDITIONS[cond]
        const isHighRes = i < 2

        return (
          <div
            key={d.fecha}
            className="flex-1 flex flex-col items-center gap-1.5 py-3 px-1 rounded-lg relative"
            style={{ background: isHighRes ? 'var(--surface-container-high)' : 'var(--surface-container-low)' }}
            title={meta.label}
          >
            {/* High-res badge */}
            {isHighRes && (
              <span
                className="absolute top-1.5 right-1.5 text-primary"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem' }}
                title="Alta resolución 2.5 km"
              >
                ●
              </span>
            )}

            {/* Day */}
            <span
              className="text-on-surface-variant"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem' }}
            >
              {dayLabel(d.fecha, i)}
            </span>

            {/* Weather icon */}
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }} title={meta.label}>
              {meta.icon}
            </span>

            {/* Condition label */}
            <span
              className="text-center leading-tight"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.58rem', color: meta.color, lineHeight: 1.2 }}
            >
              {meta.label}
            </span>

            {/* Temps */}
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className="text-on-surface font-semibold"
                style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}
              >
                {d.tempMax}°
              </span>
              <span
                className="text-on-surface-variant"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}
              >
                {d.tempMin}°
              </span>
            </div>

            {/* Rain probability */}
            {d.probPrecip > 0 && (
              <div className="flex items-center gap-0.5">
                <span style={{ color: '#4a9ece', fontSize: '0.6rem' }}>💧</span>
                <span
                  className="text-rain"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}
                >
                  {d.probPrecip}%
                </span>
              </div>
            )}

            {/* Low-res warning */}
            {!isHighRes && (
              <span
                className="text-tertiary/60"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem' }}
                title="Previsión a 25km — menos fiable"
              >
                25km
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
