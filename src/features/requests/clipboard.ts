import { formatCnpj } from '@/components/forms/checklist/wizard/helpers';
import { statusLabels } from '@/config/status';
import type { JudicialRequestDetail } from './types';

export type ClipboardWriteFailureReason =
  | 'unsupported'
  | 'permission-denied'
  | 'security'
  | 'document-not-focused'
  | 'unknown';

export type ClipboardWriteResult =
  | { success: true }
  | { success: false; reason: ClipboardWriteFailureReason; error?: unknown };

export type ReviewTextField = {
  label: string;
  value: string;
};

export type ReviewTextSection = {
  title: string;
  fields?: ReviewTextField[];
  paragraphs?: string[];
  items?: string[];
};

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(value?: number, currency?: string) {
  if (value === undefined || value === null) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency || 'BRL',
  }).format(value);
}

function formatBytes(size?: number | string) {
  if (size === undefined || size === null || size === '') return '';

  const numericSize = typeof size === 'string' ? Number(size) : Number(size);

  if (!Number.isFinite(numericSize)) return '';

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = numericSize;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatBoolean(value?: boolean) {
  if (value === undefined || value === null) return '';
  return value ? 'Sim' : 'Não';
}

function renderValue(value?: string | number | boolean | null) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'boolean') return formatBoolean(value);
  if (typeof value === 'number') return String(value);
  return String(value);
}

function addSection(
  sections: ReviewTextSection[],
  title: string,
  fields?: ReviewTextField[],
  paragraphs?: string[],
  items?: string[],
) {
  const normalizedFields = fields?.filter((field) => Boolean(field.value));
  const normalizedParagraphs = paragraphs?.filter(Boolean);
  const normalizedItems = items?.filter(Boolean);

  if (
    !normalizedFields?.length &&
    !normalizedParagraphs?.length &&
    !normalizedItems?.length
  )
    return;

  sections.push({
    title,
    fields: normalizedFields,
    paragraphs: normalizedParagraphs,
    items: normalizedItems,
  });
}

function normalizeChecklistDetails(request: JudicialRequestDetail) {
  if (
    !request.checklistDetails ||
    typeof request.checklistDetails !== 'object'
  ) {
    return undefined;
  }

  const details = request.checklistDetails as Record<string, unknown>;

  if ('checklistType' in details && details.checklistType) {
    return request.checklistDetails;
  }

  if (request.checklistType) {
    return {
      ...request.checklistDetails,
      checklistType: request.checklistType,
    };
  }

  return undefined;
}

function getChecklistDetailsForType(
  request: JudicialRequestDetail,
  checklistType: JudicialRequestDetail['checklistType'],
) {
  const canonical = request.checklistDetails;
  if (canonical && canonical.checklistType === checklistType) {
    return canonical as Record<string, unknown> & {
      checklistType: typeof checklistType;
    };
  }

  return undefined;
}

