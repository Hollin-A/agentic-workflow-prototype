import type { LinkBlockSection } from '@/lib/schemas'

export default function LinkBlockSection({ text, href }: LinkBlockSection) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-[var(--accent)] font-medium hover:underline underline-offset-4 transition-colors"
    >
      {text}
    </a>
  )
}
