interface EducationalCardProps {
  tag: string
  title: string
  body: string
}

export default function EducationalCard({ tag, title, body }: EducationalCardProps) {
  return (
    <div className="rounded-lg overflow-hidden">
      {/* Header — surface-bright */}
      <div className="bg-surface-bright px-4 pt-4 pb-3">
        <span
          className="inline-block text-xs text-primary mb-2 px-2 py-0.5 rounded-sm bg-primary-container/40"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
        >
          {tag}
        </span>
        <h3
          className="text-on-surface text-base font-semibold leading-snug"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h3>
      </div>
      {/* Body — surface-container */}
      <div className="bg-surface-container px-4 py-3">
        <p
          className="text-on-surface-variant text-sm leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {body}
        </p>
      </div>
    </div>
  )
}
