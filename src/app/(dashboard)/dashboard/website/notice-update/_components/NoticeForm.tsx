"use client";

import { SquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { FormFileUpload } from "@/components/form/form-file-upload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAcademicNotice,
  updateAcademicNotice,
} from "@/services/academicNotice";

export interface NoticeData {
  id: string;
  title: string;
  noticeType: string;
  pdfUrl?: string | null;
}

interface NoticeFormProps {
  initialData?: NoticeData | null;
}

const NOTICE_TYPES = [
  "UPDATE_NEWS",
  "GENERAL_NOTICE",
  "ADMISSION_NOTICE",
  "IMPROVEMENT_NOTICE",
  "HSC_NOTICE",
  "HONOURS_NOTICE",
  "MASTER_NOTICE",
] as const;

const noticeTypeLabel = (v: string) =>
  v
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const fieldClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30";

export default function NoticeForm({ initialData }: NoticeFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [noticeType, setNoticeType] = useState<string>(
    (initialData?.noticeType as string) ?? "GENERAL_NOTICE",
  );
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdfName, setExistingPdfName] = useState<string | null>(
    initialData?.pdfUrl ? (initialData.pdfUrl.split("/").pop() ?? null) : null,
  );
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  const [fileKey, setFileKey] = useState(0);

  useEffect(() => {
    setTitle(initialData?.title ?? "");
    setNoticeType((initialData?.noticeType as string) ?? "GENERAL_NOTICE");
    setPdfFile(null);
    setExistingPdfName(
      initialData?.pdfUrl
        ? (initialData.pdfUrl.split("/").pop() ?? null)
        : null,
    );
    setRemoved(false);
    setFileKey((k) => k + 1);
  }, [initialData]);

  const handleReset = () => {
    setTitle(initialData?.title ?? "");
    setNoticeType((initialData?.noticeType as string) ?? "GENERAL_NOTICE");
    setPdfFile(null);
    setExistingPdfName(
      initialData?.pdfUrl
        ? (initialData.pdfUrl.split("/").pop() ?? null)
        : null,
    );
    setRemoved(false);
    setFileKey((k) => k + 1);
  };

  const handleFileChange = (file: File | null) => {
    setPdfFile(file);
    if (file) {
      setRemoved(false);
      setExistingPdfName(null);
    } else {
      // user cleared the picked file - if we had an existing pdf, mark as removed
      if (initialData?.pdfUrl) {
        setRemoved(true);
        setExistingPdfName(null);
      }
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("noticeType", noticeType);

    if (pdfFile) {
      formData.append("pdf_file", pdfFile);
    } else if (removed) {
      formData.append("removePdf", "true");
    }

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateAcademicNotice(initialData.id, formData)
          : await createAcademicNotice(formData);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "Notice updated successfully"
            : "Notice created successfully",
        );
        router.push("/dashboard/website/notice-update");
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 pt-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write here..."
            className={fieldClassName}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Notice Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={noticeType}
            onValueChange={(v) => setNoticeType(v ?? "GENERAL_NOTICE")}
          >
            <SelectTrigger className={fieldClassName}>
              <SelectValue placeholder="Select notice type" />
            </SelectTrigger>
            <SelectContent>
              {NOTICE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {noticeTypeLabel(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <FormFileUpload
        key={fileKey}
        label="PDF File"
        name="pdf_file"
        accept=".pdf"
        maxSizeMB={10}
        value={pdfFile}
        onFileChange={handleFileChange}
        existingFileName={removed ? undefined : (existingPdfName ?? undefined)}
        helperText="PDF only | up to 10MB"
      />

      {initialData?.pdfUrl && !removed && !pdfFile && (
        <p className="text-xs text-muted-foreground">
          Current file:{" "}
          <a
            href={initialData.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {existingPdfName ?? "View PDF"}
          </a>
          {" · "}Upload a new file to replace or remove to clear.
        </p>
      )}

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
