'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type WizardStep = {
  title: string;
  shortTitle?: string;
  icon: LucideIcon;
};

type WizardProps = {
  steps: readonly WizardStep[];
  currentStep: number;
  completedSteps?: readonly boolean[];
  invalidSteps?: readonly number[];
  onStepChange?: (nextStep: number) => void;
  ariaLabel?: string;
};

export function Wizard({
  steps,
  currentStep,
  completedSteps = [],
  invalidSteps = [],
  onStepChange,
  ariaLabel = 'Etapas do fluxo',
}: WizardProps) {
  const safeCurrentStep = Math.min(
    Math.max(currentStep, 0),
    Math.max(steps.length - 1, 0),
  );
  const activeStep = steps[safeCurrentStep];
  const completedCount = Math.min(steps.length, safeCurrentStep + 1);
  const progressPercentage =
    steps.length <= 1 ? 100 : (safeCurrentStep / (steps.length - 1)) * 100;
  const ActiveIcon = activeStep?.icon;

  return (
    <nav aria-label={ariaLabel} className="space-y-4">
      <div className="md:hidden">
        <div className="surface-card space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-label">
                Etapa {safeCurrentStep + 1} de {steps.length}
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.h2
                  key={activeStep?.title ?? safeCurrentStep}
                  className="mt-1 text-subtitle whitespace-nowrap text-foreground"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {activeStep?.shortTitle ?? activeStep?.title}
                </motion.h2>
              </AnimatePresence>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
              {ActiveIcon ? <ActiveIcon size={18} aria-hidden="true" /> : null}
            </span>
          </div>

          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${Math.max(steps.length, 1)}, minmax(0, 1fr))`,
            }}
            aria-hidden="true"
          >
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={cn(
                  'h-2 rounded-full transition-colors',
                  index < completedCount ? 'bg-primary' : 'bg-border',
                )}
                initial={false}
                animate={{
                  opacity: index < completedCount ? 1 : 0.9,
                  scaleY: index === safeCurrentStep ? 1.12 : 1,
                }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border/80" />
          <motion.div
            className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-primary"
            initial={false}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />

          <ol
            className="relative grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.max(steps.length, 1)}, minmax(0, 1fr))`,
            }}
          >
            {steps.map((step, index) => {
              const isCurrent = index === safeCurrentStep;
              const isInvalid = invalidSteps.includes(index);
              const isCompleted =
                index < safeCurrentStep && completedSteps[index] && !isInvalid;
              const StepIcon = isCompleted ? Check : step.icon;

              return (
                <li key={step.title} className="relative min-w-0">
                  <motion.button
                    type="button"
                    onClick={() => onStepChange?.(index)}
                    title={step.title}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Etapa ${index + 1} de ${steps.length}: ${step.title}`}
                    className={cn(
                      'focus-ring flex h-12 w-full min-w-0 items-center gap-2 rounded-xl border px-3 text-left text-sm font-medium whitespace-nowrap transition will-change-transform md:h-14 md:max-2xl:justify-center md:max-2xl:px-0',
                      isCompleted &&
                        'border-success/35 bg-success text-white shadow-sm',
                      isCurrent &&
                        'border-primary bg-primary text-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.14),0_16px_32px_-18px_hsl(var(--primary)/0.7)]',
                      !isCurrent &&
                        !isCompleted &&
                        !isInvalid &&
                        'border-border/80 bg-background/55 text-muted-foreground hover:border-primary/20 hover:bg-hover/60',
                      isInvalid &&
                        'border-danger/45 bg-danger/10 text-danger shadow-sm',                    )}
                    initial={false}
                    animate={
                      isCurrent ? { y: -1, scale: 1.01 } : { y: 0, scale: 1 }
                    }
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span
                      className={cn(
                        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs transition',
                        isCompleted &&
                          'border-white/15 bg-white/15 text-white',
                        isCurrent && 'border-white/15 bg-white/12 text-white',
                        !isCurrent &&
                          !isCompleted &&
                          !isInvalid &&
                          'border-border bg-background text-muted-foreground',
                        isInvalid && 'border-danger/20 bg-danger/10 text-danger',                      )}
                      aria-hidden="true"
                    >
                      <StepIcon size={15} />
                    </span>

                    <span className="min-w-0 flex-1 overflow-hidden text-ellipsis leading-none md:max-2xl:hidden 2xl:block">
                      {step.title}
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ol>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={activeStep?.title ?? safeCurrentStep}
            className="mt-4 hidden justify-center md:flex 2xl:hidden"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary shadow-sm">
              {activeStep?.title}
            </span>
          </motion.p>
        </AnimatePresence>
      </div>
    </nav>
  );
}
