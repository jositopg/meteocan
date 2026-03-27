import { useState } from 'react'

interface LearnPageProps {
  onBack: () => void
}

// ── Glossary terms ─────────────────────────────────────────────────────────
const GLOSSARY = [
  {
    term: 'mm de lluvia',
    plain: '¿Cuánta agua ha caído? 1 mm = 1 litro por metro cuadrado de suelo.',
    detail: 'Cuando ves "5 mm de lluvia" significa que si pusieras un cubo de 1 metro de ancho en el suelo, recogería 5 litros. Una llovizna son menos de 1 mm/hora. Una tormenta fuerte puede superar los 20 mm/hora. En algunas tormentas canarias se han registrado más de 100 mm en una sola hora.',
  },
  {
    term: 'Probabilidad de lluvia (%)',
    plain: 'Las posibilidades de que caiga algo de lluvia en esa zona ese día.',
    detail: 'Un 40% NO significa que vaya a llover el 40% del tiempo. Significa que hay un 40% de posibilidades de que caiga aunque sea una gota en algún momento del día. Por debajo del 20% puedes dejar el paraguas en casa. Por encima del 60%, llevatelo seguro.',
  },
  {
    term: 'hPa (hectopascal)',
    plain: 'Cómo de "pesado" está el aire. Cuanto más bajo, peor suele ser el tiempo.',
    detail: 'La presión "normal" al nivel del mar es 1013 hPa. Cuando baja de 1000 hPa suelen llegar borrascas y lluvia. Cuando sube de 1020 hPa el tiempo es estable y soleado. Los cambios rápidos (mucho cambio en pocas horas) anuncian cambios bruscos. Los pilotos y marineros siguen este valor de cerca.',
  },
  {
    term: 'Viento alisio',
    plain: 'El viento constante del noreste que define el clima canario durante casi todo el año.',
    detail: 'Es el viento dominante en Canarias. Viene del Atlántico norte y hace que el verano sea agradable: fresco en el norte de las islas, seco y soleado en el sur. Cuando el alisio se debilita, el calor puede volverse sofocante y la calima (polvo del Sahara) llega fácilmente.',
  },
  {
    term: 'Borrasca',
    plain: 'Zona de baja presión que trae lluvia, viento y nubes. Como un "remolino" de mal tiempo.',
    detail: 'El aire gira en espiral hacia el centro de la borrasca (como el agua en un desagüe, pero en el sentido contrario al reloj en el hemisferio norte). Al cruzar Canarias, cambia todo: el viento rola, llueve con fuerza y baja la temperatura. En otoño e invierno son más frecuentes.',
  },
  {
    term: 'Frente atlántico',
    plain: 'La "frontera" entre aire frío y aire cálido que viene del océano y trae lluvia generalizada.',
    detail: 'Cuando dos masas de aire a distinta temperatura chocan, se forma un frente. Al cruzar Canarias, trae nubes en todo el cielo, lluvia en todas las islas y viento fuerte. Son más habituales entre noviembre y marzo. En el mapa los ves como una banda de lluvia que avanza de oeste a este.',
  },
  {
    term: 'Calima',
    plain: 'Polvo del desierto del Sahara que viaja por el aire y llega a las islas.',
    detail: 'Cuando el viento sopla desde el sureste (desde África), trae polvo en suspensión. El cielo se pone de color naranja-marrón, la visibilidad baja y la temperatura puede subir mucho en pocas horas. La calima puede durar de horas a varios días y puede llegar a cubrir todo el archipiélago.',
  },
  {
    term: 'Mar de nubes',
    plain: 'La capa de nubes bajas que se queda "atrapada" en las montañas del norte de las islas.',
    detail: 'El viento alisio lleva humedad del océano. Al chocar contra las montañas, sube, se enfría y forma nubes. Estas nubes no pueden pasar las cumbres (que están por encima) y se quedan "aparcadas" en las laderas norte a unos 800-1.500 metros de altura. Desde arriba, parece un mar de algodón. Por eso en el sur de Tenerife siempre hace sol aunque en el norte haya nubes.',
  },
  {
    term: 'Efecto Föhn',
    plain: 'Por qué puede llover mucho en un lado de la montaña y estar seco en el otro al mismo tiempo.',
    detail: 'El aire húmedo sube por el lado norte de la montaña, se enfría y llueve. Al bajar por el lado sur, ya ha soltado toda el agua y se calienta. Resultado: en el mismo momento, agua en el norte y sol seco en el sur. En Tenerife esto es especialmente visible: el norte puede tener un día gris y lluvioso mientras en Los Cristianos brilla el sol.',
  },
  {
    term: 'Resolución del modelo',
    plain: 'Qué tan detallado es el "mapa" del ordenador que calcula el tiempo.',
    detail: 'Para calcular el tiempo, los ordenadores dividen el mundo en cuadrículas. Un modelo de 2.5 km usa cuadrículas de 2.5 km × 2.5 km. Un modelo de 25 km usa cuadrículas 10 veces más grandes. Para Canarias, con montañas, valles y microclimas muy distintos en pocos kilómetros, cuanto más pequeña la cuadrícula, más fiable el resultado. Por eso los días 1-2 son mucho más precisos que los días 5-7.',
  },
]

