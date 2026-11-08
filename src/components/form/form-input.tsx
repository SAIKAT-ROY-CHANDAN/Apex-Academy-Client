"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormInputProps = React.ComponentProps<typeof Input> & {
  label?: string;
  description?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
};

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      description,
      error,
      icon,
      containerClassName,
      labelClassName,
      inputClassName,
      id,
      name,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? name ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ");

    return (
      <div className={cn("grid gap-2", containerClassName)}>
        {label ? (
          <Label htmlFor={inputId} className={labelClassName}>
            {label}
            {required ? <span className="text-destructive"> *</span> : null}
          </Label>
        ) : null}
        <div className="relative">
          {icon ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground"
            >
              {icon}
            </span>
          ) : null}
          <Input
            id={inputId}
            name={name}
            ref={ref}
            required={required}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy || undefined}
            className={cn(icon ? "pl-11" : undefined, inputClassName)}
            {...props}
          />
        </div>
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
FormInput.displayName = "FormInput";

export { FormInput };
