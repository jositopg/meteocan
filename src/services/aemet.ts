/**
 * AEMET OpenData API client
 *
 * Two-step flow:
 *   1. Call endpoint → get { datos: url, metadatos: url }
 *   2. Fetch datos URL → actual JSON payload
 */

const BASE = 'https://opendata.aemet.es/opendata/api'
const KEY = import.meta.env.VITE_AEMET_API_KEY as string

async function fetchAemet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}?api_key=${KEY}`)
  if (!res.ok) throw new Error(`AEMET ${res.status}: ${path}`)
  const envelope = await res.json()
  if (envelope.estado !== 200) throw new Error(`AEMET estado ${envelope.estado}: ${envelope.descripcion}`)

  const dataRes = await fetch(envelope.datos)
  if (!dataRes.ok) throw new Error(`AEMET datos ${dataRes.status}`)
  return dataRes.json() as Promise<T>
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Observation {
  idema: string
  ubi: string
  lat: number
  lon: number
  alt: number
  ta: number       // temp actual °C
  tamax: number    // temp máx
  tamin: number    // temp mín
  hr: number       // humedad relativa %
  vv: number       // velocidad viento km/h
  dv: number       // dirección viento °
  pres: number     // presión hPa
  prec: number     // precipitación mm
  fint: string     // fecha/hora UTC
}

export interface ForecastDay {
  fecha: string
  tempMax: number
  tempMin: number
  probPrecip: number
  estadoCielo: string
  estadoCieloDesc: string
  vientoDir: string
  vientoVel: number
}

// ── Observation (current conditions) ──────────────────────────────────────

// Station IDs for main islands
export const STATIONS = {
  tenerife:      'C449C',   // Santa Cruz de Tenerife
  granCanaria:   'C649I',   // Las Palmas / Gando
  laPalma:       'C139E',   // La Palma airport
  lanzarote:     'C029O',   // Lanzarote airport
  fuerteventura: 'C249I',   // Fuerteventura airport
} as const

export async function fetchObservation(stationId: string): Promise<Observation | null> {
  try {
    const data = await fetchAemet<Observation[]>(
      `/observacion/convencional/datos/estacion/${stationId}`
    )
    // Returns array sorted by time — last entry is most recent
    return data[data.length - 1] ?? null
  } catch (err) {
    console.error('fetchObservation', err)
    return null
  }
}

// ── Daily forecast ──────────────────────────────────────────────────────────

// Municipality codes (INE) for Canary Islands
export const MUNICIPIOS = {
  santaCruzTenerife: '38038',
  lasPalmasGC:       '35016',
  santaCruzLaPalma:  '38031',
  arrecife:          '35004',
  puertoRosario:     '35021',
} as const

// Raw AEMET forecast shape (simplified — full schema is large)
interface AemetForecastRaw {
  nombre: string
  provincia: string
  prediccion: {
    dia: Array<{
      fecha: string
      temperatura: { maxima: number; minima: number }
      probPrecipitacion: Array<{ value: number; periodo?: string }>
      estadoCielo: Array<{ value: string; descripcion: string; periodo?: string }>
      viento: Array<{ direccion: string; velocidad: number; periodo?: string }>
    }>
  }
}

export async function fetchForecast(municipioCode: string): Promise<ForecastDay[]> {
  try {
    const raw = await fetchAemet<AemetForecastRaw[]>(
      `/prediccion/especifica/municipio/diaria/${municipioCode}`
    )
    const pred = raw[0]?.prediccion?.dia ?? []

    return pred.slice(0, 7).map((d) => {
      // Some periods come as arrays; take the all-day value or first entry
      const allDay = (arr: Array<{ periodo?: string; value: unknown }>) =>
        arr.find((x) => !x.periodo || x.periodo === '0024') ?? arr[0]

      const cielo = allDay(d.estadoCielo as Array<{ periodo?: string; value: string; descripcion: string }>)
      const viento = allDay(d.viento as Array<{ periodo?: string; direccion: string; velocidad: number }>)
      const precip = allDay(d.probPrecipitacion as Array<{ periodo?: string; value: number }>)

      return {
        fecha:           d.fecha,
        tempMax:         d.temperatura?.maxima ?? 0,
        tempMin:         d.temperatura?.minima ?? 0,
        probPrecip:      Number((precip as { value: number })?.value ?? 0),
        estadoCielo:     String((cielo as { value: string })?.value ?? ''),
        estadoCieloDesc: String((cielo as { descripcion: string })?.descripcion ?? ''),
        vientoDir:       String((viento as { direccion: string })?.direccion ?? ''),
        vientoVel:       Number((viento as { velocidad: number })?.velocidad ?? 0),
      }
    })
  } catch (err) {
    console.error('fetchForecast', err)
    return []
  }
}
