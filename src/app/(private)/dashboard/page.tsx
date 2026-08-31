'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Brain,
  Eye,
  FileText,
  Pencil,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { MiniBarChart } from '@/components/charts/MiniBarChart';
import { DashboardMetricGrid } from '@/components/dashboard/cards';
import { RequestDetailsModal } from '@/components/requests/RequestDetailsModal';
import { Button, buttonVariants } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { StatusTag } from '@/components/ui/StatusTag';
import {
  downloadRequestDocument,
  exportRequestCsv,
  exportRequestExcel,
  exportRequestPdf,
  getRequestById,
  listMyRequests,
} from '@/features/requests/api';
import {
  formatRequestDetailsForClipboard,
  writeTextToClipboard,
} from '@/features/requests/clipboard';
import type {
  JudicialRequestDetail,
  JudicialRequestListItem,
  RequestStatus,
} from '@/features/requests/types';
import { cn } from '@/lib/utils/cn';

const canEditStatus = new Set<RequestStatus>(['NEEDS_CORRECTION']);

export default function DashboardPage() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [items, setItems] = useState<JudicialRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [selectedRequest, setSelectedRequest] =
    useState<JudicialRequestDetail | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestExportingFormat, setRequestExportingFormat] = useState<
    'pdf' | 'csv' | 'excel' | null
  >(null);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<
    string | null
  >(null);
  const [isCopyingRequest, setIsCopyingRequest] = useState(false);
  const [hasCopiedRequest, setHasCopiedRequest] = useState(false);
  const [requestFeedback, setRequestFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const latestRequestRequestRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function loadRecentRequests() {
      setLoading(true);

      try {
        const data = await listMyRequests(
          {
            limit: 5,
            sortBy: 'createdAt',
            sortDirection: 'asc',
          },
          accessToken,
        );

        if (!active) return;
        setItems(data.items);
      } catch {
        if (active) {
          setItems([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRecentRequests();

    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!requestFeedback) return;
    const timer = window.setTimeout(() => setRequestFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [requestFeedback]);

  function resetRequestModalState() {
    setIsRequestModalOpen(false);
    setSelectedRequest(null);
    setSelectedRequestId(null);
    setRequestError(null);
    setRequestExportingFormat(null);
    setDownloadingDocumentId(null);
    setIsCopyingRequest(false);
    setHasCopiedRequest(false);
    setRequestFeedback(null);
  }

  async function handleViewRequest(requestId: string) {
    if (!requestId) return;

    const requestSequence = latestRequestRequestRef.current + 1;
    latestRequestRequestRef.current = requestSequence;

    setSelectedRequestId(requestId);
    setSelectedRequest(null);
    setRequestError(null);
    setHasCopiedRequest(false);
    setRequestFeedback(null);
    setIsRequestModalOpen(true);
    setIsRequestLoading(true);

    try {
      const detail = await getRequestById(requestId, accessToken);
      if (latestRequestRequestRef.current !== requestSequence) return;
      setSelectedRequest(detail);
    } catch {
      if (latestRequestRequestRef.current === requestSequence) {
        setRequestError('Não foi possível carregar os dados da solicitação.');
      }
    } finally {
      if (latestRequestRequestRef.current === requestSequence) {
        setIsRequestLoading(false);
      }
    }
  }

  async function handleExportRequest(format: 'pdf' | 'csv' | 'excel') {
    if (!selectedRequestId) return;
    setRequestExportingFormat(format);
    setRequestFeedback(null);

    try {
      const blob =
        format === 'pdf'
          ? await exportRequestPdf(selectedRequestId, accessToken)
          : format === 'csv'
            ? await exportRequestCsv(selectedRequestId, accessToken)
            : await exportRequestExcel(selectedRequestId, accessToken);

      const filename = `${selectedRequestId}.${format === 'excel' ? 'xlsx' : format}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setRequestFeedback({
        type: 'success',
        message: `Arquivo ${format.toUpperCase()} baixado.`,
      });
    } catch {
      setRequestFeedback({
        type: 'error',
        message: `Não foi possível gerar o arquivo ${format.toUpperCase()}.`,
      });
    } finally {
      setRequestExportingFormat(null);
    }
  }

  async function handleDownloadDocument(documentId: string) {
    if (!selectedRequestId || !documentId) return;
    setDownloadingDocumentId(documentId);
    setRequestFeedback(null);

    try {
      const blob = await downloadRequestDocument(
        selectedRequestId,
        documentId,
        accessToken,
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `documento-${documentId}`;
      document.body.append(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setRequestFeedback({
        type: 'success',
        message: 'Documento baixado com sucesso.',
      });
    } catch {
      setRequestFeedback({
        type: 'error',
        message: 'Não foi possível baixar o documento.',
      });
    } finally {
      setDownloadingDocumentId(null);
    }
  }

  async function handleCopyRequestContent() {
    if (!selectedRequest) return;
    setIsCopyingRequest(true);
    setHasCopiedRequest(false);
    setRequestFeedback(null);

    try {
      const text = formatRequestDetailsForClipboard(selectedRequest);
      const result = await writeTextToClipboard(text);
      if (!result.success) {
        setRequestFeedback({
          type: 'error',
          message:
            'Não foi possível copiar o conteúdo. O navegador não autorizou a área de transferência.',
        });
        return;
      }
      setHasCopiedRequest(true);
      setRequestFeedback({
        type: 'success',
        message: 'Conteúdo copiado para a área de transferência.',
      });
    } catch {
      setRequestFeedback({
        type: 'error',
        message: 'Não foi possível copiar o conteúdo da solicitação.',
      });
    } finally {
      setIsCopyingRequest(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-label">Painel Operacional</p>
          <h1 className="text-heading">Dashboard Judicial</h1>
          <p className="text-body mt-1">
            Visão em tempo real de solicitações, performance de análise e fluxo
            de aprovação.
          </p>
        </div>
        <Link
          href="/solicitacoes/nova"
          className={buttonVariants({ variant: 'primary', size: 'md' })}
        >
          Nova solicitação <ArrowRight size={16} />
        </Link>
      </div>

      <DashboardMetricGrid />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Distribuição por tipo de checklist</CardTitle>
              <CardDescription>
                Proporção das entradas na última semana.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <MiniBarChart
              labels={[
                'Multa contratual',
                'Cobrança de títulos',
                'Recuperação vasilhames',
              ]}
              values={[34, 21, 13]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores de qualidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InsightRow
              icon={<Brain size={15} />}
              label="Confiabilidade LLM"
              value="94,2%"
              tone="info"
            />
            <InsightRow
              icon={<TrendingUp size={15} />}
              label="SLA médio"
              value="3h 12m"
              tone="success"
            />
            <InsightRow
              icon={<Sparkles size={15} />}
              label="Aprovações automáticas"
              value="76%"
              tone="primary"
            />
            <InsightRow
              icon={<FileText size={15} />}
              label="Documentos pendentes"
              value="9"
              tone="warning"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações recentes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <RequestDetailsModal
            open={isRequestModalOpen}
            request={selectedRequest}
            loading={isRequestLoading}
            error={requestError}
            exportingFormat={requestExportingFormat}
            downloadingDocumentId={downloadingDocumentId}
            isCopying={isCopyingRequest}
            hasCopied={hasCopiedRequest}
            onClose={resetRequestModalState}
            onRetry={() =>
              selectedRequestId && handleViewRequest(selectedRequestId)
            }
            onExportPdf={() => handleExportRequest('pdf')}
            onExportCsv={() => handleExportRequest('csv')}
            onExportExcel={() => handleExportRequest('excel')}
            onDownloadDocument={handleDownloadDocument}
            onCopyContent={handleCopyRequestContent}
          />

          {requestFeedback ? (
            <div
              role="status"
              aria-live="polite"
              className={cn(
                'rounded-md border p-3 text-sm',
                requestFeedback.type === 'success'
                  ? 'border-success/40 bg-success/10 text-success'
                  : 'border-danger/40 bg-danger/10 text-danger',
              )}
            >
              {requestFeedback.message}
            </div>
          ) : null}

          {loading ? (
            <p className="text-body">Carregando solicitações...</p>
          ) : items.length === 0 ? (
            <p className="text-body text-muted-foreground">
              Nenhuma solicitação recente encontrada.
            </p>
          ) : (
            items.map((item) => {
              const canEdit = canEditStatus.has(item.status);

              return (
                <div
                  key={item.requestId}
                  className="flex flex-col gap-3 rounded-md border border-border/80 bg-background/40 p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{item.requestId}</p>
                    <p className="text-body">
                      {item.checklistType.replace(/_/g, ' ')} •{' '}
                      {item.debtorName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusTag status={item.status} />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRequest(item.requestId)}
                    >
                      <Eye size={14} /> Consultar
                    </Button>

                    <Link
                      href={`/solicitacoes/${item.requestId}/editar`}
                      title={
                        canEdit
                          ? 'Editar solicitação'
                          : 'Somente solicitações em NEEDS_CORRECTION podem ser editadas'
                      }
                      aria-disabled={!canEdit}
                      tabIndex={canEdit ? 0 : -1}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'sm' }),
                        !canEdit ? 'pointer-events-none opacity-45' : '',
                      )}
                    >
                      <Pencil size={14} /> Editar
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function InsightRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: 'primary' | 'info' | 'warning' | 'success';
}) {
  const toneClass = {
    primary: 'bg-primary/15 text-primary',
    info: 'bg-info/15 text-info',
    warning: 'bg-warning/15 text-warning',
    success: 'bg-success/15 text-success',
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-md border border-border/80 bg-background/40 p-3">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex size-8 items-center justify-center rounded-md ${toneClass}`}
        >
          {icon}
        </span>
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
