import { create } from 'zustand'
import { Routine, Move, BreathType } from '@/types'
import { loadRoutines, saveRoutines, createRoutine, createMove, importRoutine, exportRoutine } from '@/utils/routineHelpers'

interface RoutineStore {
  routines: Routine[]
  load: () => void
  addRoutine: (name: string) => Routine
  deleteRoutine: (id: string) => void
  updateRoutineName: (id: string, name: string) => void
  getRoutine: (id: string) => Routine | undefined
  addMove: (routineId: string, name: string) => void
  deleteMove: (routineId: string, moveId: string) => void
  updateMove: (routineId: string, moveId: string, updates: Partial<Pick<Move, 'name' | 'duration' | 'breath' | 'note'>>) => void
  reorderMoves: (routineId: string, moves: Move[]) => void
  importRoutineFromJson: (json: string) => { success: boolean; error?: string }
  exportRoutineAsJson: (routineId: string) => string | null
  getTotalDuration: (routineId: string) => number
}

export const useRoutineStore = create<RoutineStore>((set, get) => ({
  routines: [],

  load: () => {
    const routines = loadRoutines()
    set({ routines })
  },

  addRoutine: (name: string) => {
    const routine = createRoutine(name)
    const routines = [...get().routines, routine]
    saveRoutines(routines)
    set({ routines })
    return routine
  },

  deleteRoutine: (id: string) => {
    const routines = get().routines.filter((r) => r.id !== id)
    saveRoutines(routines)
    set({ routines })
  },

  updateRoutineName: (id: string, name: string) => {
    const routines = get().routines.map((r) =>
      r.id === id ? { ...r, name, updatedAt: Date.now() } : r
    )
    saveRoutines(routines)
    set({ routines })
  },

  getRoutine: (id: string) => {
    return get().routines.find((r) => r.id === id)
  },

  addMove: (routineId: string, name: string) => {
    const routines = get().routines.map((r) => {
      if (r.id !== routineId) return r
      const order = r.moves.length + 1
      const move = createMove(name, order)
      return { ...r, moves: [...r.moves, move], updatedAt: Date.now() }
    })
    saveRoutines(routines)
    set({ routines })
  },

  deleteMove: (routineId: string, moveId: string) => {
    const routines = get().routines.map((r) => {
      if (r.id !== routineId) return r
      const moves = r.moves
        .filter((m) => m.id !== moveId)
        .map((m, i) => ({ ...m, order: i + 1 }))
      return { ...r, moves, updatedAt: Date.now() }
    })
    saveRoutines(routines)
    set({ routines })
  },

  updateMove: (routineId: string, moveId: string, updates: Partial<Pick<Move, 'name' | 'duration' | 'breath' | 'note'>>) => {
    const routines = get().routines.map((r) => {
      if (r.id !== routineId) return r
      const moves = r.moves.map((m) =>
        m.id === moveId ? { ...m, ...updates } : m
      )
      return { ...r, moves, updatedAt: Date.now() }
    })
    saveRoutines(routines)
    set({ routines })
  },

  reorderMoves: (routineId: string, moves: Move[]) => {
    const routines = get().routines.map((r) =>
      r.id === routineId ? { ...r, moves, updatedAt: Date.now() } : r
    )
    saveRoutines(routines)
    set({ routines })
  },

  importRoutineFromJson: (json: string) => {
    const result = importRoutine(json)
    if (result.success && result.routine) {
      const routines = [...get().routines, result.routine]
      saveRoutines(routines)
      set({ routines })
      return { success: true }
    }
    return { success: false, error: result.error }
  },

  exportRoutineAsJson: (routineId: string) => {
    const routine = get().routines.find((r) => r.id === routineId)
    if (!routine) return null
    return JSON.stringify(exportRoutine(routine), null, 2)
  },

  getTotalDuration: (routineId: string) => {
    const routine = get().routines.find((r) => r.id === routineId)
    if (!routine) return 0
    return routine.moves.reduce((sum, m) => sum + m.duration, 0)
  },
}))
