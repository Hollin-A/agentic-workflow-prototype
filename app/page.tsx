import ActivityFeed from '@/components/ActivityFeed'
import EditableElement from '@/components/EditableElement'
import hero from '@/content/hero.json'
import tokens from '@/theme/tokens.json'
import overrides from '@/overrides/index.json'

export default function Page() {
  return (
    <main
      style={{
        '--accent': tokens.accent,
        '--hero-font-size': overrides.heroFontSize,
        '--hero-font-weight': overrides.heroFontWeight,
        '--hero-padding': overrides.heroPadding,
      } as React.CSSProperties}
      className="min-h-screen bg-[#FAFAF7] text-[#14141A] font-sans px-8"
    >
      <div
        className="max-w-4xl mx-auto pb-32"
        style={{ paddingTop: 'var(--hero-padding)' }}
      >

        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          Built for agentic workflows
        </div>

        <EditableElement
          editId="hero.title"
          tag="h1"
          className="leading-tight tracking-tight mb-6 max-w-2xl"
          style={{
            fontSize: 'var(--hero-font-size)',
            fontWeight: 'var(--hero-font-weight)',
          }}
        >
          {hero.title}
        </EditableElement>

        <EditableElement editId="hero.subtitle" tag="p" className="text-xl text-neutral-500 leading-relaxed mb-10 max-w-xl">
          {hero.subtitle}
        </EditableElement>

        <div className="flex items-center gap-6 flex-wrap">
          <EditableElement editId="theme.accent" tag="div" className="inline-flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border border-black/10"
              style={{ background: tokens.accent }}
            />
            <span className="text-sm text-neutral-400 font-mono">{tokens.accent}</span>
          </EditableElement>

          <EditableElement editId="override.typography" tag="div" className="inline-flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-black/10 bg-white flex items-center justify-center">
              <span style={{ fontSize: '0.65rem', fontWeight: overrides.heroFontWeight }}>Aa</span>
            </div>
            <span className="text-sm text-neutral-400 font-mono">
              {overrides.heroFontSize} / {overrides.heroFontWeight}
            </span>
          </EditableElement>
        </div>

        <ActivityFeed />

      </div>
    </main>
  )
}