// ── How to read the map ────────────────────────────────────────────────────
const MAP_LAYERS = [
  {
    name: 'Capa de Nubes',
    icon: '◑',
    color: '#8fa0b8',
    how: 'Los píxeles blancos o grises indican nubes sobre esa zona. Cuanto más blanco, más cielo cubierto. Los píxeles oscuros o transparentes son cielo despejado.',
    tip: 'En Canarias pueden convivir zonas nubladas (norte de las islas) con zonas despejadas (sur) al mismo tiempo, por eso el mapa puede verse muy desigual.',
  },
  {
    name: 'Capa de Lluvia',
    icon: '●',
    color: '#4a9ece',
    how: 'El azul claro significa llovizna o lluvia ligera. El azul muy intenso u oscuro significa lluvia fuerte o muy fuerte. Sin color = sin lluvia.',
    tip: 'Fíjate en cómo la lluvia se concentra en las laderas norte de cada isla. El sur queda habitualmente seco incluso durante temporales.',
  },
  {
    name: 'Capa de Viento',
    icon: '⚡',
    color: '#ffb95a',
    how: 'Verde = viento suave o calma. Amarillo = viento moderado (alisio normal). Naranja y rojo = viento fuerte, posiblemente de una borrasca o frente activo.',
    tip: 'Cuando ves una banda roja que avanza de oeste a este, es un frente activo. Prepárate para cambios bruscos en las próximas horas.',
  },
]

// ── Why forecasts fail ─────────────────────────────────────────────────────
const WHY_FAIL = [
  {
    q: '¿Por qué a veces falla la previsión del tiempo?',
    a: 'El tiempo es un sistema caótico: pequeñas diferencias en las condiciones iniciales producen resultados muy distintos. Los ordenadores que calculan el tiempo pueden cometer errores pequeños al principio que se amplifican con los días. Por eso las previsiones a 7 días son orientativas, no exactas.',
  },
  {
    q: '¿Por qué Canarias es especialmente difícil de predecir?',
    a: 'Las islas tienen montañas de hasta 3.718 m (Teide) en un espacio muy reducido. Esto crea microclimas muy distintos en pocos kilómetros. Los modelos de ordenador necesitan cuadrículas muy pequeñas para capturar estos detalles, y eso requiere muchísimo cálculo. Solo en los primeros 2 días usamos un modelo de alta resolución (2.5 km). A partir del día 3, el detalle se pierde.',
  },
  {
    q: '¿Cómo de fiable es el porcentaje de lluvia?',
    a: 'Es una estimación de probabilidad, no una certeza. Un 70% de probabilidad de lluvia significa que en condiciones similares, ha llovido el 70% de las veces. Pero cada día es único. Úsalo como guía, no como certeza. Lo más fiable son las próximas 6-12 horas; lo menos fiable, los días 5-7.',
  },
]

// ── Canary Islands phenomena ───────────────────────────────────────────────
const CANARY_WEATHER = [
  {
    name: 'El mar de nubes',
    emoji: '☁',
    desc: 'Uno de los fenómenos más espectaculares de Canarias. El alisio carga humedad del Atlántico y al chocar con las montañas forma una capa de nubes que se queda "encajada" entre los 700 y los 1.500 metros. Desde las cumbres, parece un océano de algodón. El mejor sitio para verlo es el Teide o Roque Nublo.',
  },
  {
    name: 'La calima africana',
    emoji: '🏜',
    desc: 'Cuando el viento sopla desde el sureste, trae consigo polvo del desierto del Sahara. El cielo se vuelve naranja, la temperatura sube en horas y la humedad baja en picado. Puede durar días y hace que respirar sea incómodo. En verano es más frecuente y puede coincidir con olas de calor extremas.',
  },
  {
    name: 'Lluvias torrenciales de otoño',
    emoji: '⛈',
    desc: 'Septiembre, octubre y noviembre son los meses más lluviosos y peligrosos en Canarias. El mar Atlántico aún está caliente de verano y cuando llega una borrasca del norte, el choque de temperaturas genera tormentas muy intensas en poco tiempo. Es el momento de las "danas" (borrascas frías en altura) que pueden producir inundaciones repentinas.',
  },
  {
    name: 'El viento sur en verano',
    emoji: '🌡',
    desc: 'Cuando el alisio desaparece en verano y el viento sopla del sur (desde el continente africano), las temperaturas pueden dispararse a más de 40°C en zonas que habitualmente tienen 22°C. Esto, combinado con la sequedad ambiental, crea condiciones de riesgo alto de incendios forestales.',
  },
]

// ── Component ──────────────────────────────────────────────────────────────

