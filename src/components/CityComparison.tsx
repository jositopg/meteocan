import { useEffect, useState } from 'react'

const OWM_KEY = import.meta.env.VITE_OWM_API_KEY as string

interface CityData {
  name: string
  flag: string
  temp: number
  condition: string
  icon: string
}

// Cities that send the most tourists to Canarias + reference cities
const CITIES = [
  { name: 'Madrid',     flag: '🇪🇸', q: 'Madrid,ES' },
  { name: 'Barcelona',  flag: '🇪🇸', q: 'Barcelona,ES' },
  { name: 'Londres',    flag: '🇬🇧', q: 'London,GB' },
  { name: 'Berlín',     flag: '🇩🇪', q: 'Berlin,DE' },
  { name: 'París',      flag: '🇫🇷', q: 'Paris,FR' },
  { name: 'Ámsterdam',  flag: '🇳🇱', q: 'Amsterdam,NL' },
]

function owmToEmoji(id: number): string {
  if (id >= 200 && id < 300) return '⛈️'
  if (id >= 300 && id < 400) return '🌦️'
  if (id >= 500 && id < 600) return '🌧️'
  if (id >= 600 && id < 700) return '❄️'
  if (id >= 700 && id < 800) return '🌫️'
  if (id === 800)             return '☀️'
  if (id === 801)             return '🌤️'
  if (id <= 804)              return '⛅'
  return '🌡️'
}

async function fetchCity(q: string): Promise<{ temp: number; condition: string; icon: string }> {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${OWM_KEY}&units=metric&lang=es`
  )
  if (!res.ok) throw new Error(`OWM ${res.status}`)
  const d = await res.json()
  return {
    temp: Math.round(d.main.temp),
    condition: d.weather[0]?.description ?? '',
    icon: owmToEmoji(d.weather[0]?.id ?? 800),
  }
}

function Skeleton() {
  return (
    <div style={{ padding: '20px 24px 24px' }}>
      <div style={{ height: 13, width: 220, background: '#e2e8f0', borderRadius: 6, marginBottom: 16 }} />
      <div className="grid-6col">
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ height: 80, background: '#e2e8f0', borderRadius: 12 }} />
        ))}
      </div>
    </div>
  )
}

interface Props { localTemp: number | null }

export default function CityComparison({ localTemp }: Props) {
  const [cities, setCities] = useState<CityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled(
      CITIES.map(c => fetchCity(c.q).then(d => ({ name: c.name, flag: c.flag, ...d })))
    ).then(results => {
      const data = results
        .filter((r): r is PromiseFulfilledResult<CityData> => r.status === 'fulfilled')
        .map(r => r.value)
      setCities(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <Skeleton />
  if (cities.length === 0) return null

  return (
    <div style={{ padding: '20px 24px 24px' }}>
      <div className="city-compare-header" style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700,
          color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>
          Por qué la gente viene a Canarias
        </p>
        {localTemp !== null && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            — aquí ahora mismo {localTemp}°C ☀️
          </span>
        )}
      </div>

      <div className="grid-6col">
        {cities.map(city => {
          const diff = localTemp !== null ? localTemp - city.temp : null
          const warmer = diff !== null && diff > 0

          return (
            <div
              key={city.name}
              style={{
                borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--bg)',
                padding: '14px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '1rem' }}>{city.flag}</span>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 600,
                color: 'var(--text-muted)', textAlign: 'center',
              }}>
                {city.name}
              </p>
              <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{city.icon}</span>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700,
                color: 'var(--text)',
              }}>
                {city.temp}°
              </p>
              {diff !== null && Math.abs(diff) >= 2 && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
                  color: warmer ? '#15803d' : '#1d4ed8',
                  background: warmer ? '#d1fae5' : '#dbeafe',
                  padding: '2px 7px', borderRadius: 8,
                }}>
                  {warmer
                    ? `+${Math.round(diff * 10) / 10}° aquí`
                    : `${Math.round(Math.abs(diff) * 10) / 10}° más frío`}
                </span>
              )}
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.64rem',
                color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.3,
                textTransform: 'capitalize',
              }}>
                {city.condition}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
