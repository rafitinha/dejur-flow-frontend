'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Wizard } from '@/components/ui/Wizard';
import { ChecklistType } from '@/features/requests/types';
import {
  deleteRequestDocuments,
  uploadRequestDocuments,
} from '@/services/requestDocuments';
import type { ExistingDocument, UploadItem } from '@/types/upload';
import { ChecklistTypeSelector } from './ChecklistTypeSelector';
import { FileUpload } from './FileUpload';
import {
  CompanyDebtorSection,
  GenericSection,
  VariantFieldsSection,
} from './wizard/StepSections';

import { ReviewSection } from './wizard/ReviewSection';
import { getZodFieldErrors, stateCodeSet } from './wizard/helpers';
import { wizardStepDefinitions } from './wizard/stepConfig';
import { initialWizardForm, wizardSteps, WizardFormData } from './wizard/types';
import { createPayloadByStep, createSchemasByStep } from './wizard/validation';

export type ChecklistWizardMode = 'create' | 'edit';

export type { ExistingDocument } from '@/types/upload';

export type ChecklistWizardSubmitResult = {
  requestId?: string;
  userId?: string;
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
  userId?: string;
  onCancel?: () => void;
  onCompleted?: () => void;
  onSubmit?: (
    params: ChecklistWizardSubmitParams,
  ) =>
    | Promise<ChecklistWizardSubmitResult | void>
    | ChecklistWizardSubmitResult
    | void;
};

function defaultSubmit(params: ChecklistWizardSubmitParams) {
  if (params.mode === 'edit') {
    alert(`Mock: solicitação ${params.requestId} atualizada`);
    return;
  }

  alert('Mock: solicitação submetida como PROCESSING');
}

function createInitialUploadItems(
  existingDocuments: ExistingDocument[],
): UploadItem[] {
  return existingDocuments.map((document, index) => ({
    id:
      document.documentId ??
      `existing-${index}-${document.name ?? 'documento'}`,
    documentId: document.documentId,
    name: document.name ?? 'Documento sem nome',
    type: document.type,
    size: document.size,
    uploadedAt: document.uploadedAt,
    downloadUrl: document.downloadUrl,
    status: 'existing',
  }));
}

function createFileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`;
}

function toExistingDocument(item: UploadItem): ExistingDocument {
  return {
    documentId: item.documentId,
    name: item.name,
    type: item.type,
    size: item.size,
    uploadedAt: item.uploadedAt,
    downloadUrl: item.downloadUrl,
  };
}

export function ChecklistWizard(props: ChecklistWizardProps) {
  const {
    mode = 'create',
    requestId,
    initialChecklistType,
    initialFormData,
    existingDocuments = [],
    userId,
    onCancel,
    onCompleted,
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
  const [uploadItems, setUploadItems] = useState<UploadItem[]>(() =>
    createInitialUploadItems(existingDocuments),
  );
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
        files: uploadItems.flatMap((item) =>
          item.file && item.status !== 'pending_delete' ? [item.file] : [],
        ),
        documentCount: uploadItems.filter(
          (item) => item.status !== 'pending_delete',
        ).length,
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
    [selectedChecklistType, formData, uploadItems],
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

  function handleAddFiles(files: File[]) {
    setUploadItems((currentItems) => {
      const filesToAdd = files.filter(
        (file) =>
          !currentItems.some(
            (item) =>
              item.file?.name === file.name &&
              item.file.size === file.size &&
              item.file.lastModified === file.lastModified,
          ),
      );

      return [
        ...currentItems,
        ...filesToAdd.map((file) => ({
          id: createFileId(file),
          file,
          name: file.name,
          type: file.type,
          size: file.size,
          status: 'pending_upload' as const,
        })),
      ];
    });

    setFieldErrors((previous) => {
      const copy = { ...previous };
      delete copy.files;
      return copy;
    });
  }

  function handleRemoveFile(item: UploadItem) {
    setUploadItems((currentItems) => {
      if (item.status === 'pending_delete') {
        return currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, status: 'existing', error: undefined }
            : currentItem,
        );
      }

      if (item.status === 'existing') {
        // TODO: chamar API DELETE na confirmação final.
        return currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, status: 'pending_delete', error: undefined }
            : currentItem,
        );
      }

      return currentItems.filter((currentItem) => currentItem.id !== item.id);
    });
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

    const pendingUploads = uploadItems.filter(
      (item) => item.status === 'pending_upload' && item.file,
    );
    const pendingDeletes = uploadItems.filter(
      (item) => item.status === 'pending_delete',
    );
    const newFiles = pendingUploads.flatMap((item) =>
      item.file ? [item.file] : [],
    );
    const retainedDocuments = uploadItems
      .filter((item) => item.status === 'existing')
      .map(toExistingDocument);

    try {
      const submitResult = await onSubmit({
        mode,
        requestId,
        checklistType: selectedChecklistType,
        formData,
        newFiles,
        existingDocuments: retainedDocuments,
      });

      const resolvedRequestId = requestId ?? submitResult?.requestId;
      const resolvedUserId = userId ?? submitResult?.userId;
      const usesDefaultSubmit = props.onSubmit === undefined;

      if (usesDefaultSubmit) {
        setUploadItems((currentItems) =>
          currentItems
            .filter((item) => item.status !== 'pending_delete')
            .map((item) =>
              item.status === 'pending_upload'
                ? { ...item, status: 'success', error: undefined }
                : item,
            ),
        );
      } else if (pendingDeletes.length > 0 || pendingUploads.length > 0) {
        if (!resolvedRequestId || !resolvedUserId) {
          throw new Error(
            'A solicitação e o usuário são obrigatórios para processar documentos.',
          );
        }

        if (pendingDeletes.length > 0) {
          const documents = pendingDeletes.flatMap((item) =>
            item.documentId ? [{ documentId: item.documentId }] : [],
          );

          if (documents.length !== pendingDeletes.length) {
            setUploadItems((currentItems) =>
              currentItems.map((item) =>
                item.status === 'pending_delete' && !item.documentId
                  ? {
                      ...item,
                      error: 'Documento sem identificador para exclusão.',
                    }
                  : item,
              ),
            );
            throw new Error(
              'Há documentos sem identificador que não podem ser removidos.',
            );
          }

          const deletingIds = new Set(pendingDeletes.map((item) => item.id));
          setUploadItems((currentItems) =>
            currentItems.map((item) =>
              deletingIds.has(item.id)
                ? { ...item, status: 'deleting', error: undefined }
                : item,
            ),
          );

          try {
            await deleteRequestDocuments({
              requestId: resolvedRequestId,
              userId: resolvedUserId,
              documents,
            });
            setUploadItems((currentItems) =>
              currentItems.filter((item) => !deletingIds.has(item.id)),
            );
          } catch (deleteError) {
            const message =
              deleteError instanceof Error
                ? deleteError.message
                : 'Não foi possível remover os documentos.';
            setUploadItems((currentItems) =>
              currentItems.map((item) =>
                deletingIds.has(item.id)
                  ? { ...item, status: 'pending_delete', error: message }
                  : item,
              ),
            );
            throw deleteError;
          }
        }

        if (pendingUploads.length > 0) {
          const uploadingIds = new Set(pendingUploads.map((item) => item.id));
          setUploadItems((currentItems) =>
            currentItems.map((item) =>
              uploadingIds.has(item.id)
                ? { ...item, status: 'uploading', error: undefined }
                : item,
            ),
          );

          try {
            await uploadRequestDocuments({
              requestId: resolvedRequestId,
              userId: resolvedUserId,
              files: newFiles,
            });
            setUploadItems((currentItems) =>
              currentItems.map((item) =>
                uploadingIds.has(item.id)
                  ? { ...item, status: 'success', error: undefined }
                  : item,
              ),
            );
          } catch (uploadError) {
            const message =
              uploadError instanceof Error
                ? uploadError.message
                : 'Não foi possível enviar os documentos.';
            setUploadItems((currentItems) =>
              currentItems.map((item) =>
                uploadingIds.has(item.id)
                  ? { ...item, status: 'pending_upload', error: message }
                  : item,
              ),
            );
            throw uploadError;
          }
        }
      }

      setSubmitSuccess(
        mode === 'edit'
          ? 'Alterações salvas com sucesso.'
          : 'Solicitação enviada para processamento.',
      );
      onCompleted?.();
    } catch (submitError) {
      setSubmitError(
        submitError instanceof Error
          ? submitError.message
          : mode === 'edit'
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
    setUploadItems([]);
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
        filesCount: uploadItems.filter(
          (item) => item.status !== 'pending_delete',
        ).length,
        updatedAt: new Date().toISOString(),
      }),
    );
  }, [
    mode,
    requestId,
    activeStep,
    selectedChecklistType,
    formData,
    uploadItems,
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
          <FileUpload
            items={uploadItems}
            onAdd={handleAddFiles}
            onRemove={handleRemoveFile}
            error={fieldErrors.files}
          />
        )}

        {activeStep === 8 && (
          <ReviewSection
            checklistType={selectedChecklistType}
            attachedFiles={uploadItems.flatMap((item) =>
              item.file && item.status !== 'pending_delete' ? [item.file] : [],
            )}
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
