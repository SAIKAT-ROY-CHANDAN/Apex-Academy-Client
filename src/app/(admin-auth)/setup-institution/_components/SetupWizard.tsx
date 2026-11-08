"use client";

import { Check, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { cn } from "@/lib/utils";
import InitialRoleForm from "./InitialRoleForm";
import SetupInstitutionForm from "./SetupInstitutionForm";

const STEPS = [
  { step: 1, label: "Institution Setup" },
  { step: 2, label: "Initial Role & Features" },
] as const;

const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className={cn(currentStep === 1 && "mx-auto max-w-3xl")}>
      {/* Welcome Card */}
      <div className="mb-10 overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#0840A0] to-[#063781] px-8 py-10 text-white">
          <h2 className="text-2xl font-bold">
            {currentStep === 1 ? "Welcome to EIMS" : "Almost there!"}
          </h2>
          <p className="mt-2 max-w-xl text-base text-white/80">
            {currentStep === 1
              ? "Let's set up your institution. Fill in the details below to configure your management system."
              : "Create your first role and pick the features (permissions) it should have access to."}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {STEPS.map(({ step, label }, index) => {
              const isDone = currentStep > step;
              const isCurrent = currentStep === step;
              return (
                <Fragment key={step}>
                  {index > 0 && (
                    <ChevronRight className="mx-1 h-4 w-4 text-white/30" />
                  )}
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                      isDone
                        ? "bg-white text-[#0840A0]"
                        : isCurrent
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/50",
                    )}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : step}
                  </div>
                  <span
                    className={cn(
                      "text-sm",
                      isDone || isCurrent ? "text-white" : "text-white/50",
                    )}
                  >
                    {label}
                  </span>
                </Fragment>
              );
            })}
            <ChevronRight className="mx-1 h-4 w-4 text-white/30" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white/50">
              3
            </div>
            <span className="text-sm text-white/50">Dashboard</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 ? (
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <SetupInstitutionForm onSuccess={() => goToStep(2)} />
        </div>
      ) : (
        <InitialRoleForm />
      )}
    </div>
  );
};

export default SetupWizard;
