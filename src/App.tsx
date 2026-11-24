import { useCallback, useEffect, useState } from 'react'
import type { Level, Rating, ViewState } from './types'
import { data, getType, priorityRank, visibleGaps } from './logic'
import { FilterBar, TypeBar } from './components/Controls'
import { Board, GapCard } from './components/Board'
import { TableView } from './components/TableView'
import { ActorDrawer } from './components/ActorDrawer'
import { TypeFinder } from './components/TypeFinder'
import { Icon, RatingPill } from './components/ui'

const DEFAULT: ViewState = { typeId: 'all', levels: ['LU', 'ZCH', 'CH'], relevance: 'all', filters: [], onlyFocus: false, showGaps: false, view: 'board' }

/** Ansicht im URL-Hash halten → teilbare Links, Browser-Zurück funktioniert */
function readHash(): ViewState {
  const p = new URLSearchParams(window.location.hash.slice(1))
  const typ = p.get('typ')
  const levels = (p.get('ebene')?.split(',').filter((l) => ['LU', 'ZCH', 'CH'].includes(l)) as Level[]) ?? []
  return {
    typeId: typ && (typ === 'all' || getType(typ)) ? typ : DEFAULT.typeId,
    levels: levels.length ? levels : DEFAULT.levels,
    relevance: (['all', 'KW', 'K'].includes(p.get('rel') ?? '') ? p.get('rel') : 'all') as ViewState['relevance'],
    filters: p.get('ziel')?.split(',').filter((f) => data.filters.some((x) => x.id === f)) ?? [],
    onlyFocus: p.get('fokus') === '1',
    showGaps: p.get('luecken') === '1',
    view: p.get('ansicht') === 'tabelle' ? 'table' : 'board',
  }
}
function writeHash(s: ViewState) {
  const p = new URLSearchParams()
  if (s.typeId !== 'all') p.set('typ', s.typeId)
  if (s.levels.length !== 3) p.set('ebene', s.levels.join(','))
  if (s.relevance !== 'all') p.set('rel', s.relevance)
  if (s.filters.length) p.set('ziel', s.filters.join(','))
  if (s.onlyFocus) p.set('fokus', '1')
  if (s.showGaps) p.set('luecken', '1')
  if (s.view === 'table') p.set('ansicht', 'tabelle')
  const h = p.toString()
  history.replaceState(null, '', h ? `#${h}` : window.location.pathname + window.location.search)
}

export default function App() {
  const [s, setS] = useState<ViewState>(readHash)
  const [actor, setActor] = useState<string | null>(null)
  const [finder, setFinder] = useState(false)
  const set = useCallback((patch: Partial<ViewState>) => setS((prev) => ({ ...prev, ...patch })), [])
  useEffect(() => writeHash(s), [s])

  const gaps = visibleGaps(s)
  const crossGaps = gaps.filter((g) => g.crossPhase)
  const phaseGapCount = gaps.length - crossGaps.length
  const t = getType(s.typeId)

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1880px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 grid-cols-2 gap-0.5 rounded-lg bg-accent p-1.5" aria-hidden>
              <span className="rounded-[2px] bg-teal-300" /><span className="rounded-[2px] bg-blue-300" />
              <span className="rounded-[2px] bg-blue-300" /><span className="rounded-[2px] bg-slate-300" />
            </div>
            <div>
              <h1 className="text-[17px] font-semibold leading-tight text-ink">Fördermatrix Startup- &amp; Neuunternehmerförderung Luzern</h1>
              <p className="text-xs text-slate-500">Interne Beratungsgrundlage · Stand {data.meta.stand}</p>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
            {(['K', 'W', 'R', '?'] as Rating[]).map((r) => (
              <span key={r} className="inline-flex items-center gap-1.5"><RatingPill r={r} /> {data.ratings[r].label}</span>
            ))}
            <button onClick={() => window.print()} className="no-print ml-2 inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-50">
              <Icon name="print" className="h-3.5 w-3.5" /> Drucken
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1880px] space-y-4 px-6 py-4">
          <TypeBar s={s} set={set} onOpenFinder={() => setFinder(true)} />
          <div className="no-print border-t border-slate-100 pt-3">
            <FilterBar s={s} set={set} />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1880px] space-y-4 px-6 py-5">
        {s.showGaps && (
          <div className="rounded-lg border border-gap/20 bg-white p-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <h2 className="text-sm font-semibold text-gap">Ökosystem-Lücken {t ? `für «${t.short}»` : '(alle)'}</h2>
              <p className="text-xs text-slate-500">
                {phaseGapCount} in den Phasen eingeblendet{crossGaps.length ? ` · ${crossGaps.length} phasenübergreifend:` : ''} · Priorität = Wirkung auf Gründende × Häufigkeit
              </p>
            </div>
            {crossGaps.length > 0 && (
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {crossGaps.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority)).map((g) => <GapCard key={g.id} gap={g} />)}
              </div>
            )}
          </div>
        )}

        {s.view === 'board' ? <Board s={s} gaps={gaps} onOpen={setActor} /> : <TableView s={s} gaps={gaps} onOpen={setActor} />}

        <footer className="flex flex-wrap items-start gap-x-8 gap-y-2 border-t border-slate-200 pt-4 text-[11px] leading-relaxed text-slate-500">
          <p className="max-w-3xl"><span className="font-semibold text-slate-600">Lesehilfe: </span>{data.meta.readingNote} ° = bedingt relevant (je nach Vorhaben). Sortierung je Phase: Relevanz, dann Luzern vor Zentralschweiz vor Schweiz.</p>
          <p className="max-w-xl"><span className="font-semibold text-slate-600">Quelle: </span>{data.meta.source}</p>
        </footer>
      </main>

      <ActorDrawer id={actor} s={s} onClose={() => setActor(null)} onPickType={(typeId) => set({ typeId })} />
      {finder && <TypeFinder onPick={(typeId) => set({ typeId })} onClose={() => setFinder(false)} />}
    </div>
  )
}
