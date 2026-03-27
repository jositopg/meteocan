import { useState } from 'react'
import LayerToggle from './components/LayerToggle'
import CoordinateHUD from './components/CoordinateHUD'
import PixelMap from './components/PixelMap'
import MetricCard from './components/MetricCard'
import EducationalCard from './components/EducationalCard'
import ForecastBar from './components/ForecastBar'
import MapLegend from './components/MapLegend'
import LayerContext from './components/LayerContext'
import Glossary from './components/Glossary'
import { useWeather } from './hooks/useWeather'

type Layer = 'clouds' | 'rain' | 'storms'

const EDUCATION: Record<Layer, { tag: string; title: string; body: string }> = {
  clouds: {
    tag: 'Microclimas',
    title: 'Mar de Nubes vs. Frentes Atlánticos',
    body: 'El alisio empuja nubes orográficas contra las laderas norte a 800–1.200 m, creando el característico "mar de nubes" canario. Son nubes locales, estables. Un frente atlántico, en cambio, cubre todo el archipiélago con cirros y estratos de origen sinóptico.',
  },
  rain: {
    tag: 'Efecto Föhn',
    title: '¿Por qué llueve sólo en una ladera?',
    body: 'El viento forzado a subir una montaña se enfría y precipita en el lado de barlovento. Al descender por sotavento, se calienta adiabáticamente. Resultado: lluvia intensa en el norte de Tenerife y sol seco en el sur el mismo día.',
  },
  storms: {
    tag: 'Vientos Alisios',
    title: 'Cómo funciona el régimen de vientos',
    body: 'Los alisios soplan de NE a SO de forma casi constante entre los 15° y 30°N, impulsados por el anticiclón de las Azores. En verano son más fuertes y estables; en invierno pueden debilitarse cuando las borrascas atlánticas desplazan el anticiclón hacia el sur.',
  },
}

function windDirLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  return dirs[Math.round(deg / 45) % 8]
}

function pressureTrend(_hPa: number): string {
  // Without historical data we can't compute real trend; show neutral
  return '→ estable'
}

export default function App() {
  const [layer, setLayer] = useState<Layer>('clouds')
  const [coords, setCoords] = useState({ lat: 28.291, lng: -16.629 })
  const { observation: obs, forecast, loading, error, lastUpdated, refresh } = useWeather()

  const edu = EDUCATION[layer]

  return (
    <div
      className="min-h-screen grid"
      style={{
        gridTemplateColumns: '1fr 360px',
        gridTemplateRows: 'auto 1fr auto',
        background: 'var(--surface)',
      }}
    >
      {/* ── Header ── */}
      <header
        className="col-span-2 flex items-center justify-between px-6 py-3"
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
            className="text-xs text-on-surface-variant px-2 py-0.5 rounded-sm"
            style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-container-high)' }}
          >
            AEMET HARMONIE-AROME · 2.5 km
          </span>
          {error && (
            <span
              className="text-xs px-2 py-0.5 rounded-sm"
              style={{ fontFamily: 'var(--font-mono)', background: 'rgba(255,80,80,0.12)', color: '#ff6b6b' }}
              title={error}
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
              title="Actualizar ahora"
            >
              ↻ {lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </button>
          )}
          <CoordinateHUD lat={coords.lat} lng={coords.lng} island="Canarias" />
          <LayerToggle active={layer} onChange={setLayer} />
        </div>
      </header>

      {/* ── Map ── */}
      <main className="relative overflow-hidden" style={{ background: 'var(--surface-dim)' }}>
        <PixelMap layer={layer} onCoordinateChange={(lat, lng) => setCoords({ lat, lng })} />

        {/* Legend — bottom right */}
        <div className="absolute bottom-4 right-4">
          <MapLegend layer={layer} />
        </div>

        {/* Resolution note — bottom left */}
        <div
          className="absolute bottom-4 left-4 px-3 py-2 rounded-md text-xs"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--on-surface-variant)',
            background: 'rgba(8,20,37,0.75)',
            backdropFilter: 'blur(20px)',
            fontSize: '0.65rem',
          }}
        >
          Días 1–2 ·&nbsp;
          <span style={{ color: 'var(--primary)' }}>2.5 km alta res.</span>
          &nbsp;·&nbsp; Días 3–7 ·&nbsp;
          <span style={{ color: 'var(--tertiary)' }}>25 km baja res.</span>
        </div>
      </main>

      {/* ── Right panel ── */}
      <aside
        className="flex flex-col gap-4 p-5 overflow-y-auto"
        style={{ background: 'var(--surface-container-low)' }}
      >
        {/* What you're seeing — changes with active layer */}
        <LayerContext layer={layer} />

        {/* Station info */}
        <div>
          <p
            className="text-on-surface-variant text-xs uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.12em' }}
          >
            Estación meteorológica
          </p>
          <h2
            className="text-on-surface font-semibold"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}
          >
            {obs?.ubi ?? 'Santa Cruz de Tenerife'}
          </h2>
          <p
            className="text-on-surface-variant text-xs mt-0.5"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {obs
              ? `${obs.lat.toFixed(4)}°N · ${Math.abs(obs.lon).toFixed(4)}°W · ${obs.alt} m`
              : '28.4636°N · 16.2518°W · 35 m'}
          </p>
        </div>

        {/* Metrics */}
        <div className="flex flex-col gap-2">
          <p
            className="text-on-surface-variant text-xs uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.12em' }}
          >
            Condiciones actuales
          </p>
          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              label="Temperatura"
              value={loading ? '—' : String(obs?.ta ?? '—')}
              unit="°C"
              sub={obs ? `Máx ${obs.tamax}° · Mín ${obs.tamin}°` : 'Cargando...'}
            />
            <MetricCard
              label="Viento"
              value={loading ? '—' : String(Math.round(obs?.vv ?? 0) || '—')}
              unit="km/h"
              sub={obs ? `${windDirLabel(obs.dv)} · ${obs.dv}°` : 'Cargando...'}
            />
            <MetricCard
              label="Humedad"
              value={loading ? '—' : String(obs?.hr ?? '—')}
              unit="%"
              sub={obs ? `Precip. ${obs.prec ?? 0} mm` : 'Cargando...'}
            />
            <MetricCard
              label="Presión"
              value={loading ? '—' : String(obs?.pres ?? '—')}
              unit="hPa"
              sub={obs ? pressureTrend(obs.pres) : 'Cargando...'}
            />
          </div>
        </div>

        {/* Educational deep-dive */}
        <EducationalCard tag={edu.tag} title={edu.title} body={edu.body} />

        {/* Glossary */}
        <Glossary />
      </aside>

      {/* ── Forecast bar ── */}
      <footer
        className="col-span-2 px-6 py-4"
        style={{ background: 'var(--surface-container-low)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-on-surface-variant text-xs uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.12em' }}
          >
            Previsión 7 días · Santa Cruz de Tenerife
          </p>
          <p
            className="text-on-surface-variant"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}
          >
            % = probabilidad de lluvia · Temp en °C
          </p>
        </div>
        <ForecastBar days={forecast} loading={loading} />
      </footer>
    </div>
  )
}
