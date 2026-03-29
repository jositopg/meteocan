import { useState } from 'react'

interface LearnPageProps { onBack: () => void }

// ── Data ───────────────────────────────────────────────────────────────────

const GLOSSARY = [
  {
    term: 'mm de lluvia',
    plain: '¿Cuánta agua ha caído? 1 mm = 1 litro por metro cuadrado de suelo.',
    detail: '**Ejemplos reales:**\n- 0.5 mm → llovizna ligera, el suelo queda mojado pero no hay charcos\n- 5 mm → lluvia normal, necesitas paraguas, los barrancos empiezan a llevar agua\n- 20 mm → lluvia fuerte, visibilidad reducida al volante, riesgo de inundaciones en zonas bajas\n- 50 mm en 1 hora → torrencial; en Canarias esto puede provocar riadas en los barrancos\n\nEn Santa Cruz de Tenerife llueve una media de **4–7 días al año** con más de 10 mm.',
  },
  {
    term: 'Probabilidad de lluvia (%)',
    plain: 'Las posibilidades de que caiga algo de lluvia en esa zona ese día.',
    detail: '**Lo que significa en la práctica:**\n- 10–20% → déjate el paraguas en casa, muy improbable\n- 40% → nublado y posible chubasco, vale la pena llevarlo por si acaso\n- 60–70% → planifica como si fuera a llover; si tienes una boda al aire libre, busca plan B\n- 90%+ → llueve seguro\n\n**Truco:** Un 40% no significa que vaya a llover el 40% del tiempo. Significa que en condiciones similares, ha llovido el 40% de las veces. Puede llover toda la tarde o no caer ni una gota.',
  },
  {
    term: 'hPa (hectopascal)',
    plain: 'El "peso" del aire sobre ti. Cuanto más bajo, peor suele ser el tiempo.',
    detail: '**Valores de referencia:**\n- 1025+ hPa → anticiclón fuerte, tiempo muy estable y soleado, probablemente alisio\n- 1013 hPa → presión media normal al nivel del mar\n- 995–1005 hPa → borrasca acercándose, nubes y lluvia\n- <990 hPa → borrasca intensa, posibles vientos fuertes y lluvias generalizadas\n\n**Señal de alarma:** Si ves que la presión baja 10 hPa en pocas horas, prepárate para un cambio brusco de tiempo.',
  },
  {
    term: 'Viento alisio',
    plain: 'El viento constante del noreste que define el clima canario casi todo el año.',
    detail: '**Por qué es tan importante para Canarias:**\nEl alisio llega del Atlántico norte, fresco y cargado de humedad. Al chocar con las montañas, crea dos mundos distintos en la misma isla:\n\n**Norte:** Fresco, algo nublado por el "mar de nubes", vegetación exuberante\n**Sur:** Soleado, seco, varios grados más cálido, desierto natural\n\nEn Tenerife puede haber 24°C en el sur y 19°C con nubes en el norte en el mismo momento. Si el alisio desaparece (julio-agosto especialmente), el calor puede volverse sofocante y llega la calima.',
  },
  {
    term: 'Borrasca',
    plain: 'Zona de baja presión que trae lluvia, viento y nubes al archipiélago.',
    detail: '**Cómo funciona:**\nEl aire gira en espiral hacia el centro (como el agua de un desagüe, pero al revés). Las borrascas en Canarias casi siempre vienen del Atlántico norte y llegan entre octubre y marzo.\n\n**Señales de que se acerca una borrasca:**\n- El viento rola (cambia de dirección): deja de venir del noreste y empieza a soplar del oeste o suroeste\n- Las nubes suben (de cirros altos a estratos bajos)\n- La presión baja rápido\n- El cielo se pone blancuzco antes de nublarse del todo\n\n**¿Cuánto dura?** La mayoría pasan en 1–2 días. Las más intensas pueden dejar lluvias durante 3-4 días.',
  },
  {
    term: 'Frente atlántico',
    plain: 'La "frontera" entre aire frío y cálido que trae lluvia generalizada a todo el archipiélago.',
    detail: '**Diferencia frente a una borrasca local:**\nCuando un frente cruza Canarias, llueve en **todas las islas** al mismo tiempo. No es como la lluvia habitual que afecta más al norte y a las medianías.\n\n**Cómo reconocerlo en el pronóstico:**\n- Probabilidad de lluvia >60% en todos los días y en todas las zonas\n- Viento cambiando a suroeste u oeste\n- Temperatura bajando 3–5°C de golpe\n\n**¿Cuándo son más frecuentes?** Noviembre-marzo. En verano, los frentes se debilitan al norte de Canarias y raramente afectan a las islas.',
  },
  {
    term: 'Calima',
    plain: 'Polvo del desierto del Sahara que llega a Canarias con el viento del sur.',
    detail: '**Cómo saber si hay calima sin mirar el móvil:**\n- El cielo tiene un tono naranja-amarillo, no es el azul habitual\n- El sol se puede mirar directamente (está velado por el polvo)\n- Los coches amanecen cubiertos de un polvo rojizo fino\n- La temperatura es anormalmente alta para la época del año\n- El horizonte tiene una bruma marrón\n\n**Efectos prácticos:**\n- Visibilidad reducida en carretera y aeropuertos (puede haber cancelaciones)\n- Irritación ocular y respiratoria; úsala de excusa para quedarte dentro\n- Temperatura 5–10°C por encima de lo normal\n- Las plantas se quedan con una capa de polvo ocre\n\n**¿Cuánto dura?** De pocas horas a 4–5 días. Cuando llega el alisio del noreste, limpia el aire en 24 horas.',
  },
  {
    term: 'Mar de nubes',
    plain: 'La capa de nubes bajas "atrapada" a media montaña en las islas con mayor altitud.',
    detail: '**Por qué existe:**\nEl alisio lleva humedad oceánica. Al subir por las laderas norte de Tenerife, La Palma, La Gomera o Gran Canaria, el aire se enfría y la humedad se condensa formando nubes. Estas nubes no pueden superar las cumbres (que hacen de muro) y se quedan "encajadas" entre 700 y 1.500 m.\n\n**Lo que significa en el día a día:**\n- Puerto de la Cruz (noreste de Tenerife): nublado y fresco\n- Playa de las Américas (sur): soleado y 5°C más\n- Si subes al Teide: estás por encima de las nubes, como en un avión\n\n**Truco de local:** Si en el norte hay mar de nubes, en el sur hace sol seguro. Basta con cruzar el macizo central.',
  },
  {
    term: 'Efecto Föhn',
    plain: 'Por qué puede llover en el norte de la isla y haber sol y calor en el sur al mismo tiempo.',
    detail: '**El proceso paso a paso:**\n1. El alisio húmedo llega por el norte y sube por la ladera\n2. Al subir, el aire se enfría y pierde agua (lluvia o neblina en el norte)\n3. El aire seco pasa las cumbres y baja por el sur\n4. Al bajar, se comprime y se calienta\n5. Resultado: el sur recibe aire caliente y seco mientras en el norte llueve\n\n**El dato que sorprende:**\nEn un día normal de alisio moderado, pueden existir **8°C de diferencia** entre Orotava (norte) y Playa de las Américas (sur), separados solo 40 km.\n\nEste efecto se da en casi todas las islas con montañas: Tenerife, La Palma, Gran Canaria y La Gomera.',
  },
  {
    term: 'Resolución del modelo',
    plain: 'Qué tan detallado es el ordenador que calcula el tiempo para tu zona.',
    detail: '**¿Qué significa en la práctica?**\nImagina que divides Canarias en cuadrículas:\n- **2.5 km (HARMONIE-AROME):** Cada cuadradito es como un barrio. Puede ver la diferencia entre el norte y el sur de Tenerife, detectar el "mar de nubes" y predecir microclimas. Solo es fiable para los **primeros 2 días**.\n- **25 km (modelo global):** Cada cuadradito es como una isla entera. No distingue si llueve en el norte o en el sur. Sirve para tendencias de los días 3–7, no para planificar actividades concretas.\n\n**Regla práctica:** Para decidir si salir de excursión mañana → úsa el pronóstico D1–D2. Para saber si merece la pena reservar el fin de semana que viene → el modelo global solo da una orientación, no una certeza.',
  },
]

