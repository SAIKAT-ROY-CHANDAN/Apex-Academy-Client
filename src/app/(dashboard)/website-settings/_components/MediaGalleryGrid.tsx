"use client";

import Image from "next/image";
import { X } from "lucide-react";

export interface MediaGalleryItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  dateLabel: string;
}

interface MediaGalleryGridProps {
  items: MediaGalleryItem[];
  onRemove: (id: string) => void;
}

/**
 * Shared grid for Photos/Videos tabs (used by Academic Programs, Co-Curriculum Activities, and any future gallery section).
 * - Responsive: 2 cols mobile, 3 tablet, 4 laptop, 6 desktop
 * - Thumbnail: rounded-xl overflow-hidden, aspect-[4/3]
 * - Top-right: red circular "x" remove button
 * - Bottom overlay: title bold caps + date
 */
export default function MediaGalleryGrid({
  items,
  onRemove,
}: MediaGalleryGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-500">
          No media yet. Uploaded items will appear here.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Use the form above to add photos or videos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
            <Image
              src={item.thumbnailUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pb-3 pt-8">
              <p className="truncate text-[11px] font-bold uppercase tracking-wide text-white">
                {item.title}
              </p>
              <p className="truncate text-[11px] font-medium text-white/85">
                {item.dateLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.title}`}
            className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md ring-2 ring-white transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            <X className="h-3.5 w-3.5" strokeWidth={3} />
          </button>
        </div>
      ))}
    </div>
  );
}
