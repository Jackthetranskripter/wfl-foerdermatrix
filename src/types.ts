export type Rating = 'K' | 'W' | 'R' | '?' | '–'
export type Level = 'LU' | 'ZCH' | 'CH'
export type PhaseId = 'P0' | 'P1' | 'P2' | 'P3a' | 'P3b' | 'P4' | 'P5' | 'P6'

export interface Cell {
  rating: Rating
  text: string
}

export interface Actor {
  id: string
  name: string
  short: string
  group: string
  ebene: Level[]
  ebeneOriginal: string
  segment: string
  inOldMatrix: string
  isNew: boolean
  remark: string | null
  remarkType: 'Bemerkung' | 'zu verifizieren' | 'verifiziert' | null
  sources?: { label: string; url: string }[]
  cells: Record<PhaseId, Cell>
}

export interface Phase {
  id: PhaseId
  label: string
  title: string
  description: string
}

export interface FounderType {
  id: string
  label: string
  short: string
  description: string
  criteria: string
  focus: string[]
  conditional: string[]
  excludedCells: Record<string, PhaseId[]>
  dimmedPhases: PhaseId[]
  hint: string | null
}

export interface SpecialFilter {
  id: string
  label: string
  actor: string
  description: string
}

export interface Gap {
  id: number
  phaseOriginal: string
  phases: PhaseId[]
  crossPhase: boolean
  segment: string
  title: string
  evidence: string
  priority: string
  measure: string
  lead: string
  effort: string
  types: string[]
  filters: string[]
}

export interface MatrixData {
  meta: { title: string; source: string; stand: string; legend: string; readingNote: string }
  ratings: Record<Rating, { label: string }>
  levels: { id: Level; label: string }[]
  phases: Phase[]
  types: FounderType[]
  filters: SpecialFilter[]
  gaps: Gap[]
  actors: Actor[]
}

export type Relevance = 'all' | 'KW' | 'K'
export type ActorStatus = 'focus' | 'conditional' | 'filter' | 'neutral'

export interface ViewState {
  typeId: string // 'all' = Gesamtübersicht
  levels: Level[]
  relevance: Relevance
  filters: string[]
  onlyFocus: boolean
  showGaps: boolean
  view: 'board' | 'table'
}

export interface Entry {
  actor: Actor
  cell: Cell
  status: ActorStatus
}