const DECISIONS = [
  {
    question: '¿Voy a la playa?',
    icon: '🏖',
    rules: [
      { condition: 'Lluvia activa o probabilidad >60%', answer: 'No', color: '#991b1b', bg: '#fee2e2' },
      { condition: 'Viento >30 km/h (alisio fuerte)', answer: 'Playas del sur protegidas', color: '#92400e', bg: '#fef3c7' },
      { condition: 'Temperatura >22°C y viento suave', answer: 'Sí, perfecto', color: '#065f46', bg: '#d1fae5' },
      { condition: 'Temperatura 17–22°C', answer: 'Sí, pero fresquito', color: '#1d4ed8', bg: '#dbeafe' },
    ],
  },
  {
    question: '¿Subo al Teide?',
    icon: '🌋',
    rules: [
      { condition: 'Viento en cumbres >60 km/h', answer: 'No, peligroso en cretas', color: '#991b1b', bg: '#fee2e2' },
      { condition: 'Lluvia o nieve prevista en cumbres', answer: 'Solo con equipo adecuado', color: '#92400e', bg: '#fef3c7' },
      { condition: 'Mar de nubes presente (noreste)', answer: 'Perfecto — estarás sobre las nubes', color: '#065f46', bg: '#d1fae5' },
      { condition: 'Calima activa', answer: 'Visibilidad reducida pero posible', color: '#1d4ed8', bg: '#dbeafe' },
    ],
  },
  {
    question: '¿Salgo a correr?',
    icon: '🏃',
    rules: [
      { condition: 'Temperatura >33°C', answer: 'Antes de las 9h o después de las 19h', color: '#92400e', bg: '#fef3c7' },
      { condition: 'Calima (humedad <35%)', answer: 'Hidrátate el doble', color: '#92400e', bg: '#fef3c7' },
      { condition: 'Lluvia ligera', answer: 'Por qué no — refresca', color: '#065f46', bg: '#d1fae5' },
      { condition: 'Temperatura 15–25°C y viento suave', answer: 'Condiciones perfectas', color: '#065f46', bg: '#d1fae5' },
    ],
  },
]

