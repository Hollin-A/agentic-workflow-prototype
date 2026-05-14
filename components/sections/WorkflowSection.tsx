import type { WorkflowSection } from '@/lib/schemas'

export default function WorkflowSection({ steps }: WorkflowSection) {
  return (
    <>
      {/* ── Desktop / tablet: horizontal row ── */}
      <div className="hidden sm:block relative">
        {/* Connecting line behind the circles */}
        <div
          className="absolute top-4 h-px bg-[var(--accent)]/15"
          style={{ left: `calc(100% / ${steps.length} / 2)`, right: `calc(100% / ${steps.length} / 2)` }}
        />

        <div className="relative flex">
          {steps.map((step, i) => (
            <div key={i} className="flex-1 flex flex-col items-center px-2 min-w-0">
              {/* Numbered circle */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-[#0e0e14] border border-[var(--accent)]/35 text-[var(--accent)] text-xs font-mono font-semibold flex items-center justify-center shrink-0 mb-3">
                {i + 1}
              </div>

              <p className="text-sm font-semibold text-white text-center mb-1 leading-snug">
                {step.title}
              </p>
              <p className="text-xs text-white/40 text-center leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile: vertical stepper ── */}
      <div className="flex sm:hidden flex-col">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4">
            {/* Left rail: circle + connector */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-7 h-7 rounded-full bg-[#0e0e14] border border-[var(--accent)]/35 text-[var(--accent)] text-xs font-mono font-semibold flex items-center justify-center">
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-[var(--accent)]/15 my-1.5 min-h-[24px]" />
              )}
            </div>

            {/* Content */}
            <div className={`min-w-0 ${i < steps.length - 1 ? 'pb-5' : ''}`}>
              <p className="text-sm font-semibold text-white mb-0.5">{step.title}</p>
              <p className="text-xs text-white/40 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
