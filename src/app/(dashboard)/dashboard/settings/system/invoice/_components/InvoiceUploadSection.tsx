"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import InvoiceMediaUpload, {
  InvoiceMediaUploadState,
} from "./InvoiceMediaUpload";
import { InstitutionInvoiceSetting } from "@/types/invoice/institution-invoice-setting.type";
import { createInstitutionInvoiceSetting, updateInstitutionInvoiceSetting } from "@/services/institutionInvoiceSetting";


interface InstitutionInvoiceSettingFormProps {
  initialData?: InstitutionInvoiceSetting;
}

const emptyUploadState: InvoiceMediaUploadState = { file: null, removed: false };

export default function InstitutionInvoiceSettingForm({
  initialData,
}: InstitutionInvoiceSettingFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [watermarkState, setWatermarkState] =
    useState<InvoiceMediaUploadState>(emptyUploadState);
  const [headerState, setHeaderState] =
    useState<InvoiceMediaUploadState>(emptyUploadState);
  const [footerState, setFooterState] =
    useState<InvoiceMediaUploadState>(emptyUploadState);
  const [isPending, startTransition] = useTransition();

  // Contract with the backend:
  // - new file  -> append it under the raw field name (watermark/header/footer)
  //                so multer's upload.fields([...]) picks it up
  // - explicit removal -> append a "removeX" flag the controller can check
  // - no change -> append nothing, so the existing URL is left untouched
  const appendMediaField = (
    formData: FormData,
    fieldName: "watermark" | "header" | "footer",
    state: InvoiceMediaUploadState,
  ) => {
    if (state.file) {
      formData.append(fieldName, state.file);
      return;
    }
    if (state.removed) {
      formData.append(`remove${capitalize(fieldName)}`, "true");
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    appendMediaField(formData, "watermark", watermarkState);
    appendMediaField(formData, "header", headerState);
    appendMediaField(formData, "footer", footerState);

    startTransition(async () => {
      const response = isEditMode
        ? await updateInstitutionInvoiceSetting(initialData!.id, formData)
        : await createInstitutionInvoiceSetting(formData);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "Invoice settings updated successfully"
            : "Invoice settings created successfully",
        );
        router.push("/dashboard/settings/system/invoice");
        router.refresh();
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-6">
        <InvoiceMediaUpload
          label="Invoice Watermark"
          name="watermark"
          defaultUrl={initialData?.watermarkUrl ?? undefined}
          onFileChange={setWatermarkState}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InvoiceMediaUpload
            label="Invoice Header"
            name="header"
            defaultUrl={initialData?.headerUrl ?? undefined}
            onFileChange={setHeaderState}
          />
          <InvoiceMediaUpload
            label="Invoice Footer"
            name="footer"
            defaultUrl={initialData?.footerUrl ?? undefined}
            onFileChange={setFooterState}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Saving..."
          : isEditMode
            ? "Update Invoice Settings"
            : "Save Invoice Settings"}
      </button>
    </form>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}