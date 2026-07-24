import { RequestStatus } from '@/features/requests/types';
export const statusLabels: Record<RequestStatus, string> = {
  DRAFT: 'Rascunho',
  SUBMITTED: 'Submetida',
  PROCESSING: 'Processando',
  APPROVED: 'Aprovada',
  REJECTED: 'Reprovada',
  ERROR: 'Erro',
  NEEDS_CORRECTION: 'Necessita correção',
  CANCELLED: 'Cancelada',
};
export const editableStatuses: RequestStatus[] = [
  'DRAFT',
  'ERROR',
  'NEEDS_CORRECTION',
];
