import { ISLAND_CONFIG, type IslandId } from '../services/aemet'

interface Props {
  selected: IslandId
  onChange: (id: IslandId) => void
}

const ISLANDS = Object.entries(ISLAND_CONFIG) as [IslandId, typeof ISLAND_CONFIG[IslandId]][]

export default function IslandSelector({ selected, onChange }: Props) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
    }}>
      <div className="island-tabs">
        {ISLANDS.map(([id, cfg]) => {
          const isSelected = id === selected
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: isSelected
                  ? '2px solid var(--primary)'
                  : '2px solid transparent',
                marginBottom: -1,
                transition: 'border-color 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '0.95rem' }}>{cfg.emoji}</span>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: isSelected ? 600 : 400,
                color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'color 0.15s',
              }}>
                {cfg.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
