import { ChecklistType } from '@/features/requests/types';

export const wizardSteps = [
  'Tipo',
  'Empresa',
  'Dados',
  'Acordo',
  'Valores',
  'Resumo',
  'Parecer',
  'Documentos',
  'Confirmação',
] as const;

export const checklistTypes = [
  'RECUPERACAO_VASILHAMES',
  'COBRANCA_TITULOS',
  'COBRANCA_MULTA_CONTRATUAL',
] as const;

export type WizardFormData = {
  companyLegalName: string;
  companyCnpj: string;
  companyUf: string;
  companyCity: string;
  debtorLegalName: string;
  debtorCnpj: string;
  debtorAddress: string;
  addressConfirmedBy: string;
  rvP13: string;
  rvP20: string;
  rvP45: string;
  rvHistoricalAmount: string;
  rvUpdatedAmount: string;
  rvRefusalReason: string;
  ctTitleType: string;
  ctTitleNumber: string;
  ctGuarantor: string;
  ctOtherGuarantees: string;
  mcContractType: string;
  mcBreachedClause: string;
  mcFirstCycleFinished: string;
  mcMaxDiscount: string;
  agreementDetails: string;
  financialDetails: string;
  factsSummary: string;
  opinionDetails: string;
};

export const initialWizardForm: WizardFormData = {
  companyLegalName: '',
  companyCnpj: '',
  companyUf: '',
  companyCity: '',
  debtorLegalName: '',
  debtorCnpj: '',
  debtorAddress: '',
  addressConfirmedBy: '',
  rvP13: '',
  rvP20: '',
  rvP45: '',
  rvHistoricalAmount: '',
  rvUpdatedAmount: '',
  rvRefusalReason: '',
  ctTitleType: '',
  ctTitleNumber: '',
  ctGuarantor: '',
  ctOtherGuarantees: '',
  mcContractType: '',
  mcBreachedClause: '',
  mcFirstCycleFinished: '',
  mcMaxDiscount: '',
  agreementDetails: '',
  financialDetails: '',
  factsSummary: '',
  opinionDetails: '',
};

export type UpdateWizardFieldFn = <K extends keyof WizardFormData>(
  key: K,
  value: WizardFormData[K],
) => void;

export type Step2VariantStrategy = {
  checklistType: ChecklistType;
  fields: Array<{
    key: keyof WizardFormData;
    label: string;
    required?: boolean;
    placeholder?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    parser?: (value: string) => string;
  }>;
};