function getSpecificDataSections(
  request: JudicialRequestDetail,
): ReviewTextSection[] {
  const sections: ReviewTextSection[] = [];

  const checklistDetails = normalizeChecklistDetails(request);

  const vasilhamesData = getChecklistDetailsForType(
    request,
    'RECUPERACAO_VASILHAMES',
  ) as
    | ({
        checklistType: 'RECUPERACAO_VASILHAMES';
        p13Quantity?: string | number;
        p20Quantity?: string | number;
        p45Quantity?: string | number;
        historicalAmount?: string;
        updatedAmount?: string;
        refusalReason?: string;
      } & Record<string, unknown>)
    | undefined;

  if (vasilhamesData) {
    addSection(
      sections,
      'DADOS ESPECÍFICOS',
      [
        {
          label: 'Quantidade P13',
          value: renderValue(vasilhamesData.p13Quantity),
        },
        {
          label: 'Quantidade P20',
          value: renderValue(vasilhamesData.p20Quantity),
        },
        {
          label: 'Quantidade P45',
          value: renderValue(vasilhamesData.p45Quantity),
        },
        {
          label: 'Valor histórico',
          value: renderValue(vasilhamesData.historicalAmount),
        },
        {
          label: 'Valor atualizado',
          value: renderValue(vasilhamesData.updatedAmount),
        },
      ],
      vasilhamesData.refusalReason ? [vasilhamesData.refusalReason] : undefined,
    );
  }

  const titulosData = getChecklistDetailsForType(
    request,
    'COBRANCA_TITULOS',
  ) as
    | ({
        checklistType: 'COBRANCA_TITULOS';
        titleType?: string;
        titleNumber?: string;
        guarantor?: string;
        otherGuarantees?: string;
      } & Record<string, unknown>)
    | undefined;

  if (titulosData) {
    addSection(sections, 'DADOS ESPECÍFICOS', [
      { label: 'Tipo do título', value: renderValue(titulosData.titleType) },
      {
        label: 'Número do título',
        value: renderValue(titulosData.titleNumber),
      },
      { label: 'Garantidor', value: renderValue(titulosData.guarantor) },
      {
        label: 'Outras garantias',
        value: renderValue(titulosData.otherGuarantees),
      },
      {
        label: 'Cargo',
        value: renderValue(request.debtor?.addressConfirmedByRole),
      },
      {
        label: 'Data da confirmação',
        value: renderValue(request.debtor?.addressConfirmedByDate),
      },
    ]);
  }

  const multaData = getChecklistDetailsForType(
    request,
    'COBRANCA_MULTA_CONTRATUAL',
  ) as
    | ({
        checklistType: 'COBRANCA_MULTA_CONTRATUAL';
        contractType?: string;
        breachedClause?: string;
        firstCycleFinished?: boolean | string;
        maxDiscount?: string;
        value?: string;
        index?: string;
        updatedAt?: string;
      } & Record<string, unknown>)
    | undefined;

  if (multaData) {
    addSection(sections, 'DADOS ESPECÍFICOS', [
      { label: 'Tipo do contrato', value: renderValue(multaData.contractType) },
      {
        label: 'Cláusula violada',
        value: renderValue(multaData.breachedClause),
      },
      {
        label: 'Primeiro ciclo finalizado',
        value: renderValue(multaData.firstCycleFinished),
      },
      { label: 'Desconto máximo', value: renderValue(multaData.maxDiscount) },
      {
        label: 'Cargo',
        value: renderValue(request.debtor?.addressConfirmedByRole),
      },
      {
        label: 'Data da confirmação',
        value: renderValue(request.debtor?.addressConfirmedByDate),
      },
      { label: 'Valor', value: renderValue(multaData.value) },
      { label: 'Índice', value: renderValue(multaData.index) },
      { label: 'Data de atualização', value: renderValue(multaData.updatedAt) },
    ]);
  }

  return sections;
}

