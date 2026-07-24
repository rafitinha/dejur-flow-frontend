'use client';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { getCities, getStates } from '@brazilian-utils/brazilian-utils';
import { CircleCheckBig, Flag } from 'lucide-react';
import { ChecklistType } from '@/features/requests/types';
import { ChecklistTypeSelector } from './ChecklistTypeSelector';
import { FileUpload } from './FileUpload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils/cn';

const steps = [
  'Tipo',
  'Empresa e devedora',
  'Dados específicos',
  'Acordo',
  'Valores',
  'Resumo',
  'Parecer',
  'Documentos',
  'Confirmação',
] as const;

const checklistTypes = [
  'RECUPERACAO_VASILHAMES',
  'COBRANCA_TITULOS',
  'COBRANCA_MULTA_CONTRATUAL',
] as const;

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];

const stateOptions = getStates();
const stateCodeSet: Set<string> = new Set(
  stateOptions.map((state) => state.code),
);

type WizardForm = {
  companyLegalName: string;
  companyCnpj: string;
  companyUf: string;
  companyCity: string;
  debtorLegalName: string;
  debtorCnpj: string;
  debtorAddress: string;
  addressConfirmedBy: string;
  rvP13: string;
  rvP20: string;
  rvP45: string;
  rvHistoricalAmount: string;
  rvUpdatedAmount: string;
  rvRefusalReason: string;
  ctTitleType: string;
  ctTitleNumber: string;
  ctGuarantor: string;
  ctOtherGuarantees: string;
  mcContractType: string;
  mcBreachedClause: string;
  mcFirstCycleFinished: string;
  mcMaxDiscount: string;
  agreementDetails: string;
  financialDetails: string;
  factsSummary: string;
  opinionDetails: string;
};

const initialForm: WizardForm = {
  companyLegalName: '',
  companyCnpj: '',
  companyUf: '',
  companyCity: '',
  debtorLegalName: '',
  debtorCnpj: '',
  debtorAddress: '',
  addressConfirmedBy: '',
  rvP13: '',
  rvP20: '',
  rvP45: '',
  rvHistoricalAmount: '',
  rvUpdatedAmount: '',
  rvRefusalReason: '',
  ctTitleType: '',
  ctTitleNumber: '',
  ctGuarantor: '',
  ctOtherGuarantees: '',
  mcContractType: '',
  mcBreachedClause: '',
  mcFirstCycleFinished: '',
  mcMaxDiscount: '',
  agreementDetails: '',
  financialDetails: '',
  factsSummary: '',
  opinionDetails: '',
};

const cnpjSchema = z
  .string()
  .regex(/^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/, 'CNPJ invalido');

const step0Schema = z.object({
  type: z.enum(checklistTypes, { message: 'Selecione o tipo de checklist.' }),
});

const step1Schema = z.object({
  companyLegalName: z.string().min(3, 'Razao social obrigatoria.'),
  companyCnpj: cnpjSchema,
  companyUf: z
    .string()
    .length(2, 'Selecione a UF.')
    .refine((value) => stateCodeSet.has(value), 'UF invalida.'),
  companyCity: z.string().min(2, 'Selecione a cidade.'),
  debtorLegalName: z.string().min(3, 'Nome da devedora obrigatorio.'),
  debtorCnpj: cnpjSchema,
  debtorAddress: z.string().min(5, 'Endereco completo obrigatorio.'),
  addressConfirmedBy: z.string().min(3, 'Informe quem confirmou o endereco.'),
});

const step2RecuperacaoSchema = z.object({
  rvP13: z.string().regex(/^\d+$/, 'Use apenas numeros.'),
  rvP20: z.string().regex(/^\d+$/, 'Use apenas numeros.'),
  rvP45: z.string().regex(/^\d+$/, 'Use apenas numeros.'),
  rvHistoricalAmount: z.string().regex(/^\d+(,\d{1,2})?$/, 'Valor invalido.'),
  rvUpdatedAmount: z.string().regex(/^\d+(,\d{1,2})?$/, 'Valor invalido.'),
  rvRefusalReason: z.string().min(5, 'Motivo da recusa obrigatorio.'),
});

