import { useState } from 'react'
import IslandMap from './components/IslandMap'
import LayerToggle from './components/LayerToggle'
import CoordinateHUD from './components/CoordinateHUD'
import MetricCard from './components/MetricCard'
import ForecastBar from './components/ForecastBar'
import MapLegend from './components/MapLegend'
import LearnPage from './pages/LearnPage'
import { useWeather } from './hooks/useWeather'

type Layer = 'clouds' | 'rain' | 'storms'

const LAYER_ONELINER: Record<Layer, string> = {
  clouds: 'Píxeles blancos = nubes · Oscuro = cielo despejado',
  rain:   'Azul claro = llovizna · Azul intenso = lluvia fuerte · Sin color = seco',
  storms: 'Verde = calma · Amarillo = alisio · Naranja/Rojo = viento fuerte',
}

function windDirLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  return dirs[Math.round(deg / 45) % 8]
}

export default function App() {
  const [page, setPage]     = useState<'map' | 'learn'>('map')
  const [layer, setLayer]   = useState<Layer>('clouds')
  const [coords, setCoords] = useState({ lat: 28.29, lng: -16.63 })

  const { observation: obs, forecast, loading, error, lastUpdated, refresh } = useWeather()

  if (page === 'learn') {
    return <LearnPage onBack={() => setPage('map')} />
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--surface)' }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ background: 'var(--surface-container-low)' }}
      >
        <div className="flex items-center gap-4">
          <h1
            className="text-on-surface font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}
          >
            Meteo<span className="text-primary">Canarias</span>
          </h1>
          <span
            className="text-xs text-on-surface-variant px-2 py-0.5 rounded-sm hidden sm:inline"
            style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-container-high)' }}
          >
            AEMET · OpenWeatherMap
          </span>
          {error && (
            <span
              className="text-xs px-2 py-0.5 rounded-sm"
              style={{ fontFamily: 'var(--font-mono)', background: 'rgba(255,80,80,0.1)', color: '#ff7070' }}
            >
              Sin datos AEMET
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <button
              className="text-on-surface-variant hover:text-primary transition-colors"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}
              onClick={refresh}
              title="Actualizar"
            >
              ↻ {lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </button>
          )}
          <button
            onClick={() => setPage('learn')}
            className="text-sm px-3 py-1.5 rounded-md transition-colors hover:bg-surface-container-high"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--primary)',
              background: 'var(--primary-container)',
            }}
          >
            Aprende →
          </button>
          <LayerToggle active={layer} onChange={setLayer} />
        </div>
      </header>

      {/* ── Body: map + sidebar ─────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Map */}
        <div className="relative flex-1 min-w-0">
          <IslandMap layer={layer} onHover={(lat, lng) => setCoords({ lat, lng })} />

          {/* Coordinate HUD — top left over map */}
          <div className="absolute top-3 left-3">
            <CoordinateHUD lat={coords.lat} lng={coords.lng} island="Canarias" />
          </div>

          {/* Legend — bottom right */}
          <div className="absolute bottom-3 right-3">
            <MapLegend layer={layer} />
          </div>

          {/* Layer one-liner — bottom left */}
          <div
            className="absolute bottom-3 left-3 px-3 py-2 rounded-md"
            style={{
              background: 'rgba(4,14,31,0.82)',
              backdropFilter: 'blur(16px)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              color: 'var(--on-surface-variant)',
            }}
          >
            {LAYER_ONELINER[layer]}
          </div>
        </div>

        {/* Sidebar — slim, only essential info */}
        <aside
          className="w-64 shrink-0 flex flex-col gap-0 overflow-y-auto"
          style={{ background: 'var(--surface-container-low)' }}
        >
          {/* Station */}
          <div className="px-4 pt-5 pb-4">
            <p
              className="text-on-surface-variant uppercase tracking-widest mb-1"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem', letterSpacing: '0.12em' }}
            >
              Estación · Santa Cruz TF
            </p>
            <p
              className="text-on-surface-variant"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}
            >
              {obs
                ? `${obs.lat.toFixed(3)}°N · ${Math.abs(obs.lon).toFixed(3)}°W · ${obs.alt} m`
                : '28.464°N · 16.252°W · 35 m'}
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(139,209,232,0.06)', margin: '0 16px' }} />

          {/* Metrics */}
          <div className="px-4 py-4 grid grid-cols-2 gap-2">
            <MetricCard
              label="Temp"
              value={loading ? '—' : String(obs?.ta ?? '—')}
              unit="°C"
              sub={obs ? `↑${obs.tamax}° ↓${obs.tamin}°` : '—'}
            />
            <MetricCard
              label="Viento"
              value={loading ? '—' : String(Math.round(obs?.vv ?? 0) || '—')}
              unit="km/h"
              sub={obs ? windDirLabel(obs.dv) : '—'}
            />
            <MetricCard
              label="Humedad"
              value={loading ? '—' : String(obs?.hr ?? '—')}
              unit="%"
              sub={obs ? `${obs.prec ?? 0} mm` : '—'}
            />
            <MetricCard
              label="Presión"
              value={loading ? '—' : String(obs?.pres ?? '—')}
              unit="hPa"
              sub="→ estable"
            />
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(139,209,232,0.06)', margin: '0 16px' }} />

          {/* Resolution info */}
          <div className="px-4 py-4 flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-primary" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>D1–2</span>
                <span className="text-on-surface-variant" style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem' }}>
                  Alta resolución · 2.5 km
                </span>
              </div>
              <p className="text-on-surface-variant" style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem', lineHeight: 1.4 }}>
                Detalle suficiente para ver diferencias entre laderas de una misma isla.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-tertiary" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>D3–7</span>
                <span className="text-on-surface-variant" style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem' }}>
                  Baja resolución · 25 km
                </span>
              </div>
              <p className="text-on-surface-variant" style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem', lineHeight: 1.4 }}>
                Tendencia general. Los microclimas por isla no se pueden distinguir.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(139,209,232,0.06)', margin: '0 16px' }} />

          {/* Aprende link */}
          <div className="px-4 py-4 mt-auto">
            <button
              onClick={() => setPage('learn')}
              className="w-full rounded-lg py-3 text-sm font-medium transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                background: 'var(--surface-container-high)',
                color: 'var(--on-surface-variant)',
              }}
            >
              ¿Qué significa todo esto?
              <span className="text-primary ml-1">→</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ── Forecast bar ────────────────────────────────────────────────── */}
      <footer
        className="shrink-0 px-5 py-3"
        style={{ background: 'var(--surface-container-low)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <p
            className="text-on-surface-variant uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem', letterSpacing: '0.12em' }}
          >
            Previsión 7 días · Santa Cruz de Tenerife
          </p>
          <p
            className="text-on-surface-variant"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem' }}
          >
            💧 = prob. lluvia · °C max / °C min
          </p>
        </div>
        <ForecastBar days={forecast} loading={loading} />
      </footer>
    </div>
  )
}