export function buildRequestReviewSections(request: JudicialRequestDetail) {
  const sections: ReviewTextSection[] = [];

  addSection(sections, 'SOLICITAÇÃO', [
    { label: 'Solicitação', value: request.requestId || '' },
    { label: 'Status', value: statusLabels[request.status] || request.status },
    { label: 'Checklist', value: request.checklistType },
    {
      label: 'Criada em',
      value: formatDate(request.createdAt as string | undefined),
    },
    { label: 'Responsável', value: request.createdBy?.name || '' },
  ]);

  addSection(sections, 'DADOS DA EMPRESA', [
    { label: 'Razão social', value: request.company?.name || '' },
    { label: 'CNPJ', value: formatCnpj(request.company?.cnpj || '') },
    { label: 'UF', value: request.company?.uf || '' },
    { label: 'Cidade', value: request.company?.city || '' },
  ]);

  addSection(sections, 'DADOS DA DEVEDORA', [
    { label: 'Nome', value: request.debtor?.name || '' },
    { label: 'CNPJ', value: formatCnpj(request.debtor?.cnpj || '') },
    { label: 'UF', value: request.debtor?.uf || '' },
    { label: 'Cidade', value: request.debtor?.city || '' },
    {
      label: 'Cargo',
      value: request.debtor?.addressConfirmedByRole || '',
    },
    {
      label: 'Data da confirmação',
      value: request.debtor?.addressConfirmedByDate || '',
    },
  ]);

  addSection(sections, 'DADOS FINANCEIROS', [
    {
      label: 'Valor',
      value: formatCurrency(
        request.financial?.amount,
        request.financial?.currency,
      ),
    },
    { label: 'Moeda', value: request.financial?.currency || '' },
    { label: 'Vencimento', value: formatDate(request.financial?.dueDate) },
  ]);

  sections.push(...getSpecificDataSections(request));

  if (request.agreementAttempts?.length) {
    addSection(
      sections,
      'TENTATIVAS DE ACORDO',
      request.agreementAttempts.map((attempt) => ({
        label: `${formatDate(attempt.date)} - ${attempt.channel}`,
        value: attempt.result,
      })),
    );
  }

  addSection(
    sections,
    'RESUMO DOS FATOS',
    undefined,
    request.factsSummary ? [request.factsSummary] : undefined,
  );

  if (request.opinion?.recommendedAction || request.opinion?.details) {
    addSection(sections, 'OPINIÃO', [
      {
        label: 'Ação recomendada',
        value: request.opinion.recommendedAction || '',
      },
      {
        label: 'Detalhes',
        value: (request.opinion as { details?: string }).details || '',
      },
    ]);
  }

  if (request.documents?.length) {
    addSection(
      sections,
      'DOCUMENTOS',
      request.documents.map((document) => ({
        label: document.name || 'Documento',
        value: [
          document.type || '',
          formatBytes(document.size),
          formatDate(document.uploadedAt),
        ]
          .filter(Boolean)
          .join(' | '),
      })),
    );
  }

  addSection(sections, 'VALIDAÇÃO DO CLIENTE', [
    {
      label: 'Aprovado pelo cliente',
      value: formatBoolean(request.clientValidation?.approvedByClient),
    },
  ]);

  if (request.history?.length) {
    addSection(
      sections,
      'HISTÓRICO',
      request.history.map((entry) => ({
        label: `${formatDate(entry.at)} - ${entry.from}`,
        value: `→ ${entry.to}`,
      })),
    );
  }

  if (request.llmResult) {
    addSection(sections, 'RESULTADO DA ANÁLISE', [
      { label: 'Status', value: request.llmResult.status || '' },
      { label: 'Score', value: renderValue(request.llmResult.score) },
      { label: 'Resumo', value: request.llmResult.summary || '' },
      {
        label: 'Campos ausentes',
        value: request.llmResult.missingFields?.join(', ') || '',
      },
      {
        label: 'Documentos ausentes',
        value: request.llmResult.missingDocuments?.join(', ') || '',
      },
      {
        label: 'Inconsistências',
        value: request.llmResult.inconsistencies?.join(', ') || '',
      },
      {
        label: 'Recomendações',
        value: request.llmResult.recommendations?.join(', ') || '',
      },
      {
        label: 'Pode reenviar',
        value: formatBoolean(request.llmResult.canResubmit),
      },
      {
        label: 'Analisado em',
        value: formatDate(request.llmResult.reviewedAt),
      },
    ]);
  }

  return sections;
}

export function formatRequestDetailsForClipboard(
  request: JudicialRequestDetail,
) {
  const sections = buildRequestReviewSections(request);
  return sections
    .map((section) => {
      const lines: string[] = [section.title.toUpperCase()];
      if (section.fields?.length) {
        lines.push(
          ...section.fields.map((field) => `${field.label}: ${field.value}`),
        );
      }
      if (section.paragraphs?.length) {
        lines.push(...section.paragraphs);
      }
      if (section.items?.length) {
        lines.push(...section.items.map((item) => `- ${item}`));
      }
      return lines.join('\n');
    })
    .join('\n\n');
}

export async function writeTextToClipboard(
  text: string,
): Promise<ClipboardWriteResult> {
  if (!text?.trim()) {
    return { success: false, reason: 'unknown' };
  }

  if (
    typeof navigator === 'undefined' ||
    !navigator.clipboard ||
    typeof navigator.clipboard.writeText !== 'function'
  ) {
    return { success: false, reason: 'unsupported' };
  }

  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    if (error instanceof DOMException) {
      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        return { success: false, reason: 'permission-denied', error };
      }
      if (error.name === 'SecurityError') {
        return { success: false, reason: 'security', error };
      }
      if (error.name === 'NotFocusedError') {
        return { success: false, reason: 'document-not-focused', error };
      }
    }
    return { success: false, reason: 'unknown', error };
  }
}