const step2TitulosSchema = z.object({
  ctTitleType: z.string().min(2, 'Tipo de titulo obrigatorio.'),
  ctTitleNumber: z.string().regex(/^\d+$/, 'Use apenas numeros.'),
  ctGuarantor: z.string().min(3, 'Avalista/fiador obrigatorio.'),
  ctOtherGuarantees: z.string().min(3, 'Informe outras garantias.'),
});

const step2MultaSchema = z.object({
  mcContractType: z.string().min(3, 'Tipo de contrato obrigatorio.'),
  mcBreachedClause: z.string().min(5, 'Clausula descumprida obrigatoria.'),
  mcFirstCycleFinished: z.string().min(1, 'Informe SIM ou NAO.'),
  mcMaxDiscount: z.string().regex(/^\d+(,\d{1,2})?$/, 'Valor invalido.'),
});

const step3Schema = z.object({
  agreementDetails: z.string().min(15, 'Detalhe as tentativas de acordo.'),
});

const step4Schema = z.object({
  financialDetails: z
    .string()
    .min(15, 'Informe valores, indices e atualizacao de forma completa.'),
});

const step5Schema = z.object({
  factsSummary: z.string().min(30, 'Resumo dos fatos obrigatorio.'),
});

const step6Schema = z.object({
  opinionDetails: z.string().min(20, 'Parecer da area obrigatorio.'),
});

const step7Schema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, 'Anexe ao menos um documento.')
    .refine(
      (files) => files.every((file) => allowedMimeTypes.includes(file.type)),
      'Formato invalido. Use PDF, DOC, DOCX, PNG ou JPG/JPEG.',
    )
    .refine(
      (files) =>
        files.reduce((total, file) => total + file.size, 0) <= 10 * 1024 * 1024,
      'O tamanho total dos arquivos nao pode ultrapassar 10 MB.',
    ),
});

function formatCnpj(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function onlyMoney(value: string) {
  const normalized = value.replace(/[^\d,]/g, '');
  const [integer, decimal] = normalized.split(',');
  if (!decimal) return integer;
  return `${integer},${decimal.slice(0, 2)}`;
}

function getZodFieldErrors(error: z.ZodError) {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = issue.path.join('.');
    if (key) acc[key] = issue.message;
    return acc;
  }, {});
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function resolveStateCodeFromInput(input: string) {
  const query = normalize(input);
  if (!query) return '';

  const found = stateOptions.find((state) => {
    const byCode = normalize(state.code) === query;
    const byName = normalize(state.name) === query;
    return byCode || byName;
  });

  return found?.code ?? input.toUpperCase().slice(0, 2);
}

function isValidStateCode(
  value: string,
): value is (typeof stateOptions)[number]['code'] {
  return stateCodeSet.has(value);
}

