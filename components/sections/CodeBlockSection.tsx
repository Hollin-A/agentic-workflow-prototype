import type { CodeBlockSection } from '@/lib/schemas'

export default function CodeBlockSection({ language, code }: CodeBlockSection) {
  return (
    <div className="rounded-lg overflow-hidden border border-neutral-200 bg-[#14141A]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs font-mono text-neutral-400">{language}</span>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
      </div>
      <pre className="px-4 py-4 overflow-x-auto">
        <code className="text-sm font-mono text-neutral-200 whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}
