import { RequestStatus } from '@/features/requests/types';
import { statusLabels } from '@/config/status';
const styles: Record<RequestStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  ERROR: 'bg-red-100 text-red-700',
  NEEDS_CORRECTION: 'bg-orange-100 text-orange-700',
  CANCELLED: 'bg-slate-200 text-slate-500',
};
export function StatusTag({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
