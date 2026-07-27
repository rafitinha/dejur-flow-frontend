import { useMemo, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { getCities } from '@brazilian-utils/brazilian-utils';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ChecklistType } from '@/features/requests/types';
import { cn } from '@/lib/utils/cn';
import {
  formatCnpj,
  isValidStateCode,
  normalizeText,
  resolveStateCodeFromInput,
  toDigits,
  toMoneyMask,
} from './helpers';
import { stateOptions } from './helpers';
import { step2Strategies } from './validation';
import { UpdateWizardFieldFn, WizardFormData } from './types';

export function FieldWrapper({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function GenericSection({
  title,
  placeholder,
  textarea,
  required,
  value,
  error,
  onChange,
}: {
  title: string;
  placeholder: string;
  textarea?: boolean;
  required?: boolean;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-4 font-semibold text-foreground">
        {title} {required && <span className="text-danger">*</span>}
      </h2>
      {textarea ? (
        <Textarea
          placeholder={placeholder}
          value={value}
          status={error ? 'error' : 'default'}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          placeholder={placeholder}
          value={value}
          status={error ? 'error' : 'default'}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function ReviewSection({
  checklistType,
  attachedFiles,
  formData,
}: {
  checklistType?: ChecklistType;
  attachedFiles: File[];
  formData: WizardFormData;
}) {
  return (
    <div>
      <h2 className="font-semibold text-foreground">Revisão final</h2>
      <p className="mt-2 text-body">Tipo: {checklistType}</p>
      <p className="text-body">Arquivos: {attachedFiles.length}</p>
      <p className="text-body">Empresa: {formData.companyLegalName || '-'}</p>
      <p className="text-body">Devedora: {formData.debtorLegalName || '-'}</p>
      <p className="mt-4 rounded-md border border-warning/45 bg-warning/10 p-3 text-sm text-warning">
        Revise todos os campos. Após aprovação pela LLM, não será possível
        reenviar.
      </p>
    </div>
  );
}

export function CompanyDebtorSection({
  formData,
  errors,
  updateField,
}: {
  formData: WizardFormData;
  errors: Record<string, string>;
  updateField: UpdateWizardFieldFn;
}) {
  const [isUfOpen, setIsUfOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [highlightedUfIndex, setHighlightedUfIndex] = useState(-1);
  const [highlightedCityIndex, setHighlightedCityIndex] = useState(-1);
  const [ufQuery, setUfQuery] = useState(formData.companyUf);
  const [cityQuery, setCityQuery] = useState(formData.companyCity);

  const ufOptions = useMemo(() => {
    const sorted = [...stateOptions].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return sorted.map((state) => ({
      code: state.code,
      name: state.name,
      display: `${state.code} - ${state.name}`,
    }));
  }, []);

  const cityOptions = useMemo(() => {
    if (!isValidStateCode(formData.companyUf)) return [];
    return getCities(formData.companyUf).sort((a, b) => a.localeCompare(b));
  }, [formData.companyUf]);

  const filteredUfOptions = useMemo(() => {
    const query = normalizeText(ufQuery);
    if (!query) return ufOptions;

    return ufOptions.filter(
      (option) =>
        normalizeText(option.code).includes(query) ||
        normalizeText(option.name).includes(query),
    );
  }, [ufOptions, ufQuery]);

  const filteredCityOptions = useMemo(() => {
    const query = normalizeText(cityQuery);
    if (!query) return cityOptions;
    return cityOptions.filter((city) => normalizeText(city).includes(query));
  }, [cityOptions, cityQuery]);

  const canSelectCity = isValidStateCode(formData.companyUf);

  function commitUfSelection(index: number) {
    const selected = filteredUfOptions[index];
    if (!selected) return;

    updateField('companyUf', selected.code);
    updateField('companyCity', '');
    setUfQuery(selected.code);
    setCityQuery('');
    setIsUfOpen(false);
    setHighlightedUfIndex(-1);
  }

  function commitCitySelection(index: number) {
    const selected = filteredCityOptions[index];
    if (!selected) return;

    setCityQuery(selected);
    updateField('companyCity', selected);
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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FieldWrapper
        label="Razao social GEQ"
        required
        error={errors.companyLegalName}
      >
        <Input
          value={formData.companyLegalName}
          onChange={(event) =>
            updateField('companyLegalName', event.target.value)
          }
          status={errors.companyLegalName ? 'error' : 'default'}
          placeholder="Ex.: GEQ Companhia de Gas"
        />
      </FieldWrapper>

      <FieldWrapper label="CNPJ GEQ" required error={errors.companyCnpj}>
        <Input
          value={formData.companyCnpj}
          onChange={(event) =>
            updateField('companyCnpj', formatCnpj(event.target.value))
          }
          status={errors.companyCnpj ? 'error' : 'default'}
          placeholder="00.000.000/0000-00"
        />
      </FieldWrapper>

      <FieldWrapper label="UF" required error={errors.companyUf}>
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
              const typed = event.target.value.toUpperCase();
              setUfQuery(typed);
              setHighlightedUfIndex(-1);
              const maybeCode = resolveStateCodeFromInput(typed);
              updateField(
                'companyUf',
                isValidStateCode(maybeCode) ? maybeCode : '',
              );
              updateField('companyCity', '');
              setCityQuery('');
            }}
            status={errors.companyUf ? 'error' : 'default'}
            placeholder="Digite UF ou nome do estado"
          />
          {isUfOpen && (
            <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-border bg-card shadow-lg">
              {filteredUfOptions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Nenhuma UF encontrada.
                </p>
              ) : (
                filteredUfOptions.map((uf) => (
                  <button
                    key={uf.code}
                    type="button"
                    className={cn(
                      'block w-full px-3 py-2 text-left text-sm hover:bg-hover',
                      highlightedUfIndex >= 0 &&
                        filteredUfOptions[highlightedUfIndex]?.code ===
                          uf.code &&
                        'bg-hover',
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() =>
                      setHighlightedUfIndex(
                        filteredUfOptions.findIndex(
                          (item) => item.code === uf.code,
                        ),
                      )
                    }
                    onClick={() => {
                      const index = filteredUfOptions.findIndex(
                        (item) => item.code === uf.code,
                      );
                      commitUfSelection(index);
                    }}
                  >
                    {uf.display}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </FieldWrapper>

      <FieldWrapper label="Cidade" required error={errors.companyCity}>
        <div className="relative">
          <Input
            value={cityQuery}
            onFocus={() => {
              if (!canSelectCity) return;
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
              updateField('companyCity', event.target.value);
            }}
            disabled={!canSelectCity}
            status={errors.companyCity ? 'error' : 'default'}
            placeholder={
              canSelectCity
                ? 'Digite para filtrar cidade'
                : 'Selecione uma UF primeiro'
            }
          />
          {canSelectCity && isCityOpen && (
            <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-border bg-card shadow-lg">
              {filteredCityOptions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Nenhuma cidade encontrada.
                </p>
              ) : (
                filteredCityOptions.map((city) => (
                  <button
                    key={city}
                    type="button"
                    className={cn(
                      'block w-full px-3 py-2 text-left text-sm hover:bg-hover',
                      highlightedCityIndex >= 0 &&
                        filteredCityOptions[highlightedCityIndex] === city &&
                        'bg-hover',
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() =>
                      setHighlightedCityIndex(
                        filteredCityOptions.findIndex((item) => item === city),
                      )
                    }
                    onClick={() => {
                      const index = filteredCityOptions.findIndex(
                        (item) => item === city,
                      );
                      commitCitySelection(index);
                    }}
                  >
                    {city}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </FieldWrapper>

      <FieldWrapper
        label="Nome empresarial da devedora"
        required
        error={errors.debtorLegalName}
      >
        <Input
          value={formData.debtorLegalName}
          onChange={(event) =>
            updateField('debtorLegalName', event.target.value)
          }
          status={errors.debtorLegalName ? 'error' : 'default'}
        />
      </FieldWrapper>

      <FieldWrapper label="CNPJ da devedora" required error={errors.debtorCnpj}>
        <Input
          value={formData.debtorCnpj}
          onChange={(event) =>
            updateField('debtorCnpj', formatCnpj(event.target.value))
          }
          status={errors.debtorCnpj ? 'error' : 'default'}
          placeholder="00.000.000/0000-00"
        />
      </FieldWrapper>

      <FieldWrapper
        label="Endereco completo"
        required
        error={errors.debtorAddress}
      >
        <Input
          value={formData.debtorAddress}
          onChange={(event) => updateField('debtorAddress', event.target.value)}
          status={errors.debtorAddress ? 'error' : 'default'}
        />
      </FieldWrapper>

      <FieldWrapper
        label="Confirmado por / cargo / data"
        required
        error={errors.addressConfirmedBy}
      >
        <Input
          value={formData.addressConfirmedBy}
          onChange={(event) =>
            updateField('addressConfirmedBy', event.target.value)
          }
          status={errors.addressConfirmedBy ? 'error' : 'default'}
          placeholder="Ex.: Maria Souza - Analista - 24/07/2026"
        />
      </FieldWrapper>
    </div>
  );
}

export function VariantFieldsSection({
  checklistType,
  formData,
  errors,
  updateField,
}: {
  checklistType?: ChecklistType;
  formData: WizardFormData;
  errors: Record<string, string>;
  updateField: UpdateWizardFieldFn;
}) {
  if (!checklistType) {
    return (
      <p className="rounded-md border border-warning/45 bg-warning/10 p-3 text-sm text-warning">
        Selecione o tipo de checklist para preencher os dados específicos.
      </p>
    );
  }

  const strategy = step2Strategies[checklistType];
  const gridClass =
    strategy.fields.length > 4 ? 'md:grid-cols-3' : 'md:grid-cols-2';

  return (
    <div className={cn('grid gap-4', gridClass)}>
      {strategy.fields.map((field) => {
        const value = formData[field.key] as string;

        const parserByField: Partial<
          Record<keyof WizardFormData, (raw: string) => string>
        > = {
          rvP13: toDigits,
          rvP20: toDigits,
          rvP45: toDigits,
          ctTitleNumber: toDigits,
          rvHistoricalAmount: toMoneyMask,
          rvUpdatedAmount: toMoneyMask,
          mcMaxDiscount: toMoneyMask,
          mcFirstCycleFinished: (raw) => raw.toUpperCase(),
        };

        const parser = parserByField[field.key] ?? ((raw: string) => raw);

        return (
          <FieldWrapper
            key={String(field.key)}
            label={field.label}
            required={field.required}
            error={errors[String(field.key)]}
          >
            <Input
              value={value}
              onChange={(event) =>
                updateField(field.key, parser(event.target.value))
              }
              inputMode={field.inputMode}
              placeholder={field.placeholder}
              status={errors[String(field.key)] ? 'error' : 'default'}
            />
          </FieldWrapper>
        );
      })}
    </div>
  );
}
