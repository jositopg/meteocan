import { useRef, useEffect, useCallback } from 'react'

type Layer = 'clouds' | 'rain' | 'storms'

interface PixelMapProps {
  layer: Layer
  onCoordinateChange: (lat: number, lng: number) => void
}

// Canary Islands bounding box
const BOUNDS = {
  lat: { min: 27.6, max: 29.5 },
  lng: { min: -18.2, max: -13.3 },
}

// OWM tile layer names
const OWM_LAYERS: Record<Layer, string> = {
  clouds: 'clouds_new',
  rain:   'precipitation_new',
  storms: 'wind_new',
}

// ── Tile math (Web Mercator / OSM) ────────────────────────────────────────

function lngToTile(lng: number, z: number): number {
  return Math.floor((lng + 180) / 360 * Math.pow(2, z))
}

function latToTile(lat: number, z: number): number {
  const rad = lat * Math.PI / 180
  return Math.floor(
    (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * Math.pow(2, z)
  )
}

function tileToLng(x: number, z: number): number {
  return x / Math.pow(2, z) * 360 - 180
}

function tileToLat(y: number, z: number): number {
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z)
  return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

// ── Image loader ──────────────────────────────────────────────────────────

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

// ── Island silhouettes (base layer) ───────────────────────────────────────

function generateIslandData(cols: number, rows: number): Float32Array {
  const data = new Float32Array(cols * rows)
  const islands = [
    { cx: 0.72, cy: 0.45, rx: 0.08, ry: 0.06, v: 0.9 },
    { cx: 0.82, cy: 0.52, rx: 0.05, ry: 0.04, v: 0.8 },
    { cx: 0.92, cy: 0.48, rx: 0.04, ry: 0.03, v: 0.7 },
    { cx: 0.97, cy: 0.38, rx: 0.03, ry: 0.03, v: 0.65 },
    { cx: 0.60, cy: 0.42, rx: 0.04, ry: 0.03, v: 0.75 },
    { cx: 0.52, cy: 0.50, rx: 0.025, ry: 0.025, v: 0.7 },
    { cx: 0.46, cy: 0.56, rx: 0.02,  ry: 0.02,  v: 0.65 },
  ]
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const nx = c / cols
      const ny = r / rows
      let val = 0
      for (const isl of islands) {
        const dx = (nx - isl.cx) / isl.rx
        const dy = (ny - isl.cy) / isl.ry
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 1) val = Math.max(val, isl.v * (1 - dist * 0.6))
      }
      data[r * cols + c] = val
    }
  }
  return data
}

// ── Canvas helpers ────────────────────────────────────────────────────────

// Map a geographic point to canvas pixel (linear, good enough at this scale)
function geoToCanvas(lat: number, lng: number, W: number, H: number) {
  const cx = (lng - BOUNDS.lng.min) / (BOUNDS.lng.max - BOUNDS.lng.min) * W
  const cy = (BOUNDS.lat.max - lat) / (BOUNDS.lat.max - BOUNDS.lat.min) * H
  return { cx, cy }
}

function drawBase(ctx: CanvasRenderingContext2D, W: number, H: number) {
  // Ocean background
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#040e1f')
  grad.addColorStop(1, '#081425')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  const COLS = Math.floor(W / 8)
  const ROWS = Math.floor(H / 8)
  const PX = Math.floor(W / COLS)
  const PY = Math.floor(H / ROWS)
  const islandData = generateIslandData(COLS, ROWS)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const island = islandData[r * COLS + c]
      if (island > 0.05) {
        ctx.fillStyle = `rgba(${Math.round(30 + island * 60)},${Math.round(45 + island * 50)},${Math.round(40 + island * 30)},1)`
        ctx.fillRect(c * PX, r * PY, PX - 1, PY - 1)
      }
    }
  }

  // Grid lines
  ctx.strokeStyle = 'rgba(139,209,232,0.04)'
  ctx.lineWidth = 0.5
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath(); ctx.moveTo(c * PX, 0); ctx.lineTo(c * PX, H); ctx.stroke()
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * PY); ctx.lineTo(W, r * PY); ctx.stroke()
  }
}

function drawLabels(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.font = '500 10px "JetBrains Mono", monospace'
  ctx.fillStyle = 'rgba(216,227,251,0.7)'
  ctx.textAlign = 'center'
  const labels = [
    { label: 'TF', lat: 28.29, lng: -16.62 },
    { label: 'GC', lat: 28.00, lng: -15.57 },
    { label: 'FV', lat: 28.36, lng: -14.00 },
    { label: 'LZ', lat: 29.04, lng: -13.64 },
    { label: 'LP', lat: 28.68, lng: -17.86 },
    { label: 'GM', lat: 28.10, lng: -17.11 },
    { label: 'EH', lat: 27.74, lng: -18.03 },
  ]
  for (const l of labels) {
    const { cx, cy } = geoToCanvas(l.lat, l.lng, W, H)
    ctx.fillText(l.label, cx, cy)
  }
}

// ── Component ─────────────────────────────────────────────────────────────

export default function PixelMap({ layer, onCoordinateChange }: PixelMapProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // Keep an abort controller so layer switches cancel in-flight tile fetches
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

    // 1. Draw island base synchronously
    drawBase(ctx, W, H)
    drawLabels(ctx, W, H)

    // 2. Cancel any previous tile fetch
    abortRef.current?.abort()
    const abort = new AbortController()
    abortRef.current = abort

    // 3. Fetch OWM tiles at zoom 7
    const ZOOM = 7
    const tx1 = lngToTile(BOUNDS.lng.min, ZOOM)
    const tx2 = lngToTile(BOUNDS.lng.max, ZOOM)
    const ty1 = latToTile(BOUNDS.lat.max, ZOOM)  // min y = northernmost
    const ty2 = latToTile(BOUNDS.lat.min, ZOOM)  // max y = southernmost

    const owmKey   = import.meta.env.VITE_OWM_API_KEY as string
    const layerName = OWM_LAYERS[layer]

    const tileJobs: Promise<{ img: HTMLImageElement; tx: number; ty: number } | null>[] = []
    for (let tx = tx1; tx <= tx2; tx++) {
      for (let ty = ty1; ty <= ty2; ty++) {
        const url = `https://tile.openweathermap.org/map/${layerName}/${ZOOM}/${tx}/${ty}.png?appid=${owmKey}`
        tileJobs.push(
          loadImage(url)
            .then((img) => ({ img, tx, ty }))
            .catch(() => null)
        )
      }
    }

    const tiles = await Promise.all(tileJobs)
    if (abort.signal.aborted) return

    // 4. Draw tiles onto canvas with geographic alignment
    ctx.save()
    ctx.globalAlpha = 0.72
    ctx.globalCompositeOperation = 'screen'

    for (const tile of tiles) {
      if (!tile) continue
      const { img, tx, ty } = tile

      const lngW = tileToLng(tx,     ZOOM)
      const lngE = tileToLng(tx + 1, ZOOM)
      const latN = tileToLat(ty,     ZOOM)
      const latS = tileToLat(ty + 1, ZOOM)

      const { cx: x1, cy: y1 } = geoToCanvas(latN, lngW, W, H)
      const { cx: x2, cy: y2 } = geoToCanvas(latS, lngE, W, H)

      ctx.drawImage(img, x1, y1, x2 - x1, y2 - y1)
    }

    ctx.restore()

    // 5. Re-draw labels on top of tiles
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
