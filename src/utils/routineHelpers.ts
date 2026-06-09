import { Routine, Move, BreathType, RoutineExportFormat } from '@/types'

const STORAGE_KEY = 'taichi-routines'
const SEGMENT_STORAGE_KEY = 'taichi-practice-segments'

export interface SegmentSettings {
  startMoveId: string
  endMoveId: string
  loop: boolean
}

export function loadSegmentSettings(routineId: string): SegmentSettings | null {
  try {
    const data = localStorage.getItem(SEGMENT_STORAGE_KEY)
    if (!data) return null
    const all: Record<string, SegmentSettings> = JSON.parse(data)
    return all[routineId] ?? null
  } catch {
    return null
  }
}

export function saveSegmentSettings(routineId: string, settings: SegmentSettings): void {
  try {
    const data = localStorage.getItem(SEGMENT_STORAGE_KEY)
    const all: Record<string, SegmentSettings> = data ? JSON.parse(data) : {}
    all[routineId] = settings
    localStorage.setItem(SEGMENT_STORAGE_KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

function loadRoutines(): Routine[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveRoutines(routines: Routine[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routines))
}

export function createRoutine(name: string): Routine {
  return {
    id: generateId(),
    name,
    moves: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function createMove(name: string, order: number): Move {
  return {
    id: generateId(),
    name,
    order,
    duration: 5,
    breath: 'exhale' as BreathType,
    note: '',
  }
}

export function exportRoutine(routine: Routine): RoutineExportFormat {
  const sortedMoves = [...routine.moves].sort((a, b) => a.order - b.order)
  return {
    version: '1.0',
    routine: {
      name: routine.name,
      moves: sortedMoves.map((m) => ({
        name: m.name,
        order: m.order,
        duration: m.duration,
        breath: m.breath,
        note: m.note,
      })),
    },
  }
}

export interface ImportResult {
  success: boolean
  error?: string
  routine?: Routine
}

export function importRoutine(json: string): ImportResult {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    return { success: false, error: 'JSON 格式无效，请检查输入' }
  }

  if (!data || typeof data !== 'object') {
    return { success: false, error: '数据格式错误：需要一个对象' }
  }

  const obj = data as Record<string, unknown>

  if (obj.version !== '1.0') {
    return { success: false, error: '版本不兼容：需要 version "1.0"' }
  }

  if (!obj.routine || typeof obj.routine !== 'object') {
    return { success: false, error: '缺少 routine 字段' }
  }

  const routine = obj.routine as Record<string, unknown>

  if (typeof routine.name !== 'string' || !routine.name.trim()) {
    return { success: false, error: '套路名称不能为空' }
  }

  if (!Array.isArray(routine.moves) || routine.moves.length === 0) {
    return { success: false, error: '招式列表不能为空' }
  }

  const validBreathTypes: BreathType[] = ['inhale', 'exhale', 'hold']

  for (let i = 0; i < routine.moves.length; i++) {
    const move = routine.moves[i] as Record<string, unknown>
    if (typeof move.name !== 'string' || !move.name.trim()) {
      return { success: false, error: `第 ${i + 1} 招名称不能为空` }
    }
    if (typeof move.duration !== 'number' || move.duration <= 0) {
      return { success: false, error: `第 ${i + 1} 招 "${move.name}" 时长必须为正数` }
    }
    if (!validBreathTypes.includes(move.breath as BreathType)) {
      return { success: false, error: `第 ${i + 1} 招 "${move.name}" 呼吸类型无效` }
    }
  }

  const importedMoves = (routine.moves as Array<Record<string, unknown>>)
    .map((m, i) => ({
      name: m.name as string,
      order: typeof m.order === 'number' ? m.order : i + 1,
      duration: m.duration as number,
      breath: m.breath as BreathType,
      note: (m.note as string) || '',
    }))
    .sort((a, b) => a.order - b.order)

  const newRoutine: Routine = {
    id: generateId(),
    name: routine.name,
    moves: importedMoves.map((m, i) => ({
      id: generateId(),
      name: m.name,
      order: i + 1,
      duration: m.duration,
      breath: m.breath,
      note: m.note,
    })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  return { success: true, routine: newRoutine }
}

export { loadRoutines, saveRoutines, generateId }
