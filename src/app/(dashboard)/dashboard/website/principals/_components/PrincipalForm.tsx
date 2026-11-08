"use client";

import { SquarePlus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { format, parse } from "date-fns";
import SingleImageDropzone from "@/components/shared/single-image-dropzone";
import DateField from "@/components/shared/date-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWebsitePrincipal,
  updateWebsitePrincipal,
} from "@/services/websitePrincipal";

export interface PrincipalFormData {
  id: string;
  name: string;
  photoUrl?: string | null;
  fromDate: string;
  toDate: string;
}

interface PrincipalFormProps {
  initialData?: PrincipalFormData | null;
}

// Helpers: backend sends ISO (or Date string), we display DD-MM-YYYY.
// Convert ISO -> DD-MM-YYYY for DateField initial value.
function isoToDisplay(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return format(d, "dd-MM-yyyy");
}

// Convert DD-MM-YYYY -> ISO (yyyy-MM-dd) for backend submission.
function displayToIso(display: string): string {
  if (!display) return "";
  // Try dd-MM-yyyy
  try {
    const parsed = parse(display, "dd-MM-yyyy", new Date());
    if (!isNaN(parsed.getTime())) {
      return format(parsed, "yyyy-MM-dd");
    }
  } catch {}
  // Fallback: already ISO or Date string
  const d = new Date(display);
  if (!isNaN(d.getTime())) return format(d, "yyyy-MM-dd");
  return display;
}

export default function PrincipalForm({ initialData }: PrincipalFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isEditMode = Boolean(initialData?.id);
  const listPath = pathname.startsWith("/website-settings")
    ? "/website-settings/principals"
    : "/dashboard/website/principals";

  const [name, setName] = useState(initialData?.name ?? "");
  const [fromDate, setFromDate] = useState(isoToDisplay(initialData?.fromDate));
  const [toDate, setToDate] = useState(isoToDisplay(initialData?.toDate));
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialData?.photoUrl ?? null
  );
  const [hasPendingPhoto, setHasPendingPhoto] = useState(false);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);

  // Keep derived values in sync if server data changes (after refresh)
  useEffect(() => {
    setName(initialData?.name ?? "");
    setFromDate(isoToDisplay(initialData?.fromDate));
    setToDate(isoToDisplay(initialData?.toDate));
    setPhotoFile(null);
    setPhotoPreview(initialData?.photoUrl ?? null);
    setHasPendingPhoto(false);
    setRemovePhoto(false);
    setError(null);
  }, [initialData]);

  // Keep photoPreview as object URL for newly picked file
  useEffect(() => {
    if (!photoFile) return;
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    setHasPendingPhoto(true);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const handlePhotoChange = (file: File | null) => {
    if (file) {
      setPhotoFile(file);
      setRemovePhoto(false);
      setError(null);
    } else {
      // User clicked X on dropzone -> clear
      setPhotoFile(null);
      setPhotoPreview(null);
      setHasPendingPhoto(false);
      // If editing and had existing photo, mark for removal
      if (initialData?.photoUrl) {
        setRemovePhoto(true);
      }
    }
  };

  const handleReset = () => {
    setName(initialData?.name ?? "");
    setFromDate(isoToDisplay(initialData?.fromDate));
    setToDate(isoToDisplay(initialData?.toDate));
    setPhotoFile(null);
    setPhotoPreview(initialData?.photoUrl ?? null);
    setHasPendingPhoto(false);
    setRemovePhoto(false);
    setError(null);
  };

  const validate = (): string | null => {
    if (!name.trim()) return "Full name is required";
    if (!fromDate.trim()) return "From date is required";
    if (!toDate.trim()) return "To date is required";
    const fromIso = displayToIso(fromDate);
    const toIso = displayToIso(toDate);
    const from = new Date(fromIso);
    const to = new Date(toIso);
    if (isNaN(from.getTime())) return "From date is invalid (use DD-MM-YYYY)";
    if (isNaN(to.getTime())) return "To date is invalid (use DD-MM-YYYY)";
    if (to <= from) return "To date must be after from date";
    return null;
  };

  const validationError = validate();

  const hasChanges = useMemo(() => {
    if (!initialData) {
      // Create mode: any filled field is a change
      return Boolean(name.trim() || fromDate.trim() || toDate.trim() || photoFile || removePhoto);
    }
    const initialFrom = isoToDisplay(initialData.fromDate);
    const initialTo = isoToDisplay(initialData.toDate);
    if (name !== (initialData.name ?? "")) return true;
    if (fromDate !== initialFrom) return true;
    if (toDate !== initialTo) return true;
    if (photoFile) return true;
    if (removePhoto) return true;
    return false;
  }, [name, fromDate, toDate, photoFile, removePhoto, initialData]);

  const isSaveDisabled = Boolean(validationError) || !hasChanges || isPending;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("fromDate", displayToIso(fromDate));
    formData.append("toDate", displayToIso(toDate));

    if (photoFile) {
      formData.append("photo", photoFile);
    } else if (removePhoto) {
      formData.append("removePhoto", "true");
    }

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateWebsitePrincipal(initialData.id, formData)
          : await createWebsitePrincipal(formData);

      if (response?.success) {
        toast.success(
          isEditMode ? "Principal updated successfully" : "Principal created successfully"
        );
        router.push(listPath);
      } else {
        const msg = response?.message ?? "Something went wrong";
        setError(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 pt-2">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      <SingleImageDropzone
        label="Principal photo"
        previewSrc={photoPreview}
        hasPending={hasPendingPhoto}
        uploadLabel="Upload Image"
        maxSizeMb={10}
        showRemoveButton={true}
        onChange={handlePhotoChange}
        onError={setError}
      />

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Full Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Write here..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateField label="From Date" value={fromDate} onChange={setFromDate} />
        <DateField label="To Date" value={toDate} onChange={setToDate} />
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
          disabled={isSaveDisabled}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          <SquarePlus className="h-4 w-4" />
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset form?"
        description={
          isEditMode
            ? "All unsaved changes will be reverted to the saved values."
            : "All entered data will be cleared."
        }
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
