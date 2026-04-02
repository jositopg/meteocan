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

// ── Island configuration ───────────────────────────────────────────────────

export const ISLAND_CONFIG = {
  tenerife:      { name: 'Tenerife',      emoji: '🌋', station: 'C449C', stationNorth: 'C447A', stationSouth: 'C429I', municipio: '38038' },
  granCanaria:   { name: 'Gran Canaria',  emoji: '🏖️', station: 'C649I', stationNorth: null,     stationSouth: null,     municipio: '35016' },
  lanzarote:     { name: 'Lanzarote',     emoji: '🌵', station: 'C029O', stationNorth: null,     stationSouth: null,     municipio: '35004' },
  fuerteventura: { name: 'Fuerteventura', emoji: '🏜️', station: 'C249I', stationNorth: null,     stationSouth: null,     municipio: '35021' },
  laPalma:       { name: 'La Palma',      emoji: '🌿', station: 'C139E', stationNorth: null,     stationSouth: null,     municipio: '38031' },
  laGomera:      { name: 'La Gomera',     emoji: '🌲', station: 'C029K', stationNorth: null,     stationSouth: null,     municipio: '38035' },
  elHierro:      { name: 'El Hierro',     emoji: '🦎', station: 'C929I', stationNorth: null,     stationSouth: null,     municipio: '38901' },
} as const

export type IslandId = keyof typeof ISLAND_CONFIG

// ── Types ──────────────────────────────────────────────────────────────────

export interface Observation {
  idema: string
  ubi: string
  lat: number
  lon: number
  alt: number
  fint: string     // fecha/hora UTC
  ta: number       // temp actual °C
  tamax: number    // temp máx
  tamin: number    // temp mín
  tpr: number      // punto de rocío °C
  hr: number       // humedad relativa %
  vv: number       // velocidad viento media km/h
  vmax: number     // racha máxima km/h
  dv: number       // dirección viento media °
  dmax: number     // dirección racha máxima °
  pres: number     // presión hPa
  prec: number     // precipitación mm
  vis: number      // visibilidad km
  inso: number     // horas de insolación
}

export interface ForecastDay {
  fecha: string
  tempMax: number
  tempMin: number
  sensMax: number
  sensMin: number
  probPrecip: number
  estadoCielo: string
  estadoCieloDesc: string
  vientoDir: string
  vientoVel: number
  rachaMax: number
  uvMax: number
  hrMax: number
  hrMin: number
}

// ── Observation fetch ──────────────────────────────────────────────────────

export async function fetchObservation(stationId: string): Promise<Observation | null> {
  try {
    const data = await fetchAemet<Observation[]>(
      `/observacion/convencional/datos/estacion/${stationId}`
    )
    const raw = data[data.length - 1] ?? null
    if (!raw) return null
    return {
      ...raw,
      vmax: raw.vmax ?? raw.vv  ?? 0,
      dmax: raw.dmax ?? raw.dv  ?? 0,
      tpr:  raw.tpr  ?? 0,
      vis:  raw.vis  ?? 99,
      inso: raw.inso ?? 0,
    }
  } catch (err) {
    console.error('fetchObservation', err)
    return null
  }
}

// ── Daily forecast ──────────────────────────────────────────────────────────

interface AemetForecastRaw {
  nombre: string
  provincia: string
  prediccion: {
    dia: Array<{
      fecha: string
      temperatura: { maxima: number; minima: number }
      sensTermica: { maxima: number; minima: number }
      probPrecipitacion: Array<{ value: number; periodo?: string }>
      estadoCielo: Array<{ value: string; descripcion: string; periodo?: string }>
      viento: Array<{ direccion: string; velocidad: number; periodo?: string }>
      rachaMax: Array<{ value: string | number; periodo?: string }>
      uvMax: number
      humedadRelativa: { maxima: number; minima: number }
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
      type WithPeriodo = { periodo?: string }
      type CieloItem  = WithPeriodo & { value: string; descripcion: string }
      type VientoItem = WithPeriodo & { direccion: string; velocidad: number }
      type PrecipItem = WithPeriodo & { value: number }
      type RachaItem  = WithPeriodo & { value: string | number }

      const allDay = <T extends WithPeriodo>(arr: T[]): T | undefined =>
        arr.find((x) => !x.periodo || x.periodo === '0024') ?? arr[0]

      const cielo   = allDay(d.estadoCielo        as CieloItem[])
      const viento  = allDay(d.viento             as VientoItem[])
      const precip  = allDay(d.probPrecipitacion  as PrecipItem[])
      const racha   = allDay((d.rachaMax ?? [])   as RachaItem[])

      return {
        fecha:           d.fecha,
        tempMax:         d.temperatura?.maxima ?? 0,
        tempMin:         d.temperatura?.minima ?? 0,
        sensMax:         d.sensTermica?.maxima ?? d.temperatura?.maxima ?? 0,
        sensMin:         d.sensTermica?.minima ?? d.temperatura?.minima ?? 0,
        probPrecip:      Number(precip?.value          ?? 0),
        estadoCielo:     String(cielo?.value           ?? ''),
        estadoCieloDesc: String(cielo?.descripcion     ?? ''),
        vientoDir:       String(viento?.direccion      ?? ''),
        vientoVel:       Number(viento?.velocidad      ?? 0),
        rachaMax:        Number(racha?.value           ?? 0),
        uvMax:           Number(d.uvMax                ?? 0),
        hrMax:           Number(d.humedadRelativa?.maxima ?? 0),
        hrMin:           Number(d.humedadRelativa?.minima ?? 0),
      }
    })
  } catch (err) {
    console.error('fetchForecast', err)
    return []
  }
}
