export type ChecklistType =
  'RECUPERACAO_VASILHAMES' | 'COBRANCA_TITULOS' | 'COBRANCA_MULTA_CONTRATUAL';
export type RequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ERROR'
  | 'NEEDS_CORRECTION'
  | 'CANCELLED';
export type Role = 'USER' | 'DEJUR' | 'ADMIN';

export interface JudicialRequestListItem {
  requestId: string;
  checklistType: ChecklistType;
  debtorName: string;
  debtorCnpj: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  createdByEmail: string;
  llmScore?: number;
}
