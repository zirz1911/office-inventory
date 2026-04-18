import type { ComputerStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: ComputerStatus
}

const statusConfig: Record<ComputerStatus, { bg: string; text: string; dot: string; label: string }> = {
  Active: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
    label: 'Active',
  },
  Maintenance: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
    label: 'Maintenance',
  },
  Retired: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    label: 'Retired',
  },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig['Active']

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
