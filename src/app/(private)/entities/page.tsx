'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Check, Filter, Pencil, Plus, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { DatePicker } from '@/components/ui/DatePicker';
import { EmptyStateCard } from '@/components/common/EmptyStateCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EntityModal } from '@/components/entities/EntityModal';
import {
  createEntity,
  getEntityById,
  listEntities,
  patchEntityStatus,
  updateEntity,
  type Entity,
  type EntityStatus,
  type EntityTaxIdType,
  type EntityType,
} from '@/features/requests/api';
import { formatDocument } from '@/lib/utils/cnpj';

const taxTypeOptions = [
  { value: 'CPF', label: 'CPF' },
  { value: 'CNPJ', label: 'CNPJ' },
] as const;

const entityTypeOptions = [
  { value: 'ORGANIZATIONAL', label: 'Organizacional' },
  { value: 'DEBTOR', label: 'Devedora' },
  { value: 'PHYSICAL_PERSON', label: 'Pessoa Física' },
] as const;

const statusLabels: Record<EntityStatus, string> = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
};

const statusOptions = [
  { value: 'ACTIVE', label: 'Ativa' },
  { value: 'INACTIVE', label: 'Inativa' },
] as const;

const DEBOUNCE_MS = 500;
const TEXT_FILTER_MIN_LENGTH = 6;

function isValidDateFilter(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) || /^\d{2}\/\d{2}\/\d{4}$/.test(value)
  );
}

function normalizeDateFilter(value: string) {
  if (!value) return '';

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  }

  return value;
}

