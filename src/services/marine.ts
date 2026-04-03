/**
 * Open-Meteo Marine API — free, no API key needed
 * Docs: https://open-meteo.com/en/docs/marine-weather-api
 */

export interface WaveData {
  waveHeight: number      // metros — altura significativa total
  wavePeriod: number      // segundos — periodo medio
  waveDirection: number   // grados — dirección de procedencia
  swellHeight: number     // metros — componente swell (ondas limpias)
  swellPeriod: number     // segundos — periodo swell (calidad)
  swellDirection: number  // grados — dirección del swell
  windWaveHeight: number  // metros — componente viento (choppy)
}

export async function fetchWaveData(lat: number, lon: number): Promise<WaveData | null> {
  try {
    const params = new URLSearchParams({
      latitude:  String(lat),
      longitude: String(lon),
      current: [
        'wave_height',
        'wave_direction',
        'wave_period',
        'swell_wave_height',
        'swell_wave_period',
        'swell_wave_direction',
        'wind_wave_height',
      ].join(','),
      timezone: 'Atlantic/Canary',
    })

    const res = await fetch(`https://marine-api.open-meteo.com/v1/marine?${params}`)
    if (!res.ok) throw new Error(`Marine API ${res.status}`)
    const data = await res.json()
    const c = data.current

    return {
      waveHeight:     Number(c.wave_height      ?? 0),
      wavePeriod:     Number(c.wave_period       ?? 0),
      waveDirection:  Number(c.wave_direction    ?? 0),
      swellHeight:    Number(c.swell_wave_height  ?? 0),
      swellPeriod:    Number(c.swell_wave_period  ?? 0),
      swellDirection: Number(c.swell_wave_direction ?? 0),
      windWaveHeight: Number(c.wind_wave_height   ?? 0),
    }
  } catch (err) {
    console.error('fetchWaveData', err)
    return null
  }
}

/**
 * Computes the angular difference between two directions (0-180)
 * 0 = same direction, 180 = opposite
 */
export function angleDiff(a: number, b: number): number {
  const d = Math.abs(((a - b) + 360) % 360)
  return d > 180 ? 360 - d : d
}
