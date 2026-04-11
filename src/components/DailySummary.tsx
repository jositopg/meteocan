import type { Observation, ForecastDay, IslandId } from '../services/aemet'
import { ISLAND_CONFIG } from '../services/aemet'
import { generateSummary } from '../utils/weatherLogic'

interface Props { obs: Observation | null; forecast: ForecastDay[]; loading: boolean; islandId: IslandId }

type Condition = 'sunny' | 'partlyCloudy' | 'cloudy' | 'lightRain' | 'rain' | 'storm'

const COND_THEME: Record<Condition, {
  emoji: string; label: string; gradient: string; textColor: string
}> = {
  sunny:        { emoji: '☀️',  label: 'Despejado',    gradient: 'linear-gradient(160deg, #fef9c3 0%, #fde68a 55%, #fbbf24 100%)', textColor: '#78350f' },
  partlyCloudy: { emoji: '⛅', label: 'Algo nublado',  gradient: 'linear-gradient(160deg, #eff6ff 0%, #dbeafe 55%, #bfdbfe 100%)', textColor: '#1e3a8a' },
  cloudy:       { emoji: '☁️',  label: 'Nublado',      gradient: 'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 100%)',              textColor: '#334155' },
  lightRain:    { emoji: '🌦️', label: 'Chubascos',    gradient: 'linear-gradient(160deg, #f0f9ff 0%, #bae6fd 100%)',              textColor: '#075985' },
  rain:         { emoji: '🌧️', label: 'Lluvia',       gradient: 'linear-gradient(160deg, #dbeafe 0%, #93c5fd 100%)',              textColor: '#1e3a8a' },
  storm:        { emoji: '⛈️', label: 'Tormenta',     gradient: 'linear-gradient(160deg, #475569 0%, #1e293b 100%)',              textColor: '#f1f5f9' },
}

function getCondition(code: string, prob: number): Condition {
  const c = String(code).replace(/n$/, '')
  if (['81','82','83','84','85'].includes(c))                              return 'storm'
  if (['61','62','63','64','71','72','73','74'].includes(c) || prob >= 60) return 'rain'
  if (['51','52','53','54'].includes(c) || prob >= 40)                    return 'lightRain'
  if (['14','15','16','17','23','24','25','26','33','34','35','36'].includes(c) || prob >= 20) return 'cloudy'
  if (['12','13','22','32','42'].includes(c) || prob >= 10)               return 'partlyCloudy'
  return 'sunny'
}

function Skeleton() {
  return (
    <div style={{
      height: 300,
      background: 'linear-gradient(160deg, #f1f5f9, #e2e8f0)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 16,
    }}>
      <div style={{ width: 76, height: 76, background: 'rgba(0,0,0,0.07)', borderRadius: '50%' }} />
      <div style={{ width: 120, height: 72, background: 'rgba(0,0,0,0.07)', borderRadius: 14 }} />
      <div style={{ width: 180, height: 14, background: 'rgba(0,0,0,0.06)', borderRadius: 6 }} />
      <div style={{ width: 140, height: 12, background: 'rgba(0,0,0,0.05)', borderRadius: 6 }} />
    </div>
  )
}

export default function DailySummary({ obs, forecast, loading, islandId }: Props) {
  if (loading || !obs) return <Skeleton />

  const summary = generateSummary(obs, forecast, islandId)
  const capital = ISLAND_CONFIG[islandId].capital

  const day = forecast[0]
  const cond = day ? getCondition(day.estadoCielo, day.probPrecip) : 'partlyCloudy'
  const theme = COND_THEME[cond]

  return (
    <>
      {/* ── Hero gradient ── */}
      <div style={{
        background: theme.gradient,
        padding: '40px 24px 32px',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 4,
      }}>
        {/* Weather emoji */}
        <span style={{ fontSize: '4.5rem', lineHeight: 1 }}>
          {theme.emoji}
        </span>

        {/* Temperature */}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '6rem',
          fontWeight: 800,
          color: theme.textColor,
          lineHeight: 1,
          letterSpacing: '-0.05em',
          marginTop: 8,
        }}>
          {Math.round(obs.ta)}°
        </p>

        {/* Condition label */}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: 700,
          color: theme.textColor,
          opacity: 0.8,
          marginTop: 6,
        }}>
          {theme.label}
        </p>

        {/* High / Low */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 6 }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600,
            color: theme.textColor, opacity: 0.65,
          }}>
            ↑ {obs.tamax}°
          </span>
          <span style={{ color: theme.textColor, opacity: 0.2 }}>|</span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600,
            color: theme.textColor, opacity: 0.65,
          }}>
            ↓ {obs.tamin}°
          </span>
        </div>

        {/* Location */}
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
          color: theme.textColor, opacity: 0.45,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          marginTop: 10,
        }}>
          📍 {capital} · {obs.alt} m
        </p>
      </div>

      {/* ── Narrative ── */}
      <div style={{ padding: '20px 24px 24px' }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
          color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.14em',
          marginBottom: 8,
        }}>
          Resumen del día
        </p>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.93rem',
          color: 'var(--text)', lineHeight: 1.75,
        }}>
          {summary}
        </p>
      </div>
    </>
  )
}
