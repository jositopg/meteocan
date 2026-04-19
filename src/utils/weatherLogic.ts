import type { Observation, ForecastDay, IslandId } from '../services/aemet'
import { ISLAND_CONFIG } from '../services/aemet'

// ── Climate averages by island capital (datos históricos AEMET) ───────────
// Cada isla tiene su propio patrón climático — no mezclar

type MonthlyClimate = Record<number, { maxAvg: number; minAvg: number; rainDays: number; windAvg: number }>

const CLIMATE_BY_ISLAND: Record<IslandId, MonthlyClimate> = {
  // Santa Cruz de Tenerife
  tenerife: {
    1:  { maxAvg: 20, minAvg: 14, rainDays: 7,  windAvg: 15 },
    2:  { maxAvg: 21, minAvg: 14, rainDays: 6,  windAvg: 14 },
    3:  { maxAvg: 22, minAvg: 15, rainDays: 5,  windAvg: 14 },
    4:  { maxAvg: 23, minAvg: 16, rainDays: 3,  windAvg: 13 },
    5:  { maxAvg: 25, minAvg: 18, rainDays: 1,  windAvg: 15 },
    6:  { maxAvg: 27, minAvg: 20, rainDays: 0,  windAvg: 18 },
    7:  { maxAvg: 29, minAvg: 22, rainDays: 0,  windAvg: 20 },
    8:  { maxAvg: 30, minAvg: 23, rainDays: 0,  windAvg: 18 },
    9:  { maxAvg: 29, minAvg: 22, rainDays: 1,  windAvg: 15 },
    10: { maxAvg: 26, minAvg: 19, rainDays: 4,  windAvg: 13 },
    11: { maxAvg: 23, minAvg: 17, rainDays: 7,  windAvg: 13 },
    12: { maxAvg: 21, minAvg: 15, rainDays: 8,  windAvg: 14 },
  },
  // Las Palmas de Gran Canaria — capital costera similar a Tenerife pero algo más ventosa
  granCanaria: {
    1:  { maxAvg: 21, minAvg: 15, rainDays: 6,  windAvg: 18 },
    2:  { maxAvg: 21, minAvg: 15, rainDays: 5,  windAvg: 17 },
    3:  { maxAvg: 22, minAvg: 16, rainDays: 4,  windAvg: 17 },
    4:  { maxAvg: 23, minAvg: 17, rainDays: 2,  windAvg: 16 },
    5:  { maxAvg: 24, minAvg: 18, rainDays: 1,  windAvg: 18 },
    6:  { maxAvg: 26, minAvg: 20, rainDays: 0,  windAvg: 20 },
    7:  { maxAvg: 28, minAvg: 22, rainDays: 0,  windAvg: 22 },
    8:  { maxAvg: 29, minAvg: 23, rainDays: 0,  windAvg: 20 },
    9:  { maxAvg: 28, minAvg: 22, rainDays: 1,  windAvg: 17 },
    10: { maxAvg: 26, minAvg: 20, rainDays: 3,  windAvg: 15 },
    11: { maxAvg: 23, minAvg: 17, rainDays: 6,  windAvg: 16 },
    12: { maxAvg: 22, minAvg: 16, rainDays: 7,  windAvg: 17 },
  },
  // Arrecife (Lanzarote) — la más árida y ventosa, sin montañas
  lanzarote: {
    1:  { maxAvg: 19, minAvg: 13, rainDays: 3,  windAvg: 22 },
    2:  { maxAvg: 20, minAvg: 14, rainDays: 3,  windAvg: 21 },
    3:  { maxAvg: 21, minAvg: 14, rainDays: 2,  windAvg: 22 },
    4:  { maxAvg: 23, minAvg: 16, rainDays: 1,  windAvg: 21 },
    5:  { maxAvg: 24, minAvg: 17, rainDays: 0,  windAvg: 22 },
    6:  { maxAvg: 27, minAvg: 20, rainDays: 0,  windAvg: 24 },
    7:  { maxAvg: 29, minAvg: 22, rainDays: 0,  windAvg: 26 },
    8:  { maxAvg: 30, minAvg: 23, rainDays: 0,  windAvg: 24 },
    9:  { maxAvg: 29, minAvg: 22, rainDays: 0,  windAvg: 21 },
    10: { maxAvg: 26, minAvg: 19, rainDays: 1,  windAvg: 20 },
    11: { maxAvg: 23, minAvg: 16, rainDays: 2,  windAvg: 20 },
    12: { maxAvg: 20, minAvg: 14, rainDays: 3,  windAvg: 21 },
  },
  // Puerto del Rosario (Fuerteventura) — la más árida de España, viento constante
  fuerteventura: {
    1:  { maxAvg: 20, minAvg: 13, rainDays: 2,  windAvg: 24 },
    2:  { maxAvg: 21, minAvg: 13, rainDays: 2,  windAvg: 23 },
    3:  { maxAvg: 22, minAvg: 14, rainDays: 1,  windAvg: 24 },
    4:  { maxAvg: 23, minAvg: 15, rainDays: 1,  windAvg: 23 },
    5:  { maxAvg: 25, minAvg: 17, rainDays: 0,  windAvg: 24 },
    6:  { maxAvg: 27, minAvg: 20, rainDays: 0,  windAvg: 26 },
    7:  { maxAvg: 29, minAvg: 22, rainDays: 0,  windAvg: 28 },
    8:  { maxAvg: 30, minAvg: 22, rainDays: 0,  windAvg: 26 },
    9:  { maxAvg: 29, minAvg: 21, rainDays: 0,  windAvg: 23 },
    10: { maxAvg: 26, minAvg: 19, rainDays: 1,  windAvg: 21 },
    11: { maxAvg: 23, minAvg: 16, rainDays: 1,  windAvg: 22 },
    12: { maxAvg: 21, minAvg: 14, rainDays: 2,  windAvg: 23 },
  },
  // Santa Cruz de La Palma — más lluviosa y verde que las orientales
  laPalma: {
    1:  { maxAvg: 19, minAvg: 13, rainDays: 9,  windAvg: 13 },
    2:  { maxAvg: 19, minAvg: 13, rainDays: 8,  windAvg: 12 },
    3:  { maxAvg: 21, minAvg: 14, rainDays: 7,  windAvg: 13 },
    4:  { maxAvg: 22, minAvg: 15, rainDays: 4,  windAvg: 12 },
    5:  { maxAvg: 24, minAvg: 17, rainDays: 2,  windAvg: 14 },
    6:  { maxAvg: 26, minAvg: 19, rainDays: 0,  windAvg: 16 },
    7:  { maxAvg: 28, minAvg: 21, rainDays: 0,  windAvg: 18 },
    8:  { maxAvg: 29, minAvg: 22, rainDays: 0,  windAvg: 17 },
    9:  { maxAvg: 28, minAvg: 21, rainDays: 1,  windAvg: 14 },
    10: { maxAvg: 25, minAvg: 18, rainDays: 5,  windAvg: 12 },
    11: { maxAvg: 22, minAvg: 16, rainDays: 9,  windAvg: 12 },
    12: { maxAvg: 20, minAvg: 14, rainDays: 10, windAvg: 13 },
  },
  // San Sebastián de La Gomera — influencia similar a Tenerife/La Palma
  laGomera: {
    1:  { maxAvg: 19, minAvg: 13, rainDays: 8,  windAvg: 12 },
    2:  { maxAvg: 20, minAvg: 13, rainDays: 7,  windAvg: 12 },
    3:  { maxAvg: 21, minAvg: 14, rainDays: 5,  windAvg: 12 },
    4:  { maxAvg: 22, minAvg: 15, rainDays: 3,  windAvg: 11 },
    5:  { maxAvg: 24, minAvg: 17, rainDays: 1,  windAvg: 13 },
    6:  { maxAvg: 26, minAvg: 19, rainDays: 0,  windAvg: 15 },
    7:  { maxAvg: 28, minAvg: 21, rainDays: 0,  windAvg: 17 },
    8:  { maxAvg: 29, minAvg: 22, rainDays: 0,  windAvg: 16 },
    9:  { maxAvg: 28, minAvg: 21, rainDays: 1,  windAvg: 13 },
    10: { maxAvg: 25, minAvg: 18, rainDays: 4,  windAvg: 11 },
    11: { maxAvg: 22, minAvg: 16, rainDays: 8,  windAvg: 11 },
    12: { maxAvg: 20, minAvg: 14, rainDays: 9,  windAvg: 12 },
  },
  // Valverde (El Hierro) — nublado y fresco, la isla más occidental
  elHierro: {
    1:  { maxAvg: 18, minAvg: 13, rainDays: 8,  windAvg: 14 },
    2:  { maxAvg: 18, minAvg: 13, rainDays: 7,  windAvg: 14 },
    3:  { maxAvg: 19, minAvg: 13, rainDays: 6,  windAvg: 14 },
    4:  { maxAvg: 20, minAvg: 14, rainDays: 4,  windAvg: 13 },
    5:  { maxAvg: 22, minAvg: 16, rainDays: 2,  windAvg: 15 },
    6:  { maxAvg: 24, minAvg: 18, rainDays: 0,  windAvg: 17 },
    7:  { maxAvg: 26, minAvg: 20, rainDays: 0,  windAvg: 19 },
    8:  { maxAvg: 27, minAvg: 21, rainDays: 0,  windAvg: 18 },
    9:  { maxAvg: 27, minAvg: 21, rainDays: 1,  windAvg: 15 },
    10: { maxAvg: 24, minAvg: 18, rainDays: 4,  windAvg: 13 },
    11: { maxAvg: 21, minAvg: 15, rainDays: 7,  windAvg: 13 },
    12: { maxAvg: 19, minAvg: 13, rainDays: 8,  windAvg: 14 },
  },
}

