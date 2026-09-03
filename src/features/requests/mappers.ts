import { WizardFormData } from '@/components/forms/checklist/wizard/types';
import { formatDocument } from '@/lib/utils/cnpj';
import {
  AgreementAttempt,
  ChecklistDetails,
  ChecklistType,
  CreateRequestPayload,
  JudicialRequestDetail,
  RequestCompany,
  RequestDebtor,
  RequestFinancial,
  RequestOpinion,
} from './types';

export function normalizeCnpj(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

export function formatMoneyInput(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === '') return '';

  const numericValue =
    typeof value === 'number' ? value : parseCurrencyToNumber(value);

  if (!Number.isFinite(numericValue)) return '';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function parseCurrencyToNumber(
  value: string | number | null | undefined,
): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (value === null || value === undefined) return 0;

  const normalized = value.trim();
  if (!normalized) return 0;

  const sanitized = normalized.replace(/\s+/g, '');
  const lastComma = sanitized.lastIndexOf(',');
  const lastDot = sanitized.lastIndexOf('.');

  let normalizedValue = sanitized;

  if (lastComma !== -1 && lastDot !== -1) {
    normalizedValue =
      lastComma > lastDot
        ? sanitized.replace(/\./g, '').replace(',', '.')
        : sanitized.replace(/,/g, '');
  } else if (lastComma !== -1) {
    normalizedValue = sanitized.replace(',', '.');
  } else if (lastDot !== -1 && sanitized.split('.').length - 1 > 1) {
    const decimalIndex = sanitized.lastIndexOf('.');
    const integerPart = sanitized.slice(0, decimalIndex).replace(/\./g, '');
    const decimalPart = sanitized.slice(decimalIndex + 1);
    normalizedValue = `${integerPart}.${decimalPart}`;
  }

  const numericValue = Number(normalizedValue);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function parseAgreementAttempts(
  text: string | null | undefined,
): AgreementAttempt[] {
  if (!text) return [];

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const parsedAttempts = lines.flatMap((line) => {
    const match = line.match(/^(\d{4}-\d{2}-\d{2})\s*-\s*([^:]+):\s*(.+)$/i);

    if (!match) {
      return [];
    }

    return [
      {
        date: match[1],
        channel: match[2].trim(),
        result: match[3].trim(),
      },
    ];
  });

  if (parsedAttempts.length > 0) return parsedAttempts;

  return [
    {
      date: '',
      channel: text.trim(),
      result: '',
    },
  ].filter((attempt) => attempt.channel || attempt.result || attempt.date);
}

export function mapWizardFormToChecklistDetails(
  checklistType: ChecklistType,
  formData: WizardFormData,
): ChecklistDetails {
  switch (checklistType) {
    case 'RECUPERACAO_VASILHAMES':
      return {
        checklistType,
        p13Quantity: formData.rvP13,
        p20Quantity: formData.rvP20,
        p45Quantity: formData.rvP45,
        historicalAmount: formData.rvHistoricalAmount,
        updatedAmount: formData.rvUpdatedAmount,
        refusalReason: formData.rvRefusalReason,
      };

    case 'COBRANCA_TITULOS':
      return {
        checklistType,
        titleType: formData.ctTitleType,
        titleNumber: formData.ctTitleNumber,
        guarantor: formData.ctGuarantor,
        otherGuarantees: formData.ctOtherGuarantees,
      };

    case 'COBRANCA_MULTA_CONTRATUAL':
      return {
        checklistType,
        contractType: formData.mcContractType,
        breachedClause: formData.mcBreachedClause,
        firstCycleFinished: formData.mcFirstCycleFinished,
        maxDiscount: formData.mcMaxDiscount,
      };

    default: {
      const exhaustiveCheck: never = checklistType;
      return exhaustiveCheck as never;
    }
  }
}

export function mapWizardFormToCreateRequestPayload(
  formData: WizardFormData,
  checklistType: ChecklistType,
): CreateRequestPayload {
  const company: RequestCompany = {
    name: formData.companyLegalName.trim(),
    cnpj: normalizeCnpj(formData.companyCnpj),
    uf: formData.companyUf,
    city: formData.companyCity,
  };

  const debtor: RequestDebtor = {
    name: formData.debtorLegalName.trim(),
    cnpj: normalizeCnpj(formData.debtorCnpj),
    uf: formData.companyUf || '',
    city: formData.companyCity || '',
    debtorAddress: formData.debtorAddress,
    addressConfirmedBy: formData.addressConfirmedBy,
    addressConfirmedByRole: formData.addressConfirmedByRole,
    addressConfirmedByDate: formData.addressConfirmedByDate,
  };

  const financial: RequestFinancial = {
    amount: parseCurrencyToNumber(formData.financialValue),
    currency: 'BRL',
    dueDate: formData.financialUpdatedDate,
    index: formData.financialIndex,
  };

  const opinion: RequestOpinion = {
    recommendedAction: formData.opinionDetails,
  };

  return {
    checklistType,
    checklistDetails: mapWizardFormToChecklistDetails(checklistType, formData),
    company,
    debtor,
    financial,
    agreementAttempts: parseAgreementAttempts(formData.agreementDetails),
    factsSummary: formData.factsSummary,
    opinion,
  };
}

export function mapWizardFormToUpdateRequestPayload(
  formData: WizardFormData,
  checklistType: ChecklistType,
): CreateRequestPayload {
  return mapWizardFormToCreateRequestPayload(formData, checklistType);
}

function normalizeChecklistDetails(
  detail: JudicialRequestDetail,
): ChecklistDetails | undefined {
  if (!detail.checklistDetails || typeof detail.checklistDetails !== 'object') {
    return undefined;
  }

  const details = detail.checklistDetails as Record<string, unknown>;

  if ('checklistType' in details && details.checklistType) {
    return detail.checklistDetails as ChecklistDetails;
  }

  if (detail.checklistType) {
    return {
      ...detail.checklistDetails,
      checklistType: detail.checklistType,
    } as ChecklistDetails;
  }

  return undefined;
}

export function mapRequestDetailToWizardForm(
  detail: JudicialRequestDetail,
): Partial<WizardFormData> {
  const checklistDetails = normalizeChecklistDetails(detail);
  const checklistType = detail.checklistType ?? checklistDetails?.checklistType;

  const checklistData: Partial<WizardFormData> = (() => {
    switch (checklistType) {
      case 'RECUPERACAO_VASILHAMES': {
        if (
          !checklistDetails ||
          checklistDetails.checklistType !== 'RECUPERACAO_VASILHAMES'
        ) {
          return {};
        }

        return {
          rvP13: checklistDetails.p13Quantity ?? '',
          rvP20: checklistDetails.p20Quantity ?? '',
          rvP45: checklistDetails.p45Quantity ?? '',
          rvHistoricalAmount: checklistDetails.historicalAmount ?? '',
          rvUpdatedAmount: checklistDetails.updatedAmount ?? '',
          rvRefusalReason: checklistDetails.refusalReason ?? '',
        };
      }

      case 'COBRANCA_TITULOS': {
        if (
          !checklistDetails ||
          checklistDetails.checklistType !== 'COBRANCA_TITULOS'
        ) {
          return {};
        }

        return {
          ctTitleType: checklistDetails.titleType ?? '',
          ctTitleNumber: checklistDetails.titleNumber ?? '',
          ctGuarantor: checklistDetails.guarantor ?? '',
          ctOtherGuarantees: checklistDetails.otherGuarantees ?? '',
        };
      }

      case 'COBRANCA_MULTA_CONTRATUAL': {
        if (
          !checklistDetails ||
          checklistDetails.checklistType !== 'COBRANCA_MULTA_CONTRATUAL'
        ) {
          return {};
        }

        return {
          mcContractType: checklistDetails.contractType ?? '',
          mcBreachedClause: checklistDetails.breachedClause ?? '',
          mcFirstCycleFinished: Boolean(checklistDetails.firstCycleFinished),
          mcMaxDiscount: checklistDetails.maxDiscount ?? '',
        };
      }

      default:
        return {};
    }
  })();

  const agreementText = detail.agreementAttempts
    .map((attempt) => {
      const parts = [attempt.date, attempt.channel, attempt.result].filter(
        Boolean,
      );
      if (parts.length === 0) return '';
      return `${attempt.date ? `${attempt.date} - ` : ''}${attempt.channel ? `${attempt.channel}: ` : ''}${attempt.result ?? ''}`.trim();
    })
    .filter(Boolean)
    .join('\n');

  const financialDetails = [
    detail.financial.amount
      ? `Valor: ${formatMoneyInput(detail.financial.amount)}`
      : '',
    detail.financial.index ? `Índice: ${detail.financial.index}` : '',
    detail.financial.dueDate
      ? `Data de atualização: ${detail.financial.dueDate}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    companyLegalName: detail.company.name,
    companyCnpj: formatDocument(detail.company.cnpj),
    companyUf: detail.company.uf,
    companyCity: detail.company.city,
    debtorLegalName: detail.debtor.name,
    debtorCnpj: formatDocument(detail.debtor.cnpj),
    debtorAddress: detail.debtor.debtorAddress ?? '',
    addressConfirmedBy: detail.debtor.addressConfirmedBy ?? '',
    addressConfirmedByRole: detail.debtor.addressConfirmedByRole ?? '',
    addressConfirmedByDate: detail.debtor.addressConfirmedByDate ?? '',
    ...checklistData,
    agreementDetails: agreementText,
    financialDetails,
    financialValue: formatMoneyInput(detail.financial.amount),
    financialIndex: detail.financial.index ?? '',
    financialUpdatedDate: detail.financial.dueDate,
    factsSummary: detail.factsSummary,
    opinionDetails:
      detail.opinion?.recommendedAction ?? detail.llmResult?.summary ?? '',
  };
}
