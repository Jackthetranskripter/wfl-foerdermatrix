import type { Actor, Gap, Level, ViewState } from '../types'
import { actorStatus, baseEntries, coverage, data, isCellExcluded, passesRelevance, primaryLevel } from '../logic'
import { CoverageHeader, GapCard } from './Board'
import { Badge, LevelBadge, RatingPill, RemarkBadge, ratingStyle } from './ui'

const GROUPS: { id: Level; label: string }[] = [
  { id: 'LU', label: 'Kanton Luzern' },
  { id: 'ZCH', label: 'Zentralschweiz' },
  { id: 'CH', label: 'Schweiz (national)' },
]

export function TableView({ s, gaps, onOpen }: { s: ViewState; gaps: Gap[]; onOpen: (id: string) => void }) {
  const visible = data.actors
    .map((a) => ({ a, status: actorStatus(a, s) }))
    .filter(
      (x): x is { a: Actor; status: NonNullable<typeof x.status> } =>
        x.status !== null &&
        data.phases.some((p) => {
          const c = x.a.cells[p.id]
          return c.rating !== '–' && !isCellExcluded(x.a.id, p.id, s.typeId) && passesRelevance(c.rating, s.relevance)
        }),
    )
  const covs = Object.fromEntries(data.phases.map((p) => [p.id, coverage(p.id, baseEntries(p.id, s), s)]))

  return (
    <div className="scroll-thin print-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[1500px] border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-white">
          <tr>
            <th className="w-64 border-b border-slate-200 px-3 py-2 align-bottom text-xs font-semibold text-slate-500">Akteur</th>
            {data.phases.map((p) => (
              <th key={p.id} className={`border-b border-l border-slate-200 p-0 align-top font-normal ${covs[p.id].state === 'dimmed' ? 'opacity-60' : ''}`}>
                <CoverageHeader phase={p} cov={covs[p.id]} compact />
              </th>
            ))}
          </tr>
          {gaps.some((g) => g.phases.length) && (
            <tr className="bg-gap-soft/40">
              <td className="border-b border-slate-200 px-3 py-2 align-top text-xs font-semibold text-gap">Ökosystem-Lücken</td>
              {data.phases.map((p) => (
                <td key={p.id} className="space-y-1.5 border-b border-l border-slate-200 p-1.5 align-top">
                  {gaps.filter((g) => g.phases.includes(p.id)).map((g) => <GapCard key={g.id} gap={g} compact />)}
                </td>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {GROUPS.map((grp) => {
            const rows = visible.filter((x) => primaryLevel(x.a) === grp.id)
            if (!rows.length) return null
            return [
              <tr key={grp.id}>
                <td colSpan={9} className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {grp.label} <span className="font-normal normal-case tracking-normal text-slate-400">· {rows.length} Akteure</span>
                </td>
              </tr>,
              ...rows.map(({ a, status }) => (
                <tr key={a.id} className="group hover:bg-slate-50/70">
                  <th scope="row" className="border-b border-slate-100 px-3 py-2 align-top font-normal">
                    <button onClick={() => onOpen(a.id)} className="text-left">
                      <span className={`text-[13px] font-semibold leading-tight hover:text-accent ${status === 'conditional' ? 'text-slate-600' : 'text-ink'}`}>
                        {a.short}
                        {status === 'conditional' && <span className="text-slate-400">°</span>}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        {a.ebene.map((l) => <LevelBadge key={l} l={l} />)}
                        {a.isNew && <Badge tone="new">NEU</Badge>}
                        <RemarkBadge type={a.remarkType} />
                        {status === 'filter' && <Badge tone="filter">{data.filters.find((f) => f.actor === a.id)?.label}</Badge>}
                      </span>
                    </button>
                  </th>
                  {data.phases.map((p) => {
                    const c = a.cells[p.id]
                    const excluded = isCellExcluded(a.id, p.id, s.typeId)
                    const show = c.rating !== '–' && !excluded && passesRelevance(c.rating, s.relevance)
                    return (
                      <td
                        key={p.id}
                        onClick={() => onOpen(a.id)}
                        className={`cursor-pointer border-b border-l border-slate-100 px-2 py-2 align-top ${show ? ratingStyle[c.rating].soft : ''}`}
                        title={excluded ? 'Für diesen Gründertyp ausgeblendet' : undefined}
                      >
                        {show ? (
                          <div className="flex items-start gap-1.5">
                            <RatingPill r={c.rating} />
                            <span className={`text-[11px] leading-snug ${status === 'conditional' ? 'text-slate-500' : 'text-slate-700'}`}>{c.text}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">{c.rating !== '–' && excluded ? '·' : ''}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )),
            ]
          })}
          {visible.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-10 text-center text-sm text-slate-400">Keine Akteure für diese Filterkombination.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
