import type { ForecastDay as ApiForecastDay } from '../services/aemet'

interface ForecastBarProps {
  days: ApiForecastDay[]
  loading: boolean
}

type Condition = 'clear' | 'clouds' | 'rain' | 'storms'

// Map AEMET estadoCielo codes to our conditions
// https://www.aemet.es/es/eltiempo/prediccion/municipios/helps/tabla_estados_cielo
function cielo2condition(code: string, probPrecip: number): Condition {
  const c = String(code).replace(/[n]$/, '') // strip 'n' (nocturno)
  if (['51', '52', '53', '54', '61', '62', '63', '64', '71', '72', '73', '74'].includes(c)) return 'rain'
  if (['81', '82', '83', '84', '85'].includes(c)) return 'storms'
  if (['11', '12', '13'].includes(c) || probPrecip < 15) return 'clear'
  return 'clouds'
}

const ICONS: Record<Condition, string> = {
  clear:  '○',
  clouds: '◑',
  rain:   '●',
  storms: '⚡',
}
const COLORS: Record<Condition, string> = {
  clear:  'text-on-surface-variant',
  clouds: 'text-secondary',
  rain:   'text-rain',
  storms: 'text-tertiary',
}

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function dayLabel(fecha: string, i: number): string {
  if (i === 0) return 'Hoy'
  if (i === 1) return 'Mañana'
  try {
    return DAY_LABELS[new Date(fecha).getDay()]
  } catch {
    return `D+${i}`
  }
}

// Skeleton placeholder
function SkeletonBar() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-24 rounded-lg animate-pulse"
          style={{ background: 'var(--surface-container-high)' }}
        />
      ))}
    </div>
  )
}

export default function ForecastBar({ days, loading }: ForecastBarProps) {
  if (loading) return <SkeletonBar />

  return (
    <div className="flex gap-2">
      {days.map((d, i) => {
        const condition = cielo2condition(d.estadoCielo, d.probPrecip)
        return (
          <div
            key={d.fecha}
            className={[
              'flex-1 flex flex-col items-center gap-2 py-3 rounded-lg',
              i < 2 ? 'bg-surface-container-high' : 'bg-surface-container-low',
            ].join(' ')}
          >
            <span
              className="text-xs text-on-surface-variant"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {dayLabel(d.fecha, i)}
            </span>
            <span className={`text-base ${COLORS[condition]}`} title={d.estadoCieloDesc}>
              {ICONS[condition]}
            </span>
            <div className="flex flex-col items-center gap-0.5">
              <span
                className="text-on-surface text-sm font-medium"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {d.tempMax}°
              </span>
              <span
                className="text-on-surface-variant text-xs"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {d.tempMin}°
              </span>
            </div>
            {d.probPrecip > 0 && (
              <span
                className="text-xs text-rain"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}
              >
                {d.probPrecip}%
              </span>
            )}
            {i >= 2 && (
              <span
                className="text-outline-variant/50 leading-none"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem' }}
                title="Baja resolución — modelo global 25km"
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
