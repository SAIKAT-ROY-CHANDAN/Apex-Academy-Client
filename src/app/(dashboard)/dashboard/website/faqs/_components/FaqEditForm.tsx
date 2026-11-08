"use client";

import { SquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateWebsiteFaq } from "@/services/websiteFaq";

export interface FaqEditData {
  id: string;
  question?: string | null;
  answer?: string | null;
}

interface FaqEditFormProps {
  initialData: FaqEditData;
}

export default function FaqEditForm({ initialData }: FaqEditFormProps) {
  const router = useRouter();
  const [question, setQuestion] = useState(initialData.question ?? "");
  const [answer, setAnswer] = useState(initialData.answer ?? "");
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);

  const handleReset = () => {
    setQuestion(initialData.question ?? "");
    setAnswer(initialData.answer ?? "");
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!question.trim() || !answer.trim()) {
      toast.error("Question and Answer are required");
      return;
    }

    startTransition(async () => {
      const response = await updateWebsiteFaq(initialData.id, {
        question: question.trim(),
        answer: answer.trim(),
      });

      if (response?.success) {
        toast.success("FAQ updated successfully");
        router.push("/dashboard/website/faqs");
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 pt-4">
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Question
        </Label>
        <Input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Write here..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Answer</Label>
        <Textarea
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Write here..."
          rows={4}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
        />
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