export function ChecklistWizard() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<ChecklistType>();
  const [form, setForm] = useState<WizardForm>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [invalidSteps, setInvalidSteps] = useState<number[]>([]);
  const [stepHelpMessage, setStepHelpMessage] = useState('');

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
    if (!isValidStateCode(form.companyUf)) return [];
    return getCities(form.companyUf).sort((a, b) => a.localeCompare(b));
  }, [form.companyUf]);

  function updateField<K extends keyof WizardForm>(
    field: K,
    value: WizardForm[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }

  function runStepValidation(stepIndex: number, showErrors: boolean) {
    const payloadByStep = [
      { type },
      {
        companyLegalName: form.companyLegalName,
        companyCnpj: form.companyCnpj,
        companyUf: form.companyUf,
        companyCity: form.companyCity,
        debtorLegalName: form.debtorLegalName,
        debtorCnpj: form.debtorCnpj,
        debtorAddress: form.debtorAddress,
        addressConfirmedBy: form.addressConfirmedBy,
      },
      type === 'RECUPERACAO_VASILHAMES'
        ? {
            rvP13: form.rvP13,
            rvP20: form.rvP20,
            rvP45: form.rvP45,
            rvHistoricalAmount: form.rvHistoricalAmount,
            rvUpdatedAmount: form.rvUpdatedAmount,
            rvRefusalReason: form.rvRefusalReason,
          }
        : type === 'COBRANCA_TITULOS'
          ? {
              ctTitleType: form.ctTitleType,
              ctTitleNumber: form.ctTitleNumber,
              ctGuarantor: form.ctGuarantor,
              ctOtherGuarantees: form.ctOtherGuarantees,
            }
          : {
              mcContractType: form.mcContractType,
              mcBreachedClause: form.mcBreachedClause,
              mcFirstCycleFinished: form.mcFirstCycleFinished,
              mcMaxDiscount: form.mcMaxDiscount,
            },
      { agreementDetails: form.agreementDetails },
      { financialDetails: form.financialDetails },
      { factsSummary: form.factsSummary },
      { opinionDetails: form.opinionDetails },
      { files },
      {},
    ] as const;

    const schemaByStep = [
      step0Schema,
      step1Schema,
      type === 'RECUPERACAO_VASILHAMES'
        ? step2RecuperacaoSchema
        : type === 'COBRANCA_TITULOS'
          ? step2TitulosSchema
          : step2MultaSchema,
      step3Schema,
      step4Schema,
      step5Schema,
      step6Schema,
      step7Schema,
      z.object({}),
    ] as const;

    const result = schemaByStep[stepIndex].safeParse(payloadByStep[stepIndex]);

    if (result.success) {
      if (showErrors) {
        setInvalidSteps((prev) => prev.filter((item) => item !== stepIndex));
        setStepHelpMessage('');
      }
      return true;
    }

    if (showErrors) {
      const fieldErrors = getZodFieldErrors(result.error);
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      setInvalidSteps((prev) =>
        prev.includes(stepIndex) ? prev : [...prev, stepIndex],
      );
      setStepHelpMessage('Verifique os campos obrigatorios desta etapa.');
    }

    return false;
  }

  function moveToStep(targetStep: number) {
    if (targetStep < step) {
      setStep(targetStep);
      return;
    }

    for (let idx = step; idx < targetStep; idx += 1) {
      if (!runStepValidation(idx, true)) {
        setStep(idx);
        return;
      }
    }

    setStep(targetStep);
  }

  function validateFinalSubmission() {
    const failedSteps: number[] = [];

    for (let idx = 0; idx < 8; idx += 1) {
      if (!runStepValidation(idx, true)) {
        failedSteps.push(idx);
      }
    }

    if (failedSteps.length > 0) {
      setInvalidSteps(failedSteps);
      setStep(failedSteps[0]);
      setStepHelpMessage(
        `Existem pendencias nas etapas: ${failedSteps
          .map((idx) => `${idx + 1}. ${steps[idx]}`)
          .join(', ')}.`,
      );
      return false;
    }

    setInvalidSteps([]);
    return true;
  }

  function onNext() {
    if (step === 8) {
      if (!validateFinalSubmission()) return;
      alert('Mock: solicitacao submetida como PROCESSING');
      return;
    }

    if (!runStepValidation(step, true)) return;

    setStep((current) => Math.min(8, current + 1));
  }

  const stepCompleted = steps.map((_, idx) =>
    idx === steps.length - 1 ? false : runStepValidation(idx, false),
  );

  function resetWizardByType(nextType: ChecklistType) {
    setType(nextType);
    setStep(0);
    setForm(initialForm);
    setFiles([]);
    setErrors({});
    setInvalidSteps([]);
    setStepHelpMessage('');
  }

  useEffect(() => {
    localStorage.setItem(
      'draft-checklist',
      JSON.stringify({
        step,
        type,
        form,
        filesCount: files.length,
        updatedAt: new Date().toISOString(),
      }),
    );
  }, [step, type, form, files.length]);

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <h1 className="text-2xl font-bold tracking-tight">Nova solicitacao</h1>
      <ol className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-9 md:overflow-visible">
        {steps.map((s, i) => (
          <li key={s} className="relative min-w-[170px] md:min-w-0">
            {(() => {
              const isFinalStep = i === steps.length - 1;
              const isActive = i === step;
              const isInvalid = invalidSteps.includes(i);
              const isCompleted =
                !isFinalStep && !isActive && stepCompleted[i] && !isInvalid;

              return (
                <button
                  type="button"
                  onClick={() => moveToStep(i)}
                  className={cn(
                    'w-full rounded-xl border px-3 py-2 text-left text-xs transition focus-ring',
                    isInvalid &&
                      'border-rose-600 bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200',
                    !isInvalid &&
                      isActive &&
                      'border-brand-700 bg-brand-700 text-white',
                    !isInvalid &&
                      isCompleted &&
                      'border-emerald-600 bg-emerald-100 text-emerald-900',
                    !isInvalid &&
                      !isActive &&
                      !isCompleted &&
                      'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
                  )}
                  title={
                    i > step
                      ? 'Clique para avancar etapa por etapa com validacao.'
                      : 'Clique para revisar esta etapa.'
                  }
                >
                  <span className="flex items-center gap-1 font-semibold">
                    {i === 0 && <Flag size={14} aria-hidden="true" />}
                    {i === steps.length - 1 && (
                      <CircleCheckBig size={14} aria-hidden="true" />
                    )}
                    <span>
                      {i + 1}. {s}
                    </span>
                  </span>
                </button>
              );
            })()}
            {i < steps.length - 1 && (
              <span
                className={cn(
                  'pointer-events-none absolute -right-2 top-1/2 hidden h-0.5 w-4 -translate-y-1/2 lg:block',
                  invalidSteps.includes(i)
                    ? 'bg-rose-500'
                    : stepCompleted[i]
                      ? 'bg-emerald-600'
                      : 'bg-slate-300 dark:bg-slate-600',
                )}
              />
            )}
          </li>
        ))}
      </ol>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        {step === 0 && (
          <>
            <h2 className="mb-4 font-semibold">
              Qual acao judicial deseja validar?{' '}
              <span className="text-rose-600">*</span>
            </h2>
            <ChecklistTypeSelector
              value={type}
              onChange={(selectedType) => {
                if (selectedType !== type) {
                  resetWizardByType(selectedType);
                  return;
                }

                setType(selectedType);
              }}
            />
            {errors.type && (
              <p className="mt-2 text-sm text-rose-600">{errors.type}</p>
            )}
          </>
        )}
        {step === 1 && (
          <SimpleCompanyDebtor
            form={form}
            errors={errors}
            ufOptions={ufOptions}
            cityOptions={cityOptions}
            updateField={updateField}
          />
        )}
        {step === 2 && (
          <SpecificFields
            type={type}
            form={form}
            errors={errors}
            updateField={updateField}
          />
        )}
        {step === 3 && (
          <GenericSection
            title="Tentativas de acordo e cobrança"
            placeholder="Descreva tentativas, meios de contato, responsaveis e resultados."
            required
            error={errors.agreementDetails}
            value={form.agreementDetails}
            onChange={(value) => updateField('agreementDetails', value)}
          />
        )}
        {step === 4 && (
          <GenericSection
            title="Valores, indices e atualizacao"
            placeholder="Informe indice, juros, multa, termo inicial/final e descontos."
            required
            error={errors.financialDetails}
            value={form.financialDetails}
            onChange={(value) => updateField('financialDetails', value)}
          />
        )}
        {step === 5 && (
          <GenericSection
            title="Breve resumo dos fatos"
            placeholder="Descreva o histórico do caso e o motivo da recusa/dificuldade."
            textarea
            required
            error={errors.factsSummary}
            value={form.factsSummary}
            onChange={(value) => updateField('factsSummary', value)}
          />
        )}
        {step === 6 && (
          <GenericSection
            title="Parecer da area responsavel"
            placeholder="Informe situacao financeira, chance de exito e posicionamento."
            textarea
            required
            error={errors.opinionDetails}
            value={form.opinionDetails}
            onChange={(value) => updateField('opinionDetails', value)}
          />
        )}
        {step === 7 && (
          <FileUpload
            onFiles={(selectedFiles) => {
              setFiles(selectedFiles);
              setErrors((prev) => {
                const copy = { ...prev };
                delete copy.files;
                return copy;
              });
            }}
            error={errors.files}
          />
        )}
        {step === 8 && <Review type={type} files={files} form={form} />}
      </div>
      {stepHelpMessage && (
        <p
          className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800"
          title="Revise os campos destacados em vermelho."
        >
          {stepHelpMessage}
        </p>
      )}
      <div className="flex justify-between">
        <Button
          disabled={step === 0}
          className="bg-slate-500 hover:bg-slate-600"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Voltar
        </Button>
        <Button onClick={onNext}>
          {step === 8 ? 'Confirmar e submeter' : 'Avançar'}
        </Button>
      </div>
    </section>
  );
}

