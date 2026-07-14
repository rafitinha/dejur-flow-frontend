import { z } from 'zod';
import { agreementAttemptSchema, companySchema, debtorSchema, documentSchema, financialSchema } from './common';

export const recuperacaoVasilhamesSchema = z.object({
  checklistType: z.literal('RECUPERACAO_VASILHAMES'),
  company: companySchema,
  debtor: debtorSchema,
  containers: z.object({ p13: z.coerce.number().min(0), p20: z.coerce.number().min(0), p45: z.coerce.number().min(0) }).refine(v => v.p13 + v.p20 + v.p45 > 0, 'Informe ao menos um vasilhame'),
  debtorOperational: z.boolean(), debtorOperationalDetails: z.string().min(5),
  agreementAttempts: z.array(agreementAttemptSchema).min(1),
  accountsReceivableCollection: z.boolean(), accountsReceivableDetails: z.string().min(5),
  agreementProposalParameter: z.string().min(5),
  financial: financialSchema,
  factsSummary: z.string().min(80),
  opinion: z.object({ financialSituation: z.enum(['EXCELENTE','MUITO_BOA','BOA','REGULAR','RUIM']), financialSituationJustification: z.string().min(5), successPossibility: z.boolean(), successPossibilityJustification: z.string().min(5), position: z.enum(['FAVORAVEL_AJUIZAMENTO','CONTRA_AJUIZAMENTO']) }),
  documents: z.array(documentSchema).min(1),
});
