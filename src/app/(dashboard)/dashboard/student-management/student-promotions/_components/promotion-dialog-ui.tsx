import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { TPromotionOutcome } from "./types";

export const humanize = (value: string) =>
  value
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");

export const Field = ({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={htmlFor} className="text-xs font-semibold text-slate-700">
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    {children}
    {hint && (
      <p className="text-[11px] leading-tight text-muted-foreground">{hint}</p>
    )}
  </div>
);

export const SectionHeading = ({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
}) => (
  <div className="flex items-center gap-2">
    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
      {icon}
    </span>
    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
      {title}
    </h4>
    {hint && (
      <span className="text-[11px] font-normal text-muted-foreground">
        {hint}
      </span>
    )}
  </div>
);

export const PROMOTION_OUTCOME_ORDER: TPromotionOutcome[] = [
  "PROMOTED",
  "WITH_BACKLOG",
  "REPEATED",
];

export const PROMOTION_OUTCOME_META: Record<
  TPromotionOutcome,
  {
    title: string;
    hint: string;
    oldType: string;
    nextType: string;
    active: string;
  }
> = {
  PROMOTED: {
    title: "Promoted",
    hint:
      "Move to next class · old row closes as PROMOTED / REGULAR, new row opens as REGULAR / ACTIVE",
    oldType: "REGULAR",
    nextType: "REGULAR",
    active:
      "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  WITH_BACKLOG: {
    title: "Pass with Backlog",
    hint:
      "Move with supplementary · old row closes as WITH_BACKLOG / SUPPLEMENTARY, new row opens as REGULAR / ACTIVE",
    oldType: "SUPPLEMENTARY",
    nextType: "REGULAR",
    active: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
  },
  REPEATED: {
    title: "Repeat Class",
    hint:
      "Stay in the same class · old row closes as REPEATED / REPEAT, new row opens as REPEAT / ACTIVE",
    oldType: "REPEAT",
    nextType: "REPEAT",
    active: "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100",
  },
};

export const NEXT_ENROLLMENT_TYPES = [
  "REGULAR",
  "REPEAT",
  "SUPPLEMENTARY",
] as const;

export const OutcomeSelector = ({
  value,
  onChange,
}: {
  value: TPromotionOutcome;
  onChange: (v: TPromotionOutcome) => void;
}) => (
  <div className="grid grid-cols-1 gap-2">
    {PROMOTION_OUTCOME_ORDER.map((key) => {
      const meta = PROMOTION_OUTCOME_META[key];
      const active = value === key;
      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={active}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
            active
              ? cn(meta.active, "shadow-sm ring-2 ring-offset-1")
              : "border-border bg-white hover:border-slate-300",
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
              active ? "border-current" : "border-slate-300 text-transparent",
            )}
          >
            {active && <Check className="h-3 w-3" />}
          </span>
          <span>
            <span className="block text-sm font-semibold">{meta.title}</span>
            <span
              className={cn(
                "block text-xs",
                active ? "opacity-80" : "text-muted-foreground",
              )}
            >
              {meta.hint}
            </span>
          </span>
        </button>
      );
    })}
  </div>
);

export const NextTypeSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="grid grid-cols-3 gap-2">
    {NEXT_ENROLLMENT_TYPES.map((t) => {
      const active = value === t;
      return (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          aria-pressed={active}
          className={cn(
            "flex h-10 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-all",
            active
              ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/30 ring-offset-1"
              : "border-border bg-white text-muted-foreground hover:border-slate-300 hover:text-foreground",
          )}
        >
          {active && <Check className="h-3.5 w-3.5" />}
          {humanize(t)}
        </button>
      );
    })}
  </div>
);
