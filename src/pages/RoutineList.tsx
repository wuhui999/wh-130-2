import { useEffect, useState } from 'react'
import { useRoutineStore } from '@/store/routineStore'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, PenLine, Play, Clock, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RoutineList() {
  const { routines, load, addRoutine, deleteRoutine } = useRoutineStore()
  const navigate = useNavigate()
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newName, setNewName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = () => {
    if (!newName.trim()) return
    const routine = addRoutine(newName.trim())
    setNewName('')
    setShowNewDialog(false)
    navigate(`/routine/${routine.id}/edit`)
  }

  const handleDelete = (id: string) => {
    deleteRoutine(id)
    setDeleteConfirm(null)
  }

  const getTotalDuration = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId)
    if (!routine) return 0
    return routine.moves.reduce((sum, m) => sum + m.duration, 0)
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}分${s}秒` : `${s}秒`
  }

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-rice">套路库</h1>
            <p className="text-rice/40 mt-1 text-sm">管理太极拳套路，设置招式节奏</p>
          </div>
          <button
            onClick={() => setShowNewDialog(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-cinnabar hover:bg-cinnabar/80 text-rice rounded-lg transition-colors font-medium text-sm"
          >
            <Plus size={16} />
            新建套路
          </button>
        </div>

        {routines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-rice/30">
            <FolderOpen size={64} strokeWidth={1} />
            <p className="mt-4 text-lg">尚无套路</p>
            <p className="mt-1 text-sm">点击「新建套路」开始创建</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="group bg-ink-800/60 border border-ink-700/50 rounded-xl p-5 hover:border-cinnabar/30 transition-all hover:shadow-lg hover:shadow-cinnabar/5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-semibold text-rice">{routine.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-rice/50">
                      <span className="flex items-center gap-1">
                        <PenLine size={14} />
                        {routine.moves.length} 招
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDuration(getTotalDuration(routine.id))}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(routine.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-rice/30 hover:text-cinnabar transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/routine/${routine.id}/edit`)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm transition-colors',
                      'bg-ink-700/50 text-rice/70 hover:bg-ink-700 hover:text-rice'
                    )}
                  >
                    <PenLine size={14} />
                    编辑
                  </button>
                  <button
                    onClick={() => navigate(`/routine/${routine.id}/rhythm`)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm transition-colors',
                      'bg-jade/10 text-jade hover:bg-jade/20'
                    )}
                  >
                    <Clock size={14} />
                    节奏
                  </button>
                  <button
                    onClick={() => navigate(`/routine/${routine.id}/practice`)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm transition-colors',
                      'bg-cinnabar/10 text-cinnabar hover:bg-cinnabar/20'
                    )}
                  >
                    <Play size={14} />
                    练习
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showNewDialog && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowNewDialog(false)}>
            <div className="bg-ink-800 border border-ink-600 rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-serif font-bold text-rice mb-4">新建套路</h2>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="输入套路名称，如：二十四式简化太极拳"
                className="w-full px-4 py-3 bg-ink-900 border border-ink-600 rounded-lg text-rice placeholder-rice/30 focus:outline-none focus:border-cinnabar/50 transition-colors"
                autoFocus
              />
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowNewDialog(false)}
                  className="flex-1 py-2.5 bg-ink-700 text-rice/70 rounded-lg hover:bg-ink-600 transition-colors text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="flex-1 py-2.5 bg-cinnabar text-rice rounded-lg hover:bg-cinnabar/80 transition-colors text-sm disabled:opacity-40"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-ink-800 border border-ink-600 rounded-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-serif font-bold text-rice mb-2">确认删除</h2>
              <p className="text-rice/50 text-sm mb-5">删除后将无法恢复，确定要删除此套路吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 bg-ink-700 text-rice/70 rounded-lg hover:bg-ink-600 transition-colors text-sm"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2.5 bg-cinnabar text-rice rounded-lg hover:bg-cinnabar/80 transition-colors text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
