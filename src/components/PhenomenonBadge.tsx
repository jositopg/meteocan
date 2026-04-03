import { useState } from 'react'
import type { Observation, ForecastDay, IslandId } from '../services/aemet'
import { detectPhenomenon } from '../utils/weatherLogic'

interface Props { obs: Observation | null; forecast: ForecastDay[]; islandId: IslandId }

const LEVEL_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  info:  { bg: 'var(--primary-light)', border: '#93c5fd', text: '#1d4ed8', dot: '#3b82f6' },
  warn:  { bg: '#fef9c3', border: '#fde047', text: '#854d0e', dot: '#f59e0b' },
  alert: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', dot: '#ef4444' },
}

export default function PhenomenonBadge({ obs, forecast, islandId }: Props) {
  const [expanded, setExpanded] = useState(false)
  const p = detectPhenomenon(obs, forecast, islandId)
  if (!p) return null

  const c = LEVEL_COLORS[p.level]

  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 18px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Pulsing dot */}
        <span style={{ position: 'relative', flexShrink: 0 }}>
          <span style={{
            display: 'block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: c.dot,
          }} />
        </span>

        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{p.icon}</span>

        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: c.text,
            marginBottom: 2,
          }}>
            {p.name}
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.78rem',
            color: c.text,
            opacity: 0.85,
          }}>
            {p.brief}
          </p>
        </div>

        <span style={{
          color: c.text,
          fontSize: '0.6rem',
          opacity: 0.6,
          flexShrink: 0,
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
          display: 'inline-block',
        }}>▼</span>
      </button>

      {expanded && (
        <div style={{ padding: '0 18px 16px 50px', borderTop: `1px solid ${c.border}` }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.83rem',
            color: c.text,
            lineHeight: 1.7,
            paddingTop: 12,
            opacity: 0.9,
          }}>
            {p.explanation}
          </p>
        </div>
      )}
    </div>
  )
}
