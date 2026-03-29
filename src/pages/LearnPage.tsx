import { useState } from 'react'

interface LearnPageProps { onBack: () => void }

const GLOSSARY = [
  {
    term: 'mm de lluvia',
    plain: '¿Cuánta agua ha caído? 1 mm = 1 litro por metro cuadrado de suelo.',
    detail: 'Cuando ves "5 mm de lluvia" significa que si pusieras un cubo de 1 metro de ancho en el suelo, recogería 5 litros. Una llovizna son menos de 1 mm/hora. Una tormenta fuerte puede superar los 20 mm/hora. En algunas tormentas canarias se han registrado más de 100 mm en una sola hora.',
  },
  {
    term: 'Probabilidad de lluvia (%)',
    plain: 'Las posibilidades de que caiga algo de lluvia en esa zona ese día.',
    detail: 'Un 40% NO significa que vaya a llover el 40% del tiempo. Significa que hay un 40% de posibilidades de que caiga aunque sea una gota en algún momento del día. Por debajo del 20% puedes dejar el paraguas en casa. Por encima del 60%, llévalo seguro.',
  },
  {
    term: 'hPa (hectopascal)',
    plain: 'Cómo de "pesado" está el aire. Cuanto más bajo, peor suele ser el tiempo.',
    detail: 'La presión "normal" al nivel del mar es 1013 hPa. Cuando baja de 1000 hPa suelen llegar borrascas y lluvia. Cuando sube de 1020 hPa el tiempo es estable y soleado. Los cambios rápidos en pocas horas anuncian cambios bruscos de tiempo.',
  },
  {
    term: 'Viento alisio',
    plain: 'El viento constante del noreste que define el clima canario durante casi todo el año.',
    detail: 'Viene del Atlántico norte y hace que el verano sea agradable: fresco en el norte de las islas, seco y soleado en el sur. Cuando el alisio se debilita, el calor puede volverse sofocante y la calima llega fácilmente.',
  },
  {
    term: 'Borrasca',
    plain: 'Zona de baja presión que trae lluvia, viento y nubes.',
    detail: 'El aire gira en espiral hacia el centro (como el agua en un desagüe, pero en sentido contrario al reloj). Al cruzar Canarias, cambia todo: el viento rola, llueve con fuerza y baja la temperatura. En otoño e invierno son más frecuentes.',
  },
  {
    term: 'Frente atlántico',
    plain: 'La "frontera" entre aire frío y aire cálido que viene del océano y trae lluvia generalizada.',
    detail: 'Cuando dos masas de aire a distinta temperatura chocan, se forma un frente. Al cruzar Canarias, trae nubes en todo el cielo, lluvia en todas las islas y viento fuerte. Son más habituales entre noviembre y marzo.',
  },
  {
    term: 'Calima',
    plain: 'Polvo del desierto del Sahara que viaja por el aire y llega a las islas.',
    detail: 'Cuando el viento sopla desde el sureste (África), trae polvo en suspensión. El cielo se pone naranja-marrón, la visibilidad baja y la temperatura puede subir mucho en pocas horas. Puede durar de horas a varios días.',
  },
  {
    term: 'Mar de nubes',
    plain: 'La capa de nubes bajas que se queda "atrapada" en las montañas del norte de las islas.',
    detail: 'El viento alisio lleva humedad del océano. Al chocar con las montañas, sube, se enfría y forma nubes. Estas nubes no pueden pasar las cumbres y se quedan "aparcadas" a unos 800–1.500 metros. Desde arriba parece un mar de algodón.',
  },
  {
    term: 'Efecto Föhn',
    plain: 'Por qué puede llover en un lado de la montaña y estar seco en el otro al mismo tiempo.',
    detail: 'El aire húmedo sube por el lado norte, se enfría y llueve. Al bajar por el sur, ya ha soltado toda el agua y se calienta. Resultado: lluvia en el norte y sol seco en el sur en el mismo momento. En Tenerife se ve casi cada semana.',
  },
  {
    term: 'Resolución del modelo',
    plain: 'Qué tan detallado es el ordenador que calcula el tiempo.',
    detail: 'Los ordenadores dividen el mundo en cuadrículas. Un modelo de 2.5 km usa cuadrículas muy pequeñas (más detalle). Un modelo de 25 km usa cuadrículas 10 veces más grandes. Para Canarias, con sus montañas y microclimas en pocos kilómetros, cuanto más pequeña la cuadrícula, más fiable el resultado.',
  },
]

