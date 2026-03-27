import { useRef, useEffect, useCallback } from 'react'

type Layer = 'clouds' | 'rain' | 'storms'

// ── Geographic bounds (padded) ─────────────────────────────────────────────
const B = { lngMin: -18.5, lngMax: -12.9, latMin: 27.3, latMax: 29.9 }
const S  = 100   // SVG units per degree
const VW = (B.lngMax - B.lngMin) * S  // 560
const VH = (B.latMax - B.latMin) * S  // 260

function gx(lng: number) { return (lng - B.lngMin) * S }
function gy(lat: number) { return (B.latMax - lat) * S }

function polyPath(pts: [number, number][]): string {
  return pts.map(([lat, lng], i) => `${i === 0 ? 'M' : 'L'}${gx(lng).toFixed(1)},${gy(lat).toFixed(1)}`).join(' ') + ' Z'
}

// ── OWM tile math at zoom 7 ────────────────────────────────────────────────
const Z = 7, NT = Math.pow(2, Z)
function lng2t(lng: number) { return Math.floor((lng + 180) / 360 * NT) }
function lat2t(lat: number) {
  const r = lat * Math.PI / 180
  return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * NT)
}
function t2lng(x: number) { return x / NT * 360 - 180 }
function t2lat(y: number) {
  const n = Math.PI - 2 * Math.PI * y / NT
  return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

const OWM_LAYER: Record<Layer, string> = {
  clouds: 'clouds_new',
  rain:   'precipitation_new',
  storms: 'wind_new',
}

// ── Island data ────────────────────────────────────────────────────────────
interface Island {
  id: string
  name: string
  center: [number, number]   // [lat, lng] for gradient + label anchor
  gradR: number              // gradient radius in SVG units
  labelBelow?: boolean       // place label below island (small islands)
  poly: [number, number][]
}

const ISLANDS: Island[] = [
  {
    id: 'tenerife', name: 'Tenerife', center: [28.28, -16.55], gradR: 70,
    poly: [
      [28.34, -16.92], [28.47, -16.84], [28.57, -16.70], [28.58, -16.53],
      [28.57, -16.37], [28.50, -16.14], [28.38, -16.14], [28.24, -16.20],
      [28.11, -16.41], [27.99, -16.64], [28.07, -16.84], [28.22, -16.92],
    ],
  },
  {
    id: 'gran-canaria', name: 'Gran Canaria', center: [27.93, -15.60], gradR: 52,
    poly: [
      [28.16, -15.65], [28.10, -15.43], [28.00, -15.36], [27.86, -15.36],
      [27.74, -15.48], [27.73, -15.68], [27.80, -15.84], [27.99, -15.84],
      [28.13, -15.77],
    ],
  },
  {
    id: 'fuerteventura', name: 'Fuerteventura', center: [28.22, -14.18], gradR: 90,
    poly: [
      [28.73, -13.97], [28.65, -13.82], [28.46, -13.83], [28.29, -13.92],
      [28.12, -14.04], [27.97, -14.17], [27.82, -14.29], [27.65, -14.53],
      [27.73, -14.56], [27.90, -14.46], [28.10, -14.31], [28.30, -14.15],
      [28.52, -14.00], [28.67, -13.97],
    ],
  },
  {
    id: 'lanzarote', name: 'Lanzarote', center: [29.04, -13.67], gradR: 55,
    poly: [
      [29.26, -13.50], [29.21, -13.42], [29.10, -13.45], [28.97, -13.54],
      [28.85, -13.73], [28.84, -13.92], [28.92, -13.98], [29.05, -13.91],
      [29.16, -13.76], [29.23, -13.60],
    ],
  },
  {
    id: 'la-palma', name: 'La Palma', center: [28.65, -17.88], gradR: 38,
    poly: [
      [28.85, -17.83], [28.76, -17.75], [28.63, -17.74], [28.51, -17.80],
      [28.45, -17.89], [28.47, -17.98], [28.60, -18.01], [28.74, -17.94],
    ],
  },
  {
    id: 'la-gomera', name: 'La Gomera', center: [28.08, -17.22], gradR: 18,
    labelBelow: true,
    poly: [
      [28.21, -17.12], [28.14, -17.07], [28.04, -17.09], [27.97, -17.19],
      [27.97, -17.30], [28.05, -17.37], [28.16, -17.34], [28.22, -17.23],
    ],
  },
  {
    id: 'el-hierro', name: 'El Hierro', center: [27.74, -18.04], gradR: 14,
    labelBelow: true,
    poly: [
      [27.84, -17.92], [27.78, -17.88], [27.71, -17.92], [27.63, -18.03],
      [27.63, -18.13], [27.69, -18.18], [27.79, -18.15], [27.84, -18.05],
    ],
  },
]

// ── Component ──────────────────────────────────────────────────────────────

interface IslandMapProps {
  layer: Layer
  onHover: (lat: number, lng: number) => void
}

export default function IslandMap({ layer, onHover }: IslandMapProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const abortRef     = useRef<AbortController | null>(null)

  const drawTiles = useCallback(async () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const W = container.clientWidth
    const H = container.clientHeight
    canvas.width  = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, W, H)

    abortRef.current?.abort()
    const abort = new AbortController()
    abortRef.current = abort

    const key  = import.meta.env.VITE_OWM_API_KEY as string
    const name = OWM_LAYER[layer]
    const tx1 = lng2t(B.lngMin), tx2 = lng2t(B.lngMax)
    const ty1 = lat2t(B.latMax), ty2 = lat2t(B.latMin)

    const jobs = []
    for (let tx = tx1; tx <= tx2; tx++) {
      for (let ty = ty1; ty <= ty2; ty++) {
        const src = `https://tile.openweathermap.org/map/${name}/${Z}/${tx}/${ty}.png?appid=${key}`
        jobs.push(
          new Promise<{ img: HTMLImageElement; tx: number; ty: number } | null>((resolve) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload  = () => resolve({ img, tx, ty })
            img.onerror = () => resolve(null)
            img.src = src
          })
        )
      }
    }

    const tiles = await Promise.all(jobs)
    if (abort.signal.aborted) return

    ctx.save()
    ctx.globalAlpha = 0.72
    ctx.globalCompositeOperation = 'screen'
    for (const tile of tiles) {
      if (!tile) continue
      const svgX  = gx(t2lng(tile.tx))
      const svgY  = gy(t2lat(tile.ty))
      const svgX2 = gx(t2lng(tile.tx + 1))
      const svgY2 = gy(t2lat(tile.ty + 1))
      const cx = svgX / VW * W, cy = svgY / VH * H
      const cw = (svgX2 - svgX) / VW * W
      const ch = (svgY2 - svgY) / VH * H
      ctx.drawImage(tile.img, cx, cy, cw, ch)
    }
    ctx.restore()
  }, [layer])

  useEffect(() => {
    drawTiles()
    return () => { abortRef.current?.abort() }
  }, [drawTiles])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX = (e.clientX - rect.left) / rect.width  * VW
    const svgY = (e.clientY - rect.top)  / rect.height * VH
    onHover(B.latMax - svgY / S, B.lngMin + svgX / S)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-crosshair select-none overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* ── Layer 1: SVG islands (crisp, scalable) ── */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ocean-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#010b18" />
            <stop offset="100%" stopColor="#061220" />
          </linearGradient>

          {/* Per-island radial gradient (center = peaks, edge = coast) */}
          {ISLANDS.map(isl => (
            <radialGradient
              key={isl.id}
              id={`g-${isl.id}`}
              cx={gx(isl.center[1])} cy={gy(isl.center[0])} r={isl.gradR}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%"   stopColor="#596e52" />
              <stop offset="55%"  stopColor="#3d5038" />
              <stop offset="100%" stopColor="#27362a" />
            </radialGradient>
          ))}

          {/* Coastline glow */}
          <filter id="coast-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ocean */}
        <rect x={0} y={0} width={VW} height={VH} fill="url(#ocean-bg)" />

        {/* Subtle lat/lng grid */}
        {[-18, -17, -16, -15, -14, -13].map(lng => (
          <line key={`v${lng}`}
            x1={gx(lng)} y1={0} x2={gx(lng)} y2={VH}
            stroke="rgba(139,209,232,0.05)" strokeWidth={0.4} />
        ))}
        {[28, 29].map(lat => (
          <line key={`h${lat}`}
            x1={0} y1={gy(lat)} x2={VW} y2={gy(lat)}
            stroke="rgba(139,209,232,0.05)" strokeWidth={0.4} />
        ))}
        {/* Grid labels */}
        {[-18, -16, -14].map(lng => (
          <text key={`vl${lng}`}
            x={gx(lng) + 1.5} y={VH - 2}
            fontSize={4} fill="rgba(139,209,232,0.25)"
            fontFamily="'JetBrains Mono', monospace"
          >
            {lng}°
          </text>
        ))}
        {[28, 29].map(lat => (
          <text key={`hl${lat}`}
            x={2} y={gy(lat) - 2}
            fontSize={4} fill="rgba(139,209,232,0.25)"
            fontFamily="'JetBrains Mono', monospace"
          >
            {lat}°N
          </text>
        ))}

        {/* Island fills */}
        {ISLANDS.map(isl => (
          <path key={`f-${isl.id}`}
            d={polyPath(isl.poly)}
            fill={`url(#g-${isl.id})`}
          />
        ))}

        {/* Coastlines with glow */}
        {ISLANDS.map(isl => (
          <path key={`c-${isl.id}`}
            d={polyPath(isl.poly)}
            fill="none"
            stroke="rgba(139,209,232,0.50)"
            strokeWidth={0.9}
            strokeLinejoin="round"
            filter="url(#coast-glow)"
          />
        ))}

        {/* Island name labels */}
        {ISLANDS.map(isl => {
          const cx = gx(isl.center[1])
          const cy = gy(isl.center[0])
          // Small islands: put label below with a dot
          const lx = cx
          const ly = isl.labelBelow ? cy + 14 : cy
          const fs = isl.labelBelow ? 5 : (isl.gradR > 60 ? 7.5 : isl.gradR > 40 ? 6.5 : 5.5)

          return (
            <g key={`l-${isl.id}`} style={{ pointerEvents: 'none' }}>
              {isl.labelBelow && (
                <>
                  <circle cx={cx} cy={cy} r={1.8} fill="rgba(139,209,232,0.55)" />
                  <line x1={cx} y1={cy + 2} x2={lx} y2={ly - 6}
                    stroke="rgba(139,209,232,0.25)" strokeWidth={0.5} />
                </>
              )}
              {/* Background pill */}
              <rect
                x={lx - (isl.name.length * fs * 0.32)}
                y={ly - fs * 0.75}
                width={isl.name.length * fs * 0.64}
                height={fs * 1.5}
                rx={2}
                fill="rgba(4,14,31,0.70)"
              />
              <text
                x={lx} y={ly}
                textAnchor="middle" dominantBaseline="central"
                fill="rgba(216,227,251,0.92)"
                fontSize={fs}
                fontFamily="'Space Grotesk', sans-serif"
                fontWeight="600"
              >
                {isl.name}
              </text>
            </g>
          )
        })}
      </svg>

      {/* ── Layer 2: Canvas weather tiles ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  )
}