export default function LearnPage({ onBack }: LearnPageProps) {
  const [openTerm, setOpenTerm] = useState<number | null>(null)

  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4"
        style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid rgba(139,209,232,0.08)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          ← Volver al mapa
        </button>
        <div
          className="h-4 w-px"
          style={{ background: 'rgba(139,209,232,0.15)' }}
        />
        <h1
          className="text-on-surface font-semibold"
          style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}
        >
          Aprende Meteorología
        </h1>
        <span
          className="text-on-surface-variant text-xs ml-auto"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Explicado para todos, sin tecnicismos
        </span>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-16">

        {/* ── Cómo leer el mapa ── */}
        <section>
          <SectionHeader
            tag="El mapa"
            title="¿Cómo leer lo que ves en el mapa?"
            intro="El mapa muestra datos reales del tiempo ahora mismo sobre las Islas Canarias. Aquí te explicamos qué significa cada capa y cómo interpretarla."
          />
          <div className="flex flex-col gap-4 mt-6">
            {MAP_LAYERS.map(l => (
              <div key={l.name} className="rounded-lg overflow-hidden">
                <div
                  className="px-5 py-4 flex items-start gap-4"
                  style={{ background: 'var(--surface-container-high)' }}
                >
                  <span className="text-2xl mt-0.5" style={{ color: l.color }}>{l.icon}</span>
                  <div>
                    <h3
                      className="text-on-surface font-semibold mb-1"
                      style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}
                    >
                      {l.name}
                    </h3>
                    <p
                      className="text-on-surface text-sm leading-relaxed"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {l.how}
                    </p>
                  </div>
                </div>
                <div
                  className="px-5 py-3"
                  style={{ background: 'rgba(139,209,232,0.05)', borderLeft: '2px solid rgba(139,209,232,0.25)' }}
                >
                  <p
                    className="text-on-surface-variant text-sm leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    <span className="text-primary font-medium">En Canarias · </span>
                    {l.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Glosario ── */}
        <section>
          <SectionHeader
            tag="Glosario"
            title="¿Qué significa cada término?"
            intro="Los conceptos meteorológicos que usamos en esta app, explicados en lenguaje cotidiano."
          />
          <div className="mt-6 rounded-lg overflow-hidden" style={{ background: 'var(--surface-container)' }}>
            {GLOSSARY.map((t, i) => (
              <div
                key={t.term}
                style={{ borderTop: i > 0 ? '1px solid rgba(139,209,232,0.06)' : undefined }}
              >
                <button
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-3"
                  style={{ background: openTerm === i ? 'var(--surface-container-high)' : undefined }}
                  onClick={() => setOpenTerm(openTerm === i ? null : i)}
                >
                  <div>
                    <p
                      className="text-on-surface text-sm font-semibold mb-0.5"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {t.term}
                    </p>
                    <p
                      className="text-on-surface-variant text-xs leading-snug"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {t.plain}
                    </p>
                  </div>
                  <span
                    className="text-primary mt-1 shrink-0 transition-transform duration-200"
                    style={{ transform: openTerm === i ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '0.65rem' }}
                  >
                    ▼
                  </span>
                </button>
                {openTerm === i && (
                  <div
                    className="px-5 pb-5 pt-1"
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
        </section>

        {/* ── Fenómenos canarios ── */}
        <section>
          <SectionHeader
            tag="Fenómenos locales"
            title="El tiempo especial de Canarias"
            intro="Las Islas Canarias tienen uno de los climas más singulares del mundo. Aquí los fenómenos que más las diferencian del resto."
          />
          <div className="grid grid-cols-2 gap-4 mt-6">
            {CANARY_WEATHER.map(p => (
              <div
                key={p.name}
                className="rounded-lg p-5 flex flex-col gap-3"
                style={{ background: 'var(--surface-container)' }}
              >
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '1.75rem' }}>{p.emoji}</span>
                  <h3
                    className="text-on-surface font-semibold"
                    style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}
                  >
                    {p.name}
                  </h3>
                </div>
                <p
                  className="text-on-surface-variant text-sm leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Por qué fallan las predicciones ── */}
        <section>
          <SectionHeader
            tag="La incertidumbre"
            title="¿Por qué el tiempo a veces falla?"
            intro="Las previsiones meteorológicas son probabilidades, no certezas. Entender por qué fallan ayuda a usarlas mejor."
          />
          <div className="flex flex-col gap-4 mt-6">
            {WHY_FAIL.map(item => (
              <div
                key={item.q}
                className="rounded-lg px-5 py-4"
                style={{ background: 'var(--surface-container)' }}
              >
                <p
                  className="text-primary font-semibold text-sm mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {item.q}
                </p>
                <p
                  className="text-on-surface-variant text-sm leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pb-4">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{
              fontFamily: 'var(--font-body)',
              background: 'var(--primary-container)',
              color: 'var(--primary)',
            }}
          >
            ← Volver al mapa
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ tag, title, intro }: { tag: string; title: string; intro: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="inline-block text-xs text-primary px-2 py-0.5 rounded-sm w-fit"
        style={{ fontFamily: 'var(--font-body)', fontWeight: 500, background: 'var(--primary-container)' }}
      >
        {tag}
      </span>
      <h2
        className="text-on-surface font-semibold"
        style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', lineHeight: 1.2 }}
      >
        {title}
      </h2>
      <p
        className="text-on-surface-variant text-sm leading-relaxed"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {intro}
      </p>
    </div>
  )
}
