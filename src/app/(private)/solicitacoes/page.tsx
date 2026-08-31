'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Filter, Pencil, Search, X } from 'lucide-react';
import { EmptyStateCard } from '@/components/common/EmptyStateCard';
import { RequestDetailsModal } from '@/components/requests/RequestDetailsModal';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusTag } from '@/components/ui/StatusTag';
import {
  buildExportRoute,
  buildServerTableQuery,
  ServerDataTable,
  ServerTableColumn,
  ServerTableQuery,
} from '@/components/ui/Table';
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
import { REQUESTS_API_ROUTES } from '@/features/requests/routes';
import {
  JudicialRequestDetail,
  JudicialRequestListItem,
  RequestStatus,
} from '@/features/requests/types';
import { cn } from '@/lib/utils/cn';
import { useSession } from 'next-auth/react';

const statusOptions: RequestStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'PROCESSING',
  'APPROVED',
  'REJECTED',
  'ERROR',
  'NEEDS_CORRECTION',
  'CANCELLED',
];

export default function RequestsPage() {
  const { data: session, status } = useSession();
  const token = session?.accessToken;

  const [items, setItems] = useState<JudicialRequestListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    debtorCnpj: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [tableQuery, setTableQuery] = useState<ServerTableQuery>(
    buildServerTableQuery({ pageIndex: 0, pageSize: 10 }),
  );
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

  async function loadRequests(
    activeFilters = appliedFilters,
    query = tableQuery,
    currentToken = token,
  ) {
    setLoading(true);
    setError(null);

    if (status !== 'authenticated' || !currentToken) {
      setLoading(false);
      setItems([]);
      setTotalCount(0);
      return;
    }

    try {
      const data = await listMyRequests(
        {
          startDate: activeFilters.startDate || undefined,
          endDate: activeFilters.endDate || undefined,
          status: activeFilters.status || undefined,
          debtorCnpj: activeFilters.debtorCnpj || undefined,
          pageIndex: query.pageIndex,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortDirection: query.sortDirection,
        },
        currentToken,
      );
      setTotalCount(data.totalCount);
      setItems(data.items);
    } catch {
      setError('Nao foi possivel carregar as solicitacoes no momento.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Carregamento remoto quando mudam filtros aplicados ou query server-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRequests(appliedFilters, tableQuery, token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, tableQuery, token, status]);

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
      const detail = await getRequestById(requestId);
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
          ? await exportRequestPdf(selectedRequestId)
          : format === 'csv'
            ? await exportRequestCsv(selectedRequestId)
            : await exportRequestExcel(selectedRequestId);

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
      const blob = await downloadRequestDocument(selectedRequestId, documentId);
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

  const canEditStatus = useMemo(
    () => new Set<RequestStatus>(['DRAFT', 'NEEDS_CORRECTION', 'ERROR']),
    [],
  );

  const columns = useMemo<ServerTableColumn<JudicialRequestListItem>[]>(
    () => [
      {
        key: 'requestId',
        label: 'Solicitação',
        sortable: true,
        render: (item) => (
          <div>
            <p className="font-medium text-foreground">{item.requestId}</p>
            <p className="text-caption">{item.checklistType}</p>
          </div>
        ),
      },
      {
        key: 'debtorName',
        label: 'Devedora',
        sortable: true,
        render: (item) => (
          <div>
            <p>{item.debtorName}</p>
            <p className="text-caption">CNPJ {item.debtorCnpj}</p>
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (item) => <StatusTag status={item.status} />,
      },
      {
        key: 'createdAt',
        label: 'Ações',
        className: 'w-[220px]',
        render: (item) => (
          <div className="flex items-center gap-2">
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
                canEditStatus.has(item.status)
                  ? 'Editar solicitação'
                  : 'Somente solicitações em DRAFT, NEEDS_CORRECTION ou ERROR podem ser editadas'
              }
              aria-disabled={!canEditStatus.has(item.status)}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                !canEditStatus.has(item.status)
                  ? 'pointer-events-none opacity-45'
                  : '',
              )}
            >
              <Pencil size={14} /> Editar
            </Link>
          </div>
        ),
      },
    ],
    [canEditStatus],
  );

  return (
    <section className="space-y-4">
      <div>
        <p className="text-label">Operações</p>
        <h1 className="text-heading">Solicitações</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-subtitle">
            <Filter size={16} /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DatePicker
              value={filters.startDate}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, startDate: value }))
              }
            />

            <DatePicker
              value={filters.endDate}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, endDate: value }))
              }
            />

            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              placeholder="Todos os status"
              options={[
                { value: '', label: 'Todos os status' },
                ...statusOptions.map((status) => ({
                  value: status,
                  label: status,
                })),
              ]}
            />

            <Input
              placeholder="CNPJ devedora"
              value={filters.debtorCnpj}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, debtorCnpj: e.target.value }))
              }
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setAppliedFilters(filters);
                setTableQuery((prev) =>
                  buildServerTableQuery({
                    ...prev,
                    pageIndex: 0,
                    pageSize: prev.pageSize,
                    filters,
                  }),
                );
              }}
            >
              <Search size={14} /> Filtrar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const clearedFilters = {
                  startDate: '',
                  endDate: '',
                  status: '',
                  debtorCnpj: '',
                };
                setFilters(clearedFilters);
                setAppliedFilters(clearedFilters);
                setTableQuery((prev) =>
                  buildServerTableQuery({
                    ...prev,
                    pageIndex: 0,
                    pageSize: prev.pageSize,
                    filters: clearedFilters,
                  }),
                );
              }}
            >
              <X size={14} /> Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && <p className="text-body">Carregando solicitações...</p>}

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

      {error && (
        <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyStateCard
          title="Nenhuma solicitação encontrada"
          description="Ajuste os filtros ou crie uma nova solicitação para iniciar o fluxo de validação."
          ctaHref="/solicitacoes/nova"
          ctaLabel="Nova solicitação"
        />
      )}

      {!loading && !error && items.length > 0 && (
        <ServerDataTable
          columns={columns}
          rows={items}
          rowCount={totalCount}
          query={tableQuery}
          onQueryChange={setTableQuery}
          loading={loading}
          onExportCSV={(query) => {
            const route = buildExportRoute(
              REQUESTS_API_ROUTES.listExportCsv,
              query,
            );
            window.open(route, '_blank');
          }}
          onExportExcel={(query) => {
            const route = buildExportRoute(
              REQUESTS_API_ROUTES.listExportExcel,
              query,
            );
            window.open(route, '_blank');
          }}
        />
      )}
    </section>
  );
}