export const FORECAST_CONFIDENCE = [95, 85, 70, 58, 44, 34, 26]

const MONTH_NAMES = ['','enero','febrero','marzo','abril','mayo','junio',
                     'julio','agosto','septiembre','octubre','noviembre','diciembre']
const DAY_NAMES   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

function isNE(dv: number)     { return dv >= 315 || dv <= 90 }
function isSouth(dv: number)  { return dv > 120 && dv < 240 }

// Helper para obtener la config de isla con fallback seguro
function islandCfg(islandId: IslandId = 'tenerife') {
  return ISLAND_CONFIG[islandId]
}

// ── Phenomenon detection ───────────────────────────────────────────────────

export interface Phenomenon {
  id: string
  icon: string
  name: string
  level: 'info' | 'warn' | 'alert'
  timing: string   // 'Ahora mismo' | 'Hoy' | 'Mañana' | 'En X días'
  brief: string
  explanation: string
}

function timingForDay(dayIdx: number): string {
  if (dayIdx === 0) return 'Hoy'
  if (dayIdx === 1) return 'Mañana'
  return `En ${dayIdx} días`
}

export function detectPhenomenon(
  obs: Observation | null,
  forecast: ForecastDay[],
  islandId: IslandId = 'tenerife',
): Phenomenon | null {
  if (!obs) return null

  const cfg = islandCfg(islandId)
  const wind = obs.vv, gust = obs.vmax, temp = obs.ta, humid = obs.hr, prec = obs.prec
  const vis = obs.vis
  const south = isSouth(obs.dv)
  const NE = isNE(obs.dv)

  // ── Calima sahariana ──────────────────────────────────────────────────────
  // La calima llega del sector SE–S–SO (90°–240°) O con viento en calma
  // (el polvo viaja en altura; en superficie puede haber calma o viento ESE)
  const calimaDir = (obs.dv >= 90 && obs.dv <= 240) || obs.vv < 10

  // Cuatro caminos de detección, de mayor a menor certeza:
  // 1. Visibilidad muy reducida + aire seco → calima casi seguro (sin importar viento)
  const calimaByVisStrong = vis > 0 && vis < 4 && humid < 65
  // 2. Visibilidad reducida + aire seco + dirección favorable
  const calimaByVis       = vis > 0 && vis < 8 && humid < 55 && calimaDir
  // 3. Temperatura elevada + humedad baja + dirección favorable
  //    (cubre estaciones sin sensor de visibilidad — la mayoría)
  const calimaByTempHumid = temp > 20 && humid < 42 && calimaDir
  // 4. Calima intensa: calor extremo + aire muy seco
  const calimaIntensa     = temp > 26 && humid < 35 && calimaDir

  if (calimaIntensa || calimaByVisStrong || calimaByVis || calimaByTempHumid) {
    const level: 'warn' | 'alert' = calimaIntensa || calimaByVisStrong ? 'alert' : 'warn'
    const visStr = vis > 0 && vis < 90 ? ` · Visibilidad ${vis} km` : ''
    return {
      id: 'calima', icon: '🏜️', name: 'Calima sahariana', level,
      timing: 'Ahora mismo',
      brief: `${Math.round(temp * 10) / 10}°C · Humedad ${humid}%${visStr} — polvo del Sahara en el aire`,
      explanation: 'El polvo del desierto del Sahara viaja en altura y envuelve las islas. El cielo toma un tono naranja-amarillento, la temperatura sube anormalmente y el aire se vuelve muy seco. Efectos: visibilidad reducida, irritación ocular y respiratoria, calor distinto al habitual. Los coches amanecen con polvo rojizo. Desaparece cuando el alisio del noreste vuelve a imponerse.',
    }
  }

  // ── Niebla / visibilidad muy reducida ────────────────────────────────────
  if (vis > 0 && vis < 2 && !south) {
    const roadNote = cfg.mainRoad ? ` Las carreteras de montaña como ${cfg.mainRoad} pueden cerrar.` : ' Las carreteras de montaña pueden verse afectadas.'
    return {
      id: 'niebla', icon: '🌫️', name: 'Niebla densa', level: 'alert',
      timing: 'Ahora mismo',
      brief: `Visibilidad de solo ${vis} km — conducción muy peligrosa`,
      explanation: `La niebla espesa reduce la visibilidad a menos de 2 km en ${cfg.capital} y alrededores. En carretera, pon luces antiniebla y reduce la velocidad.${roadNote}`,
    }
  }

  // ── Alisio fuerte con efecto Föhn ────────────────────────────────────────
  if ((gust > 45 || wind > 35) && NE) {
    const gustStr = gust > wind + 10 ? ` (rachas de ${Math.round(gust)} km/h)` : ''
    const fohnNote = cfg.hasNorteSur
      ? 'El alisio reforzado golpea las laderas norte, donde el aire sube, se enfría y forma nubes. Al bajar por el sur, el aire ya está seco y se calienta. Resultado: norte nublado y fresco, sur soleado y varios grados más cálido — todo en la misma isla.'
      : `En ${cfg.name} el viento del noreste sopla con fuerza. Sin montañas que lo frenen, afecta a toda la isla por igual.`
    return {
      id: 'alisio-fuerte', icon: '💨', name: 'Alisio intenso', level: 'info',
      timing: 'Ahora mismo',
      brief: `Viento NE de ${Math.round(wind)} km/h${gustStr} — alisio reforzado en ${cfg.name}`,
      explanation: fohnNote,
    }
  }

  // ── Borrasca atlántica entrante ───────────────────────────────────────────
  const rainDays = forecast.slice(0, 5)
    .map((d, i) => ({ idx: i, prob: d.probPrecip }))
    .filter(({ prob }) => prob > 60)

  if (rainDays.length >= 2) {
    const firstIdx = rainDays[0].idx
    const timing = timingForDay(firstIdx)
    const timingBrief = firstIdx === 0 ? 'hoy' : firstIdx === 1 ? 'mañana' : `en ${firstIdx} días`
    return {
      id: 'borrasca', icon: '⛈️', name: 'Borrasca atlántica entrante', level: 'alert',
      timing,
      brief: `Cambio de tiempo importante — lluvia intensa ${timingBrief} y los días siguientes`,
      explanation: 'Se aproxima una borrasca desde el Atlántico norte. El tiempo cambiará de forma notable: vientos racheados, nubosidad generalizada y lluvias que pueden ser intensas en todo el archipiélago. En Canarias las borrascas son poco frecuentes pero cuando llegan los cambios son bruscos. Toma precauciones si tienes planes al aire libre esta semana.',
    }
  }

  // ── Lluvia activa ─────────────────────────────────────────────────────────
  if (prec > 4 || forecast[0]?.probPrecip > 75) {
    const fromObs = prec > 4
    return {
      id: 'lluvia', icon: '🌧️', name: 'Lluvia significativa', level: 'warn',
      timing: fromObs ? 'Ahora mismo' : 'Hoy',
      brief: fromObs ? `${prec} mm caídos — lluvia activa en la zona` : 'Alta probabilidad de lluvia hoy',
      explanation: 'La lluvia en Canarias es poco frecuente pero cuando llega puede ser intensa. Los barrancos y cauces secos pueden llenarse muy rápido — evita acercarte a ellos. Las carreteras de montaña pueden estar afectadas por niebla y agua.',
    }
  }

  // ── Día típicamente canario ───────────────────────────────────────────────
  if (wind >= 10 && wind <= 28 && NE && temp >= 17 && temp <= 27 && humid >= 55 && prec === 0) {
    return {
      id: 'dia-canario', icon: '✨', name: 'Día típicamente canario', level: 'info',
      timing: 'Hoy',
      brief: 'Alisio suave y temperatura perfecta — así es el clima que hace famosas a las islas',
      explanation: `Hoy tienes el tiempo por el que mucha gente elige vivir o visitar Canarias: brisa fresca del noreste, temperatura agradable y buen tiempo en ${cfg.name}. ${cfg.hasNorteSur ? 'En el norte de la isla puede haber algo de nubosidad baja que se disipa al mediodía.' : 'El cielo despejado y el viento moderado hacen el día muy agradable.'} Condiciones ideales para estar al aire libre.`,
    }
  }

  return null
}

