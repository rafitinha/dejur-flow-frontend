'use client';

import Link from 'next/link';
import { ArrowLeft, Pencil, Download, RefreshCw } from 'lucide-react';
import { use, useEffect, useState } from 'react';

import { ChecklistWizard } from '@/components/forms/checklist/ChecklistWizard';
import {
  WizardFormData,
  initialWizardForm,
} from '@/components/forms/checklist/wizard/types';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getRequestById, updateRequest } from '@/features/requests/api';
import {
  RequestStatus,
  JudicialRequestDetail,
  JudicialRequestDetailType,
} from '@/features/requests/types';

import { formatDocument } from '@/lib/utils/cnpj';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (
  value: number | string | null | undefined,
  showCurrency = true,
) => {
  const numericValue = Number(value) || 0;

  return new Intl.NumberFormat('pt-BR', {
    ...(showCurrency && {
      style: 'currency',
      currency: 'BRL',
    }),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const isEditableStatus = (status: RequestStatus) => {
  return ['DRAFT', 'NEEDS_CORRECTION', 'ERROR'].includes(status);
};

const wizardFormKeys = Object.keys(initialWizardForm) as Array<
  keyof WizardFormData
>;

function extractWizardFormData(
  detail: JudicialRequestDetail | JudicialRequestDetailType,
): Partial<WizardFormData> {
  const fromFormData = (detail as JudicialRequestDetailType).formData;
  const result: Record<string, string | boolean> = {
    companyLegalName: (detail as JudicialRequestDetail).company.name,
  };

  for (const key of wizardFormKeys) {
    const valueFromFormData = fromFormData?.[key];
    if (
      typeof valueFromFormData === 'string' ||
      typeof valueFromFormData === 'boolean'
    ) {
      result[key] = valueFromFormData;
      continue;
    }

    const valueFromDetail = (detail as unknown as Record<string, unknown>)[
      key as string
    ];
    if (
      typeof valueFromDetail === 'string' ||
      typeof valueFromDetail === 'boolean'
    ) {
      result[key] = valueFromDetail;
    }
  }

  const wizard = mapRequestDetailToWizardForm(detail as JudicialRequestDetail);
  return { ...result, ...wizard } as Partial<WizardFormData>;
}

export function mapRequestDetailToWizardForm(
  detail: JudicialRequestDetail,
): Partial<WizardFormData> {
  const checklistDetails = detail.checklistDetails;
  checklistDetails.checklistType = detail.checklistType;

  let checklistData: Partial<WizardFormData> = {};

  switch (checklistDetails.checklistType) {
    case 'RECUPERACAO_VASILHAMES':
      checklistData = {
        rvP13: checklistDetails.p13Quantity,
        rvP20: checklistDetails.p20Quantity,
        rvP45: checklistDetails.p45Quantity,
        rvHistoricalAmount: checklistDetails.historicalAmount,
        rvUpdatedAmount: checklistDetails.updatedAmount,
        rvRefusalReason: checklistDetails.refusalReason,
      };
      break;

    case 'COBRANCA_TITULOS':
      checklistData = {
        ctTitleType: checklistDetails.titleType,
        ctTitleNumber: checklistDetails.titleNumber,
        ctGuarantor: checklistDetails.guarantor,
        ctOtherGuarantees: checklistDetails.otherGuarantees,
      };
      break;

    case 'COBRANCA_MULTA_CONTRATUAL':
      checklistData = {
        mcContractType: checklistDetails.contractType,
        mcBreachedClause: checklistDetails.breachedClause,
        mcFirstCycleFinished: checklistDetails.firstCycleFinished,
        mcMaxDiscount: checklistDetails.maxDiscount,
      };
      break;
  }

  return {
    // Empresa
    companyLegalName: detail.company.name,
    companyCnpj: formatDocument(detail.company.cnpj),
    companyUf: detail.company.uf,
    companyCity: detail.company.city,

    // Devedor
    debtorLegalName: detail.debtor.name,
    debtorCnpj: formatDocument(detail.debtor.cnpj),

    debtorAddress: detail.debtor.debtorAddress,
    addressConfirmedBy: detail.debtor.addressConfirmedBy,
    addressConfirmedByRole: detail.debtor.addressConfirmedByRole,
    addressConfirmedByDate: detail.debtor.addressConfirmedByDate,

    // Dados específicos do checklist
    ...checklistData,

    // Tentativas de acordo
    agreementDetails: detail.agreementAttempts
      .map(
        (attempt) => `${attempt.date} - ${attempt.channel}: ${attempt.result}`,
      )
      .join('\n'),

    // Financeiro
    financialDetails: [
      `Valor: ${detail.financial.amount} ${detail.financial.currency}`,
      `Vencimento: ${detail.financial.dueDate}`,
    ].join('\n'),

    financialValue: formatCurrency(detail.financial.amount.toString(), false),
    financialIndex: detail.financial.index,
    financialUpdatedDate: detail.financial.dueDate,

    // Fatos
    factsSummary: [
      detail.factsSummary,
      ...(detail.llmResult?.recommendations ?? []),
    ].join('\n'),

    // Parecer
    opinionDetails:
      detail.llmResult?.summary ?? detail.opinion.recommendedAction,
  };
}

export default function RequestEditPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = use(params);
  const [detail, setDetail] = useState<JudicialRequestDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadAttempt, setReloadAttempt] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getRequestById(requestId)
      .then((data) => {
        if (cancelled) return;

        setDetail(data);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;

        setDetail(null);
        setError(
          'Não foi possível carregar os dados da solicitação. Tente novamente.',
        );
      })
      .finally(() => {
        if (cancelled) return;

        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requestId, reloadAttempt]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadAttempt((currentAttempt) => currentAttempt + 1);
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-heading">Carregando solicitação...</h1>
          <Link
            href="/solicitacoes"
            className={buttonVariants({ variant: 'outline', size: 'md' })}
          >
            <ArrowLeft size={14} /> Voltar
          </Link>
        </div>

        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-heading">Erro ao carregar solicitação</h1>
          <Link
            href="/solicitacoes"
            className={buttonVariants({ variant: 'outline', size: 'md' })}
          >
            <ArrowLeft size={14} /> Voltar
          </Link>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="mb-4 text-danger">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className={buttonVariants({ variant: 'primary', size: 'md' })}
              >
                <RefreshCw size={14} className="mr-2" />
                Tentar novamente
              </button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!detail) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-heading">Solicitação não encontrada</h1>
          <Link
            href="/solicitacoes"
            className={buttonVariants({ variant: 'outline', size: 'md' })}
          >
            <ArrowLeft size={14} /> Voltar
          </Link>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="text-center">
              A solicitação com ID {requestId} não foi encontrada.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (isEditing) {
    if (!detail.checklistType) {
      return (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-heading">Não foi possível editar</h1>
            <Link
              href="/solicitacoes"
              className={buttonVariants({ variant: 'outline', size: 'md' })}
            >
              <ArrowLeft size={14} /> Voltar
            </Link>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-body">
                A solicitação não possui um tipo de checklist definido.
              </p>
            </CardContent>
          </Card>
        </section>
      );
    }

    return (
      <ChecklistWizard
        mode="edit"
        requestId={requestId}
        initialChecklistType={detail.checklistType}
        initialFormData={extractWizardFormData(detail)}
        existingDocuments={detail.documents ?? []}
        userId={detail.createdByEmail}
        onCancel={() => setIsEditing(false)}
        onCompleted={() => {
          setIsEditing(false);
          setReloadAttempt((current) => current + 1);
        }}
        onSubmit={async ({ checklistType, formData, existingDocuments }) => {
          const payload = {
            requestId,
            checklistType,
            ...formData,
            existingDocuments,
          };

          const fd = new FormData();
          fd.append('metadata', JSON.stringify(payload));

          await updateRequest(requestId, fd);
          return { requestId, userId: detail?.createdBy?.email };
        }}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/solicitacoes"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <ArrowLeft size={14} /> Voltar
          </Link>
          <h1 className="mt-2 text-heading">Solicitação {requestId}</h1>
        </div>

        {isEditableStatus(detail.status) && (
          <button
            type="button"
            className={buttonVariants({ variant: 'primary', size: 'md' })}
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={14} className="mr-2" /> Editar
          </button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-subtitle">
            Informações da solicitação
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Tipo</p>
            <p className="font-medium">
              {detail.checklistType || 'Não especificado'}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge
              tone={
                detail.status === 'APPROVED'
                  ? 'success'
                  : detail.status === 'ERROR' || detail.status === 'REJECTED'
                    ? 'danger'
                    : detail.status === 'PROCESSING'
                      ? 'warning'
                      : 'neutral'
              }
            >
              {detail.status}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Criado em</p>
            <p className="font-medium">
              {detail.createdAt
                ? formatDate(detail.createdAt)
                : 'Não especificado'}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Última atualização</p>
            <p className="font-medium">
              {detail.updatedAt
                ? formatDate(detail.updatedAt)
                : 'Não especificado'}
            </p>
          </div>
        </CardContent>
      </Card>

      {(detail.summary || detail.structuredReport) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-subtitle">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            {detail.summary && (
              <p className="mb-4 text-body">{detail.summary}</p>
            )}

            {detail.structuredReport && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {detail.structuredReport.debtor && (
                  <div>
                    <p className="text-sm text-muted-foreground">Devedor</p>
                    <p className="font-medium">
                      {detail.structuredReport.debtor}
                    </p>
                  </div>
                )}

                {detail.structuredReport.amount !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="font-medium">
                      {formatCurrency(detail.structuredReport.amount)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-subtitle">Dados da solicitação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">ID da solicitação</p>
              <p className="font-medium">{detail.requestId}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Criado por</p>
              <p className="font-medium">
                {detail.createdByEmail || 'Não especificado'}
              </p>
            </div>

            {detail.llmScore !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Score LLM</p>
                <p className="font-medium">
                  {(detail.llmScore * 100).toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {(detail.score !== undefined ||
        (detail.inconsistencies?.length ?? 0) > 0 ||
        (detail.missingFields?.length ?? 0) > 0 ||
        (detail.missingDocuments?.length ?? 0) > 0 ||
        (detail.recommendations?.length ?? 0) > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-subtitle">
              Resultado da validação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail.score !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="font-medium">
                  {(detail.score * 100).toFixed(2)}%
                </p>
              </div>
            )}

            {detail.reviewedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Data de revisão</p>
                <p className="font-medium">{formatDate(detail.reviewedAt)}</p>
              </div>
            )}

            {(detail.missingFields?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Campos ausentes</p>
                <ul className="mt-1 list-inside list-disc">
                  {detail.missingFields?.map((field) => (
                    <li key={field} className="text-body">
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(detail.missingDocuments?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Documentos ausentes
                </p>
                <ul className="mt-1 list-inside list-disc">
                  {detail.missingDocuments?.map((doc) => (
                    <li key={doc} className="text-body">
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(detail.inconsistencies?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Inconsistências</p>
                <ul className="mt-1 list-inside list-disc">
                  {detail.inconsistencies?.map((item) => (
                    <li key={item} className="text-body">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(detail.recommendations?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Recomendações</p>
                <ul className="mt-1 list-inside list-disc">
                  {detail.recommendations?.map((recommendation) => (
                    <li key={recommendation} className="text-body">
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-subtitle">Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          {detail.documents && detail.documents.length > 0 ? (
            <div className="space-y-3">
              {detail.documents.map((doc, index) => (
                <div
                  key={`${doc.name ?? 'documento'}-${index}`}
                  className="flex flex-col justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-medium">
                      {doc.name || 'Documento sem nome'}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {doc.type && (
                        <span className="text-xs text-muted-foreground">
                          {doc.type}
                        </span>
                      )}
                      {doc.size !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(doc.size)}
                        </span>
                      )}
                      {doc.uploadedAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(doc.uploadedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {doc.downloadUrl ? (
                    <a
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                      })}
                    >
                      <Download size={14} className="mr-1" /> Baixar
                    </a>
                  ) : (
                    <button
                      type="button"
                      className={buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                      })}
                      disabled
                    >
                      <Download size={14} className="mr-1" /> Indisponível
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum documento anexado.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
