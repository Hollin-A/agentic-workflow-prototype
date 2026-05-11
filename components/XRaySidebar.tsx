'use client'

import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useXRay } from './XRayProvider'
import type { Comment } from '@/lib/schemas'

const STATUS_DOT: Record<Comment['status'], string> = {
  queued: 'bg-neutral-300',
  moderating: 'bg-yellow-400',
  generating: 'bg-blue-400 animate-pulse',
  merged: 'bg-green-400',
  rejected: 'bg-red-400',
  failed: 'bg-orange-400',
}

const STATUS_LABEL: Record<Comment['status'], string> = {
  queued: 'Queued',
  moderating: 'Moderating',
  generating: 'Generating',
  merged: 'Merged',
  rejected: 'Rejected',
  failed: 'Failed',
}

export default function XRaySidebar() {
  const { active, focusedId, comments, activate, deactivate } = useXRay()

  const elements = useMemo(() => {
    const map = new Map<string, { latest: Comment; count: number }>()
    for (const c of comments) {
      const existing = map.get(c.edit_id)
      if (!existing) {
        map.set(c.edit_id, { latest: c, count: 1 })
      } else {
        existing.count++
      }
    }
    return Array.from(map.values())
  }, [comments])

  if (!active) return null

  const sidebar = (
    <div className="fixed top-0 right-0 h-full w-72 bg-white border-l border-neutral-200 shadow-xl z-40 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          X-Ray
        </span>
        <button
          onClick={deactivate}
          className="text-neutral-400 hover:text-neutral-700 text-lg leading-none"
          aria-label="Close X-Ray"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {elements.length === 0 ? (
          <p className="text-xs text-neutral-400 italic">No editable elements with activity yet.</p>
        ) : (
          <ol className="space-y-1">
            {elements.map(({ latest: c, count }) => (
              <li
                key={c.edit_id}
                onClick={() => activate(c.edit_id)}
                className={`flex items-center gap-3 rounded-lg px-2 py-2 cursor-pointer transition-colors ${
                  focusedId === c.edit_id ? 'bg-neutral-100' : 'hover:bg-neutral-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[c.status]}`} />
                <span className="font-mono text-xs text-neutral-700 flex-1 truncate">{c.edit_id}</span>
                <span className="text-[10px] text-neutral-400">{STATUS_LABEL[c.status]}</span>
                {count > 1 && (
                  <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full shrink-0">
                    {count}
                  </span>
                )}
                {c.pr_url && (
                  <a
                    href={c.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-[var(--accent)] hover:underline shrink-0"
                  >
                    PR →
                  </a>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="px-5 py-3 border-t border-neutral-100">
        <p className="text-xs text-neutral-400">Esc or ⌘. to close</p>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(sidebar, document.body)
}
