"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FormTextareaProps = React.ComponentProps<typeof Textarea> & {
  label?: string;
  description?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  textareaClassName?: string;
};

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      description,
      error,
      containerClassName,
      labelClassName,
      textareaClassName,
      id,
      name,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const textareaId = id ?? name ?? generatedId;
    const descriptionId = description ? `${textareaId}-description` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ");

    return (
      <div className={cn("grid gap-2", containerClassName)}>
        {label ? (
          <Label htmlFor={textareaId} className={labelClassName}>
            {label}
            {required ? <span className="text-destructive"> *</span> : null}
          </Label>
        ) : null}
        <Textarea
          id={textareaId}
          name={name}
          ref={ref}
          required={required}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedBy || undefined}
          className={cn(textareaClassName)}
          {...props}
        />
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
FormTextarea.displayName = "FormTextarea";

export { FormTextarea };
