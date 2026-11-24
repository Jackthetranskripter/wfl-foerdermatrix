import { useState } from 'react'
import type { Entry, Gap, Phase, ViewState } from '../types'
import { baseEntries, coverage, data, passesRelevance, priorityRank, type Coverage } from '../logic'
import { Badge, Icon, LevelBadge, RatingPill, RemarkBadge, ratingStyle } from './ui'

export function CoverageHeader({ phase, cov, compact = false }: { phase: Phase; cov: Coverage; compact?: boolean }) {
  const stateBox = {
    ok: null,
    thin: { cls: 'bg-thin-soft text-thin', text: 'Dünne Abdeckung – kein Kernangebot' },
    empty: { cls: 'bg-gap-soft text-gap', text: 'Angebotslücke – keine Angebote' },
    dimmed: { cls: 'bg-slate-100 text-slate-500', text: 'Für diesen Typ nicht zentral' },
  }[cov.state]
  return (
    <div className={`border-b border-slate-200 ${compact ? 'px-2 py-2' : 'px-3 pb-2.5 pt-3'}`}>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xs font-bold text-accent">{phase.id}</span>
        <span className={`font-semibold leading-tight text-ink ${compact ? 'text-xs' : 'text-sm'}`}>{phase.label.replace(/\s*\(.*\)$/, '')}</span>
      </div>
      {!compact && <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{phase.description}</p>}
      <div className="mt-2 flex items-center gap-2 text-[11px] tabular-nums">
        <span className={`inline-flex items-center gap-1 font-semibold ${cov.k ? 'text-k' : 'text-slate-400'}`}>
          <span className="h-2 w-2 rounded-sm bg-k" /> {cov.k} K
        </span>
        <span className={`inline-flex items-center gap-1 font-semibold ${cov.w ? 'text-w' : 'text-slate-400'}`}>
          <span className="h-2 w-2 rounded-sm bg-w" /> {cov.w} W
        </span>
        <span className="ml-auto text-slate-500" title="Davon Kern- und wichtige Angebote mit Luzern-Bezug">
          LU: <b className="font-semibold text-accent">{cov.lu}</b>
        </span>
      </div>
      {stateBox && (
        <div className={`mt-2 flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium ${stateBox.cls}`}>
          {cov.state !== 'dimmed' && <Icon name="alert" className="h-3.5 w-3.5 shrink-0" />}
          {stateBox.text}
        </div>
      )}
    </div>
  )
}

const prioCls = ['bg-gap text-white', 'bg-gap/80 text-white', 'bg-thin-soft text-thin ring-1 ring-inset ring-thin/30', 'bg-slate-100 text-slate-600']

export function GapCard({ gap, compact = false }: { gap: Gap; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-md border border-dashed border-gap/40 bg-gap-soft/70 text-left">
      <button onClick={() => setOpen(!open)} className="flex w-full items-start gap-2 px-2.5 py-2 text-left" aria-expanded={open}>
        <span className="mt-px text-[10px] font-bold text-gap">L{gap.id}</span>
        <span className="min-w-0 flex-1">
          <span className="block hyphens-auto text-xs font-semibold leading-snug text-gap [overflow-wrap:anywhere]">{gap.title}</span>
          <span className="mt-1 flex flex-wrap items-center gap-1">
            <span className={`rounded px-1.5 py-px text-[10px] font-semibold ${prioCls[priorityRank(gap.priority)]}`}>Prio {gap.priority}</span>
            <span className="text-[10px] text-slate-500">Aufwand {gap.effort} · Lead {gap.lead}</span>
          </span>
        </span>
        <Icon name="chevron" className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-gap/60 transition ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <dl className={`space-y-1.5 border-t border-dashed border-gap/30 px-2.5 py-2 text-[11px] leading-snug text-slate-700 ${compact ? '' : ''}`}>
          <div><dt className="font-semibold text-slate-500">Evidenz</dt><dd>{gap.evidence}</dd></div>
          <div><dt className="font-semibold text-slate-500">Massnahme (Vorschlag)</dt><dd>{gap.measure}</dd></div>
          <div><dt className="font-semibold text-slate-500">Segment · Phase</dt><dd>{gap.segment} · {gap.phaseOriginal}</dd></div>
        </dl>
      )}
    </div>
  )
}

function EntryCard({ e, onOpen }: { e: Entry; onOpen: (id: string) => void }) {
  const a = e.actor
  const cond = e.status === 'conditional'
  return (
    <button
      onClick={() => onOpen(a.id)}
      className={`group w-full rounded-md border border-l-[3px] bg-white px-2.5 py-2 text-left shadow-[0_1px_0_rgba(15,42,61,0.04)] transition hover:border-slate-300 hover:shadow-sm ${ratingStyle[e.cell.rating].border} ${
        cond ? 'border-slate-200/80 bg-white/70' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start gap-2">
        <RatingPill r={e.cell.rating} />
        <span className={`min-w-0 flex-1 text-[13px] font-semibold leading-tight group-hover:text-accent ${cond ? 'text-slate-600' : 'text-ink'}`}>
          {a.short}
          {cond && <span className="ml-0.5 font-normal text-slate-400" title="bedingt relevant – je nach Vorhaben">°</span>}
        </span>
      </div>
      {e.cell.text && <p className={`mt-1 text-xs leading-snug ${cond ? 'text-slate-500' : 'text-slate-600'}`}>{e.cell.text}</p>}
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {a.ebene.map((l) => <LevelBadge key={l} l={l} />)}
        {a.isNew && <Badge tone="new" title={`In alter Matrix: ${a.inOldMatrix}`}>NEU</Badge>}
        <RemarkBadge type={a.remarkType} />
        {e.status === 'filter' && <Badge tone="filter">{data.filters.find((f) => f.actor === a.id)?.label}</Badge>}
        {cond && <Badge tone="cond">bedingt</Badge>}
      </div>
    </button>
  )
}

export function Board({ s, gaps, onOpen }: { s: ViewState; gaps: Gap[]; onOpen: (id: string) => void }) {
  return (
    <div className="scroll-thin print-full overflow-x-auto pb-4">
      <div className="grid min-w-[1680px] grid-cols-8 gap-3">
        {data.phases.map((p) => {
          const base = baseEntries(p.id, s)
          const cov = coverage(p.id, base, s)
          const shown = base.filter((e) => passesRelevance(e.cell.rating, s.relevance))
          const phaseGaps = gaps.filter((g) => g.phases.includes(p.id)).sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
          const hiddenByRel = base.length - shown.length
          return (
            <section
              key={p.id}
              className={`flex flex-col rounded-lg border bg-slate-50/60 ${
                cov.state === 'empty' ? 'border-gap/30' : cov.state === 'thin' ? 'border-thin/30' : 'border-slate-200'
              } ${cov.state === 'dimmed' ? 'opacity-60' : ''}`}
            >
              <div className="rounded-t-lg bg-white">
                <CoverageHeader phase={p} cov={cov} />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2">
                {phaseGaps.map((g) => <GapCard key={g.id} gap={g} />)}
                {shown.map((e) => <EntryCard key={e.actor.id} e={e} onOpen={onOpen} />)}
                {shown.length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-slate-400">
                    {base.length === 0 ? 'Keine passenden Angebote' : 'Keine Einträge auf dieser Relevanzstufe'}
                  </p>
                )}
                {hiddenByRel > 0 && <p className="px-1 text-[11px] text-slate-400">+ {hiddenByRel} weitere (Relevanzfilter)</p>}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
