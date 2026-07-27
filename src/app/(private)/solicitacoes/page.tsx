'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Eye, Filter, Pencil, Search, X } from 'lucide-react';
import { EmptyStateCard } from '@/components/common/EmptyStateCard';
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
import { REQUESTS_API_ROUTES } from '@/features/requests/routes';
import { listMyRequests } from '@/features/requests/api';
import {
  JudicialRequestListItem,
  RequestStatus,
} from '@/features/requests/types';
import { cn } from '@/lib/utils/cn';

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

  async function loadRequests(
    activeFilters = appliedFilters,
    query = tableQuery,
  ) {
    setLoading(true);
    setError(null);

    try {
      const data = await listMyRequests({
        startDate: activeFilters.startDate || undefined,
        endDate: activeFilters.endDate || undefined,
        status: activeFilters.status || undefined,
        debtorCnpj: activeFilters.debtorCnpj || undefined,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
      });
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
    void loadRequests(appliedFilters, tableQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, tableQuery]);

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
            <Link
              href={`/solicitacoes/${item.requestId}`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <Eye size={14} /> Consultar
            </Link>

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
        <h1 className="text-heading">Minhas solicitações</h1>
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
              REQUESTS_API_ROUTES.exportCsv,
              query,
              'csv',
            );
            window.open(route, '_blank');
          }}
          onExportExcel={(query) => {
            const route = buildExportRoute(
              REQUESTS_API_ROUTES.exportExcel,
              query,
              'xlsx',
            );
            window.open(route, '_blank');
          }}
        />
      )}
    </section>
  );
}
