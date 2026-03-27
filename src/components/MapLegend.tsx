type Layer = 'clouds' | 'rain' | 'storms'

interface LayerMeta {
  title: string
  unit: string
  what: string       // one-liner: what the pixel color means
  scaleColors: string[]
  scaleLabels: [string, string]  // [min label, max label]
  source: string
}

const META: Record<Layer, LayerMeta> = {
  clouds: {
    title:       'Cobertura de nubes',
    unit:        '% cielo cubierto',
    what:        'Blanco/gris intenso = cielo totalmente cubierto · Transparente = despejado',
    scaleColors: ['rgba(8,20,37,1)', 'rgba(100,120,140,0.6)', 'rgba(200,210,220,0.9)'],
    scaleLabels: ['0% (despejado)', '100% (cubierto)'],
    source:      'OpenWeatherMap · Modelo global',
  },
  rain: {
    title:       'Precipitación activa',
    unit:        'mm / hora',
    what:        'Azul claro = llovizna ligera · Azul oscuro = lluvia intensa',
    scaleColors: ['rgba(8,20,37,1)', 'rgba(74,140,200,0.7)', 'rgba(20,60,180,0.95)'],
    scaleLabels: ['0 mm/h (seco)', '> 10 mm/h (intenso)'],
    source:      'OpenWeatherMap · Modelo global',
  },
  storms: {
    title:       'Velocidad del viento',
    unit:        'km / hora',
    what:        'Verde = calma · Amarillo = viento moderado · Rojo = viento fuerte / frente',
    scaleColors: ['rgba(40,160,80,0.8)', 'rgba(255,185,90,0.9)', 'rgba(220,50,50,0.95)'],
    scaleLabels: ['0 km/h (calma)', '> 60 km/h (fuerte)'],
    source:      'OpenWeatherMap · Modelo global',
  },
}

interface MapLegendProps {
  layer: Layer
}

export default function MapLegend({ layer }: MapLegendProps) {
  const m = META[layer]

  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-2"
      style={{
        background: 'rgba(8,20,37,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        minWidth: '220px',
        border: '1px solid rgba(139,209,232,0.08)',
      }}
    >
      {/* Title + unit */}
      <div>
        <p
          className="text-primary font-semibold text-xs leading-none mb-0.5"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {m.title}
        </p>
        <p
          className="text-on-surface-variant"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}
        >
          {m.unit}
        </p>
      </div>

      {/* Color scale bar */}
      <div>
        <div
          className="h-2 rounded-sm w-full mb-1"
          style={{
            background: `linear-gradient(to right, ${m.scaleColors.join(', ')})`,
          }}
        />
        <div className="flex justify-between">
          <span
            className="text-on-surface-variant"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem' }}
          >
            {m.scaleLabels[0]}
          </span>
          <span
            className="text-on-surface-variant"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem' }}
          >
            {m.scaleLabels[1]}
          </span>
        </div>
      </div>

      {/* What you're seeing */}
      <p
        className="text-on-surface-variant leading-snug"
        style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem' }}
      >
        {m.what}
      </p>

      {/* Source */}
      <p
        className="text-outline-variant/60"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem' }}
      >
        {m.source}
      </p>
    </div>
  )
}
