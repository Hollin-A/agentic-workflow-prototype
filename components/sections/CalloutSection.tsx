import type { CalloutSection } from '@/lib/schemas'

const toneStyles = {
  info: {
    wrapper: 'bg-blue-50 border-blue-200',
    title: 'text-blue-900',
    body: 'text-blue-800',
    bar: 'bg-blue-400',
  },
  warn: {
    wrapper: 'bg-amber-50 border-amber-200',
    title: 'text-amber-900',
    body: 'text-amber-800',
    bar: 'bg-amber-400',
  },
  success: {
    wrapper: 'bg-emerald-50 border-emerald-200',
    title: 'text-emerald-900',
    body: 'text-emerald-800',
    bar: 'bg-emerald-400',
  },
} as const

export default function CalloutSection({ tone, title, body }: CalloutSection) {
  const s = toneStyles[tone]
  return (
    <div className={`relative rounded-lg border px-5 py-4 ${s.wrapper}`}>
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${s.bar}`} />
      <p className={`font-semibold text-sm mb-1 ${s.title}`}>{title}</p>
      <p className={`text-sm leading-relaxed ${s.body}`}>{body}</p>
    </div>
  )
}
