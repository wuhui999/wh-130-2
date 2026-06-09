export type BreathType = 'inhale' | 'exhale' | 'hold'

export interface Move {
  id: string
  name: string
  order: number
  duration: number
  breath: BreathType
  note: string
}

export interface Routine {
  id: string
  name: string
  moves: Move[]
  createdAt: number
  updatedAt: number
}

export interface RoutineExportFormat {
  version: string
  routine: {
    name: string
    moves: Array<{
      name: string
      order: number
      duration: number
      breath: BreathType
      note: string
    }>
  }
}

export const BREATH_LABELS: Record<BreathType, string> = {
  inhale: '吸',
  exhale: '呼',
  hold: '闭',
}

export const BREATH_COLORS: Record<BreathType, string> = {
  inhale: 'text-sky-400',
  exhale: 'text-amber-400',
  hold: 'text-rose-400',
}

export const BREATH_BG: Record<BreathType, string> = {
  inhale: 'bg-sky-400/15 border-sky-400/30',
  exhale: 'bg-amber-400/15 border-amber-400/30',
  hold: 'bg-rose-400/15 border-rose-400/30',
}
