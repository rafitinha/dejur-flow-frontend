import { z } from 'zod';
import { ChecklistType } from '@/features/requests/types';
import { allowedMimeTypes } from './helpers';
import { checklistTypes, Step2VariantStrategy, WizardFormData } from './types';
import { isValidCnpj } from '@/lib/utils/cnpj';

const cnpjSchema = z
  .string()
  .regex(/^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/, 'CNPJ inválido')
  .refine(isValidCnpj, 'CNPJ inválido (dígito verificador incorreto)');

const requiredText = (message: string, min = 1) => z.string().min(min, message);
const numericText = (message: string) => z.string().regex(/^\d+$/, message);
const moneyText = (message: string) =>
  z.string().regex(/^\d+(,\d{1,2})?$/, message);

export const step0Schema = z.object({
  type: z.enum(checklistTypes, { message: 'Selecione o tipo de checklist.' }),
});

export function createStep1Schema(stateCodeSet: Set<string>) {
  return z.object({
    companyLegalName: requiredText('Razao social obrigatoria.', 3),
    companyCnpj: cnpjSchema,
    companyUf: z
      .string()
      .length(2, 'Selecione a UF.')
      .refine((value) => stateCodeSet.has(value), 'UF invalida.'),
    companyCity: requiredText('Selecione a cidade.', 2),
    debtorLegalName: requiredText('Nome da devedora obrigatorio.', 3),
    debtorCnpj: cnpjSchema,
    debtorAddress: requiredText('Endereco completo obrigatorio.', 5),
    addressConfirmedBy: requiredText('Informe quem confirmou o endereco.', 3),
  });
}

const step2RecoverySchema = z.object({
  rvP13: numericText('Use apenas numeros.'),
  rvP20: numericText('Use apenas numeros.'),
  rvP45: numericText('Use apenas numeros.'),
  rvHistoricalAmount: moneyText('Valor invalido.'),
  rvUpdatedAmount: moneyText('Valor invalido.'),
  rvRefusalReason: requiredText('Motivo da recusa obrigatorio.', 5),
});

const step2TitlesSchema = z.object({
  ctTitleType: requiredText('Tipo de titulo obrigatorio.', 2),
  ctTitleNumber: numericText('Use apenas numeros.'),
  ctGuarantor: requiredText('Avalista/fiador obrigatorio.', 3),
  ctOtherGuarantees: requiredText('Informe outras garantias.', 3),
});

const step2PenaltySchema = z.object({
  mcContractType: requiredText('Tipo de contrato obrigatorio.', 3),
  mcBreachedClause: requiredText('Clausula descumprida obrigatoria.', 5),
  mcFirstCycleFinished: requiredText('Informe SIM ou NAO.', 1),
  mcMaxDiscount: moneyText('Valor invalido.'),
});

export const step2Strategies: Record<ChecklistType, Step2VariantStrategy> = {
  RECUPERACAO_VASILHAMES: {
    checklistType: 'RECUPERACAO_VASILHAMES',
    fields: [
      {
        key: 'rvP13',
        label: 'Qtd P-13',
        required: true,
        inputMode: 'numeric',
      },
      {
        key: 'rvP20',
        label: 'Qtd P-20',
        required: true,
        inputMode: 'numeric',
      },
      {
        key: 'rvP45',
        label: 'Qtd P-45',
        required: true,
        inputMode: 'numeric',
      },
      {
        key: 'rvHistoricalAmount',
        label: 'Valor historico',
        required: true,
        placeholder: 'Ex.: 12000,00',
      },
      {
        key: 'rvUpdatedAmount',
        label: 'Valor total atualizado',
        required: true,
        placeholder: 'Ex.: 14500,50',
      },
      {
        key: 'rvRefusalReason',
        label: 'Motivo da recusa',
        required: true,
      },
    ],
  },
  COBRANCA_TITULOS: {
    checklistType: 'COBRANCA_TITULOS',
    fields: [
      { key: 'ctTitleType', label: 'Tipo de titulo', required: true },
      {
        key: 'ctTitleNumber',
        label: 'Numero do titulo',
        required: true,
        inputMode: 'numeric',
      },
      { key: 'ctGuarantor', label: 'Avalista/Fiador', required: true },
      {
        key: 'ctOtherGuarantees',
        label: 'Outras garantias',
        required: true,
      },
    ],
  },
  COBRANCA_MULTA_CONTRATUAL: {
    checklistType: 'COBRANCA_MULTA_CONTRATUAL',
    fields: [
      { key: 'mcContractType', label: 'Tipo de contrato', required: true },
      {
        key: 'mcBreachedClause',
        label: 'Clausula descumprida',
        required: true,
      },
      {
        key: 'mcFirstCycleFinished',
        label: '1 ciclo finalizado?',
        required: true,
        placeholder: 'SIM ou NAO',
      },
      {
        key: 'mcMaxDiscount',
        label: 'Maior desconto autorizado',
        required: true,
        placeholder: 'Ex.: 15,00',
      },
    ],
  },
};

