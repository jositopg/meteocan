import { useEffect, useState } from 'react'
import type { Observation, ForecastDay, IslandId } from '../services/aemet'
import { fetchWaveData, angleDiff, type WaveData } from '../services/marine'
import {
  SURF_SPOTS, GOLF_COURSES, HIKING_TRAILS,
  type SurfSpot, type GolfCourse, type HikingTrail,
} from '../data/outdoorData'

// ── Score utilities ────────────────────────────────────────────────────────

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)) }

function scoreColor(s: number): string {
  if (s >= 8) return '#15803d'
  if (s >= 6) return '#65a30d'
  if (s >= 4) return '#d97706'
  if (s >= 2) return '#dc2626'
  return '#7c3aed'
}
function scoreBg(s: number): string {
  if (s >= 8) return '#f0fdf4'
  if (s >= 6) return '#f7fee7'
  if (s >= 4) return '#fffbeb'
  if (s >= 2) return '#fef2f2'
  return '#faf5ff'
}
function scoreLabel(s: number): string {
  if (s >= 9) return 'Condiciones épicas'
  if (s >= 7) return 'Muy buenas'
  if (s >= 5.5) return 'Buenas'
  if (s >= 4) return 'Aceptables'
  if (s >= 2.5) return 'Flojas'
  return 'Malas'
}

// ── SURF SCORE (0–10) ──────────────────────────────────────────────────────

interface SurfScore {
  score: number
  height: string
  period: string
  windEffect: 'offshore' | 'lateral' | 'onshore' | 'calma'
  windKmh: number
  summary: string
  factors: string[]
}

function calcSurfScore(spot: SurfSpot, wave: WaveData, obs: Observation | null): SurfScore {
  const { waveHeight: h, swellPeriod: sp, swellHeight: sh, waveDirection: wd } = wave
  const windKmh = obs?.vv ?? 0
  const windDir = obs?.dv ?? 0

  // 1. Tamaño base (0–6 puntos)
  let size = 0
  if      (h < 0.3)  size = 0   // flat
  else if (h < 0.6)  size = 2   // muy pequeño
  else if (h < 1.0)  size = 4   // pequeño
  else if (h < 1.8)  size = 6   // bueno
  else if (h < 2.5)  size = 5.5 // grande
  else if (h < 3.5)  size = 4   // muy grande — solo expertos
  else               size = 1.5 // peligroso

  // 2. Calidad del swell (periodo) (−2 a +2)
  let periodBonus = 0
  if      (sp < 5)   periodBonus = -2   // choppy / viento
  else if (sp < 7)   periodBonus = -1   // corto
  else if (sp < 10)  periodBonus =  0   // decente
  else if (sp < 13)  periodBonus =  1   // bueno
  else               periodBonus =  2   // excelente

  // Bonus si el swell es limpio (poco viento chop)
  const swellRatio = h > 0 ? sh / h : 0
  if (swellRatio > 0.8) periodBonus += 0.5

  // 3. Efecto del viento (−3 a +1.5)
  // El offshore es el ángulo opuesto a donde mira la playa
  const offshoreDir = (spot.facingDir + 180) % 360
  const diff = angleDiff(windDir, offshoreDir)  // 0=offshore, 180=onshore

  let windEffect: SurfScore['windEffect']
  let windBonus = 0

  if (windKmh < 8) {
    windEffect = 'calma'
    windBonus = 1      // calma = glassy, bueno
  } else if (diff < 60) {
    windEffect = 'offshore'
    windBonus = windKmh < 25 ? 1 : windKmh < 40 ? 0.5 : -0.5
  } else if (diff < 120) {
    windEffect = 'lateral'
    windBonus = windKmh < 20 ? 0 : -1
  } else {
    windEffect = 'onshore'
    windBonus = windKmh < 15 ? -1 : windKmh < 30 ? -2 : -3
  }

  // 4. Dirección del swell dentro de la ventana óptima del spot
  const [swFrom, swTo] = spot.swellWindow
  let swellOk = false
  if (swFrom < swTo) {
    swellOk = wd >= swFrom && wd <= swTo
  } else {
    // wraps around 0° (e.g. 300–60)
    swellOk = wd >= swFrom || wd <= swTo
  }
  const dirBonus = swellOk ? 0.5 : -0.5

  const raw = size + periodBonus + windBonus + dirBonus
  const score = Math.round(clamp(raw, 0, 10) * 10) / 10

  // Build explanation factors
  const factors: string[] = []
  factors.push(`Altura ${h.toFixed(1)} m`)
  factors.push(`Periodo ${sp.toFixed(0)} s`)
  factors.push(windEffect === 'offshore' ? `Viento offshore (${Math.round(windKmh)} km/h) — limpia las olas` :
               windEffect === 'onshore'  ? `Viento onshore (${Math.round(windKmh)} km/h) — pica el mar` :
               windEffect === 'lateral'  ? `Viento lateral (${Math.round(windKmh)} km/h)` :
               'Viento en calma — mar brillante')
  if (!swellOk) factors.push('El swell no viene de la dirección óptima')

  const summary = score >= 7 ? 'Merecen el agua' :
                  score >= 5 ? 'Vale la pena salir' :
                  score >= 3 ? 'Solo si tienes ganas' :
                  h < 0.4    ? 'Mar plano' : 'Mejor otro día'

  return {
    score,
    height: `${h.toFixed(1)} m`,
    period: `${sp.toFixed(0)} s`,
    windEffect,
    windKmh: Math.round(windKmh),
    summary,
    factors,
  }
}

