import type { TechStackSection } from '@/lib/schemas'

export default function TechStackSection({ items }: TechStackSection) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item, i) => {
        const inner = (
          <>
            <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
              {item.name}
            </span>
            <span className="text-xs text-white/35 leading-relaxed mt-0.5">
              {item.description}
            </span>
          </>
        )

        const baseClass =
          'group flex flex-col border border-white/[0.07] rounded-lg px-4 py-3 transition-colors'

        return item.href ? (
          <a
            key={i}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${baseClass} hover:border-[var(--accent)]/30 hover:bg-white/[0.02]`}
          >
            {inner}
          </a>
        ) : (
          <div key={i} className={baseClass}>
            {inner}
          </div>
        )
      })}
    </div>
  )
}
