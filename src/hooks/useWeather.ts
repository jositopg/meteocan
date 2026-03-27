import { useEffect, useState } from 'react'
import {
  fetchObservation,
  fetchForecast,
  STATIONS,
  MUNICIPIOS,
  type Observation,
  type ForecastDay,
} from '../services/aemet'

interface WeatherState {
  observation: Observation | null
  forecast: ForecastDay[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    observation: null,
    forecast: [],
    loading: true,
    error: null,
    lastUpdated: null,
  })

  async function load() {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [observation, forecast] = await Promise.all([
        fetchObservation(STATIONS.tenerife),
        fetchForecast(MUNICIPIOS.santaCruzTenerife),
      ])
      setState({
        observation,
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
    load()
    // Refresh every 30 min
    const interval = setInterval(load, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { ...state, refresh: load }
}
