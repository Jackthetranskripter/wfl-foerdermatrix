import type { Level, Relevance, ViewState } from '../types'
import { data, getType } from '../logic'
import { Icon, Toggle } from './ui'

type Set = (patch: Partial<ViewState>) => void

const TYPE_ICONS: Record<string, string> = {
  all: 'M4 5h16M4 12h16M4 19h16',
  existenz: 'M4 20V10l8-6 8 6v10M9 20v-6h6v6',
  startup: 'M5 19l4-4M14 4c3 0 6 3 6 6l-7 7-6-6 7-7zM15 9h.01',
  tech: 'M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3M7 7h10v10H7z',
  spinoff: 'M12 4L3 9l9 5 9-5-9-5zM7 11.5V16c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5',
  kmu: 'M4 20h16M6 20V9l6-4 6 4v11M10 20v-4h4v4M9 11h.01M15 11h.01',
}

export function TypeBar({ s, set, onOpenFinder }: { s: ViewState; set: Set; onOpenFinder: () => void }) {
  const items = [{ id: 'all', short: 'Alle anzeigen', description: 'Gesamtübersicht aller Akteure und Angebote' }, ...data.types]
  const t = getType(s.typeId)
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gründertyp</h2>
        <button onClick={onOpenFinder} className="no-print inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
          <Icon name="help" className="h-3.5 w-3.5" /> Welcher Typ passt?
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {items.map((it) => {
          const active = s.typeId === it.id
          return (
            <button
              key={it.id}
              onClick={() => set({ typeId: it.id })}
              aria-pressed={active}
              className={`group flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition ${
                active ? 'border-accent bg-accent text-white shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={`mt-0.5 h-5 w-5 shrink-0 ${active ? 'text-teal-200' : 'text-slate-400'}`}>
                <path d={TYPE_ICONS[it.id]} />
              </svg>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight">{it.short}</span>
                <span className={`mt-0.5 line-clamp-2 block text-[11px] leading-snug ${active ? 'text-white/75' : 'text-slate-500'}`}>{it.description}</span>
              </span>
            </button>
          )
        })}
      </div>
      {t && (
        <div className="mt-3 flex flex-wrap items-start gap-x-6 gap-y-1 rounded-md bg-accent-soft/60 px-3 py-2 text-xs text-slate-700">
          <p><span className="font-semibold text-accent">Kriterien: </span>{t.criteria}</p>
          {t.hint && <p className="text-slate-600"><span className="font-semibold">Hinweis: </span>{t.hint}</p>}
        </div>
      )}
    </div>
  )
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string; title?: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          title={o.title}
          onClick={() => onChange(o.id)}
          className={`rounded px-2.5 py-1 text-xs font-medium transition ${value === o.id ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      {children}
    </div>
  )
}

export function FilterBar({ s, set }: { s: ViewState; set: Set }) {
  const toggleLevel = (l: Level) => {
    const next = s.levels.includes(l) ? s.levels.filter((x) => x !== l) : [...s.levels, l]
    set({ levels: next.length ? next : [l] })
  }
  const toggleFilter = (id: string) => set({ filters: s.filters.includes(id) ? s.filters.filter((x) => x !== id) : [...s.filters, id] })

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <FilterGroup label="Ebene">
        <div className="inline-flex gap-1">
          {data.levels.map((l) => {
            const on = s.levels.includes(l.id)
            return (
              <button
                key={l.id}
                title={l.label}
                onClick={() => toggleLevel(l.id)}
                aria-pressed={on}
                className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                  on ? (l.id === 'LU' ? 'border-accent bg-accent text-white' : 'border-accent/40 bg-accent-soft text-accent') : 'border-slate-200 bg-white text-slate-400 line-through decoration-slate-300'
                }`}
              >
                {l.id}
              </button>
            )
          })}
          <button
            onClick={() => set({ levels: s.levels.length === 1 && s.levels[0] === 'LU' ? ['LU', 'ZCH', 'CH'] : ['LU'] })}
            className="ml-1 rounded-md px-2 py-1 text-xs font-medium text-accent hover:bg-accent-soft"
            title="Schnellwahl: nur Akteure mit Luzern-Bezug"
          >
            {s.levels.length === 1 && s.levels[0] === 'LU' ? 'alle Ebenen' : 'nur LU'}
          </button>
        </div>
      </FilterGroup>

      <FilterGroup label="Relevanz">
        <Segmented<Relevance>
          value={s.relevance}
          onChange={(relevance) => set({ relevance })}
          options={[
            { id: 'all', label: 'Alle', title: 'K, W, R und unklar' },
            { id: 'KW', label: 'K + W', title: 'Kernangebote und wichtige Beiträge' },
            { id: 'K', label: 'nur K', title: 'nur Kernangebote' },
          ]}
        />
      </FilterGroup>

      <FilterGroup label="Zielgruppe">
        <div className="inline-flex flex-wrap gap-1">
          {data.filters.map((f) => {
            const on = s.filters.includes(f.id)
            return (
              <button
                key={f.id}
                title={f.description}
                onClick={() => toggleFilter(f.id)}
                aria-pressed={on}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${on ? 'border-pink-300 bg-pink-50 text-pink-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {on ? '✓ ' : '+ '}
                {f.label}
              </button>
            )
          })}
        </div>
      </FilterGroup>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 xl:ml-auto">
        {s.typeId !== 'all' && <Toggle checked={s.onlyFocus} onChange={(onlyFocus) => set({ onlyFocus })} label="Nur Fokus-Akteure" hint="Bedingt relevante Akteure (°) ausblenden" />}
        <Toggle checked={s.showGaps} onChange={(showGaps) => set({ showGaps })} label="Ökosystem-Lücken einblenden" hint="Die 13 priorisierten Lücken aus dem Blatt «Lücken» in den betroffenen Phasen anzeigen" />
        <Segmented<ViewState['view']>
          value={s.view}
          onChange={(view) => set({ view })}
          options={[
            { id: 'board', label: 'Phasen-Karten' },
            { id: 'table', label: 'Matrix-Tabelle' },
          ]}
        />
      </div>
    </div>
  )
}
