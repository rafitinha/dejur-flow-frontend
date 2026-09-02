'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { getCities, getStates } from '@brazilian-utils/brazilian-utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import type {
  Entity,
  EntityStatus,
  EntityTaxIdType,
  EntityType,
} from '@/features/requests/api';
import { lookupPostalCode } from '@/features/address/cep';
import { isValidTaxId } from '@/lib/utils/cnpj';

const taxIdTypeLabels: Record<EntityTaxIdType, string> = {
  CPF: 'CPF',
  CNPJ: 'CNPJ',
};

const entityTypeLabels: Record<EntityType, string> = {
  ORGANIZATIONAL: 'Organizacional',
  DEBTOR: 'Devedora',
  PHYSICAL_PERSON: 'Pessoa Física',
};

const statusLabels: Record<EntityStatus, string> = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
};

const brazilStates = getStates();
const brazilStateCodes = new Set<string>(
  brazilStates.map((state) => state.code),
);

const entitySchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório.'),
  legalName: z.string().min(2, 'Razão social é obrigatória.'),
  taxId: z.string().min(11, 'Documento é obrigatório.'),
  taxIdType: z.enum(['CPF', 'CNPJ']),
  type: z.enum(['ORGANIZATIONAL', 'DEBTOR', 'PHYSICAL_PERSON']),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  address: z.object({
    street: z.string().min(2, 'Logradouro é obrigatório.'),
    number: z.string().nullable().optional(),
    complement: z.string().nullable().optional(),
    district: z.string().min(2, 'Bairro é obrigatório.'),
    city: z.string().min(2, 'Cidade é obrigatória.'),
    state: z.string().min(2, 'UF é obrigatória.'),
    postalCode: z.string().min(8, 'CEP é obrigatório.'),
    country: z.string().min(2, 'País é obrigatório.'),
  }),
});

export type EntityFormValues = z.infer<typeof entitySchema>;

const emptyForm: EntityFormValues = {
  name: '',
  legalName: '',
  taxId: '',
  taxIdType: 'CNPJ',
  type: 'ORGANIZATIONAL',
  status: 'ACTIVE',
  address: {
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Brazil',
  },
};

