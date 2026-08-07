'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Wizard } from '@/components/ui/Wizard';
import { ChecklistType } from '@/features/requests/types';
import { ChecklistTypeSelector } from './ChecklistTypeSelector';
import { FileUpload } from './FileUpload';
import {
  CompanyDebtorSection,
  GenericSection,
  ReviewSection,
  VariantFieldsSection,
} from './wizard/StepSections';
import { getZodFieldErrors, stateCodeSet } from './wizard/helpers';
import { wizardStepDefinitions } from './wizard/stepConfig';
import { initialWizardForm, wizardSteps, WizardFormData } from './wizard/types';
import { createPayloadByStep, createSchemasByStep } from './wizard/validation';

export type ChecklistWizardMode = 'create' | 'edit';

export type ExistingDocument = {
  name?: string;
  type?: string;
  size?: number;
  uploadedAt?: string;
  downloadUrl?: string;
};

export type ChecklistWizardSubmitParams = {
  mode: ChecklistWizardMode;
  requestId?: string;
  checklistType: ChecklistType;
  formData: WizardFormData;
  newFiles: File[];
  existingDocuments: ExistingDocument[];
};

export type ChecklistWizardProps = {
  mode?: ChecklistWizardMode;
  requestId?: string;
  initialChecklistType?: ChecklistType;
  initialFormData?: Partial<WizardFormData>;
  existingDocuments?: ExistingDocument[];
  onCancel?: () => void;
  onSubmit?: (params: ChecklistWizardSubmitParams) => Promise<void> | void;
};

