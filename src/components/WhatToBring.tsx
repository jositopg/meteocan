import type { Observation, ForecastDay } from '../services/aemet'

interface Props { obs: Observation | null; forecast: ForecastDay[]; loading: boolean }

type Status = 'yes' | 'maybe' | 'no'

interface Item {
  icon: string
  label: string
  status: Status
  reason: string
}

const STATUS_STYLE: Record<Status, { bg: string; border: string; labelColor: string; badge: string; badgeBg: string }> = {
  yes:   { bg: '#f0fdf4', border: '#86efac', labelColor: '#15803d', badge: 'Llévalo', badgeBg: '#d1fae5' },
  maybe: { bg: '#fffbeb', border: '#fcd34d', labelColor: '#92400e', badge: 'Quizás',  badgeBg: '#fef3c7' },
  no:    { bg: 'var(--bg)', border: 'var(--border)', labelColor: 'var(--text-dim)', badge: 'No hace falta', badgeBg: 'var(--bg)' },
}

function buildItems(obs: Observation, forecast: ForecastDay[]): Item[] {
  const prob = forecast[0]?.probPrecip ?? 0
  const uv   = forecast[0]?.uvMax ?? 0
  const prec = obs.prec
  const temp = obs.ta
  const gust = obs.vmax
  const south = obs.dv > 120 && obs.dv < 240
  const calima = temp > 23 && obs.hr < 48 && south

  return [
    {
      icon: '☂️',
      label: 'Paraguas',
      status: prec > 0 || prob > 50 ? 'yes' : prob > 25 ? 'maybe' : 'no',
      reason: prec > 0 ? 'Ya está lloviendo'
        : prob > 50 ? `${prob}% de probabilidad de lluvia`
        : prob > 25 ? `${prob}% — posible chubasco puntual`
        : 'Sin lluvia prevista',
    },
    {
      icon: '🕶️',
      label: 'Gafas de sol',
      status: prob < 40 && prec === 0 ? 'yes' : prob < 70 ? 'maybe' : 'no',
      reason: prob < 40 ? 'Sol garantizado'
        : prob < 70 ? 'Posibles claros entre nubes'
        : 'Día mayormente nublado',
    },
    {
      icon: '🧴',
      label: 'Protector solar',
      status: uv >= 6 ? 'yes' : uv >= 3 ? 'maybe' : 'no',
      reason: uv >= 11 ? `UV ${uv} — extremo, quemadura en 10 min`
        : uv >= 8  ? `UV ${uv} — muy alto, protección obligatoria`
        : uv >= 6  ? `UV ${uv} — alto, usa SPF 30 mínimo`
        : uv >= 3  ? `UV ${uv} — moderado, recomendable`
        : 'UV bajo hoy',
    },
    {
      icon: '🧥',
      label: 'Chaqueta / jersey',
      status: temp < 17 ? 'yes' : temp < 21 ? 'maybe' : 'no',
      reason: temp < 17 ? `${temp}°C — fresco para Canarias`
        : temp < 21 ? `${temp}°C — puede refrescar por la tarde`
        : `${temp}°C — no la necesitas`,
    },
    {
      icon: '💧',
      label: 'Agua extra',
      status: temp > 27 || calima ? 'yes' : temp > 23 || uv >= 8 ? 'maybe' : 'no',
      reason: calima ? 'Calima: el aire seco deshidrata sin que te des cuenta'
        : temp > 27 ? `${temp}°C — hidratación crítica al aire libre`
        : temp > 23 ? `${temp}°C + UV alto — lleva al menos 1 L extra`
        : 'Hidratación normal suficiente',
    },
    {
      icon: '😷',
      label: 'Protección respiratoria',
      status: calima && obs.hr < 38 ? 'yes' : calima ? 'maybe' : 'no',
      reason: calima && obs.hr < 38 ? 'Calima intensa — polvo fino en suspensión afecta los bronquios'
        : calima ? 'Calima activa — recomendable en personas sensibles'
        : 'Aire limpio',
    },
    {
      icon: '🌬️',
      label: 'Ropa ajustada',
      status: gust > 45 ? 'yes' : gust > 28 ? 'maybe' : 'no',
      reason: gust > 45 ? `Rachas de ${Math.round(gust)} km/h — evita ropa suelta`
        : gust > 28 ? `Rachas de ${Math.round(gust)} km/h — puede molestar`
        : 'Viento moderado o flojo',
    },
  ]
}

function Skeleton() {
  return (
    <div style={{ padding: '20px 24px 24px' }}>
      <div style={{ height: 13, width: 140, background: '#e2e8f0', borderRadius: 6, marginBottom: 16 }} />
      <div className="grid-7col">
        {[...Array(7)].map((_, i) => (
          <div key={i} style={{ height: 100, background: '#e2e8f0', borderRadius: 12 }} />
        ))}
      </div>
    </div>
  )
}

export default function WhatToBring({ obs, forecast, loading }: Props) {
  if (loading || !obs) return <Skeleton />

  const items = buildItems(obs, forecast)

  return (
    <div style={{ padding: '20px 24px 24px' }}>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700,
        color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.14em',
        marginBottom: 16,
      }}>
        ¿Qué llevar hoy?
      </p>

      <div className="grid-7col">
        {items.map(item => {
          const s = STATUS_STYLE[item.status]
          return (
            <div
              key={item.label}
              title={item.reason}
              style={{
                borderRadius: 14, border: `1.5px solid ${s.border}`,
                background: s.bg, padding: '14px 10px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, cursor: 'default',
              }}
            >
              <span style={{ fontSize: '1.6rem', lineHeight: 1, opacity: item.status === 'no' ? 0.35 : 1 }}>
                {item.icon}
              </span>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 500,
                color: s.labelColor, textAlign: 'center', lineHeight: 1.3,
              }}>
                {item.label}
              </p>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.56rem', fontWeight: 700,
                color: s.labelColor, background: s.badgeBg,
                border: `1px solid ${s.border}`, borderRadius: 6,
                padding: '2px 6px', textAlign: 'center',
              }}>
                {s.badge}
              </span>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.64rem',
                color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.4,
              }}>
                {item.reason}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
