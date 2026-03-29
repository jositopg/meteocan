import type { ForecastDay } from '../services/aemet'

interface Props { days: ForecastDay[]; loading: boolean }

const W = 700, H = 130, PAD = { top: 20, right: 24, bottom: 30, left: 32 }
const CW = W - PAD.left - PAD.right
const CH = H - PAD.top - PAD.bottom

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
function shortDay(fecha: string, i: number) {
  if (i === 0) return 'Hoy'
  try { return DAY_NAMES[new Date(fecha).getDay()] } catch { return `D${i}` }
}

function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return ''
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const mx = (x0 + x1) / 2
    d += ` C ${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`
  }
  return d
}

function Skeleton() {
  return (
    <div style={{ height: H + 24, borderRadius: 12, background: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
  )
}

export default function TempChart({ days, loading }: Props) {
  if (loading || days.length === 0) return <Skeleton />

  const allTemps = [...days.map(d => d.tempMax), ...days.map(d => d.tempMin)]
  const tMin = Math.min(...allTemps) - 2
  const tMax = Math.max(...allTemps) + 2

  function px(i: number) { return PAD.left + (i / (days.length - 1)) * CW }
  function py(t: number) { return PAD.top + (1 - (t - tMin) / (tMax - tMin)) * CH }

  const maxPts: [number, number][] = days.map((d, i) => [px(i), py(d.tempMax)])
  const minPts: [number, number][] = days.map((d, i) => [px(i), py(d.tempMin)])

  const areaPath = smoothPath(maxPts) + ' L ' + minPts.slice().reverse().map(([x, y]) => `${x} ${y}`).join(' L ') + ' Z'

  return (
    <div className="p-5 flex flex-col gap-3">
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Temperatura (°C)
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="temp-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const y = PAD.top + t * CH
          const val = Math.round(tMax - t * (tMax - tMin))
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="rgba(0,0,0,0.05)" strokeWidth={1} />
              <text x={PAD.left - 6} y={y + 4}
                textAnchor="end" fontSize={9} fill="var(--text-dim)"
                fontFamily="var(--font-mono)">
                {val}°
              </text>
            </g>
          )
        })}

        {/* Area between max/min */}
        <path d={areaPath} fill="url(#temp-area)" />

        {/* Max line (warm) */}
        <path d={smoothPath(maxPts)} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" />

        {/* Min line (cool) */}
        <path d={smoothPath(minPts)} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" />

        {/* Max value dots + labels */}
        {maxPts.map(([x, y], i) => (
          <g key={`max-${i}`}>
            <circle cx={x} cy={y} r={3} fill="#f59e0b" stroke="#fff" strokeWidth={1.5} />
            <text x={x} y={y - 8} textAnchor="middle" fontSize={9.5} fill="#b45309"
              fontFamily="var(--font-mono)" fontWeight="500">
              {days[i].tempMax}°
            </text>
          </g>
        ))}

        {/* Min value dots + labels */}
        {minPts.map(([x, y], i) => (
          <g key={`min-${i}`}>
            <circle cx={x} cy={y} r={3} fill="#3b82f6" stroke="#fff" strokeWidth={1.5} />
            <text x={x} y={y + 17} textAnchor="middle" fontSize={9.5} fill="#1d4ed8"
              fontFamily="var(--font-mono)" fontWeight="500">
              {days[i].tempMin}°
            </text>
          </g>
        ))}

        {/* Day labels on X axis */}
        {days.map((d, i) => (
          <text key={i} x={px(i)} y={H - 2} textAnchor="middle"
            fontSize={10} fill="var(--text-dim)" fontFamily="var(--font-body)">
            {shortDay(d.fecha, i)}
          </text>
        ))}

        {/* Legend */}
        <g>
          <circle cx={W - 80} cy={8} r={4} fill="#f59e0b" />
          <text x={W - 73} y={12} fontSize={9} fill="var(--text-muted)" fontFamily="var(--font-body)">Máxima</text>
          <circle cx={W - 30} cy={8} r={4} fill="#3b82f6" />
          <text x={W - 23} y={12} fontSize={9} fill="var(--text-muted)" fontFamily="var(--font-body)">Mín</text>
        </g>
      </svg>
    </div>
  )
}
