import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRoutineStore } from '@/store/routineStore'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2, Clock, Play, X, Check } from 'lucide-react'
import { Move } from '@/types'
import { cn } from '@/lib/utils'

function SortableMoveItem({ move, onDelete, onNameUpdate }: { move: Move; onDelete: () => void; onNameUpdate: (name: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: move.id })
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(move.name)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSave = useCallback(() => {
    if (editName.trim()) {
      onNameUpdate(editName.trim())
    }
    setEditing(false)
  }, [editName, onNameUpdate])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 bg-ink-800/60 border border-ink-700/50 rounded-lg px-4 py-3 group',
        isDragging && 'opacity-50 shadow-xl shadow-cinnabar/10 border-cinnabar/30'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-rice/30 hover:text-rice/60 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={18} />
      </button>
      <span className="text-rice/30 text-sm w-6 text-center font-mono">{move.order}</span>

      {editing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') { setEditing(false); setEditName(move.name) }
            }}
            className="flex-1 px-2 py-1 bg-ink-900 border border-ink-600 rounded text-rice text-sm focus:outline-none focus:border-cinnabar/50"
            autoFocus
          />
          <button onClick={handleSave} className="text-jade hover:text-jade/80"><Check size={16} /></button>
          <button onClick={() => { setEditing(false); setEditName(move.name) }} className="text-rice/40 hover:text-rice/60"><X size={16} /></button>
        </div>
      ) : (
        <span
          className="flex-1 text-rice cursor-pointer hover:text-cinnabar transition-colors"
          onClick={() => { setEditing(true); setEditName(move.name) }}
        >
          {move.name}
        </span>
      )}

      <span className="text-rice/30 text-xs">{move.duration}s</span>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-rice/30 hover:text-cinnabar transition-all"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

export default function RoutineEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { routines, load, addMove, deleteMove, updateMove, reorderMoves } = useRoutineStore()
  const [newMoveName, setNewMoveName] = useState('')

  useEffect(() => {
    load()
  }, [load])

  const routine = routines.find((r) => r.id === id)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (!routine) return
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = routine.moves.findIndex((m) => m.id === active.id)
    const newIndex = routine.moves.findIndex((m) => m.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(routine.moves, oldIndex, newIndex)
    reorderMoves(routine.id, reordered)
  }, [routine, reorderMoves])

  const handleAddMove = useCallback(() => {
    if (!id || !newMoveName.trim()) return
    addMove(id, newMoveName.trim())
    setNewMoveName('')
  }, [id, newMoveName, addMove])

  if (!routine) {
    return (
      <div className="min-h-full flex items-center justify-center text-rice/30">
        套路不存在
      </div>
    )
  }

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-rice">{routine.name}</h1>
          <p className="text-rice/40 mt-1 text-sm">编辑招式序列，拖拽调整顺序</p>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newMoveName}
            onChange={(e) => setNewMoveName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMove()}
            placeholder="输入招式名称，如：起势"
            className="flex-1 px-4 py-2.5 bg-ink-800 border border-ink-700/50 rounded-lg text-rice placeholder-rice/30 focus:outline-none focus:border-cinnabar/50 transition-colors text-sm"
          />
          <button
            onClick={handleAddMove}
            disabled={!newMoveName.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-jade/15 text-jade rounded-lg hover:bg-jade/25 transition-colors text-sm disabled:opacity-40"
          >
            <Plus size={16} />
            添加
          </button>
        </div>

        {routine.moves.length === 0 ? (
          <div className="text-center py-16 text-rice/30">
            <p>暂无招式</p>
            <p className="text-sm mt-1">在上方输入招式名称添加</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={routine.moves.map((m) => m.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {routine.moves.map((move) => (
                  <SortableMoveItem
                    key={move.id}
                    move={move}
                    onDelete={() => id && deleteMove(id, move.id)}
                    onNameUpdate={(name) => id && updateMove(id, move.id, { name })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {routine.moves.length > 0 && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate(`/routine/${routine.id}/rhythm`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-jade/15 text-jade rounded-lg hover:bg-jade/25 transition-colors text-sm"
            >
              <Clock size={16} />
              设置节奏
            </button>
            <button
              onClick={() => navigate(`/routine/${routine.id}/practice`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-cinnabar/15 text-cinnabar rounded-lg hover:bg-cinnabar/25 transition-colors text-sm"
            >
              <Play size={16} />
              开始练习
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
