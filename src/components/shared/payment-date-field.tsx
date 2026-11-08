"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const getTodayDateString = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const toCreatedAtISO = (dateStr: string | undefined | null) => {
  const raw = (dateStr ?? "").trim() || getTodayDateString();
  const d = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
};

export const isInvalidCreatedAtMessage = (message?: string | null) =>
  !!message && message.toLowerCase().includes("invalid created_at");

export const toastInvalidCreatedAt = (
  message: string | undefined | null,
  fallback: (msg: string) => void,
  defaultMsg = "Failed to collect fee",
) => {
  if (isInvalidCreatedAtMessage(message)) {
    fallback("Please select a valid payment date.");
  } else {
    fallback(message ?? defaultMsg);
  }
};

interface PaymentDateFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
}

const PaymentDateField = ({
  value,
  onChange,
  id = "payment-date",
  label = "Payment Date",
  className,
  inputClassName,
}: PaymentDateFieldProps) => {
  const [open, setOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = value ? new Date(`${value}T12:00:00`) : undefined;
  const selectedValid =
    selected && !Number.isNaN(selected.getTime()) ? selected : undefined;

  return (
    <div className={className}>
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className={cn(
                "mt-1 flex h-8 w-full justify-start gap-2 text-left text-sm font-normal",
                !selectedValid && "text-muted-foreground",
                inputClassName,
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {selectedValid
                  ? format(selectedValid, "dd MMM yyyy")
                  : "Select date"}
              </span>
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedValid}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, "yyyy-MM-dd"));
                setOpen(false);
              }
            }}
            disabled={{ after: new Date() }}
            defaultMonth={selectedValid ?? new Date()}
          />
        </PopoverContent>
      </Popover>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Backdated payment allowed. Late Fee is calculated on this date.
      </p>
    </div>
  );
};

export default PaymentDateField;
