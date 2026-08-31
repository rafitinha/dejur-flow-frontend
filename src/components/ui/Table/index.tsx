'use client';

import { useMemo } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils/cn';

export type ServerTableFilterValue = string | number | boolean;

export type ServerTableQuery = {
  pageIndex: number;
  pageSize: number;
  offset: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, ServerTableFilterValue | undefined>;
};

export type ServerTableColumn<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

export function buildServerTableQuery(params: {
  pageIndex: number;
  pageSize: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, ServerTableFilterValue | undefined>;
}) {
  const { pageIndex, pageSize, sortBy, sortDirection, filters } = params;
  return {
    pageIndex,
    pageSize,
    offset: pageIndex * pageSize,
    sortBy,
    sortDirection,
    filters,
  } satisfies ServerTableQuery;
}

export function buildExportRoute(
  baseRoute: string,
  query: ServerTableQuery,
) {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    'http://localhost:8080';

  const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, '');
  const normalizedRoute = baseRoute.startsWith('http')
    ? baseRoute
    : `${normalizedBaseUrl}${baseRoute.startsWith('/') ? baseRoute : `/${baseRoute}`}`;

  const params = new URLSearchParams();
  params.set('pageIndex', String(query.pageIndex));
  params.set('pageSize', String(query.pageSize));
  params.set('offset', String(query.offset));
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortDirection) params.set('sortDirection', query.sortDirection);

  if (query.filters) {
    Object.entries(query.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== '') {
        params.set(key, String(value));
      }
    });
  }

  const route = `${normalizedRoute}${params.toString() ? `?${params.toString()}` : ''}`;
  return route;
}

export function ServerDataTable<T extends object>({
  columns,
  rows,
  rowCount,
  query,
  onQueryChange,
  loading,
  onExportCSV,
  onExportExcel,
  className,
}: {
  columns: ServerTableColumn<T>[];
  rows: T[];
  rowCount: number;
  query: ServerTableQuery;
  onQueryChange: (query: ServerTableQuery) => void;
  loading?: boolean;
  onExportCSV?: (query: ServerTableQuery) => void;
  onExportExcel?: (query: ServerTableQuery) => void;
  className?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(rowCount / query.pageSize));

  const pageSizeOptions = useMemo(
    () =>
      [10, 20, 50, 100].map((size) => ({
        value: String(size),
        label: `${size} / página`,
      })),
    [],
  );

  function onSort(columnKey: string) {
    const nextDirection =
      query.sortBy === columnKey && query.sortDirection === 'asc'
        ? 'desc'
        : 'asc';

    onQueryChange(
      buildServerTableQuery({
        ...query,
        pageIndex: 0,
        sortBy: columnKey,
        sortDirection: nextDirection,
      }),
    );
  }

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={cn('surface-card overflow-hidden p-0', className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 p-4">
        <p className="text-caption">{rowCount} registros encontrados</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExportCSV?.(query)}
          >
            <Download size={14} /> Exportar CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExportExcel?.(query)}
          >
            <FileSpreadsheet size={14} /> Exportar Excel
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'border-b border-border/80 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground',
                    column.className,
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => onSort(String(column.key))}
                    >
                      {column.label}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-border/70 hover:bg-hover/60"
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-4 py-3 text-sm text-foreground"
                  >
                    {column.render
                      ? column.render(row)
                      : String(row[column.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum item encontrado para os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 p-4">
        <div className="w-[160px]">
          <Select
            value={String(query.pageSize)}
            onValueChange={(value) =>
              onQueryChange(
                buildServerTableQuery({
                  ...query,
                  pageIndex: 0,
                  pageSize: Number(value),
                }),
              )
            }
            options={pageSizeOptions}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={query.pageIndex <= 0}
            onClick={() =>
              onQueryChange(
                buildServerTableQuery({
                  ...query,
                  pageIndex: Math.max(0, query.pageIndex - 1),
                }),
              )
            }
          >
            Anterior
          </Button>
          <p className="text-caption">
            Página {query.pageIndex + 1} de {totalPages}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={query.pageIndex >= totalPages - 1}
            onClick={() =>
              onQueryChange(
                buildServerTableQuery({
                  ...query,
                  pageIndex: Math.min(totalPages - 1, query.pageIndex + 1),
                }),
              )
            }
          >
            Próxima
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