// ── Activity impact ────────────────────────────────────────────────────────

export type ActivityStatus = 'great' | 'ok' | 'caution' | 'avoid'

export interface Activity {
  id: string
  icon: string
  name: string
  status: ActivityStatus
  reason: string
  tip?: string
}

export function assessActivities(
  obs: Observation | null,
  forecast: ForecastDay[],
  islandId: IslandId = 'tenerife',
): Activity[] {
  if (!obs) return []

  const cfg  = islandCfg(islandId)
  const gust = obs.vmax
  const temp = obs.ta
  const prec = obs.prec
  const south = isSouth(obs.dv)
  const NE   = isNE(obs.dv)
  const prob = forecast[0]?.probPrecip ?? 0
  const uv   = forecast[0]?.uvMax ?? 0
  const calima = temp > 23 && obs.hr < 50 && south

  const beachTip = gust > 25 && NE && cfg.hasNorteSur
    ? 'Playas del sur más protegidas del viento hoy'
    : uv >= 8 ? `UV ${uv} — usa protector solar 50+`
    : undefined

  const roadTip = prec > 2 && cfg.mainRoad
    ? `${cfg.mainRoad} puede tener niebla o barro`
    : undefined

  return [
    {
      id: 'playa', icon: '🏖️', name: 'Playa',
      status: prec > 0 || prob > 50 ? 'avoid'
        : gust > 38 ? 'caution'
        : calima ? 'caution'
        : temp > 22 ? 'great'
        : 'ok',
      reason: prec > 0 ? 'Lluvia activa'
        : prob > 50 ? `${prob}% de probabilidad de lluvia`
        : gust > 38 ? `Rachas de ${Math.round(gust)} km/h — arena en suspensión`
        : calima ? 'Calima: aire seco y polvo en suspensión'
        : temp > 22 ? `${temp}°C — temperatura perfecta`
        : `${temp}°C — algo fresco para el agua`,
      tip: beachTip,
    },
    {
      id: 'deporte', icon: '🏃', name: 'Deporte exterior',
      status: temp > 34 ? 'caution' : gust > 50 ? 'caution' : prec > 2 ? 'caution' : calima ? 'caution' : 'great',
      reason: temp > 34 ? 'Calor extremo — riesgo de golpe de calor'
        : gust > 50 ? `Rachas de ${Math.round(gust)} km/h — inestable al aire libre`
        : prec > 2 ? 'Suelo resbaladizo por lluvia'
        : calima ? 'Calima: polvo en el aire puede afectar a la respiración'
        : 'Condiciones ideales',
      tip: temp > 28 || calima ? 'Mejor antes de las 10h o después de las 19h' : undefined,
    },
    {
      id: 'senderismo', icon: '🥾', name: 'Senderismo',
      status: prec > 3 ? 'avoid' : gust > 60 ? 'avoid' : gust > 40 ? 'caution' : temp > 31 ? 'caution' : calima ? 'caution' : 'great',
      reason: prec > 3 ? 'Riesgo de barrancos con crecida de agua'
        : gust > 60 ? `Cumbres con rachas de ${Math.round(gust)} km/h — peligroso en cretas`
        : gust > 40 ? `Rachas de ${Math.round(gust)} km/h — cuidado en zonas altas`
        : temp > 31 ? 'Lleva mínimo 2 L de agua por persona'
        : calima ? 'Visibilidad y aire reducidos por polvo sahariano'
        : 'Tiempo ideal para los senderos',
      tip: prec > 1 ? 'Evita barrancos aunque no llueva en tu zona' : undefined,
    },
    {
      id: 'terraza', icon: '🌿', name: 'Terraza / BBQ',
      status: prec > 0 || prob > 40 ? 'avoid' : gust > 32 ? 'caution' : temp >= 18 ? 'great' : 'ok',
      reason: prec > 0 ? 'Lluvia activa'
        : prob > 40 ? `${prob}% de lluvia — ten el toldo a mano`
        : gust > 32 ? `Rachas de ${Math.round(gust)} km/h — asegura objetos ligeros`
        : temp >= 22 ? `${temp}°C — noche perfecta al aire libre`
        : `${temp}°C — agradable con algo de abrigo`,
    },
    {
      id: 'carretera', icon: '🚗', name: 'Carreteras',
      status: prec > 5 ? 'caution' : gust > 60 ? 'caution' : obs.vis > 0 && obs.vis < 3 ? 'caution' : 'great',
      reason: prec > 5 ? 'Lluvia intensa — reducir velocidad y distancia'
        : gust > 60 ? `Rachas de ${Math.round(gust)} km/h en puntos altos y túneles`
        : obs.vis > 0 && obs.vis < 3 ? `Visibilidad de ${obs.vis} km — niebla o calima densa`
        : 'Sin incidencias meteorológicas previstas',
      tip: roadTip,
    },
  ]
}