// ── GOLF SCORE (0–10) ──────────────────────────────────────────────────────

interface GolfScore {
  score: number
  windImpact: string
  rainImpact: string
  summary: string
  warning?: string
}

function calcGolfScore(course: GolfCourse, obs: Observation | null, forecast: ForecastDay[]): GolfScore {
  const wind  = obs?.vv  ?? 0
  const gust  = obs?.vmax ?? wind
  const prob  = forecast[0]?.probPrecip ?? 0
  const temp  = obs?.ta ?? 22

  // Factor viento (50% del score)
  let windScore = 10
  if      (gust > 60) windScore = 1
  else if (gust > 50) windScore = 2
  else if (gust > 40) windScore = 4
  else if (wind > 30) windScore = 5
  else if (wind > 20) windScore = 7
  else if (wind > 12) windScore = 9
  // else 10

  // Ajuste por altitud (campos altos tienen más viento)
  if (course.altitudeM > 400) windScore = clamp(windScore - 1.5, 0, 10)
  else if (course.altitudeM > 200) windScore = clamp(windScore - 0.5, 0, 10)

  // Factor lluvia (35% del score)
  let rainScore = 10
  if      (prob > 75) rainScore = 0
  else if (prob > 55) rainScore = 2
  else if (prob > 40) rainScore = 5
  else if (prob > 25) rainScore = 7
  else if (prob > 10) rainScore = 9

  // Factor temperatura (15%)
  let tempScore = 10
  if      (temp > 38 || temp < 5)  tempScore = 2
  else if (temp > 33 || temp < 10) tempScore = 5
  else if (temp > 29 || temp < 14) tempScore = 8

  const score = Math.round((windScore * 0.5 + rainScore * 0.35 + tempScore * 0.15) * 10) / 10

  const windImpact = gust > 40 ? `Rachas de ${Math.round(gust)} km/h — afecta todos los golpes` :
                     wind > 20 ? `${Math.round(wind)} km/h — shots largos afectados (+2 palos)` :
                     wind > 12 ? `Brisa de ${Math.round(wind)} km/h — efecto moderado` :
                     'Viento flojo — condiciones óptimas'

  const rainImpact = prob > 60 ? `${prob}% de lluvia — preparar chubasquero` :
                     prob > 30 ? `${prob}% — posible chubasco puntual` :
                     `${prob}% — poco probable`

  const summary = score >= 8 ? 'Día perfecto para el campo' :
                  score >= 6 ? 'Buenas condiciones' :
                  score >= 4 ? 'Jugable con adaptación' :
                  'Condiciones difíciles'

  const warning = gust > 50 ? 'Viento peligroso — riesgo de objetos volantes en el campo' :
                  prob > 70 ? 'Alta probabilidad de lluvia — verifica antes de salir' :
                  undefined

  return { score, windImpact, rainImpact, summary, warning }
}

