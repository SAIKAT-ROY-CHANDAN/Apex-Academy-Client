"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, BriefcaseBusiness } from "lucide-react";
import { get, useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

type SalarySectionProps = {
  form: UseFormReturn<any>;
};

const SalarySection = ({ form }: SalarySectionProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customSalaries",
  });

  const err = (fieldPath: string) =>
    get(form.formState.errors, fieldPath)?.message as string | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <BriefcaseBusiness className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Salary Details</h3>
          <p className="text-xs text-muted-foreground">
            Add custom salary components.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">
                Component
              </Label>
              <Input
                placeholder="e.g. Basic Salary, House Rent"
                value={
                  (form.watch(`customSalaries.${index}.salary_component`) as string) ?? ""
                }
                onChange={(e) =>
                  form.setValue(
                    `customSalaries.${index}.salary_component`,
                    e.target.value,
                    { shouldValidate: true },
                  )
                }
                className="h-9"
              />
              {err(`customSalaries.${index}.salary_component`) && (
                <p className="text-xs text-destructive mt-0.5">
                  {err(`customSalaries.${index}.salary_component`)}
                </p>
              )}
            </div>

            <div className="w-36">
              <Label className="text-xs text-muted-foreground mb-1 block">
                Amount
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={
                  (form.watch(`customSalaries.${index}.salary_amount`) as string) ?? ""
                }
                onChange={(e) =>
                  form.setValue(
                    `customSalaries.${index}.salary_amount`,
                    e.target.value,
                    { shouldValidate: true },
                  )
                }
                className="h-9"
              />
              {err(`customSalaries.${index}.salary_amount`) && (
                <p className="text-xs text-destructive mt-0.5">
                  {err(`customSalaries.${index}.salary_amount`)}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 mt-5 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              title="Remove salary component"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 h-9"
        onClick={() => append({ salary_component: "", salary_amount: "" })}
      >
        <Plus className="h-3.5 w-3.5" />
        Add Component
      </Button>
    </div>
  );
};

export default SalarySection;