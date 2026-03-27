import { useRef, useEffect, useCallback } from 'react'

type Layer = 'clouds' | 'rain' | 'storms'

interface PixelMapProps {
  layer: Layer
  onCoordinateChange: (lat: number, lng: number) => void
}

const BOUNDS = {
  lat: { min: 27.6, max: 29.5 },
  lng: { min: -18.2, max: -13.3 },
}

const OWM_LAYERS: Record<Layer, string> = {
  clouds: 'clouds_new',
  rain:   'precipitation_new',
  storms: 'wind_new',
}

// ── Island polygon data (lat, lng) ─────────────────────────────────────────
interface Island {
  name: string
  label: [number, number]   // [lat, lng] for name label
  poly: [number, number][]  // clockwise coastline
}

const ISLANDS: Island[] = [
  {
    name: 'Tenerife',
    label: [28.26, -16.57],
    poly: [
      [28.34, -16.92], [28.47, -16.84], [28.57, -16.70], [28.58, -16.53],
      [28.57, -16.37], [28.50, -16.14], [28.38, -16.14], [28.24, -16.20],
      [28.11, -16.41], [27.99, -16.64], [28.07, -16.84], [28.22, -16.92],
    ],
  },
  {
    name: 'Gran Canaria',
    label: [27.94, -15.60],
    poly: [
      [28.16, -15.65], [28.10, -15.43], [28.00, -15.36], [27.86, -15.36],
      [27.74, -15.48], [27.73, -15.68], [27.80, -15.84], [27.99, -15.84],
      [28.13, -15.77],
    ],
  },
  {
    name: 'Fuerteventura',
    label: [28.28, -14.18],
    poly: [
      [28.73, -13.97], [28.65, -13.82], [28.46, -13.83], [28.29, -13.92],
      [28.12, -14.04], [27.97, -14.17], [27.82, -14.29], [27.65, -14.53],
      [27.73, -14.56], [27.90, -14.46], [28.10, -14.31], [28.30, -14.15],
      [28.52, -14.00], [28.67, -13.97],
    ],
  },
  {
    name: 'Lanzarote',
    label: [29.04, -13.66],
    poly: [
      [29.26, -13.50], [29.21, -13.42], [29.10, -13.45], [28.97, -13.54],
      [28.85, -13.73], [28.84, -13.92], [28.92, -13.98], [29.05, -13.91],
      [29.16, -13.76], [29.23, -13.60],
    ],
  },
  {
    name: 'La Palma',
    label: [28.65, -17.88],
    poly: [
      [28.85, -17.83], [28.76, -17.75], [28.63, -17.74], [28.51, -17.80],
      [28.45, -17.89], [28.47, -17.98], [28.60, -18.01], [28.74, -17.94],
    ],
  },
  {
    name: 'La Gomera',
    label: [28.08, -17.22],
    poly: [
      [28.21, -17.12], [28.14, -17.07], [28.04, -17.09], [27.97, -17.19],
      [27.97, -17.30], [28.05, -17.37], [28.16, -17.34], [28.22, -17.23],
    ],
  },
  {
    name: 'El Hierro',
    label: [27.74, -18.04],
    poly: [
      [27.84, -17.92], [27.78, -17.88], [27.71, -17.92], [27.63, -18.03],
      [27.63, -18.13], [27.69, -18.18], [27.79, -18.15], [27.84, -18.05],
    ],
  },
]

// ── Coordinate helpers ─────────────────────────────────────────────────────

function geoToCanvas(lat: number, lng: number, W: number, H: number) {
  return {
    x: (lng - BOUNDS.lng.min) / (BOUNDS.lng.max - BOUNDS.lng.min) * W,
    y: (BOUNDS.lat.max - lat) / (BOUNDS.lat.max - BOUNDS.lat.min) * H,
  }
}

function lngToTile(lng: number, z: number) {
  return Math.floor((lng + 180) / 360 * Math.pow(2, z))
}
function latToTile(lat: number, z: number) {
  const r = lat * Math.PI / 180
  return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z))
}
function tileToLng(x: number, z: number) { return x / Math.pow(2, z) * 360 - 180 }
function tileToLat(y: number, z: number) {
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z)
  return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

// ── Canvas drawing ─────────────────────────────────────────────────────────

function drawOcean(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#030c1a')
  g.addColorStop(1, '#071220')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // Subtle lat/lng grid
  ctx.strokeStyle = 'rgba(139,209,232,0.04)'
  ctx.lineWidth = 0.5
  for (let lng = -18; lng <= -13; lng++) {
    const { x } = geoToCanvas(BOUNDS.lat.min, lng, W, H)
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let lat = 28; lat <= 29; lat++) {
    const { y } = geoToCanvas(lat, BOUNDS.lng.min, W, H)
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }
}

