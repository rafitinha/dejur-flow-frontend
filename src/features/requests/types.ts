import { WizardFormData } from '@/components/forms/checklist/wizard/types';
import type { ExistingDocument } from '@/types/upload';

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

export type RequestCompany = {
  name: string;
  cnpj: string;
  uf: string;
  city: string;
};

export type RequestDebtor = {
  name: string;
  cnpj: string;
  uf: string;
  city: string;
};

export type RequestFinancial = {
  amount: number;
  currency: string;
  dueDate: string;
};

export type AgreementAttempt = {
  date: string;
  channel: string;
  result: string;
};

export type RequestOpinion = {
  recommendedAction: string;
  details?: string;
};

export type RequestDocument = {
  documentId?: string;
  name?: string;
  type?: string;
  size?: number;
  uploadedAt?: string;
  downloadUrl?: string;
};

export type RequestSpecificData =
  | {
      checklistType: 'RECUPERACAO_VASILHAMES';
      data: {
        p13Quantity?: number;
        p20Quantity?: number;
        p45Quantity?: number;
        historicalAmount?: string;
        updatedAmount?: string;
        reason?: string;
        confirmationRole?: string;
        confirmationDate?: string;
      };
    }
  | {
      checklistType: 'COBRANCA_TITULOS';
      data: {
        titleType?: string;
        titleNumber?: string;
        guarantor?: string;
        otherGuarantees?: string;
        confirmationRole?: string;
        confirmationDate?: string;
      };
    }
  | {
      checklistType: 'COBRANCA_MULTA_CONTRATUAL';
      data: {
        contractType?: string;
        breachedClause?: string;
        firstCycleFinished?: boolean | string;
        maxDiscount?: string;
        confirmationRole?: string;
        confirmationDate?: string;
        value?: string;
        index?: string;
        updatedAt?: string;
      };
    };

export type JudicialRequestDetail = {
  requestId: string;
  status: RequestStatus;
  checklistType: ChecklistType;

  createdBy: {
    name: string;
    email: string;
  };

  createdAt?: string;
  updatedAt?: string;

  company: RequestCompany;
  debtor: RequestDebtor;
  financial: RequestFinancial;
  agreementAttempts: AgreementAttempt[];

  factsSummary: string;

  opinion: RequestOpinion;

  documents: RequestDocument[];

  clientValidation: {
    approvedByClient: boolean;
  };

  history: Array<{
    at: string;
    from: string;
    to: string;
  }>;

  /**
   * Request-specific data
   */
  data: RequestSpecificData;

  llmResult?: {
    requestId: string;
    status: RequestStatus;
    score: number;
    summary: string;
    structuredReport: Record<string, unknown>;
    missingFields: string[];
    missingDocuments: string[];
    inconsistencies: string[];
    recommendations: string[];
    canResubmit: boolean;
    reviewedAt: string;
  };
};

export type StructuredReport = {
  checklistType?: string;
  debtor?: string;
  amount?: number;
  mainFacts?: string[];
  legalReadiness?: string;
};

export type JudicialRequestDetailType = {
  requestId: string;
  status: RequestStatus;
  score?: number;
  summary?: string;
  structuredReport?: StructuredReport;
  missingFields?: string[];
  missingDocuments?: string[];
  inconsistencies?: string[];
  recommendations?: string[];
  canResubmit?: boolean;
  reviewedAt?: string;
  checklistType?: ChecklistType;
  debtorName?: string;
  debtorCnpj?: string;
  createdAt?: string;
  updatedAt?: string;
  createdByEmail?: string;
  llmScore?: number;
  documents?: ExistingDocument[];
  formData?: Partial<WizardFormData>;
};
