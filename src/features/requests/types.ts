import { WizardFormData } from '@/components/forms/checklist/wizard/types';
import { ExistingDocument } from '@/components/forms/checklist/ChecklistWizard';
import { SET_TIMEOUT_MAX_ALLOWED_INT } from 'node_modules/msw/lib/core/delay.mjs';
import { cobrancaTitulosSchema } from '@/config/checklistSchemas';

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
};

export type RequestDocument = {
  name?: string;
  type?: string;
  size?: number;
  uploadedAt?: string;
  downloadUrl?: string;
};

export type RequestSpecificData =
  | {
      checklistType: 'CYLINDER_RECOVERY';
      data: {
        p13Quantity: number;
        p20Quantity: number;
        p45Quantity: number;
        historicalAmount: string;
        updatedAmount: string;
      };
    }
  | {
      checklistType: 'TITLE_COLLECTION';
      data: {
        titleType: string;
        titleNumber: string;
        guarantor: string;
        otherGuarantees: string;
      };
    }
  | {
      checklistType: 'CONTRACT_PENALTY_COLLECTION';
      data: {
        contractType: string;
        breachedClause: string;
        firstCycleFinished: string;
        maxDiscount: string;
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
