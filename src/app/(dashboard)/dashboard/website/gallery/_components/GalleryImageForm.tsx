"use client";

import { Images, SquarePlus, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import ImageUpload, {
  type ImageUploadState,
} from "@/components/shared/image-upload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWebsiteGalleryImage,
  createWebsiteGalleryImageJson,
  updateWebsiteGalleryImage,
  updateWebsiteGalleryImageJson,
} from "@/services/websiteGalleryImage";

export interface GalleryImageData {
  id: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  title?: string | null;
  description?: string | null;
}

interface GalleryImageFormProps {
  initialData?: GalleryImageData | null;
}

const emptyUploadState: ImageUploadState = { file: null, removed: false };

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function GalleryImageForm({
  initialData,
}: GalleryImageFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [activeTab, setActiveTab] = useState<"photo" | "video">(
    initialData?.videoUrl ? "video" : "photo",
  );
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [imageState, setImageState] =
    useState<ImageUploadState>(emptyUploadState);
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl ?? "");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);

  useEffect(() => {
    setTitle(initialData?.title ?? "");
    setDescription(initialData?.description ?? "");
    setVideoUrl(initialData?.videoUrl ?? "");
    setActiveTab(initialData?.videoUrl ? "video" : "photo");
    setImageState(emptyUploadState);
  }, [initialData]);

  const handleReset = () => {
    setTitle(initialData?.title ?? "");
    setDescription(initialData?.description ?? "");
    setVideoUrl(initialData?.videoUrl ?? "");
    setActiveTab(initialData?.videoUrl ? "video" : "photo");
    setImageState(emptyUploadState);
    setVideoError(null);
    setUploadKey((key) => key + 1);
  };

  const validateVideoUrl = (url: string): boolean => {
    if (!url.trim()) {
      setVideoError("YouTube link is required");
      return false;
    }
    const id = extractYouTubeId(url);
    if (!id) {
      setVideoError("Please enter a valid YouTube link");
      return false;
    }
    setVideoError(null);
    return true;
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (activeTab === "video" && !validateVideoUrl(videoUrl)) {
      return;
    }

    if (activeTab === "photo") {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      if (imageState.file) {
        formData.append("gallery_image", imageState.file);
      } else if (imageState.removed) {
        formData.append("removeImage", "true");
      }

      startTransition(async () => {
        const response =
          isEditMode && initialData?.id
            ? await updateWebsiteGalleryImage(initialData.id, formData)
            : await createWebsiteGalleryImage(formData);

        if (response?.success) {
          toast.success(
            isEditMode
              ? "Gallery item updated successfully"
              : "Gallery item created successfully",
          );
          router.push("/dashboard/website/gallery");
        } else {
          toast.error(response?.message ?? "Something went wrong");
        }
      });
    } else {
      const payload = {
        title,
        description,
        videoUrl: videoUrl || null,
      };

      startTransition(async () => {
        const response =
          isEditMode && initialData?.id
            ? await updateWebsiteGalleryImageJson(initialData.id, payload)
            : await createWebsiteGalleryImageJson(payload);

        if (response?.success) {
          toast.success(
            isEditMode
              ? "Gallery item updated successfully"
              : "Gallery item created successfully",
          );
          router.push("/dashboard/website/gallery");
        } else {
          toast.error(response?.message ?? "Something went wrong");
        }
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 pt-4">
      {/* Tab Switcher */}
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("photo")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "photo"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Images className="h-4 w-4" />
          Photo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("video")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "video"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Video className="h-4 w-4" />
          Video
        </button>
      </div>

      {/* Photo Tab */}
      {activeTab === "photo" && (
        <ImageUpload
          key={uploadKey}
          label="Gallery Image"
          name="gallery_image"
          defaultUrl={initialData?.imageUrl ?? undefined}
          onFileChange={setImageState}
        />
      )}

      {/* Video Tab */}
      {activeTab === "video" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              YouTube Link
            </Label>
            <Input
              value={videoUrl}
              onChange={(event) => {
                setVideoUrl(event.target.value);
                if (videoError) setVideoError(null);
              }}
              onBlur={() => {
                if (videoUrl.trim()) validateVideoUrl(videoUrl);
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            {videoError && <p className="text-xs text-red-500">{videoError}</p>}
          </div>
          {videoUrl.trim() && !videoError && (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(videoUrl)}`}
                title="Video preview"
                className="h-56 w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}

      {/* Common Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Title</Label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Description
          </Label>
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
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
