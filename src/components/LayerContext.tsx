type Layer = 'clouds' | 'rain' | 'storms'

interface LayerInfo {
  icon: string
  title: string
  subtitle: string
  explanation: string
  tip: string
  resolution: { days12: string; days37: string }
}

const INFO: Record<Layer, LayerInfo> = {
  clouds: {
    icon: '◑',
    title: 'Capa de Nubes',
    subtitle: 'Lo que ves en el mapa ahora mismo',
    explanation:
      'Cuanto más blanco o gris esté un píxel, más nublado está ese lugar en este momento. Si el píxel es oscuro o casi invisible, significa que el cielo está despejado.',
    tip: 'En Canarias hay dos tipos de nubosidad muy distintos: las nubes bajas que trae el viento del norte (que se quedan pegadas a las montañas y son el "mar de nubes" típico de las islas) y las nubes de tormenta o frente atlántico, que cubren todo el archipiélago y suelen traer lluvia.',
    resolution: {
      days12: 'Días 1 y 2 — imagen muy detallada, cada cuadradito es 2.5 km de terreno real.',
      days37: 'Días 3 al 7 — imagen menos detallada (25 km por cuadradito). Los matices locales de cada isla desaparecen.',
    },
  },
  rain: {
    icon: '●',
    title: 'Capa de Lluvia',
    subtitle: 'Lo que ves en el mapa ahora mismo',
    explanation:
      'El azul claro indica que está lloviendo un poco. El azul muy intenso u oscuro indica lluvia fuerte. Si una zona no tiene color, está seca en este momento.',
    tip: 'En Canarias puede llover a cántaros en el norte de una isla y hacer sol en el sur al mismo tiempo, porque las montañas bloquean las nubes. Esto se llama "efecto de la montaña": el viento sube, se enfría, llueve, y cuando baja al otro lado ya no queda agua.',
    resolution: {
      days12: 'Días 1 y 2 — imagen detallada. Puedes ver diferencias entre barrios de una misma ciudad.',
      days37: 'Días 3 al 7 — imagen difuminada. Solo se ve si lloverá en la isla en general, no en qué zona.',
    },
  },
  storms: {
    icon: '⚡',
    title: 'Capa de Viento',
    subtitle: 'Lo que ves en el mapa ahora mismo',
    explanation:
      'Verde significa viento suave o calma. Amarillo es viento moderado, como el viento alisio normal. Naranja y rojo indican viento fuerte: puede ser que haya una borrasca cerca o un frente de tormenta cruzando las islas.',
    tip: 'Las Canarias tienen un viento casi constante que viene del noreste llamado "alisio". Es el viento que hace agradable el verano. Cuando este viento se rompe o llega una borrasca desde el Atlántico, el tiempo cambia radicalmente y se pueden producir lluvias intensas.',
    resolution: {
      days12: 'Días 1 y 2 — detalle suficiente para ver diferencias entre el norte y el sur de cada isla.',
      days37: 'Días 3 al 7 — solo tendencia general. No sirve para planificar actividades al detalle.',
    },
  },
}

interface LayerContextProps {
  layer: Layer
}

export default function LayerContext({ layer }: LayerContextProps) {
  const info = INFO[layer]

  return (
    <div className="rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ background: 'var(--surface-container-high)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-primary text-sm">{info.icon}</span>
          <span
            className="text-on-surface-variant text-xs uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.12em' }}
          >
            {info.subtitle}
          </span>
        </div>
        <h3
          className="text-on-surface font-semibold text-base leading-snug"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {info.title}
        </h3>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex flex-col gap-3" style={{ background: 'var(--surface-container)' }}>
        <p className="text-on-surface text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
          {info.explanation}
        </p>

        {/* Contextual tip */}
        <div
          className="rounded-md px-3 py-2"
          style={{ background: 'rgba(139,209,232,0.07)', borderLeft: '2px solid rgba(139,209,232,0.3)' }}
        >
          <p className="text-on-surface-variant text-xs leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            <span className="text-primary font-medium">¿Sabías que? · </span>
            {info.tip}
          </p>
        </div>

        {/* Resolution note */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <span className="text-primary mt-0.5 shrink-0" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>D1–2</span>
            <p className="text-on-surface-variant" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', lineHeight: 1.4 }}>
              {info.resolution.days12}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-tertiary mt-0.5 shrink-0" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>D3–7</span>
            <p className="text-on-surface-variant" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', lineHeight: 1.4 }}>
              {info.resolution.days37}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
