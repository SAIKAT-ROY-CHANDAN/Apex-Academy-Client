"use client";

import { SquarePlus } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  onReset: () => void;
  isPending: boolean;
}

// White bordered card matching the design: section title on top, form
// fields in the middle, red Reset + blue Save row at the bottom. Rendered
// inside the section's <form> so Save submits natively.
export default function SectionCard({
  title,
  children,
  onReset,
  isPending,
}: SectionCardProps) {
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <h2 className="text-base font-bold text-slate-800">{title}</h2>

      <div className="mt-4 space-y-5">{children}</div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SquarePlus className="h-4 w-4" />
          Reset
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SquarePlus className="h-4 w-4" />
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset form?"
        description="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={() => {
          onReset();
          setResetOpen(false);
        }}
      />
    </section>
  );
}
