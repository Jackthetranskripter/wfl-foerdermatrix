import raw from './data/matrixData.json'
import type { Actor, ActorStatus, Entry, FounderType, Gap, Level, MatrixData, PhaseId, Rating, ViewState } from './types'

export const data = raw as unknown as MatrixData

export const RATING_ORDER: Rating[] = ['K', 'W', 'R', '?']
const LEVEL_RANK: Record<Level, number> = { LU: 0, ZCH: 1, CH: 2 }
const STATUS_RANK: Record<ActorStatus, number> = { focus: 0, neutral: 0, filter: 1, conditional: 2 }

export const getType = (id: string): FounderType | undefined => data.types.find((t) => t.id === id)
export const actorById = (id: string): Actor | undefined => data.actors.find((a) => a.id === id)

/** Spezialfilter-Akteure (BG-SAFFA, Technologiefonds, RAV) */
const filterActorIds = new Set(data.filters.map((f) => f.actor))

export const primaryLevel = (a: Actor): Level =>
  [...a.ebene].sort((x, y) => LEVEL_RANK[x] - LEVEL_RANK[y])[0]

/** Status eines Akteurs im aktuellen Gründertyp – null = ausgeblendet */
export function actorStatus(actor: Actor, s: ViewState): ActorStatus | null {
  if (!actor.ebene.some((l) => s.levels.includes(l))) return null
  const activeFilterActors = data.filters.filter((f) => s.filters.includes(f.id)).map((f) => f.actor)

  if (s.typeId === 'all') {
    // In der Gesamtübersicht ist alles sichtbar; aktive Spezialfilter werden markiert
    return activeFilterActors.includes(actor.id) ? 'filter' : 'neutral'
  }
  const t = getType(s.typeId)!
  if (activeFilterActors.includes(actor.id)) return 'filter'
  if (t.focus.includes(actor.id)) return 'focus'
  if (t.conditional.includes(actor.id)) return s.onlyFocus ? null : 'conditional'
  return null
}

/** Ist die Zelle eines Akteurs für den Typ explizit ausgeschlossen? */
export function isCellExcluded(actorId: string, phase: PhaseId, typeId: string): boolean {
  if (typeId === 'all') return false
  return getType(typeId)?.excludedCells[actorId]?.includes(phase) ?? false
}

const sortEntries = (a: Entry, b: Entry) =>
  RATING_ORDER.indexOf(a.cell.rating) - RATING_ORDER.indexOf(b.cell.rating) ||
  STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
  LEVEL_RANK[primaryLevel(a.actor)] - LEVEL_RANK[primaryLevel(b.actor)] ||
  a.actor.short.localeCompare(b.actor.short, 'de')

/** Alle Einträge einer Phase vor dem Relevanzfilter (Basis für Abdeckungszählung) */
export function baseEntries(phase: PhaseId, s: ViewState): Entry[] {
  const out: Entry[] = []
  for (const actor of data.actors) {
    const cell = actor.cells[phase]
    if (cell.rating === '–') continue
    const status = actorStatus(actor, s)
    if (!status) continue
    if (isCellExcluded(actor.id, phase, s.typeId)) continue
    out.push({ actor, cell, status })
  }
  return out.sort(sortEntries)
}

export function passesRelevance(r: Rating, rel: ViewState['relevance']): boolean {
  if (rel === 'K') return r === 'K'
  if (rel === 'KW') return r === 'K' || r === 'W'
  return true
}

export interface Coverage {
  k: number
  w: number
  lu: number
  total: number
  state: 'ok' | 'thin' | 'empty' | 'dimmed'
}

export function coverage(phase: PhaseId, entries: Entry[], s: ViewState): Coverage {
  const k = entries.filter((e) => e.cell.rating === 'K').length
  const w = entries.filter((e) => e.cell.rating === 'W').length
  const lu = entries.filter((e) => e.actor.ebene.includes('LU') && (e.cell.rating === 'K' || e.cell.rating === 'W')).length
  const dimmed = s.typeId !== 'all' && (getType(s.typeId)?.dimmedPhases.includes(phase) ?? false)
  const state = dimmed ? 'dimmed' : entries.length === 0 ? 'empty' : k === 0 ? 'thin' : 'ok'
  return { k, w, lu, total: entries.length, state }
}

export function visibleGaps(s: ViewState): Gap[] {
  if (!s.showGaps) return []
  return data.gaps.filter(
    (g) => s.typeId === 'all' || g.types.includes(s.typeId) || g.filters.some((f) => s.filters.includes(f)),
  )
}

export const isFilterActor = (id: string) => filterActorIds.has(id)

/** Relevanz eines Akteurs je Gründertyp (für Detailansicht) */
export function relevanceByType(actorId: string) {
  return data.types.map((t) => ({
    type: t,
    status: t.focus.includes(actorId) ? 'focus' : t.conditional.includes(actorId) ? 'conditional' : isFilterActor(actorId) ? 'filter' : null,
    excluded: t.excludedCells[actorId] ?? [],
  }))
}

export const priorityRank = (p: string) =>
  p.startsWith('Hoch') ? 0 : p.startsWith('Mittel–hoch') ? 1 : p.startsWith('Mittel') ? 2 : 3
