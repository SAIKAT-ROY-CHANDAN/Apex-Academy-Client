"use client";

import { FormImageUploadSingle } from "@/components/form/form-image-upload";
import { FormFileUpload } from "@/components/form/form-file-upload";

type TeacherDocumentDefaults = {
  nid_front?: string;
  nid_back?: string;
  photo?: string;
  academic_document?: string;
  previous_institution_resign_letter?: string;
};

type DocumentsSectionProps = {
  onFileChange: (fieldName: string, file: File | null) => void;
  defaults?: TeacherDocumentDefaults;
};

const fileNameFromUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  const clean = url.split("?")[0];
  const last = clean.split("/").pop();
  return last ? decodeURIComponent(last) : undefined;
};

const DocumentsSection = ({ onFileChange, defaults }: DocumentsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <svg
            className="h-3.5 w-3.5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Documents & Photos</h3>
          <p className="text-[11px] text-muted-foreground">
            Upload NID, academic documents, resignation letter & photo.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormImageUploadSingle
          label="NID Front"
          accept="image/png,image/jpeg,image/webp"
          maxSizeMB={5}
          helperText="PNG, JPG, WEBP | up to 5MB"
          name="nid_front"
          defaultUrl={defaults?.nid_front}
          onFileChange={(file) => onFileChange("nid_front", file)}
        />
        <FormImageUploadSingle
          label="NID Back"
          accept="image/png,image/jpeg,image/webp"
          maxSizeMB={5}
          helperText="PNG, JPG, WEBP | up to 5MB"
          name="nid_back"
          defaultUrl={defaults?.nid_back}
          onFileChange={(file) => onFileChange("nid_back", file)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormImageUploadSingle
          label="Photo"
          accept="image/png,image/jpeg,image/webp"
          maxSizeMB={5}
          helperText="PNG, JPG, WEBP | up to 5MB"
          name="photo"
          defaultUrl={defaults?.photo}
          onFileChange={(file) => onFileChange("photo", file)}
        />
        <FormFileUpload
          label="Academic Document"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          maxSizeMB={10}
          helperText="PDF, DOC, DOCX, JPG, PNG | up to 10MB"
          name="academic_document"
          required
          existingFileName={fileNameFromUrl(defaults?.academic_document)}
          existingFileUrl={defaults?.academic_document}
          onFileChange={(file) => onFileChange("academic_document", file)}
        />
      </div>

      <FormFileUpload
        label="Previous Institution Resign Letter"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        maxSizeMB={10}
        helperText="PDF, DOC, DOCX, JPG, PNG | up to 10MB"
        name="previous_institution_resign_letter"
        existingFileName={fileNameFromUrl(
          defaults?.previous_institution_resign_letter,
        )}
        existingFileUrl={defaults?.previous_institution_resign_letter}
        onFileChange={(file) =>
          onFileChange("previous_institution_resign_letter", file)
        }
      />
    </div>
  );
};

export default DocumentsSection;