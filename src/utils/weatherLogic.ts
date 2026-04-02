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
function isSouth(dv: number) { return dv > 120 && dv < 240 }  // SE · S · SW

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

  const wind = obs.vv, gust = obs.vmax, temp = obs.ta, humid = obs.hr, prec = obs.prec
  const vis = obs.vis   // km — 99 means not reported (assume clear)
  const south = isSouth(obs.dv)
  const NE = isNE(obs.dv)

  // ── Calima sahariana ──────────────────────────────────────────────────────
  // Señales: viento sur + humedad baja + [visibilidad reducida o temp alta]
  // La visibilidad <8 km con viento del sur es una señal fiable aunque temp sea normal
  const calimaByVis    = vis > 0 && vis < 8 && south && humid < 55
  const calimaByTemp   = temp > 23 && humid < 45 && south
  const calimaIntensa  = temp > 28 && humid < 38 && south

  if (calimaIntensa || calimaByVis || calimaByTemp) {
    const level: 'warn' | 'alert' = calimaIntensa || (vis > 0 && vis < 4) ? 'alert' : 'warn'
    const visStr = vis < 99 ? ` · Visibilidad ${vis} km` : ''
    return {
      id: 'calima', icon: '🏜️', name: 'Calima sahariana', level,
      brief: `${temp}°C · Humedad ${humid}%${visStr} — polvo del Sahara en el aire`,
      explanation: 'El viento del sur arrastra polvo del desierto del Sahara. El cielo tiene un tono naranja-amarillento, la temperatura sube anormalmente y el aire se seca. Podrás ver una neblina ocre en el horizonte. Efectos: visibilidad reducida, irritación ocular y respiratoria, calor distinto al habitual. Los coches amanecen con polvo rojizo. Desaparece cuando vuelve el alisio del noreste.',
    }
  }

  // ── Niebla / visibilidad muy reducida ────────────────────────────────────
  if (vis > 0 && vis < 2 && !south) {
    return {
      id: 'niebla', icon: '🌫️', name: 'Niebla densa', level: 'alert',
      brief: `Visibilidad de solo ${vis} km — conducción muy peligrosa`,
      explanation: 'La niebla espesa reduce la visibilidad a menos de 2 km. En carretera, pon luces antiniebla y reduce la velocidad. En las cumbres del Teide o la TF-21 puede bajar a cero. Las carreteras de montaña son especialmente peligrosas.',
    }
  }

  // ── Alisio fuerte con efecto Föhn ────────────────────────────────────────
  if ((gust > 45 || wind > 35) && NE) {
    const gustStr = gust > wind + 10 ? ` (rachas de ${Math.round(gust)} km/h)` : ''
    return {
      id: 'alisio-fuerte', icon: '💨', name: 'Alisio intenso + Efecto Föhn', level: 'info',
      brief: `Viento NE de ${Math.round(wind)} km/h${gustStr} — el clásico tiempo "norte y sur" de Canarias`,
      explanation: 'El alisio reforzado golpea las laderas norte de las islas, donde el aire sube, se enfría y forma nubes o llueve. Al bajar por el sur, el aire ya está seco y se calienta. Resultado: en el norte puede estar nublado y fresco mientras que a 30 km al sur hace sol y más calor. Este contraste puede superar los 8°C entre un lado y otro de la misma isla.',
    }
  }

  // ── Borrasca atlántica entrante ───────────────────────────────────────────
  const comingRain = forecast.slice(1, 4).filter(d => d.probPrecip > 60).length
  if (comingRain >= 2) {
    return {
      id: 'borrasca', icon: '⛈️', name: 'Borrasca atlántica entrante', level: 'alert',
      brief: 'Cambio de tiempo importante en los próximos 2–3 días',
      explanation: 'Se aproxima una borrasca desde el Atlántico norte. El tiempo cambiará de forma notable: vientos racheados, nubosidad generalizada en todas las islas y lluvias que pueden ser intensas. En Canarias las borrascas son poco frecuentes pero cuando llegan los cambios son bruscos. Toma precauciones si tienes planes al aire libre esta semana.',
    }
  }

  // ── Lluvia activa ─────────────────────────────────────────────────────────
  if (prec > 4 || forecast[0]?.probPrecip > 75) {
    return {
      id: 'lluvia', icon: '🌧️', name: 'Lluvia significativa', level: 'warn',
      brief: prec > 4 ? `${prec} mm caídos — lluvia activa en la zona` : 'Alta probabilidad de lluvia hoy',
      explanation: 'La lluvia en Canarias es poco frecuente pero cuando llega puede ser intensa. Los barrancos y cauces secos pueden llenarse muy rápido — evita acercarte a ellos. Las carreteras de montaña pueden estar afectadas por niebla y agua. El Sur suele quedar más protegido que el Norte durante estos episodios.',
    }
  }

  // ── Día típicamente canario (alisio suave perfecto) ───────────────────────
  if (wind >= 10 && wind <= 28 && NE && temp >= 17 && temp <= 27 && humid >= 55 && prec === 0) {
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

  const wind = obs.vv
  const gust = obs.vmax   // racha máxima — más relevante que velocidad media
  const temp = obs.ta
  const prec = obs.prec
  const south = isSouth(obs.dv)
  const NE = isNE(obs.dv)
  const prob = forecast[0]?.probPrecip ?? 0
  const uv = forecast[0]?.uvMax ?? 0

  // Calima activa
  const calima = temp > 23 && obs.hr < 50 && south

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
        : calima ? `Calima: aire seco y polvo en suspensión`
        : temp > 22 ? `${temp}°C — temperatura perfecta`
        : `${temp}°C — algo fresco para el agua`,
      tip: gust > 25 && NE ? 'Playas del sur más protegidas del viento' : uv >= 8 ? `UV ${uv} — usa protector solar 50+` : undefined,
    },
    {
      id: 'deporte', icon: '🏃', name: 'Deporte exterior',
      status: temp > 34 ? 'caution'
        : gust > 50 ? 'caution'
        : prec > 2 ? 'caution'
        : calima ? 'caution'
        : 'great',
      reason: temp > 34 ? 'Calor extremo — riesgo de golpe de calor'
        : gust > 50 ? `Rachas de ${Math.round(gust)} km/h — inestable al aire libre`
        : prec > 2 ? 'Suelo resbaladizo por lluvia'
        : calima ? 'Calima: polvo en el aire puede afectar a la respiración'
        : 'Condiciones ideales',
      tip: temp > 28 || calima ? 'Mejor antes de las 10h o después de las 19h' : undefined,
    },
    {
      id: 'senderismo', icon: '🥾', name: 'Senderismo',
      status: prec > 3 ? 'avoid'
        : gust > 60 ? 'avoid'
        : gust > 40 ? 'caution'
        : temp > 31 ? 'caution'
        : calima ? 'caution'
        : 'great',
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
      status: prec > 0 || prob > 40 ? 'avoid'
        : gust > 32 ? 'caution'
        : temp >= 18 ? 'great'
        : 'ok',
      reason: prec > 0 ? 'Lluvia activa'
        : prob > 40 ? `${prob}% de lluvia — ten el toldo a mano`
        : gust > 32 ? `Rachas de ${Math.round(gust)} km/h — asegura objetos ligeros`
        : temp >= 22 ? `${temp}°C — noche perfecta al aire libre`
        : `${temp}°C — agradable con algo de abrigo`,
    },
    {
      id: 'carretera', icon: '🚗', name: 'Carreteras',
      status: prec > 5 ? 'caution'
        : gust > 60 ? 'caution'
        : obs.vis > 0 && obs.vis < 3 ? 'caution'
        : 'great',
      reason: prec > 5 ? 'Lluvia intensa — reducir velocidad y distancia'
        : gust > 60 ? `Rachas de ${Math.round(gust)} km/h en cumbres y túneles`
        : obs.vis > 0 && obs.vis < 3 ? `Visibilidad de ${obs.vis} km — niebla o calima densa`
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

  // Temperature vs monthly average
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

  // Wind vs monthly average
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

  const wind = obs.vv, gust = obs.vmax, temp = obs.ta, prec = obs.prec
  const NE = isNE(obs.dv), south = isSouth(obs.dv)
  const prob = forecast[0]?.probPrecip ?? 0
  const vis = obs.vis

  // Calima detection (same logic as detectPhenomenon)
  const calimaByVis  = vis > 0 && vis < 8 && south && obs.hr < 55
  const calimaByTemp = temp > 23 && obs.hr < 45 && south
  const calima = calimaByVis || calimaByTemp

  const parts: string[] = []

  // ── Opening: current situation ──
  if (prec > 5) {
    parts.push(`Lluvia moderada-intensa en Santa Cruz ahora mismo (${prec} mm acumulados). Un episodio poco habitual para el archipiélago.`)
  } else if (prec > 0) {
    parts.push(`Llovizna ligera en Santa Cruz. En el norte de la isla suele llover bastante más que en la capital.`)
  } else if (calima) {
    const visNote = vis > 0 && vis < 99 ? ` con visibilidad de ${vis} km` : ''
    parts.push(`Calima activa: ${temp}°C y humedad al ${obs.hr}%${visNote}. El viento del sur arrastra polvo del Sahara — el cielo tiene un tono amarillento característico.`)
  } else if (vis > 0 && vis < 3) {
    parts.push(`Niebla densa en Santa Cruz — visibilidad de solo ${vis} km. Conduce con precaución.`)
  } else if ((gust > 48 || wind > 35) && NE) {
    const gustStr = gust > wind + 10 ? `, con rachas de ${Math.round(gust)} km/h` : ''
    parts.push(`Alisio fuerte hoy — ${Math.round(wind)} km/h del noreste${gustStr}. Crea el clásico contraste norte/sur en las islas.`)
  } else if (wind >= 12 && NE) {
    parts.push(`Día canario de manual: alisio moderado (${Math.round(wind)} km/h), ${temp}°C y buen ambiente en Santa Cruz.`)
  } else if (wind < 8) {
    parts.push(`Viento casi en calma — algo inusual para Canarias. Con ${temp}°C, el día se siente más cálido de lo que marcan los termómetros.`)
  } else {
    parts.push(`${temp}°C en Santa Cruz con viento de ${Math.round(wind)} km/h.`)
  }

  // ── Middle: island effect ──
  if (!calima && wind > 14 && NE && prec === 0) {
    parts.push(`El alisio mantiene el contraste habitual: norte de las islas con nubes y ambiente fresco; sur con sol y varios grados más de temperatura.`)
  } else if (south && !calima) {
    parts.push(`El viento del sur es el menos frecuente en Canarias y suele anunciar condiciones fuera de lo normal.`)
  }

  // ── Closing: what's coming ──
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
