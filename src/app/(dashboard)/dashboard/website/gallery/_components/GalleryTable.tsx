"use client";

import { Edit, Images, Trash2, Video } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteWebsiteGalleryImage } from "@/services/websiteGalleryImage";

export interface GalleryImage {
  id: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  title?: string | null;
  description?: string | null;
}

interface GalleryTableProps {
  images: GalleryImage[];
}

function extractYouTubeThumbnail(videoUrl: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = videoUrl.match(pattern);
    if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return null;
}

const GalleryTable = ({ images }: GalleryTableProps) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<GalleryImage | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (image: GalleryImage) => {
    setToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;

    startTransition(async () => {
      const response = await deleteWebsiteGalleryImage(toDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete image");
        return;
      }
      toast.success(response.message ?? "Image deleted successfully");
      setDeleteDialogOpen(false);
      setToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Images className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No gallery items found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the search or add a new item.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50/70 hover:bg-blue-50/70">
                <TableHead className="h-12 w-24 text-center text-sm font-semibold text-slate-700">
                  No.
                </TableHead>
                <TableHead className="h-12 text-sm font-semibold text-slate-700">
                  Preview
                </TableHead>
                <TableHead className="h-12 text-sm font-semibold text-slate-700">
                  Type
                </TableHead>
                <TableHead className="h-12 text-sm font-semibold text-slate-700">
                  Title
                </TableHead>
                <TableHead className="h-12 w-28 text-center text-sm font-semibold text-slate-700">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images.map((image, index) => (
                <TableRow
                  key={image.id}
                  className="border-slate-100 hover:bg-slate-50/60"
                >
                  <TableCell className="text-center text-sm text-slate-600">
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>
                  <TableCell>
                    {image.imageUrl ? (
                      // biome-ignore lint/performance/noImgElement: backend-served image URL
                      <img
                        src={image.imageUrl}
                        alt={image.title ?? "Gallery"}
                        className="h-9 w-9 rounded-md object-cover"
                      />
                    ) : image.videoUrl ? (
                      (() => {
                        const thumbnail = extractYouTubeThumbnail(
                          image.videoUrl,
                        );
                        return thumbnail ? (
                          // biome-ignore lint/performance/noImgElement: YouTube thumbnail URL
                          <img
                            src={thumbnail}
                            alt={image.title ?? "Video"}
                            className="h-9 w-9 rounded-md object-cover"
                          />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-red-600">
                            <Video className="h-4 w-4" />
                          </span>
                        );
                      })()
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                        <Images className="h-4 w-4" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {image.videoUrl ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
                        <Video className="h-3 w-3" />
                        Video
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                        <Images className="h-3 w-3" />
                        Photo
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-slate-800">
                      {image.title ?? "Untitled"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/dashboard/website/gallery/${image.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(image)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Gallery Item"
        description={
          toDelete
            ? `Are you sure you want to delete ${toDelete.title ?? "this item"}? This action cannot be undone.`
            : "Are you sure you want to delete this item? This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default GalleryTable;
