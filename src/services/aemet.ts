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
  vis: number      // visibilidad km (útil para calima y niebla)
  inso: number     // horas de insolación
}

export interface ForecastDay {
  fecha: string
  tempMax: number
  tempMin: number
  sensMax: number     // sensación térmica máxima
  sensMin: number     // sensación térmica mínima
  probPrecip: number
  estadoCielo: string
  estadoCieloDesc: string
  vientoDir: string
  vientoVel: number
  rachaMax: number    // racha máxima prevista km/h
  uvMax: number       // índice UV máximo
  hrMax: number       // humedad relativa máxima %
  hrMin: number       // humedad relativa mínima %
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
    const raw = data[data.length - 1] ?? null
    if (!raw) return null
    // Normalize: some fields may be missing/null from the station
    return {
      ...raw,
      vmax: raw.vmax   ?? raw.vv  ?? 0,
      dmax: raw.dmax   ?? raw.dv  ?? 0,
      tpr:  raw.tpr    ?? 0,
      vis:  raw.vis    ?? 99,   // 99 = not reported (assume clear)
      inso: raw.inso   ?? 0,
    }
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
