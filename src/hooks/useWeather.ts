import { useEffect, useState } from 'react'
import {
  fetchObservation,
  fetchForecast,
  ISLAND_CONFIG,
  type IslandId,
  type Observation,
  type ForecastDay,
} from '../services/aemet'

export type { IslandId }

interface WeatherState {
  observation: Observation | null
  obsNorth: Observation | null    // Tenerife Norte (solo en Tenerife)
  obsSouth: Observation | null    // Tenerife Sur (solo en Tenerife)
  forecast: ForecastDay[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useWeather(islandId: IslandId = 'tenerife') {
  const [state, setState] = useState<WeatherState>({
    observation: null,
    obsNorth: null,
    obsSouth: null,
    forecast: [],
    loading: true,
    error: null,
    lastUpdated: null,
  })

  async function load() {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const cfg = ISLAND_CONFIG[islandId]

      const promises: [
        Promise<Observation | null>,
        Promise<ForecastDay[]>,
        Promise<Observation | null>,
        Promise<Observation | null>,
      ] = [
        fetchObservation(cfg.station),
        fetchForecast(cfg.municipio),
        cfg.stationNorth ? fetchObservation(cfg.stationNorth) : Promise.resolve(null),
        cfg.stationSouth ? fetchObservation(cfg.stationSouth) : Promise.resolve(null),
      ]

      const [observation, forecast, obsNorth, obsSouth] = await Promise.all(promises)

      setState({
        observation,
        obsNorth,
        obsSouth,
        forecast,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      })
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Error desconocido',
      }))
    }
  }

  useEffect(() => {
    setState((s) => ({ ...s, loading: true, observation: null, obsNorth: null, obsSouth: null, forecast: [] }))
    load()
    const interval = setInterval(load, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [islandId])

  return { ...state, refresh: load }
}
