import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRoutineStore } from '@/store/routineStore'
import { BreathType, BREATH_LABELS, BREATH_COLORS } from '@/types'
import { SegmentSettings, loadSegmentSettings, saveSegmentSettings } from '@/utils/routineHelpers'
import { playMoveStart, playCountTick } from '@/utils/audio'
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Clock, Scissors, Repeat, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type PracticeState = 'idle' | 'playing' | 'paused'

export default function Practice() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { routines, load } = useRoutineStore()

  const [state, setState] = useState<PracticeState>('idle')
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [segmentStart, setSegmentStart] = useState(0)
  const [segmentEnd, setSegmentEnd] = useState(0)
  const [loopSegment, setLoopSegment] = useState(false)
  const [segmentPanelOpen, setSegmentPanelOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastTickSecondRef = useRef(-1)
  const segmentLoadedRef = useRef(false)

  useEffect(() => {
    load()
  }, [load])

  const routine = routines.find((r) => r.id === id)

  useEffect(() => {
    if (routine && routine.moves.length > 0 && !segmentLoadedRef.current) {
      segmentLoadedRef.current = true
      const saved = loadSegmentSettings(routine.id)
      if (saved) {
        setSegmentStart(saved.startIndex)
        setSegmentEnd(saved.endIndex)
        setLoopSegment(saved.loop)
      } else {
        setSegmentStart(0)
        setSegmentEnd(routine.moves.length - 1)
      }
    }
  }, [routine])

  const persistSegment = useCallback((start: number, end: number, loop: boolean) => {
    if (id) {
      saveSegmentSettings(id, { startIndex: start, endIndex: end, loop })
    }
  }, [id])

  const handleSegmentStartChange = useCallback((newStart: number) => {
    const clamped = Math.min(newStart, segmentEnd)
    setSegmentStart(clamped)
    persistSegment(clamped, segmentEnd, loopSegment)
    if (currentMoveIndex < clamped) {
      setCurrentMoveIndex(clamped)
      setElapsed(0)
    }
  }, [segmentEnd, loopSegment, currentMoveIndex, persistSegment])

  const handleSegmentEndChange = useCallback((newEnd: number) => {
    const clamped = Math.max(newEnd, segmentStart)
    setSegmentEnd(clamped)
    persistSegment(segmentStart, clamped, loopSegment)
    if (currentMoveIndex > clamped) {
      setCurrentMoveIndex(clamped)
      setElapsed(0)
    }
  }, [segmentStart, loopSegment, currentMoveIndex, persistSegment])

  const handleLoopToggle = useCallback(() => {
    setLoopSegment((prev) => {
      persistSegment(segmentStart, segmentEnd, !prev)
      return !prev
    })
  }, [segmentStart, segmentEnd, persistSegment])

  const isFullRoutine = segmentStart === 0 && segmentEnd === (routine?.moves.length ?? 0) - 1

  const currentMove = routine?.moves[currentMoveIndex]
  const moveDuration = currentMove?.duration ?? 0
  const remaining = moveDuration - elapsed
  const progress = moveDuration > 0 ? elapsed / moveDuration : 0

  const segmentMoves = routine ? routine.moves.slice(segmentStart, segmentEnd + 1) : []
  const segmentTotalDuration = segmentMoves.reduce((sum, m) => sum + m.duration, 0)

  const segmentElapsed = routine
    ? routine.moves.slice(segmentStart, currentMoveIndex).reduce((sum, m) => sum + m.duration, 0) + elapsed
    : 0

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    lastTickSecondRef.current = -1
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1
        if (currentMove && next >= currentMove.duration) {
          return currentMove.duration
        }
        if (next !== lastTickSecondRef.current && next > 0) {
          lastTickSecondRef.current = next
          playCountTick()
        }
        return next
      })
    }, 1000)
  }, [currentMove, stopTimer])

  useEffect(() => {
    if (state === 'playing' && currentMove) {
      startTimer()
    } else {
      stopTimer()
    }
    return stopTimer
  }, [state, currentMoveIndex, startTimer, stopTimer])

  useEffect(() => {
    if (state !== 'playing' || !currentMove) return
    if (elapsed >= moveDuration) {
      if (currentMoveIndex < segmentEnd) {
        setCurrentMoveIndex((prev) => prev + 1)
        setElapsed(0)
        lastTickSecondRef.current = -1
        setTimeout(() => playMoveStart(), 50)
      } else if (loopSegment) {
        setCurrentMoveIndex(segmentStart)
        setElapsed(0)
        lastTickSecondRef.current = -1
        setTimeout(() => playMoveStart(), 50)
      } else {
        setState('idle')
        setCurrentMoveIndex(segmentStart)
        setElapsed(0)
      }
    }
  }, [elapsed, state, currentMoveIndex, moveDuration, segmentEnd, segmentStart, loopSegment])

  const handlePlay = useCallback(() => {
    if (!routine || routine.moves.length === 0) return
    if (state === 'idle') {
      setCurrentMoveIndex(segmentStart)
      setElapsed(0)
      playMoveStart()
    }
    setState('playing')
  }, [routine, state, segmentStart])

  const handlePause = useCallback(() => {
    setState('paused')
  }, [])

  const handlePrev = useCallback(() => {
    if (!routine) return
    setCurrentMoveIndex((prev) => {
      const next = Math.max(segmentStart, prev - 1)
      return next
    })
    setElapsed(0)
    lastTickSecondRef.current = -1
    if (state === 'playing') {
      playMoveStart()
    }
  }, [routine, state, segmentStart])

  const handleNext = useCallback(() => {
    if (!routine) return
    if (currentMoveIndex < segmentEnd) {
      setCurrentMoveIndex((prev) => prev + 1)
      setElapsed(0)
      lastTickSecondRef.current = -1
      if (state === 'playing') {
        playMoveStart()
      }
    }
  }, [routine, currentMoveIndex, state, segmentEnd])

  const handleReset = useCallback(() => {
    setState('idle')
    setCurrentMoveIndex(segmentStart)
    setElapsed(0)
    lastTickSecondRef.current = -1
  }, [segmentStart])

  const handleMoveClick = useCallback((index: number) => {
    if (index < segmentStart || index > segmentEnd) return
    setCurrentMoveIndex(index)
    setElapsed(0)
    lastTickSecondRef.current = -1
    if (state === 'playing') playMoveStart()
  }, [segmentStart, segmentEnd, state])

  const getBreathCircleColor = (breath: BreathType) => {
    switch (breath) {
      case 'inhale': return 'from-sky-400/30 to-sky-600/10 border-sky-400/40'
      case 'exhale': return 'from-amber-400/30 to-amber-600/10 border-amber-400/40'
      case 'hold': return 'from-rose-400/30 to-rose-600/10 border-rose-400/40'
    }
  }

  if (!routine) {
    return (
      <div className="min-h-full flex items-center justify-center text-rice/30">
        套路不存在
      </div>
    )
  }

  if (routine.moves.length === 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center text-rice/30">
        <p>暂无招式</p>
        <button
          onClick={() => navigate(`/routine/${id}/edit`)}
          className="mt-4 px-4 py-2 bg-jade/15 text-jade rounded-lg hover:bg-jade/25 transition-colors text-sm"
        >
          去添加招式
        </button>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="relative mb-8">
            <div
              className={cn(
                'w-64 h-64 md:w-80 md:h-80 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-700',
                'bg-gradient-to-br',
                currentMove ? getBreathCircleColor(currentMove.breath) : 'from-ink-700/30 to-ink-800/10 border-ink-600/30',
                state === 'playing' && 'animate-pulse-slow'
              )}
            >
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="48"
                  fill="none"
                  stroke="currentColor"
                  className="text-ink-700/30"
                  strokeWidth="0.5"
                />
                <circle
                  cx="50" cy="50" r="48"
                  fill="none"
                  stroke="currentColor"
                  className={cn(
                    currentMove?.breath === 'inhale' && 'text-sky-400',
                    currentMove?.breath === 'exhale' && 'text-amber-400',
                    currentMove?.breath === 'hold' && 'text-rose-400',
                  )}
                  strokeWidth="0.5"
                  strokeDasharray={`${progress * 301.6} 301.6`}
                  strokeLinecap="round"
                />
              </svg>
              {currentMove && (
                <>
                  <span className={cn('text-5xl font-serif font-bold text-rice mb-2', BREATH_COLORS[currentMove.breath])}>
                    {BREATH_LABELS[currentMove.breath]}
                  </span>
                  <span className="text-2xl font-serif font-semibold text-rice">
                    {currentMove.name}
                  </span>
                  <span className="text-4xl font-mono font-bold text-rice/70 mt-3">
                    {Math.max(0, remaining)}
                  </span>
                  {currentMove.note && (
                    <span className="text-xs text-rice/40 mt-2 max-w-40 text-center">{currentMove.note}</span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="p-3 bg-ink-800/60 border border-ink-700/50 rounded-full text-rice/50 hover:text-rice hover:bg-ink-700 transition-colors"
              title="重新开始"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={handlePrev}
              disabled={currentMoveIndex <= segmentStart}
              className="p-3 bg-ink-800/60 border border-ink-700/50 rounded-full text-rice/50 hover:text-rice hover:bg-ink-700 transition-colors disabled:opacity-30"
              title="上一招"
            >
              <SkipBack size={20} />
            </button>
            {state === 'playing' ? (
              <button
                onClick={handlePause}
                className="p-5 bg-cinnabar/20 border-2 border-cinnabar/40 rounded-full text-cinnabar hover:bg-cinnabar/30 transition-colors"
                title="暂停"
              >
                <Pause size={28} />
              </button>
            ) : (
              <button
                onClick={handlePlay}
                className="p-5 bg-cinnabar/20 border-2 border-cinnabar/40 rounded-full text-cinnabar hover:bg-cinnabar/30 transition-colors"
                title="播放"
              >
                <Play size={28} />
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={currentMoveIndex >= segmentEnd}
              className="p-3 bg-ink-800/60 border border-ink-700/50 rounded-full text-rice/50 hover:text-rice hover:bg-ink-700 transition-colors disabled:opacity-30"
              title="下一招"
            >
              <SkipForward size={20} />
            </button>
            <div className="w-12" />
          </div>

          <div className="mt-6 flex items-center gap-2 text-rice/40 text-sm">
            <Clock size={14} />
            <span>{formatTime(segmentElapsed)} / {formatTime(segmentTotalDuration)}</span>
          </div>

          <div className="mt-4">
            <button
              onClick={() => setSegmentPanelOpen((prev) => !prev)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors border',
                !isFullRoutine
                  ? 'bg-cinnabar/10 border-cinnabar/30 text-cinnabar hover:bg-cinnabar/20'
                  : 'bg-ink-800/60 border-ink-700/50 text-rice/50 hover:text-rice/80 hover:bg-ink-700/50'
              )}
            >
              <Scissors size={14} />
              {!isFullRoutine
                ? `片段：${routine.moves[segmentStart]?.name} → ${routine.moves[segmentEnd]?.name}`
                : '片段练习'}
              {segmentPanelOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {segmentPanelOpen && (
            <div className="mt-3 bg-ink-800/80 border border-ink-700/50 rounded-xl p-5 w-full max-w-md">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-rice/40 text-xs mb-1.5 block">起始招式</label>
                  <select
                    value={segmentStart}
                    onChange={(e) => handleSegmentStartChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-rice text-sm focus:outline-none focus:border-cinnabar/50 appearance-none cursor-pointer"
                  >
                    {routine.moves.map((move, i) => (
                      <option key={move.id} value={i} disabled={i > segmentEnd}>
                        {i + 1}. {move.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-rice/40 text-xs mb-1.5 block">结束招式</label>
                  <select
                    value={segmentEnd}
                    onChange={(e) => handleSegmentEndChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-rice text-sm focus:outline-none focus:border-cinnabar/50 appearance-none cursor-pointer"
                  >
                    {routine.moves.map((move, i) => (
                      <option key={move.id} value={i} disabled={i < segmentStart}>
                        {i + 1}. {move.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={handleLoopToggle}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors',
                    loopSegment
                      ? 'bg-jade/15 border-jade/30 text-jade'
                      : 'bg-ink-700/30 border-ink-600/30 text-rice/40 hover:text-rice/70'
                  )}
                >
                  <Repeat size={14} />
                  循环播放
                </button>
                <button
                  onClick={() => {
                    const lastIdx = routine.moves.length - 1
                    setSegmentStart(0)
                    setSegmentEnd(lastIdx)
                    setLoopSegment(false)
                    persistSegment(0, lastIdx, false)
                    setCurrentMoveIndex(0)
                    setElapsed(0)
                    setState('idle')
                  }}
                  className="px-3 py-1.5 text-sm text-rice/40 hover:text-rice/70 transition-colors"
                >
                  重置为全套路
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-56 md:w-72 border-l border-ink-700/50 bg-ink-900/30 overflow-y-auto">
          <div className="p-4 border-b border-ink-700/30">
            <h3 className="text-sm font-medium text-rice/50">招式进度</h3>
          </div>
          <div className="p-2">
            {routine.moves.map((move, index) => {
              const inSegment = index >= segmentStart && index <= segmentEnd
              const isCurrent = index === currentMoveIndex
              const isPast = inSegment && index < currentMoveIndex
              return (
                <div
                  key={move.id}
                  onClick={() => handleMoveClick(index)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm',
                    !inSegment && 'opacity-25 cursor-not-allowed',
                    inSegment && 'cursor-pointer',
                    isCurrent
                      ? 'bg-cinnabar/10 text-rice'
                      : isPast
                      ? 'text-rice/30'
                      : inSegment
                      ? 'text-rice/50 hover:bg-ink-800/40'
                      : 'text-rice/20'
                  )}
                >
                  <span className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs border',
                    isCurrent
                      ? 'border-cinnabar bg-cinnabar/20 text-cinnabar'
                      : isPast
                      ? 'border-ink-600 bg-ink-700/50 text-rice/30'
                      : inSegment
                      ? 'border-ink-600 text-rice/40'
                      : 'border-ink-700 text-rice/15'
                  )}>
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate">{move.name}</span>
                  <span className="text-xs text-rice/25">{move.duration}s</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
