import type { ReactNode } from 'react'
import type { Level, Rating } from '../types'
import { data } from '../logic'

export const ratingStyle: Record<Rating, { pill: string; border: string; soft: string; text: string }> = {
  K: { pill: 'bg-k text-white', border: 'border-l-k', soft: 'bg-k-soft', text: 'text-k' },
  W: { pill: 'bg-w text-white', border: 'border-l-w', soft: 'bg-w-soft', text: 'text-w' },
  R: { pill: 'bg-r-soft text-slate-600 ring-1 ring-inset ring-slate-300', border: 'border-l-slate-300', soft: 'bg-r-soft', text: 'text-slate-500' },
  '?': { pill: 'bg-q-soft text-q ring-1 ring-inset ring-q/40', border: 'border-l-q', soft: 'bg-q-soft', text: 'text-q' },
  '–': { pill: 'bg-transparent text-slate-300', border: 'border-l-transparent', soft: '', text: 'text-slate-300' },
}

export function RatingPill({ r, size = 'sm' }: { r: Rating; size?: 'sm' | 'md' }) {
  const s = size === 'md' ? 'h-7 min-w-7 text-sm' : 'h-5 min-w-5 text-[11px]'
  return (
    <span
      title={data.ratings[r].label}
      className={`inline-flex shrink-0 items-center justify-center rounded px-1 font-semibold tabular-nums ${s} ${ratingStyle[r].pill}`}
    >
      {r}
    </span>
  )
}

const levelStyle: Record<Level, string> = {
  LU: 'bg-accent text-white',
  ZCH: 'bg-accent-soft text-accent',
  CH: 'bg-white text-slate-500 ring-1 ring-inset ring-slate-200',
}

export function LevelBadge({ l }: { l: Level }) {
  return (
    <span
      title={data.levels.find((x) => x.id === l)?.label}
      className={`inline-flex h-[18px] items-center rounded px-1.5 text-[10px] font-semibold tracking-wide ${levelStyle[l]}`}
    >
      {l}
    </span>
  )
}

type Tone = 'new' | 'verify' | 'ok' | 'note' | 'cond' | 'filter' | 'gap'
const tones: Record<Tone, string> = {
  new: 'bg-violet-50 text-violet-700 ring-violet-200',
  verify: 'bg-q-soft text-q ring-q/30',
  ok: 'bg-k-soft text-k ring-k/20',
  note: 'bg-slate-50 text-slate-600 ring-slate-200',
  cond: 'bg-white text-slate-500 ring-slate-300 border-dashed',
  filter: 'bg-pink-50 text-pink-700 ring-pink-200',
  gap: 'bg-gap-soft text-gap ring-gap/25',
}

export function Badge({ tone, children, title }: { tone: Tone; children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className={`inline-flex h-[18px] items-center gap-1 whitespace-nowrap rounded-full px-1.5 text-[10px] font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

export function RemarkBadge({ type }: { type: 'Bemerkung' | 'zu verifizieren' | 'verifiziert' | null }) {
  if (!type) return null
  if (type === 'zu verifizieren') return <Badge tone="verify" title="Bemerkung enthält offene Punkte">zu verifizieren</Badge>
  if (type === 'verifiziert') return <Badge tone="ok">verifiziert</Badge>
  return <Badge tone="note" title="Bemerkung vorhanden">Bemerkung</Badge>
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-slate-700" title={hint}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </button>
      {label}
    </label>
  )
}

export function Icon({ name, className = 'h-4 w-4' }: { name: 'close' | 'info' | 'alert' | 'grid' | 'columns' | 'print' | 'help' | 'link' | 'chevron'; className?: string }) {
  const p: Record<string, ReactNode> = {
    close: <path d="M6 6l12 12M18 6L6 18" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    alert: <><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17h.01" /></>,
    grid: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16M4 15h16M10 4v16" /></>,
    columns: <><rect x="4" y="4" width="4.5" height="16" rx="1" /><rect x="9.75" y="4" width="4.5" height="11" rx="1" /><rect x="15.5" y="4" width="4.5" height="13" rx="1" /></>,
    print: <><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="7" rx="1.5" /><path d="M7 14h10v6H7z" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.2M12 17h.01" /></>,
    link: <><path d="M14 5h5v5M19 5l-8 8" /><path d="M17 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4" /></>,
    chevron: <path d="M9 6l6 6-6 6" />,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {p[name]}
    </svg>
  )
}
