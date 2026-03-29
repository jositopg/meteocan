import type { Observation, ForecastDay } from '../services/aemet'

// ── Climate averages Santa Cruz de Tenerife (datos históricos AEMET) ──────
const CLIMATE: Record<number, { maxAvg: number; minAvg: number; rainDays: number; windAvg: number }> = {
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
}

export const FORECAST_CONFIDENCE = [95, 85, 70, 58, 44, 34, 26]

const MONTH_NAMES = ['','enero','febrero','marzo','abril','mayo','junio',
                     'julio','agosto','septiembre','octubre','noviembre','diciembre']
const DAY_NAMES   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

function isNE(dv: number) { return dv >= 315 || dv <= 90 }
function isSouth(dv: number) { return dv > 135 && dv < 225 }

// ── Phenomenon detection ───────────────────────────────────────────────────

export interface Phenomenon {
  id: string
  icon: string
  name: string
  level: 'info' | 'warn' | 'alert'
  brief: string
  explanation: string
}

export function detectPhenomenon(obs: Observation | null, forecast: ForecastDay[]): Phenomenon | null {
  if (!obs) return null

  const wind = obs.vv, temp = obs.ta, humid = obs.hr, prec = obs.prec

  // Calima: hot + dry + southerly wind
  if (temp > 27 && humid < 38 && isSouth(obs.dv)) {
    return {
      id: 'calima', icon: '🏜', name: 'Calima sahariana', level: 'warn',
      brief: `${temp}°C y humedad al ${humid}% — polvo del Sahara en el aire`,
      explanation: 'El viento del sur arrastra polvo del desierto del Sahara. El cielo tiene un tono naranja-amarillento, la temperatura es anormalmente alta y el aire es muy seco. Podrás ver una neblina ocre en el horizonte. Efectos: visibilidad reducida, irritación ocular y respiratoria, y un calor muy diferente al habitual.',
    }
  }

  // Strong alisio + Föhn
  if (wind > 35 && isNE(obs.dv)) {
    return {
      id: 'alisio-fuerte', icon: '💨', name: 'Alisio intenso + Efecto Föhn', level: 'info',
      brief: `Viento NE de ${Math.round(wind)} km/h — el clásico tiempo "norte y sur" de Canarias`,
      explanation: 'El alisio reforzado golpea las laderas norte de las islas, donde el aire sube, se enfría y forma nubes o llueve. Al bajar por el sur, el aire ya está seco y se calienta. Resultado: en el norte puede estar nublado y fresco mientras que a 30 km al sur hace sol y más calor. Este contraste puede superar los 8°C entre un lado y otro de la misma isla.',
    }
  }

  // Incoming storm (next 2-3 days heavy rain)
  const comingRain = forecast.slice(1, 4).filter(d => d.probPrecip > 65).length
  if (comingRain >= 2) {
    return {
      id: 'borrasca', icon: '⛈', name: 'Borrasca atlántica entrante', level: 'alert',
      brief: 'Cambio de tiempo importante en los próximos 2–3 días',
      explanation: 'Se aproxima una borrasca desde el Atlántico norte. El tiempo cambiará de forma notable: vientos racheados, nubosidad generalizada en todas las islas y lluvias que pueden ser intensas. En Canarias las borrascas son poco frecuentes pero cuando llegan los cambios son bruscos. Toma precauciones si tienes planes al aire libre esta semana.',
    }
  }

  // Active rain
  if (prec > 4 || forecast[0]?.probPrecip > 75) {
    return {
      id: 'lluvia', icon: '🌧', name: 'Lluvia significativa', level: 'warn',
      brief: prec > 4 ? `${prec} mm caídos — lluvia activa en la zona` : 'Alta probabilidad de lluvia hoy',
      explanation: 'La lluvia en Canarias es poco frecuente pero cuando llega puede ser intensa. Los barrancos y cauces secos pueden llenarse muy rápido — evita acercarte a ellos. Las carreteras de montaña pueden estar afectadas por niebla y agua. El Sur suele quedar más protegido que el Norte durante estos episodios.',
    }
  }

  // Classic perfect alisio day — positive phenomenon
  if (wind >= 10 && wind <= 28 && isNE(obs.dv) && temp >= 17 && temp <= 27 && humid >= 55) {
    return {
      id: 'dia-canario', icon: '✨', name: 'Día típicamente canario', level: 'info',
      brief: 'Alisio suave y temperatura perfecta — así es el clima que hace famosas a las islas',
      explanation: 'Hoy tienes el tiempo por el que mucha gente elige vivir o visitar Canarias: brisa fresca del noreste, temperatura agradable todo el día y buen tiempo en general. En el norte de las islas puede haber algo de nubosidad baja que se disipa al mediodía. El sur: soleado desde el amanecer.',
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

export function assessActivities(obs: Observation | null, forecast: ForecastDay[]): Activity[] {
  if (!obs) return []

  const wind = obs.vv, temp = obs.ta, prec = obs.prec
  const prob = forecast[0]?.probPrecip ?? 0
  const NE   = isNE(obs.dv)

  return [
    {
      id: 'playa', icon: '🏖', name: 'Playa',
      status: prec > 0 || prob > 50 ? 'avoid' : wind > 32 ? 'caution' : temp > 22 ? 'great' : 'ok',
      reason: prec > 0 ? 'Lluvia activa'
        : prob > 50 ? `${prob}% de probabilidad de lluvia hoy`
        : wind > 32 ? `Oleaje y arena en suspensión (${Math.round(wind)} km/h)`
        : temp > 22 ? `Temperatura perfecta — ${temp}°C`
        : `${temp}°C — algo fresco para el agua`,
      tip: wind > 25 && NE ? 'Playas del sur más protegidas del viento hoy' : undefined,
    },
    {
      id: 'deporte', icon: '🏃', name: 'Deporte exterior',
      status: temp > 33 ? 'caution' : wind > 45 ? 'caution' : prec > 2 ? 'caution' : 'great',
      reason: temp > 33 ? 'Calor extremo — riesgo de golpe de calor'
        : wind > 45 ? `Viento muy fuerte (${Math.round(wind)} km/h)`
        : prec > 2 ? 'Suelo resbaladizo por lluvia'
        : `Condiciones ideales`,
      tip: temp > 28 ? 'Mejor antes de las 10h o después de las 19h' : undefined,
    },
    {
      id: 'senderismo', icon: '🥾', name: 'Senderismo',
      status: prec > 3 ? 'avoid' : wind > 55 ? 'avoid' : wind > 35 ? 'caution' : temp > 30 ? 'caution' : 'great',
      reason: prec > 3 ? 'Riesgo de barrancos con crecida de agua'
        : wind > 55 ? 'Cumbres con viento peligroso'
        : wind > 35 ? 'Cimas muy ventosas — cuidado en cretas'
        : temp > 30 ? 'Lleva mínimo 2L de agua por persona'
        : 'Tiempo ideal para los senderos',
      tip: prec > 1 ? 'Evita barrancos y zonas bajas aunque no llueva en tu zona' : undefined,
    },
    {
      id: 'terraza', icon: '🌿', name: 'Terraza / BBQ',
      status: prec > 0 || prob > 40 ? 'avoid' : wind > 28 ? 'caution' : temp >= 18 ? 'great' : 'ok',
      reason: prec > 0 ? 'Lluvia activa'
        : prob > 40 ? `${prob}% de lluvia — ten el toldo a mano`
        : wind > 28 ? `Brisa fuerte (${Math.round(wind)} km/h) — asegura objetos ligeros`
        : temp >= 22 ? `${temp}°C — noche perfecta al aire libre`
        : `${temp}°C — agradable con algo de abrigo`,
    },
    {
      id: 'carretera', icon: '🚗', name: 'Carreteras',
      status: prec > 5 ? 'caution' : wind > 55 ? 'caution' : 'great',
      reason: prec > 5 ? 'Lluvia intensa — reducir velocidad y distancia'
        : wind > 55 ? 'Viento lateral en cumbres y túneles'
        : 'Sin incidencias meteorológicas previstas',
      tip: prec > 2 ? 'TF-21 (Teide) puede tener niebla o barro en calzada' : undefined,
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

export function getContext(obs: Observation | null, forecast: ForecastDay[]): ContextItem[] {
  if (!obs) return []
  const month = new Date().getMonth() + 1
  const avg   = CLIMATE[month]
  if (!avg) return []

  const items: ContextItem[] = []

  // Temperature
  const diff = Math.round(obs.ta - avg.maxAvg)
  items.push({
    label: 'Temperatura',
    value: `${obs.ta}°C`,
    emoji: diff > 3 ? '🔴' : diff < -3 ? '🔵' : '🟢',
    context: Math.abs(diff) < 1
      ? `Normal para ${MONTH_NAMES[month]} (media ${avg.maxAvg}°C)`
      : diff > 0
        ? `${diff}° por encima de la media de ${MONTH_NAMES[month]} (${avg.maxAvg}°C)`
        : `${Math.abs(diff)}° por debajo de la media de ${MONTH_NAMES[month]} (${avg.maxAvg}°C)`,
    isUnusual: Math.abs(diff) > 4,
  })

  // Wind
  const wdiff = Math.round(obs.vv - avg.windAvg)
  items.push({
    label: 'Viento',
    value: `${Math.round(obs.vv)} km/h`,
    emoji: Math.abs(wdiff) < 4 ? '🟢' : wdiff > 0 ? '🟡' : '🔵',
    context: Math.abs(wdiff) < 4
      ? `Viento habitual para ${MONTH_NAMES[month]}`
      : wdiff > 8
        ? `Notablemente más fuerte de lo normal`
        : wdiff > 0 ? `Algo más ventoso de lo habitual` : `Más calmado de lo habitual`,
    isUnusual: Math.abs(wdiff) > 10,
  })

  // Rain this week vs expected
  const weekRain = forecast.filter(d => d.probPrecip > 50).length
  items.push({
    label: 'Lluvia esta semana',
    value: weekRain === 0 ? 'Sin lluvia prevista' : `${weekRain} días con lluvia probable`,
    emoji: weekRain > avg.rainDays * 1.8 ? '🔴' : weekRain < avg.rainDays * 0.4 ? '🟡' : '🟢',
    context: weekRain > avg.rainDays * 1.5
      ? `Semana más húmeda de lo normal para ${MONTH_NAMES[month]}`
      : weekRain === 0 && avg.rainDays > 2
        ? `Semana seca — lo habitual son ${avg.rainDays} días con lluvia este mes`
        : `Dentro de lo normal para ${MONTH_NAMES[month]}`,
    isUnusual: weekRain > avg.rainDays * 2.5,
  })

  return items
}

// ── Daily narrative summary ────────────────────────────────────────────────

export function generateSummary(obs: Observation | null, forecast: ForecastDay[]): string {
  if (!obs || forecast.length === 0) return 'Cargando datos meteorológicos…'

  const wind = obs.vv, temp = obs.ta, prec = obs.prec
  const NE = isNE(obs.dv), south = isSouth(obs.dv)
  const prob = forecast[0]?.probPrecip ?? 0

  const parts: string[] = []

  // ── Opening: current situation ──
  if (prec > 5) {
    parts.push(`Lluvia moderada-intensa en Santa Cruz ahora mismo (${prec} mm acumulados). Un episodio poco habitual para el archipiélago.`)
  } else if (prec > 0) {
    parts.push(`Llovizna ligera en Santa Cruz esta mañana. Nada comparado con lo que puede caer en el norte de la isla.`)
  } else if (temp > 30 && obs.hr < 38 && south) {
    parts.push(`Calima activa: ${temp}°C y humedad al ${obs.hr}% por viento del sur que arrastra polvo del Sahara. El cielo tendrá un tono amarillento.`)
  } else if (wind > 38 && NE) {
    parts.push(`Alisio fuerte hoy — rachas de ${Math.round(wind)} km/h del noreste. Es el tipo de viento que hace que el norte y el sur de las islas parezcan dos países distintos.`)
  } else if (wind >= 12 && NE) {
    parts.push(`Día canario de manual: alisio moderado (${Math.round(wind)} km/h), ${temp}°C y buen ambiente en Santa Cruz.`)
  } else if (wind < 8) {
    parts.push(`Viento casi en calma — algo inusual para Canarias. Con ${temp}°C, el día se siente más cálido de lo que marcan los termómetros.`)
  } else {
    parts.push(`${temp}°C en Santa Cruz con viento de ${Math.round(wind)} km/h.`)
  }

  // ── Middle: island effect ──
  if (wind > 14 && NE && prec === 0) {
    parts.push(`El alisio mantiene el contraste habitual: norte de las islas con nubes y ambiente fresco; sur con sol y varios grados más de temperatura.`)
  } else if (south) {
    parts.push(`El viento del sur es el menos frecuente en Canarias y suele anunciar condiciones fuera de lo normal: más calor, polvo en el ambiente y cielos sin el color azul habitual.`)
  }

  // ── Closing: what's coming ──
  const tomorrow = forecast[1]
  const d2 = forecast[2]
  const incoming = forecast.slice(1, 4).filter(d => d.probPrecip > 60).length

  if (incoming >= 2) {
    parts.push(`Ojo a esta semana: en los próximos días se espera un cambio de tiempo importante con lluvias en todo el archipiélago.`)
  } else if (prob > 60) {
    parts.push(`Mañana sigue siendo probable la lluvia (${tomorrow?.probPrecip ?? 0}%). Tenlo en cuenta si tienes planes al aire libre.`)
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
