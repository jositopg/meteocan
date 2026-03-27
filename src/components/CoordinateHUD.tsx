interface CoordinateHUDProps {
  lat: number
  lng: number
  island: string
}

export default function CoordinateHUD({ lat, lng, island }: CoordinateHUDProps) {
  return (
    <div
      className="flex items-center gap-4 px-3 py-2 rounded-md"
      style={{
        background: 'rgba(42,53,72,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <span
        className="text-on-surface-variant text-xs"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {lat.toFixed(4)}°N
      </span>
      <span className="text-outline-variant text-xs">/</span>
      <span
        className="text-on-surface-variant text-xs"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {Math.abs(lng).toFixed(4)}°W
      </span>
      <span className="text-surface-bright text-xs">·</span>
      <span
        className="text-on-surface text-xs font-medium"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {island}
      </span>
    </div>
  )
}