function FieldWrapper({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function getInputClass(error?: string) {
  return cn(error && 'border-rose-500 ring-1 ring-rose-200');
}

function SimpleCompanyDebtor({
  form,
  errors,
  ufOptions,
  cityOptions,
  updateField,
}: {
  form: WizardForm;
  errors: Record<string, string>;
  ufOptions: { code: string; name: string; display: string }[];
  cityOptions: string[];
  updateField: <K extends keyof WizardForm>(
    field: K,
    value: WizardForm[K],
  ) => void;
}) {
  const [isUfOpen, setIsUfOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [highlightedUfIndex, setHighlightedUfIndex] = useState(-1);
  const [highlightedCityIndex, setHighlightedCityIndex] = useState(-1);
  const [ufQuery, setUfQuery] = useState(form.companyUf);
  const [cityQuery, setCityQuery] = useState(form.companyCity);

  const filteredUfOptions = useMemo(() => {
    const query = normalize(ufQuery);
    if (!query) return ufOptions;
    return ufOptions.filter(
      (option) =>
        normalize(option.code).includes(query) ||
        normalize(option.name).includes(query),
    );
  }, [ufOptions, ufQuery]);

  const filteredCityOptions = useMemo(() => {
    const query = normalize(cityQuery);
    if (!query) return cityOptions;
    return cityOptions.filter((city) => normalize(city).includes(query));
  }, [cityOptions, cityQuery]);

  const canSelectCity = isValidStateCode(form.companyUf);

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

  function onUfKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
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

  function onCityKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
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
          value={form.companyLegalName}
          onChange={(e) => updateField('companyLegalName', e.target.value)}
          className={getInputClass(errors.companyLegalName)}
          placeholder="Ex.: GEQ Companhia de Gas"
        />
      </FieldWrapper>
      <FieldWrapper label="CNPJ GEQ" required error={errors.companyCnpj}>
        <Input
          value={form.companyCnpj}
          onChange={(e) =>
            updateField('companyCnpj', formatCnpj(e.target.value))
          }
          className={getInputClass(errors.companyCnpj)}
          placeholder="00.000.000/0000-00"
        />
      </FieldWrapper>
      <FieldWrapper label="UF" required error={errors.companyUf}>
        <div className="relative">
          <Input
            className={cn(
              'w-full rounded-lg border border-slate-300 px-3 py-2 focus-ring',
              getInputClass(errors.companyUf),
            )}
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
            onChange={(e) => {
              const typed = e.target.value.toUpperCase();
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
            placeholder="Digite UF ou nome do estado"
          />
          {isUfOpen && (
            <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              {filteredUfOptions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-500">
                  Nenhuma UF encontrada.
                </p>
              ) : (
                filteredUfOptions.map((uf) => (
                  <button
                    key={uf.code}
                    type="button"
                    className={cn(
                      'block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800',
                      highlightedUfIndex >= 0 &&
                        filteredUfOptions[highlightedUfIndex]?.code ===
                          uf.code &&
                        'bg-slate-100 dark:bg-slate-800',
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
                      const idx = filteredUfOptions.findIndex(
                        (item) => item.code === uf.code,
                      );
                      commitUfSelection(idx);
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
            className={cn(
              'w-full rounded-lg border border-slate-300 px-3 py-2 focus-ring',
              getInputClass(errors.companyCity),
            )}
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
            onChange={(e) => {
              setCityQuery(e.target.value);
              setHighlightedCityIndex(-1);
              updateField('companyCity', e.target.value);
            }}
            disabled={!canSelectCity}
            placeholder={
              canSelectCity
                ? 'Digite para filtrar cidade'
                : 'Selecione uma UF primeiro'
            }
          />
          {canSelectCity && isCityOpen && (
            <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              {filteredCityOptions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-500">
                  Nenhuma cidade encontrada.
                </p>
              ) : (
                filteredCityOptions.map((city) => (
                  <button
                    key={city}
                    type="button"
                    className={cn(
                      'block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800',
                      highlightedCityIndex >= 0 &&
                        filteredCityOptions[highlightedCityIndex] === city &&
                        'bg-slate-100 dark:bg-slate-800',
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() =>
                      setHighlightedCityIndex(
                        filteredCityOptions.findIndex((item) => item === city),
                      )
                    }
                    onClick={() => {
                      const idx = filteredCityOptions.findIndex(
                        (item) => item === city,
                      );
                      commitCitySelection(idx);
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
          value={form.debtorLegalName}
          onChange={(e) => updateField('debtorLegalName', e.target.value)}
          className={getInputClass(errors.debtorLegalName)}
        />
      </FieldWrapper>
      <FieldWrapper label="CNPJ da devedora" required error={errors.debtorCnpj}>
        <Input
          value={form.debtorCnpj}
          onChange={(e) =>
            updateField('debtorCnpj', formatCnpj(e.target.value))
          }
          className={getInputClass(errors.debtorCnpj)}
          placeholder="00.000.000/0000-00"
        />
      </FieldWrapper>
      <FieldWrapper
        label="Endereco completo"
        required
        error={errors.debtorAddress}
      >
        <Input
          value={form.debtorAddress}
          onChange={(e) => updateField('debtorAddress', e.target.value)}
          className={getInputClass(errors.debtorAddress)}
        />
      </FieldWrapper>
      <FieldWrapper
        label="Confirmado por / cargo / data"
        required
        error={errors.addressConfirmedBy}
      >
        <Input
          value={form.addressConfirmedBy}
          onChange={(e) => updateField('addressConfirmedBy', e.target.value)}
          className={getInputClass(errors.addressConfirmedBy)}
          placeholder="Ex.: Maria Souza - Analista - 24/07/2026"
        />
      </FieldWrapper>
    </div>
  );
}

function SpecificFields({
  type,
  form,
  errors,
  updateField,
}: {
  type?: ChecklistType;
  form: WizardForm;
  errors: Record<string, string>;
  updateField: <K extends keyof WizardForm>(
    field: K,
    value: WizardForm[K],
  ) => void;
}) {
  if (type === 'RECUPERACAO_VASILHAMES')
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <FieldWrapper label="Qtd P-13" required error={errors.rvP13}>
          <Input
            value={form.rvP13}
            onChange={(e) => updateField('rvP13', onlyDigits(e.target.value))}
            inputMode="numeric"
            className={getInputClass(errors.rvP13)}
          />
        </FieldWrapper>
        <FieldWrapper label="Qtd P-20" required error={errors.rvP20}>
          <Input
            value={form.rvP20}
            onChange={(e) => updateField('rvP20', onlyDigits(e.target.value))}
            inputMode="numeric"
            className={getInputClass(errors.rvP20)}
          />
        </FieldWrapper>
        <FieldWrapper label="Qtd P-45" required error={errors.rvP45}>
          <Input
            value={form.rvP45}
            onChange={(e) => updateField('rvP45', onlyDigits(e.target.value))}
            inputMode="numeric"
            className={getInputClass(errors.rvP45)}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Valor historico"
          required
          error={errors.rvHistoricalAmount}
        >
          <Input
            value={form.rvHistoricalAmount}
            onChange={(e) =>
              updateField('rvHistoricalAmount', onlyMoney(e.target.value))
            }
            inputMode="decimal"
            className={getInputClass(errors.rvHistoricalAmount)}
            placeholder="Ex.: 12000,00"
          />
        </FieldWrapper>
        <FieldWrapper
          label="Valor total atualizado"
          required
          error={errors.rvUpdatedAmount}
        >
          <Input
            value={form.rvUpdatedAmount}
            onChange={(e) =>
              updateField('rvUpdatedAmount', onlyMoney(e.target.value))
            }
            inputMode="decimal"
            className={getInputClass(errors.rvUpdatedAmount)}
            placeholder="Ex.: 14500,50"
          />
        </FieldWrapper>
        <FieldWrapper
          label="Motivo da recusa"
          required
          error={errors.rvRefusalReason}
        >
          <Input
            value={form.rvRefusalReason}
            onChange={(e) => updateField('rvRefusalReason', e.target.value)}
            className={getInputClass(errors.rvRefusalReason)}
          />
        </FieldWrapper>
      </div>
    );
  if (type === 'COBRANCA_TITULOS')
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <FieldWrapper
          label="Tipo de titulo"
          required
          error={errors.ctTitleType}
        >
          <Input
            value={form.ctTitleType}
            onChange={(e) => updateField('ctTitleType', e.target.value)}
            className={getInputClass(errors.ctTitleType)}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Numero do titulo"
          required
          error={errors.ctTitleNumber}
        >
          <Input
            value={form.ctTitleNumber}
            onChange={(e) =>
              updateField('ctTitleNumber', onlyDigits(e.target.value))
            }
            inputMode="numeric"
            className={getInputClass(errors.ctTitleNumber)}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Avalista/Fiador"
          required
          error={errors.ctGuarantor}
        >
          <Input
            value={form.ctGuarantor}
            onChange={(e) => updateField('ctGuarantor', e.target.value)}
            className={getInputClass(errors.ctGuarantor)}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Outras garantias"
          required
          error={errors.ctOtherGuarantees}
        >
          <Input
            value={form.ctOtherGuarantees}
            onChange={(e) => updateField('ctOtherGuarantees', e.target.value)}
            className={getInputClass(errors.ctOtherGuarantees)}
          />
        </FieldWrapper>
      </div>
    );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FieldWrapper
        label="Tipo de contrato"
        required
        error={errors.mcContractType}
      >
        <Input
          value={form.mcContractType}
          onChange={(e) => updateField('mcContractType', e.target.value)}
          className={getInputClass(errors.mcContractType)}
        />
      </FieldWrapper>
      <FieldWrapper
        label="Clausula descumprida"
        required
        error={errors.mcBreachedClause}
      >
        <Input
          value={form.mcBreachedClause}
          onChange={(e) => updateField('mcBreachedClause', e.target.value)}
          className={getInputClass(errors.mcBreachedClause)}
        />
      </FieldWrapper>
      <FieldWrapper
        label="1 ciclo finalizado?"
        required
        error={errors.mcFirstCycleFinished}
      >
        <Input
          value={form.mcFirstCycleFinished}
          onChange={(e) =>
            updateField('mcFirstCycleFinished', e.target.value.toUpperCase())
          }
          className={getInputClass(errors.mcFirstCycleFinished)}
          placeholder="SIM ou NAO"
        />
      </FieldWrapper>
      <FieldWrapper
        label="Maior desconto autorizado"
        required
        error={errors.mcMaxDiscount}
      >
        <Input
          value={form.mcMaxDiscount}
          onChange={(e) =>
            updateField('mcMaxDiscount', onlyMoney(e.target.value))
          }
          inputMode="decimal"
          className={getInputClass(errors.mcMaxDiscount)}
          placeholder="Ex.: 15,00"
        />
      </FieldWrapper>
    </div>
  );
}

function GenericSection({
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
      <h2 className="mb-4 font-semibold">
        {title} {required && <span className="text-rose-600">*</span>}
      </h2>
      {textarea ? (
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={getInputClass(error)}
        />
      ) : (
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={getInputClass(error)}
        />
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function Review({
  type,
  files,
  form,
}: {
  type?: ChecklistType;
  files: File[];
  form: WizardForm;
}) {
  return (
    <div>
      <h2 className="font-semibold">Revisão final</h2>
      <p className="mt-2 text-slate-600">Tipo: {type}</p>
      <p className="text-slate-600">Arquivos: {files.length}</p>
      <p className="text-slate-600">Empresa: {form.companyLegalName || '-'}</p>
      <p className="text-slate-600">Devedora: {form.debtorLegalName || '-'}</p>
      <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm">
        Revise todos os campos. Após aprovação pela LLM, não será possível
        reenviar.
      </p>
    </div>
  );
}