const CANARY_WEATHER = [
  {
    emoji: '☁',
    name: 'El mar de nubes',
    desc: 'El alisio carga humedad del Atlántico y al chocar con las montañas forma una capa de nubes que se queda "encajada" entre los 700 y los 1.500 metros. Desde las cumbres, parece un océano de algodón. Por eso en el sur de Tenerife siempre hace sol aunque en el norte haya nubes.',
  },
  {
    emoji: '🏜',
    name: 'La calima africana',
    desc: 'Cuando el viento sopla desde el sureste, trae polvo del Sahara. El cielo se vuelve naranja, la temperatura sube en horas y la humedad baja en picado. En verano es más frecuente y puede coincidir con olas de calor extremas.',
  },
  {
    emoji: '⛈',
    name: 'Lluvias torrenciales de otoño',
    desc: 'Septiembre, octubre y noviembre son los meses más peligrosos. El mar Atlántico aún está caliente y cuando llega una borrasca del norte, el choque genera tormentas muy intensas en poco tiempo. Las "danas" pueden producir inundaciones repentinas.',
  },
  {
    emoji: '🌡',
    name: 'El viento sur en verano',
    desc: 'Cuando el alisio desaparece y el viento sopla desde África, las temperaturas pueden dispararse a más de 40°C en zonas que habitualmente tienen 22°C. Combinado con la sequedad ambiental, crea riesgo muy alto de incendios forestales.',
  },
]

const WHY_FAIL = [
  {
    q: '¿Por qué a veces falla la previsión del tiempo?',
    a: 'El tiempo es un sistema caótico: pequeñas diferencias iniciales producen resultados muy distintos. Los ordenadores cometen errores pequeños al principio que se amplifican con los días. Por eso las previsiones a 7 días son orientativas, no exactas.',
  },
  {
    q: '¿Por qué Canarias es especialmente difícil de predecir?',
    a: 'Las islas tienen montañas de hasta 3.718 m (Teide) en un espacio muy reducido, creando microclimas muy distintos en pocos kilómetros. Solo en los primeros 2 días usamos un modelo de alta resolución (2.5 km). A partir del día 3, el detalle se pierde.',
  },
  {
    q: '¿Cómo de fiable es el porcentaje de lluvia?',
    a: 'Es una probabilidad, no una certeza. Un 70% de probabilidad significa que en condiciones similares, ha llovido el 70% de las veces. Lo más fiable son las próximas 6–12 horas; lo menos fiable, los días 5–7.',
  },
]

// ── Shared styles ──────────────────────────────────────────────────────────

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

export default function LearnPage({ onBack }: LearnPageProps) {
  const [openTerm, setOpenTerm] = useState<number | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
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
            Sin tecnicismos
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
            Los conceptos meteorológicos que usamos en esta app, explicados en lenguaje cotidiano.
          </p>
          <div style={cardStyle}>
            {GLOSSARY.map((t, i) => (
              <div key={t.term} style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}>
                <button
                  onClick={() => setOpenTerm(openTerm === i ? null : i)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '16px 20px',
                    background: openTerm === i ? 'var(--bg)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.term}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.plain}</p>
                  </div>
                  <span style={{ color: 'var(--primary)', fontSize: '0.6rem', marginTop: 4, flexShrink: 0, transition: 'transform 0.2s', transform: openTerm === i ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▼</span>
                </button>
                {openTerm === i && (
                  <div style={{ padding: '0 20px 16px', background: 'var(--bg)' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{t.detail}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Fenómenos locales */}
        <section>
          <span style={tagStyle}>Fenómenos locales</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            El tiempo especial de Canarias
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Las Islas Canarias tienen uno de los climas más singulares del mundo.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {CANARY_WEATHER.map(p => (
              <div key={p.name} style={{ ...cardStyle, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: '1.6rem' }}>{p.emoji}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>{p.name}</h3>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{p.desc}</p>
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
            Las previsiones meteorológicas son probabilidades, no certezas.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {WHY_FAIL.map(item => (
              <div key={item.q} style={{ ...cardStyle, padding: '20px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>{item.q}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{item.a}</p>
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
