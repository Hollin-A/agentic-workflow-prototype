'use client'

import { createContext, useContext } from 'react'

// Provides the current accent token value to any client component in the tree.
// Populated from tokens.json in the server component (app/page.tsx) so the
// value is always fresh — no CSS variable timing issues.

export const AccentContext = createContext<string>('#ffffff')

export function AccentProvider({
  accent,
  children,
}: {
  accent: string
  children: React.ReactNode
}) {
  return <AccentContext.Provider value={accent}>{children}</AccentContext.Provider>
}

export function useAccent(): string {
  return useContext(AccentContext)
}