export default function EntitiesPage() {
  const { data: session, status } = useSession();
  const token = session?.accessToken;

  const [items, setItems] = useState<Entity[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [inputFilters, setInputFilters] = useState({
    name: '',
    taxId: '',
    taxIdType: '',
    type: '',
    createdAt: '',
    updatedAt: '',
  });
  const [filters, setFilters] = useState(inputFilters);

  const activePageSize = 10;

  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextFilters = {
        ...inputFilters,
        name:
          inputFilters.name.trim().length >= TEXT_FILTER_MIN_LENGTH
            ? inputFilters.name.trim()
            : '',
        taxId:
          inputFilters.taxId.trim().length >= TEXT_FILTER_MIN_LENGTH
            ? inputFilters.taxId.trim()
            : '',
        createdAt: inputFilters.createdAt
          ? isValidDateFilter(inputFilters.createdAt)
            ? normalizeDateFilter(inputFilters.createdAt)
            : ''
          : '',
        updatedAt: inputFilters.updatedAt
          ? isValidDateFilter(inputFilters.updatedAt)
            ? normalizeDateFilter(inputFilters.updatedAt)
            : ''
          : '',
      };

      setFilters(nextFilters);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [inputFilters]);

  async function loadEntities() {
    if (status !== 'authenticated' || !token) {
      setItems([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextItems = await listEntities(
        {
          name: filters.name || undefined,
          taxId: filters.taxId || undefined,
          taxIdType: (filters.taxIdType as EntityTaxIdType) || undefined,
          type: (filters.type as EntityType) || undefined,
          createdAt: filters.createdAt || undefined,
          updatedAt: filters.updatedAt || undefined,
          limit: activePageSize,
          offset: pageIndex * activePageSize,
          index: pageIndex,
        },
        token,
      );

      setItems(nextItems ?? []);
      setTotalCount(nextItems?.length ?? 0);
    } catch {
      setError('Não foi possível carregar as entidades no momento.');
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    status,
    token,
    pageIndex,
    filters.name,
    filters.taxId,
    filters.taxIdType,
    filters.type,
    filters.createdAt,
    filters.updatedAt,
  ]);

  function toggleSelect(id?: string) {
    if (!id) return;
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(items.map((item) => item.id ?? '').filter(Boolean));
  }

  const selectedStatuses = useMemo(() => {
    return items
      .filter((item) => selectedIds.includes(item.id ?? ''))
      .map((item) => item.status);
  }, [items, selectedIds]);

  const bulkActionTarget =
    selectedStatuses.length > 0
      ? selectedStatuses.every((status) => status === 'ACTIVE')
        ? 'INACTIVE'
        : 'ACTIVE'
      : null;

  async function handleBulkStatusChange() {
    if (!bulkActionTarget || !selectedIds.length || !token) return;

    try {
      setSaving(true);
      await Promise.all(
        selectedIds.map((id) =>
          patchEntityStatus(id, bulkActionTarget as EntityStatus, token),
        ),
      );
      setSelectedIds([]);
      await loadEntities();
    } catch {
      setError(
        'Não foi possível atualizar o status das entidades selecionadas.',
      );
    } finally {
      setSaving(false);
    }
  }

  function updateFilter<K extends keyof typeof inputFilters>(
    key: K,
    value: (typeof inputFilters)[K],
  ) {
    setPageIndex(0);
    setInputFilters((current) => ({ ...current, [key]: value }));
  }

  async function handleCreateEntity(payload: Partial<Entity>) {
    if (!token) return;
    try {
      setSaving(true);
      await createEntity(payload, token);
      setModalOpen(false);
      setSelectedEntity(null);
      await loadEntities();
    } catch {
      setError('Não foi possível criar a entidade.');
    } finally {
      setSaving(false);
    }
  }

  async function handleEditEntity(payload: Partial<Entity>) {
    if (!token || !selectedEntity?.id) return;
    try {
      setSaving(true);
      await updateEntity(selectedEntity.id, payload, token);
      setModalOpen(false);
      setSelectedEntity(null);
      await loadEntities();
    } catch {
      setError('Não foi possível atualizar a entidade.');
    } finally {
      setSaving(false);
    }
  }

  async function openEditModal(entity: Entity) {
    if (!entity.id) {
      setSelectedEntity(entity);
      setModalOpen(true);
      return;
    }

    try {
      const detail = await getEntityById(entity.id, token ?? undefined);
      setSelectedEntity(detail);
    } catch {
      setSelectedEntity(entity);
      setError(
        'Não foi possível carregar os detalhes da entidade. Usando os dados da listagem.',
      );
    } finally {
      setModalOpen(true);
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / activePageSize));

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-label text-primary">Administração</p>
          <h1 className="text-display">Entidades</h1>
        </div>
        <Button
          onClick={() => {
            setSelectedEntity(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} /> Adicionar
        </Button>
      </div>

      <Card>
        <CardHeader className="items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 size={18} /> Filtros
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setInputFilters({
                name: '',
                taxId: '',
                taxIdType: '',
                type: '',
                createdAt: '',
                updatedAt: '',
              });
              setFilters({
                name: '',
                taxId: '',
                taxIdType: '',
                type: '',
                createdAt: '',
                updatedAt: '',
              });
              setPageIndex(0);
            }}
          >
            <X size={14} /> Limpar
          </Button>
        </CardHeader>
        <CardContent className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="flex min-h-[78px] flex-col justify-end gap-2">
            <label className="block text-caption">Razão</label>
            <Input
              value={inputFilters.name}
              onChange={(event) => updateFilter('name', event.target.value)}
              placeholder="Razão"
            />
          </div>

          <div className="flex min-h-[78px] flex-col justify-end gap-2">
            <label className="block text-caption">CPF/CNPJ</label>
            <Input
              value={inputFilters.taxId}
              onChange={(event) => updateFilter('taxId', event.target.value)}
              placeholder="Digite o documento"
            />
          </div>

          <div className="flex min-h-[78px] flex-col justify-end gap-2">
            <label className="block text-caption">Documento</label>
            <Select
              value={inputFilters.taxIdType}
              onValueChange={(value) => updateFilter('taxIdType', value)}
              placeholder="Todos"
              options={[{ value: '', label: 'Todos' }, ...taxTypeOptions]}
            />
          </div>

          <div className="flex min-h-[78px] flex-col justify-end gap-2">
            <label className="block text-caption">Tipo</label>
            <Select
              value={inputFilters.type}
              onValueChange={(value) => updateFilter('type', value)}
              placeholder="Todos"
              options={[{ value: '', label: 'Todos' }, ...entityTypeOptions]}
            />
          </div>

          <div className="flex min-h-[78px] flex-col justify-end gap-2">
            <label className="block text-caption">Data de cadastro</label>
            <DatePicker
              value={inputFilters.createdAt}
              onChange={(value) => updateFilter('createdAt', value)}
            />
          </div>

          <div className="flex min-h-[78px] flex-col justify-end gap-2">
            <label className="block text-caption">Data de atualização</label>
            <DatePicker
              value={inputFilters.updatedAt}
              onChange={(value) => updateFilter('updatedAt', value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="items-center justify-between">
          <CardTitle>Lista de entidades</CardTitle>
          {selectedIds.length > 0 && (
            <Button
              variant="outline"
              onClick={handleBulkStatusChange}
              loading={saving}
            >
              {bulkActionTarget === 'ACTIVE'
                ? 'Ativar selecionadas'
                : 'Inativar selecionadas'}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-danger">{error}</p>}

          {loading ? (
            <div className="space-y-3">
              <div className="skeleton-premium h-12 w-full rounded-md" />
              <div className="skeleton-premium h-12 w-full rounded-md" />
              <div className="skeleton-premium h-12 w-full rounded-md" />
            </div>
          ) : items.length === 0 ? (
            <EmptyStateCard
              title="Nenhuma entidade encontrada"
              description="Ainda não há entidades cadastradas para os filtros atuais."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-3 py-3">
                      <Checkbox
                        checked={
                          items.length > 0 &&
                          selectedIds.length === items.length
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-3 py-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                      Razão
                    </th>
                    <th className="px-3 py-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                      Documento
                    </th>
                    <th className="px-3 py-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                      Tipo
                    </th>
                    <th className="px-3 py-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                      Situação
                    </th>
                    <th className="px-3 py-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                      Cadastro
                    </th>
                    <th className="px-3 py-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                      Atualização
                    </th>
                    <th className="px-3 py-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border/80 hover:bg-hover/60"
                    >
                      <td className="px-3 py-3">
                        <Checkbox
                          checked={selectedIds.includes(item.id ?? '')}
                          onCheckedChange={() => toggleSelect(item.id)}
                        />
                      </td>
                      <td className="px-3 py-3 text-sm text-foreground">
                        {item.name}
                      </td>
                      <td className="px-3 py-3 text-sm text-foreground">
                        {formatDocument(item.taxId)}
                      </td>
                      <td className="px-3 py-3 text-sm text-foreground">
                        {entityTypeOptions.find(
                          (opt) => opt.value === item.type,
                        )?.label ?? item.type}
                      </td>
                      <td className="px-3 py-3 text-sm text-foreground">
                        <span className="rounded-full border border-border bg-muted px-2 py-1 text-xs">
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-foreground">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-foreground">
                        {item.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            void openEditModal(item);
                          }}
                        >
                          <Pencil size={14} /> Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-caption">{totalCount} registros encontrados</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageIndex === 0}
                  onClick={() =>
                    setPageIndex((current) => Math.max(0, current - 1))
                  }
                >
                  Anterior
                </Button>
                <span className="text-caption">
                  Página {pageIndex + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageIndex >= totalPages - 1}
                  onClick={() => setPageIndex((current) => current + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EntityModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEntity(null);
        }}
        mode={selectedEntity ? 'edit' : 'create'}
        initialValues={selectedEntity ?? undefined}
        loading={saving}
        onSubmit={selectedEntity ? handleEditEntity : handleCreateEntity}
      />
    </main>
  );
}
