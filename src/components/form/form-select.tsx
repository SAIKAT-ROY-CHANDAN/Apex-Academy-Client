"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type FormSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type FormSelectProps = {
  label?: string;
  description?: string;
  error?: string;
  options?: FormSelectOption[];
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  containerClassName?: string;
  labelClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  id?: string;
  children?: React.ReactNode;
};

const FormSelect = React.forwardRef<HTMLButtonElement, FormSelectProps>(
  (
    {
      label,
      description,
      error,
      options,
      placeholder,
      name,
      required,
      disabled,
      value,
      defaultValue,
      onValueChange,
      containerClassName,
      labelClassName,
      triggerClassName,
      contentClassName,
      id,
      children,
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const selectId = id ?? name ?? generatedId;
    const descriptionId = description ? `${selectId}-description` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ");

    return (
      <div className={cn("grid gap-2", containerClassName)}>
        {label ? (
          <Label htmlFor={selectId} className={labelClassName}>
            {label}
            {required ? <span className="text-destructive"> *</span> : null}
          </Label>
        ) : null}
        <Select
          name={name}
          required={required}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange as any}
        >
          <SelectTrigger
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy || undefined}
            className={cn(triggerClassName)}
          >
            <SelectValue placeholder={placeholder ?? "Select an option"}>
              {(value: string | null) => {
                if (!value) return placeholder ?? "Select an option";
                const selected = options?.find(
                  (option) => option.value === value,
                );
                return selected?.label ?? value;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className={cn(contentClassName)}>
            {options?.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
            {children}
          </SelectContent>
        </Select>
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
FormSelect.displayName = "FormSelect";

export { FormSelect, type FormSelectOption };
