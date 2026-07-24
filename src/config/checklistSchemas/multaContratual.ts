import { z } from 'zod';
import {
  agreementAttemptSchema,
  companySchema,
  debtorSchema,
  documentSchema,
  financialSchema,
} from './common';

export const multaContratualSchema = z.object({
  checklistType: z.literal('COBRANCA_MULTA_CONTRATUAL'),
  company: companySchema,
  debtor: debtorSchema,
  contract: z.object({
    type: z.string().min(3),
    breachedClause: z.string().min(5),
    firstCycleFinished: z.boolean(),
    firstCycleEndDate: z.string().optional(),
    hasAddendum: z.boolean(),
    addendumDetails: z.string().nullable().optional(),
  }),
  debtorOperational: z.boolean(),
  debtorOperationalDetails: z.string().min(5),
  agreementAttempts: z.array(agreementAttemptSchema).min(1),
  accountsReceivableCollection: z.boolean(),
  accountsReceivableDetails: z.string().min(5),
  agreementProposalParameter: z.string().min(5),
  financial: financialSchema,
  factsSummary: z.string().min(80),
  opinion: z.object({
    financialSituation: z.enum([
      'EXCELENTE',
      'MUITO_BOA',
      'BOA',
      'REGULAR',
      'RUIM',
    ]),
    financialSituationJustification: z.string().min(5),
    successPossibility: z.boolean(),
    successPossibilityJustification: z.string().min(5),
    maxAuthorizedDiscount: z.string().min(1),
    branchPosition: z.enum(['FAVORAVEL_AJUIZAMENTO', 'CONTRA_AJUIZAMENTO']),
    accountsReceivablePosition: z.enum([
      'FAVORAVEL_AJUIZAMENTO',
      'CONTRA_AJUIZAMENTO',
    ]),
  }),
  documents: z.array(documentSchema).min(1),
});
