import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive';
  className?: string;
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  trialing: {
    label: 'Trialing',
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  canceled: {
    label: 'Canceled',
    className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  },
  past_due: {
    label: 'Past Due',
    className: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
