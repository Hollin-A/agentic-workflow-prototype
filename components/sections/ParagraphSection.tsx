import type { ParagraphSection } from '@/lib/schemas'

export default function ParagraphSection({ text }: ParagraphSection) {
  return (
    <p className="text-lg text-neutral-600 leading-relaxed">
      {text}
    </p>
  )
}