const MYTHS = [
  {
    myth: '"Si llueve en Maspalomas, llueve en toda Gran Canaria"',
    truth: 'Falso. Las islas tienen microclimas tan distintos que puede estar lloviendo en Las Palmas y haber sol con 28°C en Maspalomas. El Roque Nublo (1.813 m) separa dos mundos meteorológicos.',
  },
  {
    myth: '"En verano en Canarias nunca llueve"',
    truth: 'Casi nunca, pero no nunca. Las tormentas de verano son raras pero intensas. El interior de Gran Canaria y Tenerife puede tener tormentas convectivas locales en los meses más cálidos.',
  },
  {
    myth: '"La temperatura de 22°C durante todo el año es un mito turístico"',
    truth: 'Parcialmente cierto. En el sur de las islas principales, la temperatura media anual ronda los 22–24°C. Pero en el norte y las medianías puede bajar a 10–12°C en invierno y en cumbres nieva cada año.',
  },
  {
    myth: '"Si hay calima, se va en unas horas"',
    truth: 'No siempre. Los episodios cortos duran 12–24 horas, pero los intensos pueden durar 4–5 días. El récord histórico fue una calima que afectó a Canarias durante más de una semana en verano de 2020.',
  },
]

const WHY_FAIL = [
  {
    q: '¿Por qué el pronóstico a 5 días a veces falla?',
    a: 'El tiempo es un sistema caótico: pequeños errores en los datos iniciales se amplifican con cada día. Un modelo que calcula mal la temperatura del océano a día 1 puede predecir lluvia donde habrá sol a día 5. Por eso los meteorólogos hablan de "tendencias" para los días 5–7, no de previsiones exactas.',
    example: 'Ejemplo: si el modelo predice lluvia el sábado con 40% de probabilidad, eso es una señal de incertidumbre, no una promesa. El martes ya habrá más precisión.',
  },
  {
    q: '¿Por qué Canarias es especialmente difícil de predecir?',
    a: 'Las islas tienen el Teide (3.718 m) y otras montañas de 1.500–1.800 m en un espacio de apenas 80 km. Los modelos meteorológicos globales no pueden representar estas montañas con suficiente detalle. Solo el modelo de alta resolución (2.5 km) puede ver el efecto Föhn, el mar de nubes y los microclimas costeros. Y ese modelo solo es fiable hasta 48 horas.',
    example: 'Ejemplo: el modelo global puede decir "nublado en Tenerife" cuando en realidad el norte tiene nubes y el sur tiene sol — son dos cosas completamente distintas.',
  },
  {
    q: '¿El % de lluvia es la probabilidad de que llueva a mi hora?',
    a: 'No exactamente. El porcentaje se calcula para un área y un período (generalmente el día completo o 12 horas). Un 70% de probabilidad de lluvia no dice si llueve a las 10h o a las 20h. Para saber cuándo, hay que mirar los modelos horarios, que son más imprecisos.',
    example: 'Ejemplo: "60% de probabilidad de lluvia mañana" puede ser lluvia constante todo el día, o un chaparrón de 20 minutos a las 15h y luego sol.',
  },
]

