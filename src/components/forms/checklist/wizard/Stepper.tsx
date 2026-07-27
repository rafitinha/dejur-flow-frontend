import { CircleCheckBig, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export function WizardStepper({
  steps,
  currentStep,
  invalidSteps,
  completedSteps,
  onStepChange,
}: {
  steps: readonly string[];
  currentStep: number;
  invalidSteps: number[];
  completedSteps: boolean[];
  onStepChange: (nextStep: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={false}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        />
      </div>

      <ol className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-9 md:overflow-visible">
        {steps.map((stepLabel, index) => {
          const isFinalStep = index === steps.length - 1;
          const isCurrent = index === currentStep;
          const isInvalid = invalidSteps.includes(index);
          const isCompleted =
            !isFinalStep && !isCurrent && completedSteps[index] && !isInvalid;

          return (
            <li key={stepLabel} className="relative min-w-[170px] md:min-w-0">
              <button
                type="button"
                onClick={() => onStepChange(index)}
                className={cn(
                  'w-full rounded-md border px-3 py-2 text-left text-xs transition focus-ring',
                  isInvalid && 'border-danger/55 bg-danger/15 text-danger',
                  !isInvalid &&
                    isCurrent &&
                    'border-primary bg-primary text-primary-foreground shadow-sm',
                  !isInvalid &&
                    isCompleted &&
                    'border-success/60 bg-success/15 text-success',
                  !isInvalid &&
                    !isCurrent &&
                    !isCompleted &&
                    'border-border bg-muted/45 text-muted-foreground hover:bg-hover',
                )}
                title={
                  index > currentStep
                    ? 'Clique para avancar etapa por etapa com validacao.'
                    : 'Clique para revisar esta etapa.'
                }
              >
                <span className="flex items-center gap-1 font-semibold">
                  {index === 0 && <Flag size={14} aria-hidden="true" />}
                  {isFinalStep && (
                    <CircleCheckBig size={14} aria-hidden="true" />
                  )}
                  <span>
                    {index + 1}. {stepLabel}
                  </span>
                </span>
              </button>
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    'pointer-events-none absolute -right-2 top-1/2 hidden h-0.5 w-4 -translate-y-1/2 lg:block',
                    invalidSteps.includes(index)
                      ? 'bg-danger/70'
                      : completedSteps[index]
                        ? 'bg-success/70'
                        : 'bg-border',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
