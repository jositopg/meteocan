interface MetricCardProps {
  label: string
  value: string
  unit: string
  sub?: string
}

export default function MetricCard({ label, value, unit, sub }: MetricCardProps) {
  return (
    <div className="bg-surface-container-high rounded-lg px-4 py-3 flex flex-col gap-1">
      <span
        className="text-on-surface-variant text-xs uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.1em' }}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className="text-on-surface font-semibold leading-none"
          style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}
        >
          {value}
        </span>
        <span
          className="text-primary text-sm"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {unit}
        </span>
      </div>
      {sub && (
        <span
          className="text-on-surface-variant text-xs"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {sub}
        </span>
      )}
    </div>
  )
}
