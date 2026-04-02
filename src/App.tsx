import { useState } from 'react'
import CurrentWeather from './components/CurrentWeather'
import DailySummary from './components/DailySummary'
import PhenomenonBadge from './components/PhenomenonBadge'
import ActivityImpact from './components/ActivityImpact'
import ContextStats from './components/ContextStats'
import ForecastStrip from './components/ForecastStrip'
import ConfidenceBar from './components/ConfidenceBar'
import TempChart from './components/TempChart'
import RainChart from './components/RainChart'
import LearnPage from './pages/LearnPage'
import { useWeather } from './hooks/useWeather'

function Card({ children, noPad }: { children: React.ReactNode; noPad?: boolean }) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 18,
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border)',
      overflow: noPad ? 'hidden' : undefined,
    }}>
      {children}
    </div>
  )
}

function SectionDivider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '0 24px' }} />
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '20px 24px 0' }}>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700,
        color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.14em',
      }}>
        {children}
      </p>
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
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: 1040, margin: '0 auto',
          padding: '0 28px', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800,
              color: 'var(--text)', letterSpacing: '-0.02em',
            }}>
              Meteo<span style={{ color: 'var(--primary)' }}>Canarias</span>
            </h1>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              color: 'var(--text-dim)', padding: '3px 8px', borderRadius: 6,
              background: 'var(--bg)', border: '1px solid var(--border)',
            }}>
              AEMET OpenData
            </span>
            {error && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#dc2626',
                padding: '3px 8px', borderRadius: 6, background: '#fef2f2',
              }}>
                Sin conexión
              </span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {lastUpdated && (
              <button
                onClick={refresh}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                  color: 'var(--text-dim)', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '4px 6px', borderRadius: 6,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
                title="Actualizar datos"
              >
                <span style={{ opacity: 0.6 }}>↻</span>
                {lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </button>
            )}
            <button
              onClick={() => setPage('learn')}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
                color: 'var(--primary)', background: 'var(--primary-light)',
                border: '1px solid rgba(27,104,212,0.2)',
                borderRadius: 10, padding: '7px 16px', cursor: 'pointer',
              }}
            >
              Aprende meteorología →
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{
        maxWidth: 1040, margin: '0 auto',
        padding: '28px 28px 64px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>

        {/* Phenomenon alert — only rendered when detected */}
        <PhenomenonBadge obs={obs} forecast={forecast} />

        {/* ── Card 1: Narrative + current metrics ── */}
        <Card>
          <DailySummary obs={obs} forecast={forecast} loading={loading} />
          <SectionDivider />
          <CurrentWeather obs={obs} loading={loading} />
        </Card>

        {/* ── Card 2: Activities ── */}
        <Card>
          <ActivityImpact obs={obs} forecast={forecast} loading={loading} />
        </Card>

        {/* ── Card 3: 7-day forecast ── */}
        <Card>
          <ForecastStrip days={forecast} loading={loading} />
        </Card>

        {/* ── Row: Charts ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card>
            <TempChart days={forecast} loading={loading} />
          </Card>
          <Card>
            <RainChart days={forecast} loading={loading} />
          </Card>
        </div>

        {/* ── Card 4: Historical context ── */}
        <Card>
          <ContextStats obs={obs} forecast={forecast} loading={loading} />
        </Card>

        {/* ── Card 5: Forecast confidence ── */}
        <Card>
          <ConfidenceBar days={forecast} loading={loading} />
        </Card>

        {/* Model resolution note */}
        <div style={{
          display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center',
          padding: '4px 0',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>D1–2</span>
            {' '}· HARMONIE-AROME 2.5 km
          </span>
          <span style={{ color: 'var(--border)', fontSize: '0.8rem' }}>|</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--sun)', fontWeight: 700 }}>D3–7</span>
            {' '}· Modelo global 25 km
          </span>
        </div>
      </main>
    </div>
  )
}
