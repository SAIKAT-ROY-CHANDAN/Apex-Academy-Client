"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type FormRadioOption = {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
};

type FormRadioGroupProps = React.ComponentProps<typeof RadioGroup> & {
  label?: string;
  description?: string;
  error?: string;
  options?: FormRadioOption[];
  containerClassName?: string;
  labelClassName?: string;
  itemClassName?: string;
};

const FormRadioGroup = React.forwardRef<HTMLDivElement, FormRadioGroupProps>(
  (
    {
      label,
      description,
      error,
      options,
      containerClassName,
      labelClassName,
      itemClassName,
      id,
      name,
      required,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const groupId = id ?? name ?? generatedId;
    const labelId = label ? `${groupId}-label` : undefined;
    const descriptionId = description ? `${groupId}-description` : undefined;
    const errorId = error ? `${groupId}-error` : undefined;
    const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ");

    return (
      <div className={cn("grid gap-2", containerClassName)}>
        {label ? (
          <Label id={labelId} className={labelClassName}>
            {label}
            {required ? <span className="text-destructive"> *</span> : null}
          </Label>
        ) : null}
        <RadioGroup
          ref={ref}
          id={groupId}
          name={name}
          aria-labelledby={labelId}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedBy || undefined}
          {...props}
        >
          {options?.map((option) => {
            const optionId = `${groupId}-${option.value}`;
            return (
              <div
                key={option.value}
                className={cn("flex items-start gap-2", itemClassName)}
              >
                <RadioGroupItem
                  id={optionId}
                  value={option.value}
                  disabled={option.disabled}
                />
                <div className="grid gap-1 leading-none">
                  <Label htmlFor={optionId}>{option.label}</Label>
                  {option.description ? (
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
          {children}
        </RadioGroup>
        {description ? (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
FormRadioGroup.displayName = "FormRadioGroup";

export { FormRadioGroup, type FormRadioOption };
