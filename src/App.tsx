import { useState } from 'react'
import LayerToggle from './components/LayerToggle'
import CoordinateHUD from './components/CoordinateHUD'
import PixelMap from './components/PixelMap'
import MetricCard from './components/MetricCard'
import EducationalCard from './components/EducationalCard'
import ForecastBar from './components/ForecastBar'
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
    tag: 'Convección',
    title: 'Tormentas en el archipiélago',
    body: 'La orografía actúa como desencadenante: el calentamiento diurno sobre las cumbres genera ascensos convectivos locales. Las descargas eléctricas se concentran en pocas horas, difíciles de predecir con más de 6 h de antelación incluso con modelos de mesoescala de 2.5 km.',
  },
}

// Map wind direction abbreviation to compass label
function windLabel(dir: string, vel: number): string {
  if (!dir || vel === 0) return 'Calma'
  const map: Record<string, string> = {
    N: 'N', NE: 'NE', E: 'E', SE: 'SE',
    S: 'S', SO: 'SO', O: 'O', NO: 'NO',
  }
  return `${map[dir] ?? dir} · ${vel} km/h`
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
        gridTemplateColumns: '1fr 340px',
        gridTemplateRows: 'auto 1fr auto',
        background: 'var(--surface)',
      }}
    >
      {/* ── Header ── */}
      <header
        className="col-span-2 flex items-center justify-between px-6 py-4"
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
            style={{
              fontFamily: 'var(--font-mono)',
              background: 'var(--surface-container-high)',
            }}
          >
            HARMONIE-AROME · 2.5 km
          </span>
          {error && (
            <span
              className="text-xs px-2 py-0.5 rounded-sm"
              style={{
                fontFamily: 'var(--font-mono)',
                background: 'rgba(255,80,80,0.12)',
                color: '#ff6b6b',
              }}
              title={error}
            >
              Sin conexión AEMET
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span
              className="text-on-surface-variant cursor-pointer select-none"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}
              onClick={refresh}
              title="Actualizar ahora"
            >
              ↻ {lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <CoordinateHUD lat={coords.lat} lng={coords.lng} island="Tenerife" />
          <LayerToggle active={layer} onChange={setLayer} />
        </div>
      </header>

      {/* ── Map ── */}
      <main
        className="relative overflow-hidden"
        style={{ background: 'var(--surface-dim)' }}
      >
        <PixelMap layer={layer} onCoordinateChange={(lat, lng) => setCoords({ lat, lng })} />

        <div
          className="absolute bottom-4 left-4 px-3 py-2 rounded-md text-xs"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--on-surface-variant)',
            background: 'rgba(42,53,72,0.7)',
            backdropFilter: 'blur(20px)',
          }}
        >
          Días 1–2: Alta res. 2.5 km &nbsp;·&nbsp;
          <span style={{ color: 'var(--tertiary)', opacity: 0.8 }}>
            Días 3–7: Baja res. 25 km ▲ detalle degradado
          </span>
        </div>
      </main>

      {/* ── Right panel ── */}
      <aside
        className="flex flex-col gap-4 p-5 overflow-y-auto"
        style={{ background: 'var(--surface-container-low)' }}
      >
        {/* Station header */}
        <div>
          <p
            className="text-on-surface-variant text-xs uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.12em' }}
          >
            Estación de referencia
          </p>
          <h2
            className="text-on-surface font-semibold"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}
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

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="Temp"
            value={loading ? '—' : String(obs?.ta ?? '—')}
            unit="°C"
            sub={obs ? `Máx ${obs.tamax}° / Mín ${obs.tamin}°` : undefined}
          />
          <MetricCard
            label="Viento"
            value={loading ? '—' : String(obs?.vv ?? '—')}
            unit="km/h"
            sub={obs ? windLabel(
              ['N','NE','E','SE','S','SO','O','NO'][Math.round(obs.dv / 45) % 8],
              Math.round(obs.vv)
            ) : undefined}
          />
          <MetricCard
            label="Humedad"
            value={loading ? '—' : String(obs?.hr ?? '—')}
            unit="%"
            sub={obs ? `Precip. ${obs.prec ?? 0} mm` : undefined}
          />
          <MetricCard
            label="Presión"
            value={loading ? '—' : String(obs?.pres ?? '—')}
            unit="hPa"
            sub={obs ? '↗ estable' : undefined}
          />
        </div>

        {/* Educational card — changes with layer */}
        <EducationalCard tag={edu.tag} title={edu.title} body={edu.body} />

        {/* Education chips */}
        <div className="flex flex-wrap gap-2">
          {['Microclimas', 'Vientos Alisios', 'Volcanología', 'Orografía'].map((chip) => (
            <span
              key={chip}
              className="text-xs text-on-surface-variant px-3 py-1 rounded-md"
              style={{
                fontFamily: 'var(--font-body)',
                background: 'var(--surface-container-highest)',
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </aside>

      {/* ── Forecast bar ── */}
      <footer
        className="col-span-2 px-6 py-4"
        style={{ background: 'var(--surface-container-low)' }}
      >
        <p
          className="text-on-surface-variant text-xs uppercase tracking-widest mb-3"
          style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.12em' }}
        >
          Previsión 7 días
        </p>
        <ForecastBar days={forecast} loading={loading} />
      </footer>
    </div>
  )
}
