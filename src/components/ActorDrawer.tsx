import { useEffect } from 'react'
import type { ViewState } from '../types'
import { actorById, data, getType, isCellExcluded, relevanceByType } from '../logic'
import { Badge, Icon, LevelBadge, RatingPill, RemarkBadge } from './ui'

export function ActorDrawer({ id, s, onClose, onPickType }: { id: string | null; s: ViewState; onClose: () => void; onPickType: (t: string) => void }) {
  const a = id ? actorById(id) : undefined
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  if (!a) return null
  const t = getType(s.typeId)
  const rel = relevanceByType(a.id)

  return (
    <div className="no-print fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <header className="border-b border-slate-200 px-6 pb-4 pt-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{a.group}</p>
              <h2 id="drawer-title" className="mt-1 text-lg font-semibold leading-snug text-ink">{a.name}</h2>
            </div>
            <button onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Schliessen">
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {a.ebene.map((l) => <LevelBadge key={l} l={l} />)}
            {a.isNew && <Badge tone="new">NEU</Badge>}
            <RemarkBadge type={a.remarkType} />
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
            <div><dt className="text-slate-400">Ebene (Original)</dt><dd className="mt-0.5 font-medium text-slate-700">{a.ebeneOriginal}</dd></div>
            <div><dt className="text-slate-400">Segment</dt><dd className="mt-0.5 font-medium text-slate-700">{a.segment}</dd></div>
            <div><dt className="text-slate-400">In alter Matrix?</dt><dd className="mt-0.5 font-medium text-slate-700">{a.inOldMatrix}</dd></div>
          </dl>
        </header>

        <div className="scroll-thin flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {a.remark && (
            <div className={`rounded-md px-3 py-2.5 text-sm leading-relaxed ${a.remarkType === 'zu verifizieren' ? 'bg-q-soft text-slate-800' : 'bg-slate-50 text-slate-700'}`}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Bemerkung{a.remarkType === 'zu verifizieren' ? ' / zu verifizieren' : ''}</p>
              {a.remark}
            </div>
          )}

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Angebote über alle Phasen</h3>
            <ol className="mt-2 divide-y divide-slate-100 rounded-md border border-slate-200">
              {data.phases.map((p) => {
                const c = a.cells[p.id]
                const excl = t ? isCellExcluded(a.id, p.id, t.id) : false
                return (
                  <li key={p.id} className={`flex gap-3 px-3 py-2.5 ${c.rating === '–' ? 'opacity-50' : ''}`}>
                    <div className="w-36 shrink-0">
                      <span className="text-xs font-bold text-accent">{p.id}</span>
                      <span className="ml-1 text-xs text-slate-600">{p.label.replace(/\s*\(.*\)$/, '')}</span>
                    </div>
                    <RatingPill r={c.rating} />
                    <div className="min-w-0 flex-1 text-sm leading-snug text-slate-700">
                      {c.text || <span className="text-slate-400">{data.ratings[c.rating].label}</span>}
                      {excl && c.rating !== '–' && <p className="mt-0.5 text-[11px] text-slate-400">Für «{t!.short}» ausgeblendet</p>}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Relevanz je Gründertyp</h3>
            <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {rel.map(({ type, status, excluded }) => (
                <li key={type.id}>
                  <button
                    onClick={() => onPickType(type.id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition hover:border-accent/40 ${
                      type.id === s.typeId ? 'border-accent bg-accent-soft' : 'border-slate-200'
                    }`}
                  >
                    <span className="font-medium text-slate-700">{type.short}</span>
                    <span className="flex items-center gap-1">
                      {status === 'focus' && <Badge tone="ok">Fokus</Badge>}
                      {status === 'conditional' && <Badge tone="cond">bedingt</Badge>}
                      {status === 'filter' && <Badge tone="filter">via Zusatzfilter</Badge>}
                      {!status && <span className="text-slate-400">–</span>}
                      {status && excluded.length > 0 && <span className="text-[10px] text-slate-400" title="Für diesen Typ ausgeblendete Phasen">ohne {excluded.join(', ')}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {a.sources && (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Quellen (Recherche 11/2026)</h3>
              <ul className="mt-2 space-y-1">
                {a.sources.map((q) => (
                  <li key={q.url}>
                    <a href={q.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
                      <Icon name="link" className="h-3.5 w-3.5" /> {q.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </aside>
    </div>
  )
}
