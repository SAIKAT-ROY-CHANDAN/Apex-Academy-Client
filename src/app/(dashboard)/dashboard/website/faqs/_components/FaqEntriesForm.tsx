"use client";

import { Plus, SquarePlus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createManyWebsiteFaqs,
  createWebsiteFaq,
} from "@/services/websiteFaq";

type FaqEntry = {
  question: string;
  answer: string;
};

const emptyEntry: FaqEntry = { question: "", answer: "" };

export default function FaqEntriesForm() {
  const router = useRouter();
  const [entries, setEntries] = useState<FaqEntry[]>([{ ...emptyEntry }]);
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);

  const handleAddMore = () => {
    setEntries((prev) => [...prev, { ...emptyEntry }]);
  };

  const handleRemove = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: keyof FaqEntry,
    value: string,
  ) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const handleReset = () => {
    setEntries([{ ...emptyEntry }]);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validEntries = entries
      .map((e) => ({
        question: e.question.trim(),
        answer: e.answer.trim(),
      }))
      .filter((e) => e.question && e.answer);

    if (validEntries.length === 0) {
      toast.error("Please fill at least one Question and Answer");
      return;
    }

    startTransition(async () => {
      const response =
        validEntries.length === 1
          ? await createWebsiteFaq(validEntries[0])
          : await createManyWebsiteFaqs(validEntries);

      if (response?.success) {
        toast.success(
          validEntries.length === 1
            ? "FAQ created successfully"
            : `${validEntries.length} FAQs created successfully`,
        );
        setEntries([{ ...emptyEntry }]);
        router.push("/dashboard/website/faqs");
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {entries.map((entry, index) => (
        <div
          key={index}
          className="space-y-4 rounded-lg border border-slate-100 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              FAQ {index + 1}
            </span>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 hover:bg-red-50"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Question
            </Label>
            <Input
              value={entry.question}
              onChange={(event) =>
                handleChange(index, "question", event.target.value)
              }
              placeholder="Write here..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Answer
            </Label>
            <Textarea
              value={entry.answer}
              onChange={(event) =>
                handleChange(index, "answer", event.target.value)
              }
              placeholder="Write here..."
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAddMore}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add More
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
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
          handleReset();
          setResetOpen(false);
        }}
      />
    </form>
  );
}
