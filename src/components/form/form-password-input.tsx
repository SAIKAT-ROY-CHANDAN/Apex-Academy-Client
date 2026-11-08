"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type StrengthResult = {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  progress: number;
  barClassName: string;
  textClassName: string;
};

const getPasswordStrength = (
  value: string,
  minLength: number,
): StrengthResult => {
  if (!value) {
    return {
      score: 0,
      label: "Weak",
      progress: 0,
      barClassName: "bg-destructive",
      textClassName: "text-destructive",
    };
  }

  const checks = [
    value.length >= minLength,
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ];

  const score = checks.filter(Boolean).length;

  if (score <= 2) {
    return {
      score,
      label: "Weak",
      progress: 25,
      barClassName: "bg-destructive",
      textClassName: "text-destructive",
    };
  }

  if (score === 3) {
    return {
      score,
      label: "Fair",
      progress: 50,
      barClassName: "bg-amber-500",
      textClassName: "text-amber-600",
    };
  }

  if (score === 4) {
    return {
      score,
      label: "Good",
      progress: 75,
      barClassName: "bg-sky-500",
      textClassName: "text-sky-600",
    };
  }

  return {
    score,
    label: "Strong",
    progress: 100,
    barClassName: "bg-emerald-500",
    textClassName: "text-emerald-600",
  };
};

type FormPasswordInputProps = React.ComponentProps<typeof Input> & {
  label?: string;
  description?: string;
  error?: string;
  minLength?: number;
  showStrength?: boolean;
  icon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
};

const FormPasswordInput = React.forwardRef<
  HTMLInputElement,
  FormPasswordInputProps
>(
  (
    {
      label,
      description,
      error,
      minLength = 8,
      showStrength = true,
      icon,
      containerClassName,
      labelClassName,
      inputClassName,
      id,
      name,
      required,
      value,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? name ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ");

    const [isVisible, setIsVisible] = React.useState(false);

    const strengthValue = typeof value === "string" ? value : "";
    const strength = React.useMemo(
      () => getPasswordStrength(strengthValue, minLength),
      [strengthValue, minLength],
    );

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
              className="pointer-events-none absolute inset-y-0 left-3.5 z-10 flex items-center text-muted-foreground"
            >
              {icon}
            </span>
          ) : null}
          <Input
            id={inputId}
            name={name}
            ref={ref}
            required={required}
            type={isVisible ? "text" : "password"}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy || undefined}
            className={cn(icon ? "pl-11" : undefined, "pr-10", inputClassName)}
            value={value}
            {...props}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition hover:text-foreground"
            onClick={() => setIsVisible((prev) => !prev)}
            aria-label={isVisible ? "Hide password" : "Show password"}
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {showStrength ? (
          <div className="mt-1 space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  strength.barClassName,
                )}
                style={{ width: `${strength.progress}%` }}
              />
            </div>
            <p className={cn("text-xs font-medium", strength.textClassName)}>
              Password strength: {strength.label}
            </p>
          </div>
        ) : null}
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
FormPasswordInput.displayName = "FormPasswordInput";

export { FormPasswordInput };