// ── HIKING SCORE (0–10) ────────────────────────────────────────────────────

interface HikingScore {
  score: number
  summary: string
  alerts: string[]
  tips: string[]
}

function calcHikingScore(trail: HikingTrail, obs: Observation | null, forecast: ForecastDay[]): HikingScore {
  if (!obs) return { score: 5, summary: 'Sin datos', alerts: [], tips: [] }

  const prec  = obs.prec
  const prob  = forecast[0]?.probPrecip ?? 0
  const wind  = obs.vv
  const gust  = obs.vmax
  const temp  = obs.ta
  const vis   = obs.vis
  const south = obs.dv > 120 && obs.dv < 240
  const calima = temp > 23 && obs.hr < 48 && south

  // Temperatura ajustada a la altitud de la ruta (−0.65°C / 100m ganados)
  const gainM      = trail.altitudeMaxM - (obs.alt ?? 35)
  const tempAtTop  = temp - (gainM / 100) * 0.65

  // Viento estimado en cima (el viento aumenta con la altitud, aprox ×1.5 en cimas)
  const windAtTop  = trail.riskFactors.includes('cumbre') ? gust * 1.5 : gust

  // ── Scores por factor ──
  let rainScore = 10
  if      (prec > 5 || prob > 70)                    rainScore = 0
  else if (prec > 1 || prob > 50)                    rainScore = 3
  else if (prob > 35)                                 rainScore = 6
  else if (prob > 15)                                 rainScore = 8

  let windScore = 10
  if      (windAtTop > 70)                           windScore = 0
  else if (windAtTop > 55)                           windScore = 2
  else if (windAtTop > 40)                           windScore = 5
  else if (windAtTop > 28)                           windScore = 7
  else if (windAtTop > 18)                           windScore = 9

  let tempScore = 10
  if      (tempAtTop < 2)                            tempScore = 2  // hipotermia
  else if (tempAtTop < 8)                            tempScore = 6  // frío
  else if (tempAtTop > 35)                           tempScore = 3  // calor extremo
  else if (tempAtTop > 28)                           tempScore = 7  // calor

  let visScore = 10
  if      (vis < 1)                                  visScore = 0
  else if (vis < 3)                                  visScore = 3
  else if (vis < 8)                                  visScore = 7

  // Penalización extra si hay barranco + lluvia (riesgo de crecida)
  const barrancoRisk = trail.riskFactors.includes('barranco') && (prec > 0 || prob > 30) ? -2 : 0

  // Pesos según tipo de exposición
  const weights = trail.exposure === 'alta montaña'
    ? { rain: 0.25, wind: 0.40, temp: 0.25, vis: 0.10 }
    : trail.exposure === 'barranco'
    ? { rain: 0.50, wind: 0.20, temp: 0.20, vis: 0.10 }
    : { rain: 0.35, wind: 0.25, temp: 0.25, vis: 0.15 }

  const raw = rainScore * weights.rain + windScore * weights.wind +
              tempScore * weights.temp + visScore * weights.vis + barrancoRisk
  const score = Math.round(clamp(raw, 0, 10) * 10) / 10

  // Build alerts
  const alerts: string[] = []
  if (prec > 0 || prob > 50) alerts.push(`Lluvia activa o muy probable (${prob}%)`)
  if (trail.riskFactors.includes('barranco') && (prec > 0 || prob > 25))
    alerts.push('BARRANCO: cualquier lluvia (aunque sea lejos) puede causar crecida repentina')
  if (windAtTop > 50) alerts.push(`Viento estimado en cima: ${Math.round(windAtTop)} km/h — riesgo de caída`)
  if (tempAtTop < 5)  alerts.push(`Temperatura en cima ~${Math.round(tempAtTop)}°C — llevar ropa de abrigo`)
  if (vis < 3)        alerts.push(`Visibilidad reducida (${vis} km) — posible desorientación`)
  if (calima)         alerts.push('Calima: hidratación extra imprescindible, protege las vías respiratorias')

  // Build tips
  const tips: string[] = []
  if (trail.exposure === 'alta montaña') tips.push('Lleva mínimo 2 L de agua, cortavientos y capas')
  if (trail.riskFactors.includes('sol_directo') && !calima) tips.push('Protector solar SPF50+ — exposición UV alta en altura')
  if (trail.exposure === 'forestal') tips.push('El suelo puede estar resbaladizo aunque no llueva en tu zona')
  if (score >= 7 && alerts.length === 0) tips.push('Buen momento para esta ruta')

  const summary = score >= 8 ? 'Condiciones ideales' :
                  score >= 6 ? 'Buenas condiciones' :
                  score >= 4 ? 'Precaución recomendada' :
                  score >= 2 ? 'Solo senderistas experimentados' :
                  'Ruta no recomendada hoy'

  return { score, summary, alerts, tips }
}

