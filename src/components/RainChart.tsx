import type { ForecastDay } from '../services/aemet'

interface Props { days: ForecastDay[]; loading: boolean }

const W = 700, H = 130, PAD = { top: 24, right: 24, bottom: 30, left: 32 }
const CW = W - PAD.left - PAD.right
const CH = H - PAD.top - PAD.bottom

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
function shortDay(fecha: string, i: number) {
  if (i === 0) return 'Hoy'
  try { return DAY_NAMES[new Date(fecha).getDay()] } catch { return `D${i}` }
}

function Skeleton() {
  return (
    <div style={{ height: H + 24, borderRadius: 12, background: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
  )
}

export default function RainChart({ days, loading }: Props) {
  if (loading || days.length === 0) return <Skeleton />

  const barW   = CW / days.length
  const barPad = barW * 0.25

  return (
    <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
        Probabilidad de lluvia (%)
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>
          <linearGradient id="bar-low" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>

        {/* Horizontal guide lines at 25%, 50%, 75%, 100% */}
        {[25, 50, 75, 100].map(pct => {
          const y = PAD.top + (1 - pct / 100) * CH
          return (
            <g key={pct}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="rgba(0,0,0,0.05)" strokeWidth={pct === 50 ? 1.5 : 1}
                strokeDasharray={pct === 50 ? '4 3' : undefined} />
              <text x={PAD.left - 6} y={y + 4}
                textAnchor="end" fontSize={9} fill="var(--text-dim)"
                fontFamily="var(--font-mono)">
                {pct}%
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {days.map((d, i) => {
          const prob = d.probPrecip
          const bx   = PAD.left + i * barW + barPad
          const bw   = barW - barPad * 2
          const bh   = (prob / 100) * CH
          const by   = PAD.top + CH - bh
          const isHigh = prob >= 50

          return (
            <g key={i}>
              {/* Background column */}
              <rect x={bx} y={PAD.top} width={bw} height={CH}
                rx={4} fill="rgba(0,0,0,0.025)" />

              {/* Bar */}
              {prob > 0 && (
                <rect x={bx} y={by} width={bw} height={bh}
                  rx={4} fill={isHigh ? 'url(#bar-grad)' : 'url(#bar-low)'} />
              )}

              {/* Value label above bar */}
              {prob > 0 && (
                <text x={bx + bw / 2} y={by - 5}
                  textAnchor="middle" fontSize={10} fontWeight="600"
                  fill={isHigh ? '#1d4ed8' : '#60a5fa'}
                  fontFamily="var(--font-mono)">
                  {prob}%
                </text>
              )}
              {prob === 0 && (
                <text x={bx + bw / 2} y={PAD.top + CH / 2 + 4}
                  textAnchor="middle" fontSize={9}
                  fill="var(--text-dim)"
                  fontFamily="var(--font-body)">
                  —
                </text>
              )}
            </g>
          )
        })}

        {/* Day labels */}
        {days.map((d, i) => (
          <text key={i}
            x={PAD.left + i * barW + barW / 2}
            y={H - 2}
            textAnchor="middle" fontSize={10}
            fill="var(--text-dim)"
            fontFamily="var(--font-body)">
            {shortDay(d.fecha, i)}
          </text>
        ))}
      </svg>
    </div>
  )
}
