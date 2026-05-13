import type { BulletListSection } from '@/lib/schemas'

export default function BulletListSection({ items }: BulletListSection) {
  return (
    <ul className="space-y-2 list-none">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2.5" />
          <span className="text-neutral-600 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}
