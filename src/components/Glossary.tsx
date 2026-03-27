import { useState } from 'react'

interface Term {
  term: string
  plain: string      // one-line summary in plain language
  detail: string     // deeper explanation, still accessible
}

const TERMS: Term[] = [
  {
    term: 'mm de lluvia',
    plain: '¿Cuánta agua ha caído? 1 mm = 1 litro por cada metro cuadrado de suelo.',
    detail: 'Cuando ves "5 mm de lluvia", significa que si pusieras un cubo de 1 metro de ancho en el suelo, recogería 5 litros de agua. Una llovizna son menos de 1 mm/hora. Una tormenta fuerte puede superar los 20 mm/hora.',
  },
  {
    term: '% de probabilidad de lluvia',
    plain: 'La probabilidad de que llueva algo en algún punto de la zona durante ese día.',
    detail: 'Un 40% NO significa que vaya a llover el 40% del tiempo. Significa que hay un 40% de posibilidades de que en esa zona caiga al menos una gota en algún momento del día. Si ves 80% o más, prepara el paraguas.',
  },
  {
    term: 'hPa (hectopascal)',
    plain: 'Medida de la presión del aire. Cuanto más baja, peor suele ser el tiempo.',
    detail: 'La presión "normal" al nivel del mar es 1013 hPa. Cuando baja de 1000 hPa suelen llegar borrascas y lluvia. Cuando sube de 1020 hPa el tiempo tiende a ser estable y soleado. Las variaciones rápidas (mucho cambio en pocas horas) anuncian cambios bruscos de tiempo.',
  },
  {
    term: 'Viento alisio',
    plain: 'El viento constante del noreste que define el clima canario.',
    detail: 'Es el viento dominante en las Islas Canarias, especialmente en verano. Viene del Atlántico norte y hace que el clima sea agradable: fresco en el norte de las islas, seco y soleado en el sur. Cuando el alisio se debilita, el calor puede volverse sofocante.',
  },
  {
    term: 'Borrasca',
    plain: 'Una zona de aire con muy poca presión que trae mal tiempo: lluvia, viento y nubosidad.',
    detail: 'El aire gira en espiral hacia el centro de la borrasca. Cuando una borrasca pasa sobre Canarias, el tiempo cambia radicalmente: el viento rola, llueve con fuerza y la temperatura baja. En otoño e invierno son más frecuentes.',
  },
  {
    term: 'Frente atlántico',
    plain: 'La "frontera" entre aire frío y aire cálido que viene del océano y trae lluvia.',
    detail: 'Cuando dos masas de aire a distinta temperatura se encuentran, se forma un frente. Al cruzar Canarias, suele traer nubes en toda la altura del cielo, lluvia generalizada y viento fuerte. Son más habituales entre noviembre y marzo.',
  },
  {
    term: 'Resolución del modelo',
    plain: 'Qué tan detallado es el "mapa" del ordenador que calcula el tiempo.',
    detail: 'Un modelo de 2.5 km divide el mundo en cuadrículas de 2.5 km de lado y calcula el tiempo en cada cuadradito. Uno de 25 km usa cuadrículas 10 veces más grandes. Para Canarias, con sus montañas y microclimas en pocos kilómetros, cuanto más detallado mejor. Por eso los primeros 2 días son más fiables.',
  },
  {
    term: 'Nubosidad de barlovento / sotavento',
    plain: 'Por qué hay nubes en un lado de la montaña y sol en el otro.',
    detail: 'Barlovento es el lado de la montaña que "recibe" el viento. Al subir, el aire se enfría y forma nubes o llueve. Sotavento es el lado de "abrigo", donde el aire ya ha soltado su agua y baja caliente y seco. En Tenerife: el norte suele estar nublado (barlovento del alisio) y el sur despejado y seco (sotavento).',
  },
]

export default function Glossary() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ background: 'var(--surface-container-high)' }}>
        <span
          className="inline-block text-xs text-primary mb-2 px-2 py-0.5 rounded-sm"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 500, background: 'var(--primary-container)' }}
        >
          Aprende meteorología
        </span>
        <h3
          className="text-on-surface font-semibold text-base leading-snug"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ¿Qué significa cada cosa?
        </h3>
        <p
          className="text-on-surface-variant text-xs mt-1 leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Los términos que usamos en esta app, explicados sin tecnicismos.
        </p>
      </div>

      {/* Terms list */}
      <div style={{ background: 'var(--surface-container)' }}>
        {TERMS.map((t, i) => (
          <div
            key={t.term}
            style={{ borderTop: i > 0 ? '1px solid rgba(139,209,232,0.06)' : undefined }}
          >
            <button
              className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-surface-container-high/40 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div>
                <p
                  className="text-on-surface text-sm font-medium"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t.term}
                </p>
                <p
                  className="text-on-surface-variant text-xs mt-0.5 leading-snug"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {t.plain}
                </p>
              </div>
              <span
                className="text-primary mt-0.5 shrink-0 transition-transform duration-200"
                style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '0.7rem' }}
              >
                ▼
              </span>
            </button>

            {open === i && (
              <div
                className="px-4 pb-4"
                style={{ background: 'rgba(139,209,232,0.04)' }}
              >
                <p
                  className="text-on-surface-variant text-sm leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {t.detail}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
