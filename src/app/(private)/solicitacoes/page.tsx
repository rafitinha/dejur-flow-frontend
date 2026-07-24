'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
import { StatusTag } from '@/components/ui/StatusTag';
import { listMyRequests } from '@/features/requests/api';
import {
  JudicialRequestListItem,
  RequestStatus,
} from '@/features/requests/types';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    debtorCnpj: '',
  });

  async function loadRequests(nextFilters = filters) {
    setLoading(true);
    setError(null);

    try {
      const data = await listMyRequests({
        startDate: nextFilters.startDate || undefined,
        endDate: nextFilters.endDate || undefined,
        status: nextFilters.status || undefined,
        debtorCnpj: nextFilters.debtorCnpj || undefined,
      });
      setItems(data);
    } catch {
      setError('Nao foi possivel carregar as solicitacoes no momento.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Carregamento inicial da listagem ao montar a tela.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canEditStatus = useMemo(
    () => new Set<RequestStatus>(['DRAFT', 'NEEDS_CORRECTION', 'ERROR']),
    [],
  );

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Minhas solicitações</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            className="rounded border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-950"
            placeholder="Data inicial"
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
          <input
            className="rounded border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-950"
            placeholder="Data final"
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
          <select
            className="rounded border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-950"
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="">Todos os status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            className="rounded border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-950"
            placeholder="CNPJ devedora"
            value={filters.debtorCnpj}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, debtorCnpj: e.target.value }))
            }
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="rounded bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => void loadRequests()}
          >
            Filtrar
          </button>
          <button
            type="button"
            className="rounded border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
            onClick={() => {
              const clearedFilters = {
                startDate: '',
                endDate: '',
                status: '',
                debtorCnpj: '',
              };
              setFilters(clearedFilters);
              void loadRequests(clearedFilters);
            }}
          >
            Limpar
          </button>
        </div>

        {loading && (
          <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">
            Carregando solicitações...
          </p>
        )}

        {error && (
          <p className="mt-6 rounded border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="mt-6 grid gap-2">
            {items.length === 0 && (
              <p className="rounded border border-slate-200 p-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                Nenhuma solicitação encontrada para os filtros informados.
              </p>
            )}

            {items.map((item) => (
              <div
                key={item.requestId}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {item.requestId} • {item.debtorName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.checklistType} • CNPJ {item.debtorCnpj}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <StatusTag status={item.status} />

                  <Link
                    href={`/solicitacoes/${item.requestId}`}
                    className="inline-flex items-center gap-1 rounded border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-600"
                  >
                    <Eye size={14} /> Consultar
                  </Link>

                  <Link
                    href={`/solicitacoes/${item.requestId}/editar`}
                    className="inline-flex items-center gap-1 rounded border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-50 dark:border-slate-600"
                    aria-disabled={!canEditStatus.has(item.status)}
                    onClick={(event) => {
                      if (!canEditStatus.has(item.status)) {
                        event.preventDefault();
                      }
                    }}
                    title={
                      canEditStatus.has(item.status)
                        ? 'Editar solicitação'
                        : 'Somente solicitações em DRAFT, NEEDS_CORRECTION ou ERROR podem ser editadas'
                    }
                  >
                    <Pencil size={14} /> Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
