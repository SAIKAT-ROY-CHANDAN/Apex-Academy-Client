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
  createWebsiteHistoricalOutline,
  updateWebsiteHistoricalOutline,
} from "@/services/websiteHistoricalOutline";

export interface WebsiteHistoricalOutlineData {
  id: string;
  heading?: string | null;
  description?: string | null;
  imageUrl1?: string | null;
  imageUrl2?: string | null;
  imageUrl3?: string | null;
}

interface HistoricalOutlineFormProps {
  initialData?: WebsiteHistoricalOutlineData | null;
}

const IMAGE_SLOTS = [
  { field: "outline_image_1", key: "imageUrl1" },
  { field: "outline_image_2", key: "imageUrl2" },
  { field: "outline_image_3", key: "imageUrl3" },
] as const;

const emptyUploadState: ImageUploadState = { file: null, removed: false };

export default function HistoricalOutlineForm({
  initialData,
}: HistoricalOutlineFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [heading, setHeading] = useState(initialData?.heading ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [imageStates, setImageStates] = useState<ImageUploadState[]>(
    IMAGE_SLOTS.map(() => emptyUploadState),
  );
  const [isPending, startTransition] = useTransition();
  // Changing the key remounts ImageUpload so its internal picked-file
  // state (which the parent cannot reach) is discarded on reset.
  const [uploadKeys, setUploadKeys] = useState<number[]>([0, 0, 0]);

  // Re-sync fields when the server data changes (e.g. after save + revalidate).
  useEffect(() => {
    setHeading(initialData?.heading ?? "");
    setDescription(initialData?.description ?? "");
    setImageStates(IMAGE_SLOTS.map(() => emptyUploadState));
  }, [initialData]);

  const handleReset = () => {
    setHeading(initialData?.heading ?? "");
    setDescription(initialData?.description ?? "");
    setImageStates(IMAGE_SLOTS.map(() => emptyUploadState));
    setUploadKeys((keys) => keys.map((key) => key + 1));
  };

  const handleImageChange = (index: number, state: ImageUploadState) => {
    setImageStates((states) =>
      states.map((item, itemIndex) => (itemIndex === index ? state : item)),
    );
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("heading", heading);
    formData.append("description", description);

    imageStates.forEach((state, index) => {
      if (state.file) {
        formData.append(IMAGE_SLOTS[index].field, state.file);
      } else if (state.removed) {
        formData.append(`removeImage${index + 1}`, "true");
      }
    });

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateWebsiteHistoricalOutline(initialData.id, formData)
          : await createWebsiteHistoricalOutline(formData);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "Historical Outline updated successfully"
            : "Historical Outline created successfully",
        );
        router.refresh();
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <SectionCard
        title="Historical Outline"
        onReset={handleReset}
        isPending={isPending}
      >
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Heading
          </Label>
          <Input
            value={heading}
            onChange={(event) => setHeading(event.target.value)}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>

        <RichTextEditor
          label="Description"
          value={description}
          onChange={setDescription}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {IMAGE_SLOTS.map((slot, index) => (
            <ImageUpload
              key={uploadKeys[index]}
              label="Historical Outline"
              name={slot.field}
              defaultUrl={
                initialData?.[slot.key as keyof WebsiteHistoricalOutlineData] ??
                undefined
              }
              onFileChange={(state) => handleImageChange(index, state)}
            />
          ))}
        </div>
      </SectionCard>
    </form>
  );
}
