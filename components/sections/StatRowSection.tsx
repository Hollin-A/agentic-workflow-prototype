import type { StatRowSection } from '@/lib/schemas'

export default function StatRowSection({ stats }: StatRowSection) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.06] rounded-xl overflow-hidden">
      {stats.map((stat, i) => (
        <div key={i} className="bg-[#0a0a0f] px-6 py-5 flex flex-col gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold text-[var(--accent)] tracking-tight leading-none">
            {stat.value}
          </span>
          <span className="text-xs text-white/35 leading-snug">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