function formatTaxId(value: string, taxIdType: EntityTaxIdType) {
  const digits = value.replace(/\D/g, '');
  if (taxIdType === 'CPF') {
    return digits
      .slice(0, 11)
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return digits
    .slice(0, 14)
    .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function formatPostalCode(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function normalizeValues(raw: Partial<Entity>): EntityFormValues {
  return {
    name: raw.name ?? '',
    legalName: raw.legalName ?? '',
    taxId: raw.taxId ?? '',
    taxIdType: raw.taxIdType ?? 'CNPJ',
    type: raw.type ?? 'ORGANIZATIONAL',
    status: raw.status ?? 'ACTIVE',
    address: {
      street: raw.address?.street ?? '',
      number: raw.address?.number ?? '',
      complement: raw.address?.complement ?? '',
      district: raw.address?.district ?? '',
      city: raw.address?.city ?? '',
      state: raw.address?.state ?? '',
      postalCode: raw.address?.postalCode ?? '',
      country: raw.address?.country ?? 'Brazil',
    },
  };
}

export function EntityModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading = false,
  mode = 'create',
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<Entity>) => Promise<void> | void;
  initialValues?: Partial<Entity>;
  loading?: boolean;
  mode?: 'create' | 'edit';
}) {
  const [form, setForm] = useState<EntityFormValues>(
    initialValues ? normalizeValues(initialValues) : emptyForm,
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isLookingUpPostalCode, setIsLookingUpPostalCode] = useState(false);

  const cityOptions = useMemo(() => {
    const currentState = form.address.state as
      (typeof brazilStates)[number]['code'] | undefined;

    if (!currentState || !brazilStateCodes.has(currentState)) {
      return [];
    }

    return getCities(currentState).sort((a, b) => a.localeCompare(b));
  }, [form.address.state]);

  useEffect(() => {
    setForm(initialValues ? normalizeValues(initialValues) : emptyForm);
    setErrors({});
  }, [initialValues, open]);

  const taxIdOptions = useMemo(
    () =>
      Object.entries(taxIdTypeLabels).map(([value, label]) => ({
        value,
        label,
      })),
    [],
  );

  const typeOptions = useMemo(
    () =>
      Object.entries(entityTypeLabels).map(([value, label]) => ({
        value,
        label,
      })),
    [],
  );

  const statusOptions = useMemo(
    () =>
      Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
    [],
  );

  function setField<K extends keyof EntityFormValues>(
    key: K,
    value: EntityFormValues[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setAddressField<K extends keyof EntityFormValues['address']>(
    key: K,
    value: EntityFormValues['address'][K],
  ) {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        [key]: value,
      },
    }));
  }

  function validate() {
    const parsed = entitySchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    const digits = form.taxId.replace(/\D/g, '');
    const normalizedState = form.address.state.trim().toUpperCase();

    if (
      form.taxIdType === 'CPF' &&
      (!isValidTaxId(form.taxId, 'CPF') || digits.length !== 11)
    ) {
      setErrors((current) => ({
        ...current,
        taxId: 'CPF inválido.',
      }));
      return false;
    }

    if (
      form.taxIdType === 'CNPJ' &&
      (!isValidTaxId(form.taxId, 'CNPJ') || digits.length !== 14)
    ) {
      setErrors((current) => ({
        ...current,
        taxId: 'CNPJ inválido.',
      }));
      return false;
    }

    if (
      !normalizedState ||
      normalizedState.length !== 2 ||
      !brazilStateCodes.has(normalizedState)
    ) {
      setErrors((current) => ({
        ...current,
        'address.state': 'Selecione uma UF válida.',
      }));
      return false;
    }

    setErrors({});
    return true;
  }

  async function handlePostalCodeLookup() {
    const cep = form.address.postalCode.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      setIsLookingUpPostalCode(true);
      const result = await lookupPostalCode(cep);

      if (!result) {
        setForm((current) => ({
          ...current,
          address: {
            ...current.address,
            street: '',
            district: '',
            city: '',
            state: '',
            country: 'Brazil',
            number: null,
            complement: null,
          },
        }));

        setErrors((current) => ({
          ...current,
          'address.postalCode':
            'CEP não encontrado. Preencha os campos manualmente.',
          'address.street': undefined,
          'address.district': undefined,
          'address.city': undefined,
          'address.state': undefined,
        }));
        return;
      }

      setForm((current) => ({
        ...current,
        address: {
          ...current.address,
          street: result.street || current.address.street,
          district: result.district || current.address.district,
          city: result.city || current.address.city,
          state: (result.state || current.address.state || '')
            .toUpperCase()
            .slice(0, 2),
          country: result.country || current.address.country,
          number: result.number ?? current.address.number ?? null,
          complement: result.complement ?? current.address.complement ?? null,
        },
      }));

      setErrors((current) => ({
        ...current,
        'address.postalCode': undefined,
        'address.street': undefined,
        'address.district': undefined,
        'address.city': undefined,
        'address.state': undefined,
      }));
    } finally {
      setIsLookingUpPostalCode(false);
    }
  }

  async function handleSubmit() {
    if (!validate()) return;

    const payload: Partial<Entity> = {
      ...form,
      taxId: form.taxId.replace(/\D/g, ''),
      address: {
        ...form.address,
        number: form.address.number?.trim() ? form.address.number : null,
        complement: form.address.complement?.trim()
          ? form.address.complement
          : null,
        postalCode: form.address.postalCode.replace(/\D/g, ''),
      },
    };

    await onSubmit(payload);
  }

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={mode === 'create' ? 'Adicionar entidade' : 'Editar entidade'}
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label className="text-caption text-muted-foreground">Nome</label>
            <Input
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              status={errors.name ? 'error' : 'default'}
            />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-caption text-muted-foreground">
              Razão social
            </label>
            <Input
              value={form.legalName}
              onChange={(event) => setField('legalName', event.target.value)}
              status={errors.legalName ? 'error' : 'default'}
            />
            {errors.legalName && (
              <p className="text-xs text-danger">{errors.legalName}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">
              Tipo de documento
            </label>
            <Select
              value={form.taxIdType}
              onValueChange={(value) => {
                const nextType = value as EntityTaxIdType;
                setField('taxIdType', nextType);
                setField('taxId', formatTaxId(form.taxId, nextType));
              }}
              options={taxIdOptions}
            />
          </div>

          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">
              Documento
            </label>
            <Input
              value={form.taxId}
              onChange={(event) => {
                setField(
                  'taxId',
                  formatTaxId(event.target.value, form.taxIdType),
                );
              }}
              status={errors.taxId ? 'error' : 'default'}
            />
            {errors.taxId && (
              <p className="text-xs text-danger">{errors.taxId}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Tipo</label>
            <Select
              value={form.type}
              onValueChange={(value) => setField('type', value as EntityType)}
              options={typeOptions}
            />
          </div>

          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Status</label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                setField('status', value as EntityStatus)
              }
              options={statusOptions}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Endereço</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <label className="text-caption text-muted-foreground">CEP</label>
              <div className="flex gap-2">
                <Input
                  value={form.address.postalCode}
                  onChange={(event) =>
                    setAddressField(
                      'postalCode',
                      formatPostalCode(event.target.value),
                    )
                  }
                  onBlur={handlePostalCodeLookup}
                  status={errors['address.postalCode'] ? 'error' : 'default'}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={isLookingUpPostalCode}
                  onClick={() => {
                    void handlePostalCodeLookup();
                  }}
                >
                  Buscar
                </Button>
              </div>
              {errors['address.postalCode'] && (
                <p className="text-xs text-danger">
                  {errors['address.postalCode']}
                </p>
              )}
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-caption text-muted-foreground">
                Logradouro
              </label>
              <Input
                value={form.address.street}
                onChange={(event) =>
                  setAddressField('street', event.target.value)
                }
                status={errors['address.street'] ? 'error' : 'default'}
              />
              {errors['address.street'] && (
                <p className="text-xs text-danger">
                  {errors['address.street']}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">
                Número
              </label>
              <Input
                value={form.address.number ?? ''}
                onChange={(event) =>
                  setAddressField('number', event.target.value)
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">
                Complemento
              </label>
              <Input
                value={form.address.complement ?? ''}
                onChange={(event) =>
                  setAddressField('complement', event.target.value)
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">
                Bairro
              </label>
              <Input
                value={form.address.district}
                onChange={(event) =>
                  setAddressField('district', event.target.value)
                }
                status={errors['address.district'] ? 'error' : 'default'}
              />
              {errors['address.district'] && (
                <p className="text-xs text-danger">
                  {errors['address.district']}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">UF</label>
              <Select
                value={form.address.state}
                onValueChange={(value) => {
                  const normalizedState = value.toUpperCase().slice(0, 2);
                  setAddressField('state', normalizedState);
                  setAddressField('city', '');
                }}
                placeholder="Selecione a UF"
                options={brazilStates.map((state) => ({
                  value: state.code,
                  label: `${state.code} - ${state.name}`,
                }))}
              />
              {errors['address.state'] && (
                <p className="text-xs text-danger">{errors['address.state']}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">
                Cidade
              </label>
              <Select
                value={form.address.city}
                onValueChange={(value) => setAddressField('city', value)}
                placeholder={
                  form.address.state
                    ? 'Selecione a cidade'
                    : 'Selecione a UF primeiro'
                }
                options={cityOptions.map((city) => ({
                  value: city,
                  label: city,
                }))}
                disabled={
                  !form.address.state ||
                  !brazilStateCodes.has(form.address.state.toUpperCase())
                }
              />
              {errors['address.city'] && (
                <p className="text-xs text-danger">{errors['address.city']}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">País</label>
              <Input
                value={form.address.country}
                onChange={(event) =>
                  setAddressField('country', event.target.value)
                }
                status={errors['address.country'] ? 'error' : 'default'}
              />
              {errors['address.country'] && (
                <p className="text-xs text-danger">
                  {errors['address.country']}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={loading} type="button">
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
