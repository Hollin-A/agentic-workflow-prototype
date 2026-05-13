import type { OrderedListSection } from '@/lib/schemas'

export default function OrderedListSection({ items }: OrderedListSection) {
  return (
    <ol className="space-y-2 list-none">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="text-neutral-600 leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
  )
}
