import { z } from 'zod';
import { agreementAttemptSchema, companySchema, debtorSchema, documentSchema, financialSchema } from './common';

export const cobrancaTitulosSchema = z.object({
  checklistType: z.literal('COBRANCA_TITULOS'), company: companySchema, debtor: debtorSchema,
  guarantor: z.object({ name: z.string().min(3), document: z.string().min(11), address: z.string().min(5), confirmedBy: z.string().min(3) }).optional(),
  title: z.object({ type: z.enum(['CHEQUE','DUPLICATA','NOTA_PROMISSORIA','CONFISSAO_DIVIDA','CONTRATO','OUTROS']), number: z.string().min(1), protestCertificate: z.boolean() }),
  otherGuarantees: z.boolean(), otherGuaranteesDetails: z.string().nullable().optional(),
  debtorOperational: z.boolean(), debtorOperationalDetails: z.string().min(5),
  agreementAttempts: z.array(agreementAttemptSchema).min(1),
  accountsReceivableCollection: z.boolean(), accountsReceivableDetails: z.string().min(5),
  agreementProposalParameter: z.string().min(5), financial: financialSchema,
  factsSummary: z.string().min(80),
  opinion: z.object({ collectionCompanyConclusion: z.enum(['FAVORAVEL_GEQ','DESFAVORAVEL_GEQ','NAO_HOUVE']), financialSituation: z.enum(['EXCELENTE','MUITO_BOA','BOA','REGULAR','RUIM']), financialSituationJustification: z.string().min(5), successPossibility: z.boolean(), successPossibilityJustification: z.string().min(5), policyObserved: z.boolean(), position: z.enum(['FAVORAVEL_AJUIZAMENTO','CONTRA_AJUIZAMENTO']) }),
  documents: z.array(documentSchema).min(1),
}).superRefine((data, ctx) => {
  if (data.title.type === 'DUPLICATA') {
    const types = data.documents.map(d => d.documentType);
    if (!types.includes('NOTA_FISCAL') || !types.includes('COMPROVANTE_ENTREGA')) ctx.addIssue({ code: 'custom', message: 'Duplicata exige Nota Fiscal e comprovante de entrega.' });
  }
});