function drawIslands(ctx: CanvasRenderingContext2D, W: number, H: number) {
  for (const island of ISLANDS) {
    if (island.poly.length < 3) continue
    ctx.beginPath()
    const first = geoToCanvas(island.poly[0][0], island.poly[0][1], W, H)
    ctx.moveTo(first.x, first.y)
    for (let i = 1; i < island.poly.length; i++) {
      const p = geoToCanvas(island.poly[i][0], island.poly[i][1], W, H)
      ctx.lineTo(p.x, p.y)
    }
    ctx.closePath()

    // Fill: volcanic dark green-brown gradient
    const { x: cx, y: cy } = geoToCanvas(island.label[0], island.label[1], W, H)
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80)
    grad.addColorStop(0, 'rgba(62, 75, 58, 0.95)')
    grad.addColorStop(1, 'rgba(38, 48, 36, 0.90)')
    ctx.fillStyle = grad
    ctx.fill()

    // Coastline stroke
    ctx.strokeStyle = 'rgba(139,209,232,0.25)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

function drawLabels(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (const island of ISLANDS) {
    const { x, y } = geoToCanvas(island.label[0], island.label[1], W, H)

    // Background pill
    ctx.font = '600 10px "Space Grotesk", sans-serif'
    const tw = ctx.measureText(island.name).width
    ctx.fillStyle = 'rgba(8,20,37,0.75)'
    const pad = 5
    const rh = 14
    ctx.beginPath()
    ctx.roundRect(x - tw / 2 - pad, y - rh / 2, tw + pad * 2, rh, 3)
    ctx.fill()

    // Label text
    ctx.fillStyle = 'rgba(216,227,251,0.90)'
    ctx.fillText(island.name, x, y)
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export default function PixelMap({ layer, onCoordinateChange }: PixelMapProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const abortRef     = useRef<AbortController | null>(null)

  const render = useCallback(async () => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const W = container.clientWidth
    const H = container.clientHeight
    canvas.width  = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    // 1. Base
    drawOcean(ctx, W, H)
    drawIslands(ctx, W, H)
    drawLabels(ctx, W, H)

    // 2. Cancel previous fetches
    abortRef.current?.abort()
    const abort = new AbortController()
    abortRef.current = abort

    // 3. OWM tiles
    const ZOOM = 7
    const tx1 = lngToTile(BOUNDS.lng.min, ZOOM)
    const tx2 = lngToTile(BOUNDS.lng.max, ZOOM)
    const ty1 = latToTile(BOUNDS.lat.max, ZOOM)
    const ty2 = latToTile(BOUNDS.lat.min, ZOOM)

    const owmKey    = import.meta.env.VITE_OWM_API_KEY as string
    const layerName = OWM_LAYERS[layer]

    const jobs = []
    for (let tx = tx1; tx <= tx2; tx++) {
      for (let ty = ty1; ty <= ty2; ty++) {
        const url = `https://tile.openweathermap.org/map/${layerName}/${ZOOM}/${tx}/${ty}.png?appid=${owmKey}`
        jobs.push(loadImage(url).then(img => ({ img, tx, ty })).catch(() => null))
      }
    }

    const tiles = await Promise.all(jobs)
    if (abort.signal.aborted) return

    // 4. Draw tiles
    ctx.save()
    ctx.globalAlpha = 0.68
    ctx.globalCompositeOperation = 'screen'
    for (const tile of tiles) {
      if (!tile) continue
      const { img, tx, ty } = tile
      const { x: x1, y: y1 } = geoToCanvas(tileToLat(ty, ZOOM),     tileToLng(tx,     ZOOM), W, H)
      const { x: x2, y: y2 } = geoToCanvas(tileToLat(ty + 1, ZOOM), tileToLng(tx + 1, ZOOM), W, H)
      ctx.drawImage(img, x1, y1, x2 - x1, y2 - y1)
    }
    ctx.restore()

    // 5. Island outlines + labels on top (after tile overlay)
    ctx.save()
    for (const island of ISLANDS) {
      if (island.poly.length < 3) continue
      ctx.beginPath()
      const first = geoToCanvas(island.poly[0][0], island.poly[0][1], W, H)
      ctx.moveTo(first.x, first.y)
      for (let i = 1; i < island.poly.length; i++) {
        const p = geoToCanvas(island.poly[i][0], island.poly[i][1], W, H)
        ctx.lineTo(p.x, p.y)
      }
      ctx.closePath()
      ctx.strokeStyle = 'rgba(139,209,232,0.35)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
    ctx.restore()
    drawLabels(ctx, W, H)
  }, [layer])

  useEffect(() => {
    render()
    return () => { abortRef.current?.abort() }
  }, [render])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const nx   = (e.clientX - rect.left)  / rect.width
    const ny   = (e.clientY - rect.top)   / rect.height
    const lat  = BOUNDS.lat.max - ny * (BOUNDS.lat.max - BOUNDS.lat.min)
    const lng  = BOUNDS.lng.min + nx * (BOUNDS.lng.max - BOUNDS.lng.min)
    onCoordinateChange(lat, lng)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-crosshair"
      onMouseMove={handleMouseMove}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
