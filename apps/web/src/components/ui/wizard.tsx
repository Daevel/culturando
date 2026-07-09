import type * as React from "react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type WizardStep = {
  description?: string;
  id: string;
  title: string;
};

export type WizardProps = React.ComponentProps<"section"> & {
  children: React.ReactNode;
  currentStep: number;
  description?: string;
  footer?: React.ReactNode;
  progressLabel?: string;
  stepCounterLabel?: (currentStep: number, totalSteps: number) => React.ReactNode;
  steps: WizardStep[];
  title: string;
};

export function Wizard({
  children,
  className,
  currentStep,
  description,
  footer,
  progressLabel = "Avanzamento wizard",
  stepCounterLabel = (current, total) => `Step ${current} di ${total}`,
  steps,
  title,
  ...props
}: WizardProps) {
  const safeStepCount = Math.max(steps.length, 1);
  const safeCurrentStep = Math.min(Math.max(currentStep, 0), safeStepCount - 1);
  const progressValue = ((safeCurrentStep + 1) / safeStepCount) * 100;

  return (
    <section
      className={cn("rounded-2xl border bg-card text-card-foreground shadow", className)}
      {...props}
    >
      <header className="space-y-6 border-b p-5 sm:p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {stepCounterLabel(safeCurrentStep + 1, safeStepCount)}
          </p>
          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
        </div>

        <div className="space-y-4">
          <Progress aria-label={progressLabel} value={progressValue} />
          <ol
            className="grid gap-3 sm:grid-cols-[repeat(var(--wizard-step-count),minmax(0,1fr))]"
            style={{ "--wizard-step-count": safeStepCount } as React.CSSProperties}
          >
            {steps.map((step, index) => {
              const isCompleted = index < safeCurrentStep;
              const isCurrent = index === safeCurrentStep;

              return (
                <li
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "rounded-xl border bg-background p-3 transition-colors",
                    isCompleted && "border-primary/40 bg-primary/10",
                    isCurrent && "border-primary bg-primary/10",
                  )}
                  key={step.id}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        isCompleted && "border-primary bg-primary text-primary-foreground",
                        isCurrent && "border-primary text-primary",
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold leading-5">{step.title}</p>
                      {step.description ? (
                        <p className="text-xs leading-5 text-muted-foreground">
                          {step.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      <div className="p-5 sm:p-6">{children}</div>

      {footer ? <footer className="border-t p-5 sm:p-6">{footer}</footer> : null}
    </section>
  );
}
