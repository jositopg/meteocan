type Layer = 'clouds' | 'rain' | 'storms'

interface LayerToggleProps {
  active: Layer
  onChange: (layer: Layer) => void
}

const layers: { id: Layer; label: string; icon: string; color: string }[] = [
  { id: 'clouds', label: 'Nubosidad',  icon: '◼', color: 'text-on-surface-variant' },
  { id: 'rain',   label: 'Lluvia',     icon: '◼', color: 'text-rain' },
  { id: 'storms', label: 'Tormentas',  icon: '◼', color: 'text-tertiary' },
]

export default function LayerToggle({ active, onChange }: LayerToggleProps) {
  return (
    <div
      className="flex gap-1 p-1 rounded-lg"
      style={{
        background: 'rgba(42,53,72,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {layers.map((l) => (
        <button
          key={l.id}
          onClick={() => onChange(l.id)}
          className={[
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
            'font-[var(--font-body)]',
            active === l.id
              ? 'bg-primary-container text-primary'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high',
          ].join(' ')}
        >
          <span className={`text-xs ${l.color}`}>{l.icon}</span>
          {l.label}
        </button>
      ))}
    </div>
  )
}