// ── Styles ────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  borderRadius: 14,
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-sm)',
  overflow: 'hidden',
}

const tagStyle: React.CSSProperties = {
  display: 'inline-block',
  fontFamily: 'var(--font-body)',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'var(--primary)',
  background: 'var(--primary-light)',
  padding: '2px 10px',
  borderRadius: 20,
  marginBottom: 8,
}

// Renders **bold** markdown in plain strings
function RichText({ text, style }: { text: string; style?: React.CSSProperties }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <span style={style}>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : p
      )}
    </span>
  )
}

function DetailBlock({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {text.split('\n').filter(Boolean).map((line, i) => (
        <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
          <RichText text={line} />
        </p>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function LearnPage({ onBack }: LearnPageProps) {
  const [openTerm, setOpenTerm] = useState<number | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={onBack}
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            ← Volver al mapa
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
            Aprende Meteorología
          </h1>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
            Con ejemplos reales de Canarias
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 64px', display: 'flex', flexDirection: 'column', gap: 48 }}>

        {/* Glosario */}
        <section>
          <span style={tagStyle}>Glosario</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            ¿Qué significa cada término?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Con ejemplos concretos para que tengan sentido en tu día a día.
          </p>
          <div style={cardStyle}>
            {GLOSSARY.map((t, i) => (
              <div key={t.term} style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}>
                <button
                  onClick={() => setOpenTerm(openTerm === i ? null : i)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '16px 20px',
                    background: openTerm === i ? 'var(--bg)' : 'none',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
                  }}
                >
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.term}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.plain}</p>
                  </div>
                  <span style={{
                    color: 'var(--primary)', fontSize: '0.6rem', marginTop: 4, flexShrink: 0,
                    transition: 'transform 0.2s', transform: openTerm === i ? 'rotate(180deg)' : 'none', display: 'inline-block',
                  }}>▼</span>
                </button>
                {openTerm === i && (
                  <div style={{ padding: '0 20px 18px', background: 'var(--bg)' }}>
                    <DetailBlock text={t.detail} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Decisiones prácticas */}
        <section>
          <span style={tagStyle}>Decisiones prácticas</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            ¿Qué hago con este tiempo?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Guías rápidas de decisión para las actividades más habituales.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {DECISIONS.map(d => (
              <div key={d.question} style={cardStyle}>
                <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '1.3rem' }}>{d.icon}</span>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{d.question}</p>
                </div>
                <div style={{ padding: '12px 20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {d.rules.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
                        color: r.color, background: r.bg, border: `1px solid ${r.color}30`,
                        padding: '2px 8px', borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1,
                      }}>
                        {r.answer}
                      </span>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                        {r.condition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mitos */}
        <section>
          <span style={tagStyle}>Mitos y realidad</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Lo que se dice y lo que es verdad
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Creencias comunes sobre el tiempo en Canarias desmentidas (o matizadas).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MYTHS.map(m => (
              <div key={m.myth} style={{ ...cardStyle, padding: '18px 20px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, fontStyle: 'italic' }}>
                  {m.myth}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.65 }}>
                  {m.truth}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Por qué fallan */}
        <section>
          <span style={tagStyle}>La incertidumbre</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            ¿Por qué el tiempo a veces falla?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Las previsiones meteorológicas son probabilidades, no certezas. Te explicamos por qué.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {WHY_FAIL.map(item => (
              <div key={item.q} style={{ ...cardStyle, padding: '20px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>{item.q}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 10 }}>{item.a}</p>
                <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--border)' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.55, fontStyle: 'italic' }}>
                    {item.example}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Back */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onBack}
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--primary)', background: 'var(--primary-light)', border: 'none', borderRadius: 10, padding: '12px 28px', cursor: 'pointer' }}
          >
            ← Volver al mapa
          </button>
        </div>
      </main>
    </div>
  )
}
