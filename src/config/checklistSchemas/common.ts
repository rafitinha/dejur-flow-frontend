import { z } from 'zod';

export const cnpjSchema = z.string().min(14, 'CNPJ obrigatório');
export const moneySchema = z.coerce.number().gt(0, 'Valor deve ser maior que zero');
export const yesNoSchema = z.enum(['SIM', 'NAO']);

export const companySchema = z.object({
  legalName: z.string().min(3), cnpj: cnpjSchema, city: z.string().min(2), uf: z.string().length(2),
});
export const addressSchema = z.object({
  street: z.string().min(2), number: z.string().min(1), district: z.string().min(2), zipCode: z.string().min(8), city: z.string().min(2), uf: z.string().length(2),
});
export const debtorSchema = z.object({
  legalName: z.string().min(3), tradeName: z.string().min(2), cnpj: cnpjSchema, address: addressSchema,
  addressConfirmedBy: z.object({ name: z.string().min(3), role: z.string().min(2), confirmedAt: z.string().min(10) }),
  usesDifferentLegalIdentity: z.boolean(), differentLegalIdentityDescription: z.string().nullable().optional(),
});
export const financialSchema = z.object({
  historicalAmount: moneySchema, updatedAmount: moneySchema, correctionIndex: z.string().min(2), interestRate: z.string().min(1), penaltyRate: z.string().min(1),
  initialTerm: z.string().min(10), finalTerm: z.string().min(10), capitalizationPeriodicity: z.string().nullable().optional(), mandatoryDiscounts: z.string().nullable().optional(),
});
export const agreementAttemptSchema = z.object({ date: z.string().min(10), method: z.string().min(2), responsible: z.string().min(2), result: z.string().min(5) });
export const documentSchema = z.object({ documentType: z.string().min(2), fileName: z.string().min(3), required: z.boolean(), sizeBytes: z.number().max(10 * 1024 * 1024) });
