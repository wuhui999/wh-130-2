import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRoutineStore } from '@/store/routineStore'
import BreathSelector from '@/components/BreathSelector'
import BreathIndicator from '@/components/BreathIndicator'
import { Play, ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RhythmEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { routines, load, updateMove } = useRoutineStore()

  useEffect(() => {
    load()
  }, [load])

  const routine = routines.find((r) => r.id === id)

  if (!routine) {
    return (
      <div className="min-h-full flex items-center justify-center text-rice/30">
        套路不存在
      </div>
    )
  }

  const totalDuration = routine.moves.reduce((sum, m) => sum + m.duration, 0)
  const formatTotal = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}分${s}秒` : `${s}秒`
  }

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-rice">{routine.name}</h1>
          <p className="text-rice/40 mt-1 text-sm">为每招设置时长、呼吸和备注</p>
        </div>

        {routine.moves.length === 0 ? (
          <div className="text-center py-16 text-rice/30">
            <p>暂无招式</p>
            <p className="text-sm mt-1">请先在编辑页添加招式</p>
            <button
              onClick={() => navigate(`/routine/${id}/edit`)}
              className="mt-4 px-4 py-2 bg-jade/15 text-jade rounded-lg hover:bg-jade/25 transition-colors text-sm"
            >
              去添加招式
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {routine.moves.map((move, index) => (
                <div
                  key={move.id}
                  className="bg-ink-800/60 border border-ink-700/50 rounded-xl p-5 hover:border-ink-600/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-rice/25 font-mono text-sm w-6 text-center">{index + 1}</span>
                    <h3 className="text-rice font-serif font-semibold flex-1">{move.name}</h3>
                    <BreathIndicator breath={move.breath} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4">
                    <div>
                      <label className="text-rice/40 text-xs mb-2 block">时长（秒）</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={1}
                          max={60}
                          step={1}
                          value={move.duration}
                          onChange={(e) => id && updateMove(id, move.id, { duration: Number(e.target.value) })}
                          className="flex-1 accent-cinnabar h-1.5 cursor-pointer"
                        />
                        <input
                          type="number"
                          min={1}
                          max={300}
                          value={move.duration}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value))
                            id && updateMove(id, move.id, { duration: val })
                          }}
                          className="w-16 px-2 py-1.5 bg-ink-900 border border-ink-600 rounded text-rice text-center text-sm focus:outline-none focus:border-cinnabar/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-rice/40 text-xs mb-2 block">呼吸</label>
                      <BreathSelector
                        value={move.breath}
                        onChange={(breath) => id && updateMove(id, move.id, { breath })}
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="text-rice/40 text-xs mb-2 block">备注</label>
                      <input
                        type="text"
                        value={move.note}
                        onChange={(e) => id && updateMove(id, move.id, { note: e.target.value })}
                        placeholder="动作要点..."
                        className="w-full md:w-48 px-3 py-1.5 bg-ink-900 border border-ink-600 rounded text-rice text-sm placeholder-rice/20 focus:outline-none focus:border-cinnabar/50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-ink-800/40 border border-ink-700/30 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rice/60">
                  <Clock size={18} />
                  <span className="text-sm">总时长</span>
                </div>
                <span className="text-xl font-serif font-bold text-cinnabar">{formatTotal(totalDuration)}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate(`/routine/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-ink-700/50 text-rice/70 rounded-lg hover:bg-ink-700 hover:text-rice transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                编辑招式
              </button>
              <button
                onClick={() => navigate(`/routine/${id}/practice`)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 bg-cinnabar/15 text-cinnabar rounded-lg hover:bg-cinnabar/25 transition-colors text-sm'
                )}
              >
                <Play size={16} />
                开始练习
              </button>
              <button
                onClick={() => navigate(`/routine/${id}/export`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-ink-700/50 text-rice/70 rounded-lg hover:bg-ink-700 hover:text-rice transition-colors text-sm"
              >
                <ArrowRight size={16} />
                导出
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
