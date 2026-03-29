import { useState } from 'react'
import CurrentWeather from './components/CurrentWeather'
import ForecastStrip from './components/ForecastStrip'
import TempChart from './components/TempChart'
import RainChart from './components/RainChart'
import LearnPage from './pages/LearnPage'
import { useWeather } from './hooks/useWeather'

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 16,
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border)',
    }}>
      {children}
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<'map' | 'learn'>('map')
  const { observation: obs, forecast, loading, error, lastUpdated, refresh } = useWeather()

  if (page === 'learn') {
    return <LearnPage onBack={() => setPage('map')} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
              Meteo<span style={{ color: 'var(--primary)' }}>Canarias</span>
            </h1>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-dim)', padding: '2px 8px', borderRadius: 6, background: 'var(--bg)' }}>
              AEMET OpenData
            </span>
            {error && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#dc2626', padding: '2px 8px', borderRadius: 6, background: '#fef2f2' }}>
                Sin datos
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {lastUpdated && (
              <button
                onClick={refresh}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                title="Actualizar datos"
              >
                ↻ {lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </button>
            )}
            <button
              onClick={() => setPage('learn')}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                border: 'none',
                borderRadius: 8,
                padding: '6px 14px',
                cursor: 'pointer',
              }}
            >
              Aprende →
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 24px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Current conditions */}
        <Card>
          <CurrentWeather obs={obs} loading={loading} />
        </Card>

        {/* 7-day forecast */}
        <Card>
          <ForecastStrip days={forecast} loading={loading} />
        </Card>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card>
            <TempChart days={forecast} loading={loading} />
          </Card>
          <Card>
            <RainChart days={forecast} loading={loading} />
          </Card>
        </div>

        {/* Resolution note */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>D1–2</span> · Alta resolución 2.5 km (HARMONIE-AROME)
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--sun)', fontWeight: 600 }}>D3–7</span> · Baja resolución 25 km (modelo global)
          </span>
        </div>
      </main>
    </div>
  )
}
