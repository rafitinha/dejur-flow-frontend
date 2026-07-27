'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChecklistType } from '@/features/requests/types';
import { ChecklistTypeSelector } from './ChecklistTypeSelector';
import { FileUpload } from './FileUpload';
import { Button } from '@/components/ui/Button';
import { Wizard } from '@/components/ui/Wizard';
import {
  CompanyDebtorSection,
  GenericSection,
  ReviewSection,
  VariantFieldsSection,
} from './wizard/StepSections';
import { getZodFieldErrors, stateCodeSet } from './wizard/helpers';
import { createPayloadByStep, createSchemasByStep } from './wizard/validation';
import { initialWizardForm, wizardSteps, WizardFormData } from './wizard/types';
import { wizardStepDefinitions } from './wizard/stepConfig';

export function ChecklistWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedChecklistType, setSelectedChecklistType] =
    useState<ChecklistType>();
  const [formData, setFormData] = useState<WizardFormData>(initialWizardForm);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [invalidStepIndexes, setInvalidStepIndexes] = useState<number[]>([]);
  const [stepHelpMessage, setStepHelpMessage] = useState('');

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

  function onNext() {
    if (activeStep === wizardSteps.length - 1) {
      if (!validateFinalSubmission()) return;
      alert('Mock: solicitacao submetida como PROCESSING');
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
    setFormData(initialWizardForm);
    setUploadedFiles([]);
    setFieldErrors({});
    setInvalidStepIndexes([]);
    setStepHelpMessage('');
  }

  useEffect(() => {
    localStorage.setItem(
      'draft-checklist',
      JSON.stringify({
        step: activeStep,
        type: selectedChecklistType,
        form: formData,
        filesCount: uploadedFiles.length,
        updatedAt: new Date().toISOString(),
      }),
    );
  }, [activeStep, selectedChecklistType, formData, uploadedFiles.length]);

  return (
    <section className="surface-elevated space-y-6 p-6 md:p-8">
      <div className="space-y-1">
        <p className="text-label">Fluxo guiado</p>
        <h1 className="text-heading">Nova solicitacao</h1>
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
              onChange={(nextType) => {
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
            onFiles={(selectedFiles) => {
              setUploadedFiles(selectedFiles);
              setFieldErrors((previous) => {
                const copy = { ...previous };
                delete copy.files;
                return copy;
              });
            }}
            error={fieldErrors.files}
          />
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

      <div className="flex justify-between">
        <Button
          disabled={activeStep === 0}
          variant="outline"
          onClick={() => setActiveStep((previous) => Math.max(0, previous - 1))}
        >
          Voltar
        </Button>
        <Button onClick={onNext}>
          {activeStep === wizardSteps.length - 1
            ? 'Confirmar e submeter'
            : 'Avancar'}
        </Button>
      </div>
    </section>
  );
}
