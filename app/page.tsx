import { readFileSync } from 'fs'
import { join } from 'path'
import EditableElement from '@/components/EditableElement'
import { SECTION_RENDERERS } from '@/components/sections/registry'
import type { ThemeTokens, SectionsFile } from '@/lib/schemas'

export const revalidate = 60

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), relativePath), 'utf8')) as T
}

export default function Page() {
  const { sections } = readJson<SectionsFile>('content/sections.json')
  const tokens = readJson<ThemeTokens>('theme/tokens.json')

  return (
    <>
      <style>{`:root { --accent: ${tokens.accent}; }`}</style>
      <main className="min-h-screen bg-[#FAFAF7] text-[#14141A] font-sans px-8">
        <div className="max-w-2xl mx-auto py-24 space-y-10">

          {/* Theme accent — editable via "change the accent color" suggestions */}
          <EditableElement editId="theme.accent" tag="div" className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border border-black/10"
              style={{ background: tokens.accent }}
            />
            <span className="text-xs text-neutral-400 font-mono">{tokens.accent}</span>
          </EditableElement>

          {/* Sections loop */}
          {sections
            .filter(s => s.visible)
            .map(section => {
              const Renderer = SECTION_RENDERERS[section.type]
              return (
                <EditableElement
                  key={section.id}
                  editId={`section.${section.id}`}
                  tag="div"
                >
                  <Renderer {...section} />
                </EditableElement>
              )
            })}

        </div>
      </main>
    </>
  )
}
