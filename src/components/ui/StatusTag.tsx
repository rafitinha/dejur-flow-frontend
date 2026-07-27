import { RequestStatus } from '@/features/requests/types';
import type { ComponentType } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  CircleDashed,
  Clock3,
  FileWarning,
  Send,
  XCircle,
} from 'lucide-react';
import { statusLabels } from '@/config/status';

const styles: Record<RequestStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground border border-border',
  SUBMITTED: 'bg-info/15 text-info border border-info/30',
  PROCESSING: 'bg-warning/15 text-warning border border-warning/35',
  APPROVED: 'bg-success/15 text-success border border-success/35',
  REJECTED: 'bg-danger/15 text-danger border border-danger/35',
  ERROR: 'bg-danger/15 text-danger border border-danger/35',
  NEEDS_CORRECTION: 'bg-warning/15 text-warning border border-warning/35',
  CANCELLED: 'bg-muted text-muted-foreground border border-border',
};

const icons: Record<RequestStatus, ComponentType<{ size?: number }>> = {
  DRAFT: CircleDashed,
  SUBMITTED: Send,
  PROCESSING: Clock3,
  APPROVED: BadgeCheck,
  REJECTED: XCircle,
  ERROR: AlertCircle,
  NEEDS_CORRECTION: FileWarning,
  CANCELLED: CircleDashed,
};

export function StatusTag({ status }: { status: RequestStatus }) {
  const Icon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      <Icon size={12} />
      {statusLabels[status]}
    </span>
  );
}