export function getStep2Schema(type?: ChecklistType) {
  if (!type) {
    return z
      .object({ type: z.string().optional() })
      .refine(() => false, 'Selecione um tipo de checklist primeiro.');
  }

  if (type === 'RECUPERACAO_VASILHAMES') return step2RecoverySchema;
  if (type === 'COBRANCA_TITULOS') return step2TitlesSchema;
  return step2PenaltySchema;
}

const step3Schema = z.object({
  agreementDetails: requiredText('Detalhe as tentativas de acordo.', 15),
});

const step4Schema = z.object({
  financialDetails: requiredText(
    'Informe valores, indices e atualizacao de forma completa.',
    15,
  ),
});

const step5Schema = z.object({
  factsSummary: requiredText('Resumo dos fatos obrigatorio.', 30),
});

const step6Schema = z.object({
  opinionDetails: requiredText('Parecer da area obrigatorio.', 20),
});

const step7Schema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, 'Anexe ao menos um documento.')
    .refine(
      (files) => files.every((file) => allowedMimeTypes.includes(file.type)),
      'Formato invalido. Use PDF, DOC, DOCX, PNG ou JPG/JPEG.',
    )
    .refine(
      (files) =>
        files.reduce((total, file) => total + file.size, 0) <= 10 * 1024 * 1024,
      'O tamanho total dos arquivos nao pode ultrapassar 10 MB.',
    ),
});

export function createSchemasByStep(
  type: ChecklistType | undefined,
  stateCodeSet: Set<string>,
) {
  return [
    step0Schema,
    createStep1Schema(stateCodeSet),
    getStep2Schema(type),
    step3Schema,
    step4Schema,
    step5Schema,
    step6Schema,
    step7Schema,
    z.object({}),
  ] as const;
}

export function createPayloadByStep(params: {
  checklistType: ChecklistType | undefined;
  formData: WizardFormData;
  files: File[];
}) {
  const { checklistType, formData, files } = params;

  return [
    { type: checklistType },
    {
      companyLegalName: formData.companyLegalName,
      companyCnpj: formData.companyCnpj,
      companyUf: formData.companyUf,
      companyCity: formData.companyCity,
      debtorLegalName: formData.debtorLegalName,
      debtorCnpj: formData.debtorCnpj,
      debtorAddress: formData.debtorAddress,
      addressConfirmedBy: formData.addressConfirmedBy,
    },
    checklistType === 'RECUPERACAO_VASILHAMES'
      ? {
          rvP13: formData.rvP13,
          rvP20: formData.rvP20,
          rvP45: formData.rvP45,
          rvHistoricalAmount: formData.rvHistoricalAmount,
          rvUpdatedAmount: formData.rvUpdatedAmount,
          rvRefusalReason: formData.rvRefusalReason,
        }
      : checklistType === 'COBRANCA_TITULOS'
        ? {
            ctTitleType: formData.ctTitleType,
            ctTitleNumber: formData.ctTitleNumber,
            ctGuarantor: formData.ctGuarantor,
            ctOtherGuarantees: formData.ctOtherGuarantees,
          }
        : {
            mcContractType: formData.mcContractType,
            mcBreachedClause: formData.mcBreachedClause,
            mcFirstCycleFinished: formData.mcFirstCycleFinished,
            mcMaxDiscount: formData.mcMaxDiscount,
          },
    { agreementDetails: formData.agreementDetails },
    { financialDetails: formData.financialDetails },
    { factsSummary: formData.factsSummary },
    { opinionDetails: formData.opinionDetails },
    { files },
    {},
  ] as const;
}
