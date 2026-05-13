import type { HeadingSection } from '@/lib/schemas'

const styles = {
  1: 'text-4xl sm:text-5xl font-bold tracking-tight text-[#14141A] leading-tight',
  2: 'text-2xl sm:text-3xl font-semibold tracking-tight text-[#14141A] leading-snug',
  3: 'text-xl sm:text-2xl font-semibold text-[#14141A] leading-snug',
} as const

export default function HeadingSection({ level, text }: HeadingSection) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  return <Tag className={styles[level]}>{text}</Tag>
}
