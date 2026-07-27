'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export type DataColumn<T> = {
  key: keyof T;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => ReactNode;
};

export function DataTable<T extends object>({
  columns,
  data,
  getRowId,
  searchPlaceholder = 'Pesquisar...',
  emptyLabel = 'Nenhum registro encontrado.',
  pageSize = 8,
}: {
  columns: DataColumn<T>[];
  data: T[];
  getRowId: (row: T, index: number) => string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  pageSize?: number;
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data;

    return data.filter((row) =>
      Object.values(row as Record<string, unknown>).some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(normalized),
      ),
    );
  }, [data, query]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;

    return [...filtered].sort((a, b) => {
      const left = String(a[sortKey] ?? '');
      const right = String(b[sortKey] ?? '');
      const result = left.localeCompare(right, 'pt-BR', { numeric: true });
      return sortDirection === 'asc' ? result : -result;
    });
  }, [filtered, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  function onSort(key: keyof T) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border/80 p-4">
          <div className="relative max-w-sm">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="pl-9"
              aria-label="Pesquisar na tabela"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-muted/50">
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
                        onClick={() => onSort(column.key)}
                        className="inline-flex items-center gap-1"
                      >
                        <span>{column.header}</span>
                        {sortKey === column.key ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp size={12} />
                          ) : (
                            <ArrowDown size={12} />
                          )
                        ) : null}
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    {emptyLabel}
                  </td>
                </tr>
              )}

              {pageRows.map((row, index) => (
                <tr
                  key={getRowId(row, index)}
                  className="border-b border-border/70 transition-colors hover:bg-hover/65"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn(
                        'px-4 py-3 text-sm text-foreground',
                        column.className,
                      )}
                    >
                      {column.render
                        ? column.render(row)
                        : String(row[column.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border/80 p-4">
          <p className="text-caption">
            Página {safePage} de {totalPages} • {sorted.length} registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Próxima
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
