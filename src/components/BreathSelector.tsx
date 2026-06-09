import { BreathType, BREATH_LABELS, BREATH_BG, BREATH_COLORS } from '@/types'
import { cn } from '@/lib/utils'

interface BreathSelectorProps {
  value: BreathType
  onChange: (breath: BreathType) => void
}

const options: BreathType[] = ['inhale', 'exhale', 'hold']

export default function BreathSelector({ value, onChange }: BreathSelectorProps) {
  return (
    <div className="flex gap-1.5">
      {options.map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            'px-3 py-1 rounded-md text-xs font-medium border transition-all',
            value === type
              ? BREATH_BG[type] + ' ' + BREATH_COLORS[type]
              : 'bg-ink-700/30 border-ink-600/30 text-rice/40 hover:text-rice/70'
          )}
        >
          {BREATH_LABELS[type]}
        </button>
      ))}
    </div>
  )
}
