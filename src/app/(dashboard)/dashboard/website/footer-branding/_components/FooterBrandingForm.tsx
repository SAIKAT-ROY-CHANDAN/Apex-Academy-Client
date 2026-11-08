"use client";

import { SquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import ImageUpload, {
  type ImageUploadState,
} from "@/components/shared/image-upload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createWebsiteFooterBranding,
  updateWebsiteFooterBranding,
} from "@/services/websiteFooterBranding";

export interface WebsiteFooterBrandingData {
  id: string;
  heading?: string | null;
  subHeading?: string | null;
  description?: string | null;
  footerImage?: string | null;
  brandingImage?: string | null;
  copyrightText?: string | null;
}

interface FooterBrandingFormProps {
  initialData?: WebsiteFooterBrandingData | null;
}

const emptyUploadState: ImageUploadState = { file: null, removed: false };

export default function FooterBrandingForm({ initialData }: FooterBrandingFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [heading, setHeading] = useState(initialData?.heading ?? "");
  const [subHeading, setSubHeading] = useState(initialData?.subHeading ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [copyrightText, setCopyrightText] = useState(initialData?.copyrightText ?? "");
  const [footerImageState, setFooterImageState] = useState<ImageUploadState>(emptyUploadState);
  const [brandingImageState, setBrandingImageState] = useState<ImageUploadState>(emptyUploadState);
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  const [footerUploadKey, setFooterUploadKey] = useState(0);
  const [brandingUploadKey, setBrandingUploadKey] = useState(0);

  useEffect(() => {
    setHeading(initialData?.heading ?? "");
    setSubHeading(initialData?.subHeading ?? "");
    setDescription(initialData?.description ?? "");
    setCopyrightText(initialData?.copyrightText ?? "");
    setFooterImageState(emptyUploadState);
    setBrandingImageState(emptyUploadState);
  }, [initialData]);

  const handleReset = () => {
    setHeading(initialData?.heading ?? "");
    setSubHeading(initialData?.subHeading ?? "");
    setDescription(initialData?.description ?? "");
    setCopyrightText(initialData?.copyrightText ?? "");
    setFooterImageState(emptyUploadState);
    setBrandingImageState(emptyUploadState);
    setFooterUploadKey((key) => key + 1);
    setBrandingUploadKey((key) => key + 1);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("heading", heading);
    formData.append("subHeading", subHeading);
    formData.append("description", description);
    formData.append("copyrightText", copyrightText);

    if (footerImageState.file) {
      formData.append("footer_image", footerImageState.file);
    } else if (footerImageState.removed) {
      formData.append("removeFooterImage", "true");
    }

    if (brandingImageState.file) {
      formData.append("branding_image", brandingImageState.file);
    } else if (brandingImageState.removed) {
      formData.append("removeBrandingImage", "true");
    }

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateWebsiteFooterBranding(initialData.id, formData)
          : await createWebsiteFooterBranding(formData);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "Footer branding updated successfully"
            : "Footer branding created successfully",
        );
        router.refresh();
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ImageUpload
          key={footerUploadKey}
          label="Footer Image"
          name="footer_image"
          defaultUrl={initialData?.footerImage ?? undefined}
          onFileChange={setFooterImageState}
        />

        <ImageUpload
          key={brandingUploadKey}
          label="Branding Image"
          name="branding_image"
          defaultUrl={initialData?.brandingImage ?? undefined}
          onFileChange={setBrandingImageState}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Heading</Label>
        <Input
          value={heading}
          onChange={(event) => setHeading(event.target.value)}
          placeholder="Write here..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Sub-Heading</Label>
        <Input
          value={subHeading}
          onChange={(event) => setSubHeading(event.target.value)}
          placeholder="Write here..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Description</Label>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Write description..."
          className="w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30 min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Copyright Text</Label>
        <Input
          value={copyrightText}
          onChange={(event) => setCopyrightText(event.target.value)}
          placeholder="Write copyright text..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
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