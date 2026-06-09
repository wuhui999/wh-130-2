import { BreathType, BREATH_LABELS, BREATH_COLORS } from '@/types'
import { cn } from '@/lib/utils'

interface BreathIndicatorProps {
  breath: BreathType
  size?: 'sm' | 'lg'
}

export default function BreathIndicator({ breath, size = 'sm' }: BreathIndicatorProps) {
  const sizeClasses = size === 'lg' ? 'text-2xl font-bold' : 'text-xs font-medium'
  return (
    <span className={cn(BREATH_COLORS[breath], sizeClasses)}>
      {BREATH_LABELS[breath]}
    </span>
  )
}
