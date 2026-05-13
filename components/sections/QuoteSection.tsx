import type { QuoteSection } from '@/lib/schemas'

export default function QuoteSection({ text, attribution }: QuoteSection) {
  return (
    <figure className="border-l-2 border-[var(--accent)] pl-5">
      <blockquote className="text-lg text-neutral-700 italic leading-relaxed mb-2">
        &ldquo;{text}&rdquo;
      </blockquote>
      <figcaption className="text-sm text-neutral-400 font-mono">— {attribution}</figcaption>
    </figure>
  )
}
