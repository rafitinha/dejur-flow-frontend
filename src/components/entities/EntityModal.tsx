'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { z } from 'zod';
import { Search } from 'lucide-react';
import { getCities, getStates } from '@brazilian-utils/brazilian-utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { normalizeText } from '@/components/forms/checklist/wizard/helpers';
import type {
  Entity,
  EntityStatus,
  EntityTaxIdType,
  EntityType,
} from '@/features/requests/api';
import { lookupPostalCode } from '@/features/address/cep';
import { consultarCnpj, CnpjLookupError } from '@/services/cnpjService';
import { isValidTaxId } from '@/lib/utils/cnpj';
import { cn } from '@/lib/utils/cn';

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
    country: 'Brasil',
  },
};

function formatTaxId(value: string, taxIdType: EntityTaxIdType) {
  const digits = value.replace(/\D/g, '');

  if (taxIdType === 'CPF') {
    const compact = digits.slice(0, 11);
    if (compact.length <= 3) return compact;
    if (compact.length <= 6)
      return `${compact.slice(0, 3)}.${compact.slice(3)}`;
    if (compact.length <= 9) {
      return `${compact.slice(0, 3)}.${compact.slice(3, 6)}.${compact.slice(6)}`;
    }
    return `${compact.slice(0, 3)}.${compact.slice(3, 6)}.${compact.slice(6, 9)}-${compact.slice(9, 11)}`;
  }

  const compact = digits.slice(0, 14);
  if (compact.length <= 2) return compact;
  if (compact.length <= 5) return `${compact.slice(0, 2)}.${compact.slice(2)}`;
  if (compact.length <= 8) {
    return `${compact.slice(0, 2)}.${compact.slice(2, 5)}.${compact.slice(5)}`;
  }
  if (compact.length <= 12) {
    return `${compact.slice(0, 2)}.${compact.slice(2, 5)}.${compact.slice(5, 8)}/${compact.slice(8)}`;
  }
  return `${compact.slice(0, 2)}.${compact.slice(2, 5)}.${compact.slice(5, 8)}/${compact.slice(8, 12)}-${compact.slice(12, 14)}`;
}

function formatPostalCode(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatAddressNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 10);
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
      country: raw.address?.country ?? 'Brasil',
    },
  };
}