function defaultSubmit(params: ChecklistWizardSubmitParams) {
  if (params.mode === 'edit') {
    alert(`Mock: solicitação ${params.requestId} atualizada`);
    return;
  }

  alert('Mock: solicitação submetida como PROCESSING');
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChecklistWizard(props: ChecklistWizardProps) {
  const {
    mode = 'create',
    requestId,
    initialChecklistType,
    initialFormData,
    existingDocuments = [],
    onCancel,
    onSubmit = defaultSubmit,
  } = props;

  if (mode === 'edit') {
    if (!requestId)
      throw new Error('ChecklistWizard: requestId obrigatório no modo edit.');
    if (!initialChecklistType)
      throw new Error(
        'ChecklistWizard: initialChecklistType obrigatório no modo edit.',
      );
  }

  const [activeStep, setActiveStep] = useState(0);
  const [selectedChecklistType, setSelectedChecklistType] = useState<
    ChecklistType | undefined
  >(initialChecklistType);
  const [formData, setFormData] = useState<WizardFormData>(() => ({
    ...initialWizardForm,
    ...(initialFormData ?? {}),
  }));
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [invalidStepIndexes, setInvalidStepIndexes] = useState<number[]>([]);
  const [stepHelpMessage, setStepHelpMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  function updateField<K extends keyof WizardFormData>(
    field: K,
    value: WizardFormData[K],
  ) {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => {
      const copy = { ...previous };
      delete copy[field];
      return copy;
    });
  }

  const validateStep = useCallback(
    (stepIndex: number, showErrors: boolean) => {
      const payloadByStep = createPayloadByStep({
        checklistType: selectedChecklistType,
        formData,
        files: uploadedFiles,
      });

      const schemasByStep = createSchemasByStep(
        selectedChecklistType,
        stateCodeSet,
      );
      const result = schemasByStep[stepIndex].safeParse(
        payloadByStep[stepIndex],
      );

      if (result.success) {
        if (showErrors) {
          setInvalidStepIndexes((previous) =>
            previous.filter((item) => item !== stepIndex),
          );
          setStepHelpMessage('');
        }
        return true;
      }

      if (showErrors) {
        const errorMap = getZodFieldErrors(result.error);
        setFieldErrors((previous) => ({ ...previous, ...errorMap }));
        setInvalidStepIndexes((previous) =>
          previous.includes(stepIndex) ? previous : [...previous, stepIndex],
        );
        setStepHelpMessage('Verifique os campos obrigatorios desta etapa.');
      }

      return false;
    },
    [selectedChecklistType, formData, uploadedFiles],
  );

  function moveToStep(targetStep: number) {
    if (targetStep < activeStep) {
      setActiveStep(targetStep);
      return;
    }

    for (let idx = activeStep; idx < targetStep; idx += 1) {
      if (!validateStep(idx, true)) {
        setActiveStep(idx);
        return;
      }
    }

    setActiveStep(targetStep);
  }

  function validateFinalSubmission() {
    const failedSteps: number[] = [];

    for (let idx = 0; idx < wizardSteps.length - 1; idx += 1) {
      if (!validateStep(idx, true)) {
        failedSteps.push(idx);
      }
    }

    if (failedSteps.length > 0) {
      setInvalidStepIndexes(failedSteps);
      setActiveStep(failedSteps[0]);
      setStepHelpMessage(
        `Existem pendencias nas etapas: ${failedSteps
          .map((idx) => `${idx + 1}. ${wizardSteps[idx]}`)
          .join(', ')}.`,
      );
      return false;
    }

    setInvalidStepIndexes([]);
    return true;
  }

  async function handleFinalSubmit() {
    if (!selectedChecklistType) {
      setFieldErrors((previous) => ({
        ...previous,
        type: 'Selecione o tipo de checklist.',
      }));
      setActiveStep(0);
      return;
    }

    if (!validateFinalSubmission()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await onSubmit({
        mode,
        requestId,
        checklistType: selectedChecklistType,
        formData,
        newFiles: uploadedFiles,
        existingDocuments,
      });

      setSubmitSuccess(
        mode === 'edit'
          ? 'Alterações salvas com sucesso.'
          : 'Solicitação enviada para processamento.',
      );
    } catch {
      setSubmitError(
        mode === 'edit'
          ? 'Não foi possível salvar as alterações. Tente novamente.'
          : 'Não foi possível submeter a solicitação. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function onNext() {
    if (activeStep === wizardSteps.length - 1) {
      void handleFinalSubmit();
      return;
    }

    if (!validateStep(activeStep, true)) return;

    setActiveStep((previous) => Math.min(wizardSteps.length - 1, previous + 1));
  }

  const completedSteps = useMemo(
    () =>
      wizardSteps.map((_, idx) =>
        idx === wizardSteps.length - 1 ? false : validateStep(idx, false),
      ),
    [validateStep],
  );

  function resetWizardByType(nextType: ChecklistType) {
    setSelectedChecklistType(nextType);
    setActiveStep(0);
    setFormData({ ...initialWizardForm, ...(initialFormData ?? {}) });
    setUploadedFiles([]);
    setFieldErrors({});
    setInvalidStepIndexes([]);
    setStepHelpMessage('');
    setSubmitError(null);
    setSubmitSuccess(null);
  }

  useEffect(() => {
    localStorage.setItem(
      'draft-checklist',
      JSON.stringify({
        mode,
        requestId,
        step: activeStep,
        type: selectedChecklistType,
        form: formData,
        filesCount: uploadedFiles.length,
        updatedAt: new Date().toISOString(),
      }),
    );
  }, [
    mode,
    requestId,
    activeStep,
    selectedChecklistType,
    formData,
    uploadedFiles.length,
  ]);

  const isEditMode = mode === 'edit';

  return (
    <section className="surface-elevated space-y-6 p-6 md:p-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <p className="text-label">Fluxo guiado</p>
          <h1 className="text-heading">
            {isEditMode
              ? `Editar Solicitação ${requestId}`
              : 'Nova Solicitação'}
          </h1>
        </div>

        {isEditMode && (
          <Button variant="outline" onClick={onCancel}>
            Cancelar edição
          </Button>
        )}
      </div>

      <Wizard
        steps={wizardStepDefinitions}
        currentStep={activeStep}
        invalidSteps={invalidStepIndexes}
        completedSteps={completedSteps}
        onStepChange={moveToStep}
      />

      <div className="surface-card p-6">
        {activeStep === 0 && (
          <>
            <h2 className="mb-4 font-semibold">
              Qual acao judicial deseja validar?{' '}
              <span className="text-danger">*</span>
            </h2>
            <ChecklistTypeSelector
              value={selectedChecklistType}
              disabled={isEditMode}
              onChange={(nextType) => {
                if (isEditMode) return;

                if (nextType !== selectedChecklistType) {
                  resetWizardByType(nextType);
                  return;
                }

                setSelectedChecklistType(nextType);
              }}
            />
            {fieldErrors.type && (
              <p className="mt-2 text-sm text-danger">{fieldErrors.type}</p>
            )}
          </>
        )}

        {activeStep === 1 && (
          <CompanyDebtorSection
            formData={formData}
            errors={fieldErrors}
            updateField={updateField}
          />
        )}

        {activeStep === 2 && (
          <VariantFieldsSection
            checklistType={selectedChecklistType}
            formData={formData}
            errors={fieldErrors}
            updateField={updateField}
          />
        )}

        {activeStep === 3 && (
          <GenericSection
            title="Tentativas de acordo e cobranca"
            placeholder="Descreva tentativas, meios de contato, responsaveis e resultados."
            required
            error={fieldErrors.agreementDetails}
            value={formData.agreementDetails}
            onChange={(value) => updateField('agreementDetails', value)}
          />
        )}

        {activeStep === 4 && (
          <GenericSection
            title="Valores, indices e atualizacao"
            placeholder="Informe indice, juros, multa, termo inicial/final e descontos."
            required
            error={fieldErrors.financialDetails}
            value={formData.financialDetails}
            onChange={(value) => updateField('financialDetails', value)}
          />
        )}

        {activeStep === 5 && (
          <GenericSection
            title="Breve resumo dos fatos"
            placeholder="Descreva o historico do caso e o motivo da recusa/dificuldade."
            textarea
            required
            error={fieldErrors.factsSummary}
            value={formData.factsSummary}
            onChange={(value) => updateField('factsSummary', value)}
          />
        )}

        {activeStep === 6 && (
          <GenericSection
            title="Parecer da area responsavel"
            placeholder="Informe situacao financeira, chance de exito e posicionamento."
            textarea
            required
            error={fieldErrors.opinionDetails}
            value={formData.opinionDetails}
            onChange={(value) => updateField('opinionDetails', value)}
          />
        )}

        {activeStep === 7 && (
          <div className="space-y-4">
            {existingDocuments.length > 0 && (
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-foreground">
                  Documentos já anexados
                </p>
                <ul className="mt-3 space-y-2">
                  {existingDocuments.map((doc, index) => (
                    <li
                      key={`${doc.name ?? 'documento'}-${index}`}
                      className="flex flex-col justify-between gap-2 rounded-md border border-border/60 p-3 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-medium">
                          {doc.name || 'Documento sem nome'}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {doc.type && <span>{doc.type}</span>}
                          {doc.size !== undefined && (
                            <span>{formatFileSize(doc.size)}</span>
                          )}
                          {doc.uploadedAt && (
                            <span>{formatDate(doc.uploadedAt)}</span>
                          )}
                        </div>
                      </div>

                      {doc.downloadUrl ? (
                        <a
                          href={doc.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary underline-offset-4 hover:underline"
                        >
                          Baixar
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Indisponível
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <FileUpload
              onFiles={async (selectedFiles) => {
                await new Promise((resolve) => setTimeout(resolve, 800));

                setUploadedFiles((previousFiles) => {
                  const filesToAdd = selectedFiles.filter(
                    (selectedFile) =>
                      !previousFiles.some(
                        (currentFile) =>
                          currentFile.name === selectedFile.name &&
                          currentFile.size === selectedFile.size &&
                          currentFile.lastModified ===
                            selectedFile.lastModified,
                      ),
                  );

                  return [...previousFiles, ...filesToAdd];
                });

                setFieldErrors((previous) => {
                  const copy = { ...previous };
                  delete copy.files;
                  return copy;
                });
              }}
              onRemove={(removedFile) => {
                setUploadedFiles((previousFiles) =>
                  previousFiles.filter(
                    (file) =>
                      !(
                        file.name === removedFile.name &&
                        file.size === removedFile.size &&
                        file.lastModified === removedFile.lastModified
                      ),
                  ),
                );
              }}
              error={fieldErrors.files}
            />
          </div>
        )}

        {activeStep === 8 && (
          <ReviewSection
            checklistType={selectedChecklistType}
            attachedFiles={uploadedFiles}
            formData={formData}
          />
        )}
      </div>

      {stepHelpMessage && (
        <p
          className="rounded-md border border-warning/45 bg-warning/10 p-3 text-sm text-warning"
          title="Revise os campos destacados em vermelho."
        >
          {stepHelpMessage}
        </p>
      )}

      {submitError && (
        <p className="rounded-md border border-danger/45 bg-danger/10 p-3 text-sm text-danger">
          {submitError}
        </p>
      )}

      {submitSuccess && (
        <p className="rounded-md border border-success/45 bg-success/10 p-3 text-sm text-success">
          {submitSuccess}
        </p>
      )}

      <div className="flex justify-between">
        <Button
          disabled={activeStep === 0 || isSubmitting}
          variant="outline"
          onClick={() => setActiveStep((previous) => Math.max(0, previous - 1))}
        >
          Voltar
        </Button>
        <Button disabled={isSubmitting} onClick={onNext}>
          {activeStep === wizardSteps.length - 1
            ? isEditMode
              ? 'Salvar alterações'
              : 'Confirmar e submeter'
            : 'Avancar'}
        </Button>
      </div>
    </section>
  );
}