// ── Components ─────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const c = scoreColor(score)
  const bg = scoreBg(score)
  return (
    <div style={{
      width: 52, height: 52, borderRadius: 14,
      background: bg, border: `2px solid ${c}30`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: c, lineHeight: 1 }}>
        {score.toFixed(score % 1 === 0 ? 0 : 1)}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.48rem', color: c, opacity: 0.7, letterSpacing: '0.05em' }}>
        /10
      </span>
    </div>
  )
}

// ── SURF TAB ──────────────────────────────────────────────────────────────

function WindEffectTag({ effect }: { effect: SurfScore['windEffect'] }) {
  const cfg = {
    offshore: { label: 'Offshore ↗', color: '#15803d', bg: '#d1fae5' },
    lateral:  { label: 'Lateral →',  color: '#92400e', bg: '#fef3c7' },
    onshore:  { label: 'Onshore ↙', color: '#991b1b', bg: '#fee2e2' },
    calma:    { label: 'Calma 🪞',   color: '#1d4ed8', bg: '#dbeafe' },
  }[effect]
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
      color: cfg.color, background: cfg.bg,
      padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

function SurfTab({ spots, obs, islandId }: { spots: SurfSpot[]; obs: Observation | null; islandId: IslandId }) {
  const [waveData, setWaveData] = useState<Record<string, WaveData>>({})
  const [waveLoading, setWaveLoading] = useState(true)

  useEffect(() => {
    setWaveLoading(true)
    setWaveData({})
    const islandSpots = spots.filter(s => s.island === islandId)
    Promise.allSettled(
      islandSpots.map(s => fetchWaveData(s.lat, s.lon).then(d => [s.id, d] as const))
    ).then(results => {
      const map: Record<string, WaveData> = {}
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value[1]) {
          map[r.value[0]] = r.value[1]
        }
      }
      setWaveData(map)
      setWaveLoading(false)
    })
  }, [islandId])

  const islandSpots = spots.filter(s => s.island === islandId)

  if (islandSpots.length === 0) {
    return (
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          No tenemos spots catalogados para esta isla todavía.
        </p>
      </div>
    )
  }

  const LEVEL_CFG = {
    principiante: { label: 'Principiante', color: '#15803d', bg: '#d1fae5' },
    intermedio:   { label: 'Intermedio',   color: '#1d4ed8', bg: '#dbeafe' },
    avanzado:     { label: 'Avanzado',     color: '#7c3aed', bg: '#ede9fe' },
    todos:        { label: 'Todos',        color: '#64748b', bg: '#f1f5f9' },
  }
  const BREAK_EMOJI = { playa: '🏖️', arrecife: '🪨', punta: '🌊' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {islandSpots.map(spot => {
        const wave = waveData[spot.id]
        const lvl = LEVEL_CFG[spot.level]

        if (waveLoading || !wave) {
          return (
            <div key={spot.id} style={{ height: 90, background: '#f1f5f9', borderRadius: 14, border: '1px solid var(--border)' }} />
          )
        }

        const surf = calcSurfScore(spot, wave, obs)
        const c = scoreColor(surf.score)

        return (
          <div key={spot.id} style={{
            borderRadius: 14, border: '1px solid var(--border)',
            background: 'var(--bg)',
            padding: '16px 18px',
            display: 'flex', gap: 16, alignItems: 'flex-start',
          }}>
            <ScoreBadge score={surf.score} />

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ fontSize: '1rem' }}>{BREAK_EMOJI[spot.breakType]}</span>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)' }}>
                  {spot.name}
                </p>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 700, color: lvl.color, background: lvl.bg, padding: '1px 7px', borderRadius: 6 }}>
                  {lvl.label}
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, color: c }}>
                  {scoreLabel(surf.score)}
                </span>
              </div>

              {/* Data row */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600 }}>
                  🌊 {surf.height}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ⏱ {surf.period}
                </span>
                <WindEffectTag effect={surf.windEffect} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  💨 {surf.windKmh} km/h
                </span>
              </div>

              {/* Factors */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {surf.factors.map((f, i) => (
                  <span key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    {i > 0 ? '· ' : ''}{f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', paddingTop: 4 }}>
        Oleaje: Open-Meteo Marine API · Viento: AEMET observación en tiempo real
      </p>
    </div>
  )
}

// ── GOLF TAB ──────────────────────────────────────────────────────────────

function GolfTab({ courses, obs, forecast, islandId }: { courses: GolfCourse[]; obs: Observation | null; forecast: ForecastDay[]; islandId: IslandId }) {
  const islandCourses = courses.filter(c => c.island === islandId)

  if (islandCourses.length === 0) {
    return (
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          No hay campos de golf registrados para esta isla.
        </p>
      </div>
    )
  }

  const ZONE_LABEL = { norte: '🌧️ Norte', sur: '☀️ Sur', oeste: '🌊 Oeste' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {islandCourses.map(course => {
        const golf = calcGolfScore(course, obs, forecast)
        const c = scoreColor(golf.score)

        return (
          <div key={course.id} style={{
            borderRadius: 14, border: `1px solid var(--border)`,
            background: golf.warning ? '#fffbeb' : 'var(--bg)',
            padding: '16px 18px',
            display: 'flex', gap: 16, alignItems: 'flex-start',
          }}>
            <ScoreBadge score={golf.score} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                  {course.name}
                </p>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '1px 7px', borderRadius: 6 }}>
                  {course.holes} hoyos
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                  {ZONE_LABEL[course.zone]}
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, color: c }}>
                  {golf.summary}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.77rem', color: 'var(--text-muted)' }}>
                  💨 {golf.windImpact}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.77rem', color: 'var(--text-muted)' }}>
                  🌧️ {golf.rainImpact}
                </p>
                {golf.warning && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#92400e', fontWeight: 600, marginTop: 4 }}>
                    ⚠️ {golf.warning}
                  </p>
                )}
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2, fontStyle: 'italic' }}>
                  {course.notes}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── HIKING TAB ────────────────────────────────────────────────────────────

function HikingTab({ trails, obs, forecast, islandId }: { trails: HikingTrail[]; obs: Observation | null; forecast: ForecastDay[]; islandId: IslandId }) {
  const islandTrails = trails.filter(t => t.island === islandId)

  if (islandTrails.length === 0) {
    return (
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          No hay rutas catalogadas para esta isla todavía.
        </p>
      </div>
    )
  }

  const DIFF_CFG = {
    'fácil':       { color: '#15803d', bg: '#d1fae5' },
    'moderada':    { color: '#1d4ed8', bg: '#dbeafe' },
    'difícil':     { color: '#d97706', bg: '#fef3c7' },
    'muy difícil': { color: '#991b1b', bg: '#fee2e2' },
  }
  const EXPO_EMOJI: Record<string, string> = {
    'forestal': '🌲', 'costera': '🌊', 'alta montaña': '🏔️', 'barranco': '🪨', 'mixta': '🌿',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {islandTrails.map(trail => {
        const hike = calcHikingScore(trail, obs, forecast)
        const diff = DIFF_CFG[trail.difficulty]
        const c = scoreColor(hike.score)

        return (
          <div key={trail.id} style={{
            borderRadius: 14, border: `1px solid ${hike.alerts.length > 0 ? '#fcd34d' : 'var(--border)'}`,
            background: hike.alerts.length > 1 ? '#fffbeb' : 'var(--bg)',
            padding: '16px 18px',
            display: 'flex', gap: 16, alignItems: 'flex-start',
          }}>
            <ScoreBadge score={hike.score} />

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.95rem' }}>{EXPO_EMOJI[trail.exposure]}</span>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                  {trail.name}
                </p>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700, color: diff.color, background: diff.bg, padding: '1px 7px', borderRadius: 6 }}>
                  {trail.difficulty}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                  {trail.distanceKm} km · ↑{trail.altitudeMaxM} m
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, color: c }}>
                  {hike.summary}
                </span>
              </div>

              {/* Description */}
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.45 }}>
                {trail.description}
              </p>

              {/* Alerts */}
              {hike.alerts.map((a, i) => (
                <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#92400e', fontWeight: 600, marginBottom: 4 }}>
                  ⚠️ {a}
                </p>
              ))}

              {/* Tips */}
              {hike.tips.map((t, i) => (
                <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 2 }}>
                  💡 {t}
                </p>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

type Tab = 'surf' | 'golf' | 'senderismo'

interface Props {
  obs: Observation | null
  forecast: ForecastDay[]
  loading: boolean
  islandId: IslandId
}

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'surf',       label: 'Surf',       emoji: '🏄' },
  { id: 'golf',       label: 'Golf',       emoji: '⛳' },
  { id: 'senderismo', label: 'Senderismo', emoji: '🥾' },
]

export default function OutdoorSports({ obs, forecast, loading, islandId }: Props) {
  const [tab, setTab] = useState<Tab>('surf')

  return (
    <div style={{ padding: '20px 24px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700,
          color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>
          Deportes al aire libre
        </p>
        {/* Score legend */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {[
            { color: '#15803d', label: '8–10' },
            { color: '#65a30d', label: '6–8' },
            { color: '#d97706', label: '4–6' },
            { color: '#dc2626', label: '0–4' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20,
        background: 'var(--bg)', borderRadius: 12, padding: 4,
        border: '1px solid var(--border)',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '8px 0',
              background: tab === t.id ? 'var(--surface)' : 'none',
              border: tab === t.id ? '1px solid var(--border)' : '1px solid transparent',
              borderRadius: 9, cursor: 'pointer',
              boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '1rem' }}>{t.emoji}</span>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? 'var(--text)' : 'var(--text-muted)',
            }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 88, background: '#e2e8f0', borderRadius: 14 }} />
          ))}
        </div>
      ) : (
        <>
          {tab === 'surf' && (
            <SurfTab spots={SURF_SPOTS} obs={obs} islandId={islandId} />
          )}
          {tab === 'golf' && (
            <GolfTab courses={GOLF_COURSES} obs={obs} forecast={forecast} islandId={islandId} />
          )}
          {tab === 'senderismo' && (
            <HikingTab trails={HIKING_TRAILS} obs={obs} forecast={forecast} islandId={islandId} />
          )}
        </>
      )}
    </div>
  )
}
