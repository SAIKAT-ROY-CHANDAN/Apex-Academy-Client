"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import ImageUpload, {
  type ImageUploadState,
} from "@/components/shared/image-upload";
import RichTextEditor from "@/components/shared/rich-text-editor";
import SectionCard from "@/components/shared/section-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWebsiteChairmanMessage,
  updateWebsiteChairmanMessage,
} from "@/services/websiteChairmanMessage";
import {
  createWebsitePrincipalMessage,
  updateWebsitePrincipalMessage,
} from "@/services/websitePrincipalMessage";

export interface AdministrativeMessageData {
  id: string;
  imageUrl?: string | null;
  name?: string | null;
  facebookUrl?: string | null;
  linkedinUrl?: string | null;
  message?: string | null;
}

interface MessageSectionFormProps {
  section: "chairman" | "principal";
  title: string;
  nameLabel: string;
  initialData?: AdministrativeMessageData | null;
}

const SECTION_CONFIG = {
  chairman: {
    imageField: "chairman_image",
    create: createWebsiteChairmanMessage,
    update: updateWebsiteChairmanMessage,
  },
  principal: {
    imageField: "principal_image",
    create: createWebsitePrincipalMessage,
    update: updateWebsitePrincipalMessage,
  },
} as const;

const emptyUploadState: ImageUploadState = { file: null, removed: false };

export default function MessageSectionForm({
  section,
  title,
  nameLabel,
  initialData,
}: MessageSectionFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);
  const { imageField, create, update } = SECTION_CONFIG[section];

  const [name, setName] = useState(initialData?.name ?? "");
  const [facebookUrl, setFacebookUrl] = useState(
    initialData?.facebookUrl ?? "",
  );
  const [linkedinUrl, setLinkedinUrl] = useState(
    initialData?.linkedinUrl ?? "",
  );
  const [message, setMessage] = useState(initialData?.message ?? "");
  const [imageState, setImageState] =
    useState<ImageUploadState>(emptyUploadState);
  const [isPending, startTransition] = useTransition();
  // Changing the key remounts ImageUpload so its internal picked-file
  // state (which the parent cannot reach) is discarded on reset.
  const [uploadKey, setUploadKey] = useState(0);

  // Re-sync fields when the server data changes (e.g. after save + revalidate).
  useEffect(() => {
    setName(initialData?.name ?? "");
    setFacebookUrl(initialData?.facebookUrl ?? "");
    setLinkedinUrl(initialData?.linkedinUrl ?? "");
    setMessage(initialData?.message ?? "");
    setImageState(emptyUploadState);
  }, [initialData]);

  const handleReset = () => {
    setName(initialData?.name ?? "");
    setFacebookUrl(initialData?.facebookUrl ?? "");
    setLinkedinUrl(initialData?.linkedinUrl ?? "");
    setMessage(initialData?.message ?? "");
    setImageState(emptyUploadState);
    setUploadKey((key) => key + 1);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("facebookUrl", facebookUrl);
    formData.append("linkedinUrl", linkedinUrl);
    formData.append("message", message);

    if (imageState.file) {
      formData.append(imageField, imageState.file);
    } else if (imageState.removed) {
      formData.append("removeImage", "true");
    }

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await update(initialData.id, formData)
          : await create(formData);

      if (response?.success) {
        toast.success(
          isEditMode
            ? `${title} updated successfully`
            : `${title} created successfully`,
        );
        router.refresh();
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="pt-4">
      <SectionCard title={title} onReset={handleReset} isPending={isPending}>
        <ImageUpload
          key={uploadKey}
          label={title}
          name={imageField}
          defaultUrl={initialData?.imageUrl ?? undefined}
          onFileChange={setImageState}
        />

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            {nameLabel}
          </Label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Facebook URL
            </Label>
            <Input
              value={facebookUrl}
              onChange={(event) => setFacebookUrl(event.target.value)}
              placeholder="Write here..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Linkedin URL
            </Label>
            <Input
              value={linkedinUrl}
              onChange={(event) => setLinkedinUrl(event.target.value)}
              placeholder="Write here..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
        </div>

        <RichTextEditor label="Message" value={message} onChange={setMessage} />
      </SectionCard>
    </form>
  );
}