// ── Historical context ─────────────────────────────────────────────────────

export interface ContextItem {
  label: string
  value: string
  context: string
  isUnusual: boolean
  emoji: string
}

export function getContext(
  obs: Observation | null,
  forecast: ForecastDay[],
  islandId: IslandId = 'tenerife',
): ContextItem[] {
  if (!obs) return []
  const month  = new Date().getMonth() + 1
  const climate = CLIMATE_BY_ISLAND[islandId]
  const avg    = climate?.[month]
  if (!avg) return []

  const cfg  = islandCfg(islandId)
  const items: ContextItem[] = []

  // Temperatura
  const diff = Math.round(obs.ta - avg.maxAvg)
  items.push({
    label: 'Temperatura',
    value: `${obs.ta}°C`,
    emoji: diff > 3 ? '🔴' : diff < -3 ? '🔵' : '🟢',
    context: Math.abs(diff) < 1
      ? `Normal para ${MONTH_NAMES[month]} en ${cfg.capital} (media ${avg.maxAvg}°C)`
      : diff > 0
        ? `${diff}° por encima de la media de ${MONTH_NAMES[month]} en ${cfg.name} (${avg.maxAvg}°C)`
        : `${Math.abs(diff)}° por debajo de la media de ${MONTH_NAMES[month]} en ${cfg.name} (${avg.maxAvg}°C)`,
    isUnusual: Math.abs(diff) > 4,
  })

  // Viento
  const wdiff = Math.round(obs.vv - avg.windAvg)
  items.push({
    label: 'Viento',
    value: `${Math.round(obs.vv)} km/h`,
    emoji: Math.abs(wdiff) < 4 ? '🟢' : wdiff > 0 ? '🟡' : '🔵',
    context: Math.abs(wdiff) < 4
      ? `Viento habitual para ${MONTH_NAMES[month]} en ${cfg.name}`
      : wdiff > 8 ? `Notablemente más fuerte de lo normal en ${cfg.name}`
      : wdiff > 0 ? `Algo más ventoso de lo habitual` : `Más calmado de lo habitual`,
    isUnusual: Math.abs(wdiff) > 10,
  })

  // Lluvia semanal
  const weekRain = forecast.filter(d => d.probPrecip > 50).length
  items.push({
    label: 'Lluvia esta semana',
    value: weekRain === 0 ? 'Sin lluvia prevista' : `${weekRain} días con lluvia probable`,
    emoji: weekRain > avg.rainDays * 1.8 ? '🔴' : weekRain < avg.rainDays * 0.4 ? '🟡' : '🟢',
    context: weekRain > avg.rainDays * 1.5
      ? `Semana más húmeda de lo normal para ${MONTH_NAMES[month]} en ${cfg.name}`
      : weekRain === 0 && avg.rainDays > 2
        ? `Semana seca — lo habitual en ${cfg.name} son ${avg.rainDays} días con lluvia este mes`
        : weekRain === 0 && avg.rainDays <= 1
          ? `Normal para ${MONTH_NAMES[month]} — ${cfg.name} es muy seca esta época`
          : `Dentro de lo normal para ${MONTH_NAMES[month]} en ${cfg.name}`,
    isUnusual: weekRain > avg.rainDays * 2.5,
  })

  return items
}

