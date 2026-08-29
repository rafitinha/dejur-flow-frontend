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

function formatBytes(size?: number) {
  if (size === undefined || size === null || Number.isNaN(size)) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
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

function getSpecificDataSections(
  request: JudicialRequestDetail,
): ReviewTextSection[] {
  const sections: ReviewTextSection[] = [];

  if (!request.data) return sections;

  if (
    request.checklistType === 'RECUPERACAO_VASILHAMES' &&
    request.data.checklistType === 'RECUPERACAO_VASILHAMES'
  ) {
    const data = request.data.data as {
      p13Quantity?: number;
      p20Quantity?: number;
      p45Quantity?: number;
      historicalAmount?: string;
      updatedAmount?: string;
      reason?: string;
    };
    addSection(
      sections,
      'DADOS ESPECÍFICOS',
      [
        { label: 'Quantidade P13', value: renderValue(data.p13Quantity) },
        { label: 'Quantidade P20', value: renderValue(data.p20Quantity) },
        { label: 'Quantidade P45', value: renderValue(data.p45Quantity) },
        { label: 'Valor histórico', value: renderValue(data.historicalAmount) },
        { label: 'Valor atualizado', value: renderValue(data.updatedAmount) },
      ],
      data.reason ? [data.reason] : undefined,
    );
  }

  if (
    request.checklistType === 'COBRANCA_TITULOS' &&
    request.data.checklistType === 'COBRANCA_TITULOS'
  ) {
    const data = request.data.data as {
      titleType?: string;
      titleNumber?: string;
      guarantor?: string;
      otherGuarantees?: string;
      confirmationRole?: string;
      confirmationDate?: string;
    };
    addSection(sections, 'DADOS ESPECÍFICOS', [
      { label: 'Tipo do título', value: renderValue(data.titleType) },
      { label: 'Número do título', value: renderValue(data.titleNumber) },
      { label: 'Garantidor', value: renderValue(data.guarantor) },
      { label: 'Outras garantias', value: renderValue(data.otherGuarantees) },
      { label: 'Cargo', value: renderValue(data.confirmationRole) },
      {
        label: 'Data da confirmação',
        value: renderValue(data.confirmationDate),
      },
    ]);
  }

  if (
    request.checklistType === 'COBRANCA_MULTA_CONTRATUAL' &&
    request.data.checklistType === 'COBRANCA_MULTA_CONTRATUAL'
  ) {
    const data = request.data.data as {
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
    addSection(sections, 'DADOS ESPECÍFICOS', [
      { label: 'Tipo do contrato', value: renderValue(data.contractType) },
      { label: 'Cláusula violada', value: renderValue(data.breachedClause) },
      {
        label: 'Primeiro ciclo finalizado',
        value: renderValue(data.firstCycleFinished),
      },
      { label: 'Desconto máximo', value: renderValue(data.maxDiscount) },
      { label: 'Cargo', value: renderValue(data.confirmationRole) },
      {
        label: 'Data da confirmação',
        value: renderValue(data.confirmationDate),
      },
      { label: 'Valor', value: renderValue(data.value) },
      { label: 'Índice', value: renderValue(data.index) },
      { label: 'Data de atualização', value: renderValue(data.updatedAt) },
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
      value:
        (request.data?.data as { confirmationRole?: string })
          ?.confirmationRole || '',
    },
    {
      label: 'Data da confirmação',
      value:
        (request.data?.data as { confirmationDate?: string })
          ?.confirmationDate || '',
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