function splitStreetAndNumber(
  streetValue: string,
  numberValue?: string,
): {
  street: string;
  number: string;
} {
  const street = (streetValue ?? '').trim();

  if (!street) {
    return { street: '', number: numberValue ?? '' };
  }

  const match = street.match(/^(.*?)(?:,|\s+)(\d+\w?)(?:\s*[-/].*)?$/i);
  if (match) {
    return {
      street: match[1].trim(),
      number: match[2].trim(),
    };
  }

  const trailingNumberMatch = street.match(/^(.*?)(\d+\w?)$/i);
  if (trailingNumberMatch && trailingNumberMatch[1].trim()) {
    return {
      street: trailingNumberMatch[1].trim(),
      number: trailingNumberMatch[2].trim(),
    };
  }

  return { street, number: numberValue ?? '' };
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
  const [isLookingUpCnpj, setIsLookingUpCnpj] = useState(false);
  const [isUfOpen, setIsUfOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [ufQuery, setUfQuery] = useState(initialValues?.address?.state ?? '');
  const [cityQuery, setCityQuery] = useState(
    initialValues?.address?.city ?? '',
  );
  const [highlightedUfIndex, setHighlightedUfIndex] = useState(-1);
  const [highlightedCityIndex, setHighlightedCityIndex] = useState(-1);
  const cnpjLookupAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      cnpjLookupAbortRef.current?.abort();
    };
  }, []);

  const ufOptions = useMemo(
    () =>
      brazilStates.map((state) => ({
        code: state.code,
        name: state.name,
        display: `${state.code} - ${state.name}`,
      })),
    [],
  );

  const filteredUfOptions = useMemo(() => {
    const query = normalizeText(ufQuery);
    if (!query) return ufOptions;

    return ufOptions.filter(
      (option) =>
        normalizeText(option.code).includes(query) ||
        normalizeText(option.name).includes(query),
    );
  }, [ufOptions, ufQuery]);

  const cityOptions = useMemo(() => {
    const currentState = form.address.state as
      (typeof brazilStates)[number]['code'] | undefined;

    if (!currentState || !brazilStateCodes.has(currentState)) {
      return [];
    }

    return getCities(currentState).sort((a, b) => a.localeCompare(b));
  }, [form.address.state]);

  const filteredCityOptions = useMemo(() => {
    const query = normalizeText(cityQuery);
    if (!query) return cityOptions;

    return cityOptions.filter((city) => normalizeText(city).includes(query));
  }, [cityOptions, cityQuery]);

  function resetFormState(nextInitialValues?: Partial<Entity>) {
    const nextValues = nextInitialValues
      ? normalizeValues(nextInitialValues)
      : emptyForm;
    setForm(nextValues);
    setErrors({});
    setUfQuery(nextValues.address.state ?? '');
    setCityQuery(nextValues.address.city ?? '');
  }

  function applyCompanyData(result: {
    razaoSocial?: string;
    nomeFantasia?: string;
    situacaoCadastral?: string;
    cep?: string;
    tipoLogradouro?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    uf?: string;
  }) {
    setForm((current) => {
      const normalizedStreet = result.logradouro || current.address.street;
      const { street, number } = splitStreetAndNumber(
        normalizedStreet,
        result.numero || current.address.number || '',
      );

      const nextStreet = result.tipoLogradouro
        ? `${result.tipoLogradouro} ${street}`.trim()
        : street;

      const nextState = (
        result.uf ||
        current.address.state ||
        ''
      ).toUpperCase();
      const nextCity = result.cidade || current.address.city || '';
      const nextPostalCode = formatPostalCode(
        result.cep || current.address.postalCode || '',
      );
      const nextCountry = 'Brasil';

      const nextStatus =
        result.situacaoCadastral &&
        /ativa|regular|habilitada|vinculada|em vigor/i.test(
          result.situacaoCadastral,
        )
          ? 'ACTIVE'
          : result.situacaoCadastral
            ? 'INACTIVE'
            : current.status;

      const nextValues = {
        ...current,
        name: result.nomeFantasia || current.name,
        legalName: result.razaoSocial || current.legalName,
        status: nextStatus,
        address: {
          ...current.address,
          street: nextStreet,
          district: result.bairro || current.address.district,
          city: nextCity,
          state: nextState,
          postalCode: nextPostalCode,
          number: number || current.address.number || '',
          complement: result.complemento || current.address.complement || '',
          country: nextCountry,
        },
      };

      setUfQuery(nextState);
      setCityQuery(nextCity);
      return nextValues;
    });
  }

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

  function commitUfSelection(index: number) {
    const selected = filteredUfOptions[index];
    if (!selected) return;

    setAddressField('state', selected.code);
    setAddressField('city', '');
    setUfQuery(selected.code);
    setCityQuery('');
    setIsUfOpen(false);
    setHighlightedUfIndex(-1);
  }

  function commitCitySelection(index: number) {
    const selected = filteredCityOptions[index];
    if (!selected) return;

    setAddressField('city', selected);
    setCityQuery(selected);
    setIsCityOpen(false);
    setHighlightedCityIndex(-1);
  }

  function onUfKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isUfOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setIsUfOpen(true);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedUfIndex((prev) =>
        prev < filteredUfOptions.length - 1 ? prev + 1 : 0,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedUfIndex((prev) =>
        prev > 0 ? prev - 1 : Math.max(filteredUfOptions.length - 1, 0),
      );
      return;
    }

    if (event.key === 'Enter') {
      if (highlightedUfIndex >= 0) {
        event.preventDefault();
        commitUfSelection(highlightedUfIndex);
      }
      return;
    }

    if (event.key === 'Escape') {
      setIsUfOpen(false);
      setHighlightedUfIndex(-1);
    }
  }

  function onCityKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isCityOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setIsCityOpen(true);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedCityIndex((prev) =>
        prev < filteredCityOptions.length - 1 ? prev + 1 : 0,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedCityIndex((prev) =>
        prev > 0 ? prev - 1 : Math.max(filteredCityOptions.length - 1, 0),
      );
      return;
    }

    if (event.key === 'Enter') {
      if (highlightedCityIndex >= 0) {
        event.preventDefault();
        commitCitySelection(highlightedCityIndex);
      }
      return;
    }

    if (event.key === 'Escape') {
      setIsCityOpen(false);
      setHighlightedCityIndex(-1);
    }
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

  async function handleCnpjLookup() {
    const digits = form.taxId.replace(/\D/g, '');

    if (digits.length !== 14) {
      setErrors((current) => ({
        ...current,
        taxId: 'Informe um CNPJ válido.',
      }));
      return;
    }

    if (!isValidTaxId(digits, 'CNPJ')) {
      setErrors((current) => ({
        ...current,
        taxId: 'Informe um CNPJ válido.',
      }));
      return;
    }

    cnpjLookupAbortRef.current?.abort();
    const controller = new AbortController();
    cnpjLookupAbortRef.current = controller;

    try {
      setIsLookingUpCnpj(true);
      setErrors((current) => ({ ...current, taxId: undefined }));
      const result = await consultarCnpj(digits, controller.signal);
      applyCompanyData(result);
      setErrors((current) => ({ ...current, taxId: undefined }));
    } catch (error) {
      if (error instanceof CnpjLookupError) {
        const message =
          error.code === 'CNPJ_INVALIDO'
            ? 'Informe um CNPJ válido.'
            : error.code === 'CNPJ_NAO_ENCONTRADO'
              ? 'CNPJ não encontrado. Preencha os dados da empresa manualmente.'
              : 'Não foi possível consultar o CNPJ neste momento. Você pode preencher os dados manualmente.';

        setErrors((current) => ({
          ...current,
          taxId: message,
        }));
        return;
      }

      setErrors((current) => ({
        ...current,
        taxId:
          'Não foi possível consultar o CNPJ neste momento. Você pode preencher os dados manualmente.',
      }));
    } finally {
      setIsLookingUpCnpj(false);
    }
  }

  async function handlePostalCodeLookup() {
    const cep = form.address.postalCode.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      setIsLookingUpPostalCode(true);
      const result = await lookupPostalCode(cep);

      if (!result) {
        setForm((current) => {
          const nextValues = {
            ...current,
            address: {
              ...current.address,
              street: '',
              district: '',
              city: '',
              state: '',
              country: 'Brasil',
              number: null,
              complement: null,
            },
          };

          setUfQuery('');
          setCityQuery('');
          return nextValues;
        });

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

      setForm((current) => {
        const nextState = (result.state || current.address.state || '')
          .toUpperCase()
          .slice(0, 2);
        const nextCity = result.city || current.address.city || '';
        const nextAddress = {
          ...current.address,
          street: result.street || current.address.street,
          district: result.district || current.address.district,
          city: nextCity,
          state: nextState,
          country: 'Brasil',
          number: result.number ?? current.address.number ?? null,
          complement: null,
        };

        setUfQuery(nextState);
        setCityQuery(nextCity);

        return {
          ...current,
          address: nextAddress,
        };
      });

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
        if (!next) {
          onClose();
          return;
        }

        resetFormState(initialValues);
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
            <div className="flex gap-2">
              <Input
                value={form.taxId}
                onChange={(event) => {
                  const nextValue = formatTaxId(
                    event.target.value,
                    form.taxIdType,
                  );
                  setField('taxId', nextValue);
                }}
                status={errors.taxId ? 'error' : 'default'}
              />
              {form.taxIdType === 'CNPJ' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Consultar CNPJ"
                  onClick={() => void handleCnpjLookup()}
                  loading={isLookingUpCnpj}
                  loadingText="..."
                  className="shrink-0"
                >
                  <Search size={15} />
                </Button>
              )}
            </div>
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
                  setAddressField(
                    'number',
                    formatAddressNumber(event.target.value),
                  )
                }
                inputMode="numeric"
                pattern="[0-9]*"
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
              <div className="relative">
                <Input
                  value={ufQuery}
                  onFocus={() => {
                    setIsUfOpen(true);
                    setHighlightedUfIndex(-1);
                  }}
                  onBlur={() =>
                    setTimeout(() => {
                      setIsUfOpen(false);
                      setHighlightedUfIndex(-1);
                    }, 120)
                  }
                  onKeyDown={onUfKeyDown}
                  onChange={(event) => {
                    setUfQuery(event.target.value.toUpperCase());
                    setHighlightedUfIndex(-1);
                    if (!event.target.value.trim()) {
                      setAddressField('state', '');
                      setAddressField('city', '');
                      setCityQuery('');
                    }
                  }}
                  placeholder="Digite UF ou nome do estado"
                  status={errors['address.state'] ? 'error' : 'default'}
                />
                {isUfOpen && (
                  <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-border bg-card shadow-lg">
                    {filteredUfOptions.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        Nenhuma UF encontrada.
                      </p>
                    ) : (
                      filteredUfOptions.map((option, index) => (
                        <button
                          key={option.code}
                          type="button"
                          className={cn(
                            'block w-full px-3 py-2 text-left text-sm hover:bg-hover',
                            highlightedUfIndex >= 0 &&
                              filteredUfOptions[highlightedUfIndex]?.code ===
                                option.code &&
                              'bg-hover',
                          )}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setHighlightedUfIndex(index)}
                          onClick={() => commitUfSelection(index)}
                        >
                          {option.display}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {errors['address.state'] && (
                <p className="text-xs text-danger">{errors['address.state']}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">
                Cidade
              </label>
              <div className="relative">
                <Input
                  value={cityQuery}
                  onFocus={() => {
                    if (!form.address.state) return;
                    setIsCityOpen(true);
                    setHighlightedCityIndex(-1);
                  }}
                  onBlur={() =>
                    setTimeout(() => {
                      setIsCityOpen(false);
                      setHighlightedCityIndex(-1);
                    }, 120)
                  }
                  onKeyDown={onCityKeyDown}
                  onChange={(event) => {
                    setCityQuery(event.target.value);
                    setHighlightedCityIndex(-1);
                    if (!form.address.state) return;
                    setAddressField('city', event.target.value);
                  }}
                  disabled={!form.address.state}
                  placeholder={
                    form.address.state
                      ? 'Digite para filtrar cidade'
                      : 'Selecione uma UF primeiro'
                  }
                  status={errors['address.city'] ? 'error' : 'default'}
                />
                {form.address.state && isCityOpen && (
                  <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-border bg-card shadow-lg">
                    {filteredCityOptions.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        Nenhuma cidade encontrada.
                      </p>
                    ) : (
                      filteredCityOptions.map((city, index) => (
                        <button
                          key={city}
                          type="button"
                          className={cn(
                            'block w-full px-3 py-2 text-left text-sm hover:bg-hover',
                            highlightedCityIndex >= 0 &&
                              filteredCityOptions[highlightedCityIndex] ===
                                city &&
                              'bg-hover',
                          )}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setHighlightedCityIndex(index)}
                          onClick={() => commitCitySelection(index)}
                        >
                          {city}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
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