// ── Daily narrative summary ────────────────────────────────────────────────

export function generateSummary(
  obs: Observation | null,
  forecast: ForecastDay[],
  islandId: IslandId = 'tenerife',
): string {
  if (!obs || forecast.length === 0) return 'Cargando datos meteorológicos…'

  const cfg   = islandCfg(islandId)
  const wind  = obs.vv, gust = obs.vmax, temp = obs.ta, prec = obs.prec
  const NE    = isNE(obs.dv), south = isSouth(obs.dv)
  const prob  = forecast[0]?.probPrecip ?? 0
  const vis   = obs.vis
  const city  = cfg.capital   // nombre correcto de la capital de esta isla

  const calimaByVis  = vis > 0 && vis < 8 && south && obs.hr < 55
  const calimaByTemp = temp > 23 && obs.hr < 45 && south
  const calima = calimaByVis || calimaByTemp

  const parts: string[] = []

  // ── Apertura: situación actual ──
  if (prec > 5) {
    parts.push(`Lluvia moderada-intensa en ${city} ahora mismo (${prec} mm acumulados). Un episodio poco habitual para el archipiélago.`)
  } else if (prec > 0) {
    parts.push(`Llovizna ligera en ${city}.${cfg.hasNorteSur ? ' En el norte de la isla suele llover bastante más que en la capital.' : ''}`)
  } else if (calima) {
    const visNote = vis > 0 && vis < 99 ? ` con visibilidad de ${vis} km` : ''
    parts.push(`Calima activa en ${cfg.name}: ${temp}°C y humedad al ${obs.hr}%${visNote}. El viento del sur arrastra polvo del Sahara — el cielo tiene un tono amarillento característico.`)
  } else if (vis > 0 && vis < 3) {
    parts.push(`Niebla densa en ${city} — visibilidad de solo ${vis} km. Conduce con precaución.`)
  } else if ((gust > 48 || wind > 35) && NE) {
    const gustStr = gust > wind + 10 ? `, con rachas de ${Math.round(gust)} km/h` : ''
    parts.push(`Alisio fuerte hoy en ${cfg.name} — ${Math.round(wind)} km/h del noreste${gustStr}.`)
  } else if (wind >= 12 && NE) {
    parts.push(`Día canario de manual en ${city}: alisio moderado (${Math.round(wind)} km/h), ${temp}°C y buen ambiente.`)
  } else if (wind < 8) {
    parts.push(`Viento casi en calma en ${city} — algo inusual para Canarias. Con ${temp}°C, el día se siente más cálido de lo que marcan los termómetros.`)
  } else {
    parts.push(`${temp}°C en ${city} con viento de ${Math.round(wind)} km/h.`)
  }

  // ── Efecto isla: solo si la isla tiene contraste norte/sur ──
  if (!calima && wind > 14 && NE && prec === 0) {
    if (cfg.hasNorteSur) {
      parts.push(`El alisio mantiene el contraste habitual en ${cfg.name}: norte nublado y fresco, sur con sol y varios grados más de temperatura.`)
    }
    // En islas planas (Lanzarote, Fuerteventura) no hay contraste norte/sur
  } else if (south && !calima) {
    parts.push(`El viento del sur es el menos frecuente en Canarias y suele anunciar condiciones fuera de lo normal.`)
  }

  // ── Cierre: qué se viene ──
  const tomorrow = forecast[1]
  const d2 = forecast[2]
  const incoming = forecast.slice(1, 4).filter(d => d.probPrecip > 60).length

  if (incoming >= 2) {
    parts.push(`Ojo a esta semana: se espera un cambio de tiempo importante con lluvias en todo el archipiélago.`)
  } else if (prob > 60) {
    parts.push(`Hoy hay ${prob}% de probabilidad de lluvia. Tenlo en cuenta si tienes planes al aire libre.`)
  } else if (tomorrow && Math.abs(tomorrow.tempMax - forecast[0].tempMax) > 4) {
    const dir = tomorrow.tempMax > forecast[0].tempMax ? 'subirá' : 'bajará'
    parts.push(`Mañana ${dir} la temperatura hasta ${tomorrow.tempMax}°C.`)
  } else if (d2 && d2.probPrecip > 60) {
    const dayName = DAY_NAMES[new Date(d2.fecha).getDay()]
    parts.push(`El ${dayName} podría ser el día más activo de la semana, con un ${d2.probPrecip}% de probabilidad de lluvia.`)
  } else {
    parts.push(`El tiempo se mantiene estable y sin cambios relevantes los próximos días.`)
  }

  return parts.join(' ')
}
