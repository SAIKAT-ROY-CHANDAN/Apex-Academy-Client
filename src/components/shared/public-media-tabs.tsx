"use client";

import Image from "next/image";
import { useState } from "react";
import { format } from "date-fns";
import { Play } from "lucide-react";

type MediaRow = {
  id: string;
  type: "PHOTO" | "VIDEO";
  title: string;
  captureDate: string;
  fileUrl?: string | null;
  videoUrl?: string | null;
};

function formatDateLabel(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return format(d, "MMM dd, yyyy");
  } catch {
    return iso;
  }
}

function getVideoThumb(videoUrl?: string | null): string | null {
  if (!videoUrl) return null;
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace("www.", "");
    if (host.includes("youtube.com") || host === "youtu.be") {
      let id: string | null = null;
      if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0] ?? null;
      else id = url.searchParams.get("v");
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    return null;
  } catch {
    return null;
  }
}

function getYouTubeEmbedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace("www.", "");
    if (host.includes("youtube.com") || host === "youtu.be") {
      let id: string | null = null;
      if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0] ?? null;
      else id = url.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

interface Props {
  photos: MediaRow[];
  videos: MediaRow[];
  previewLimit?: number;
  sectionLabel?: string;
}

export default function PublicMediaTabs({
  photos,
  videos,
  previewLimit,
  sectionLabel = "Academic Programs",
}: Props) {
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [activeVideo, setActiveVideo] = useState<MediaRow | null>(null);

  const activeItems = activeTab === "photos" ? photos : videos;
  const displayItems =
    previewLimit && previewLimit > 0
      ? activeItems.slice(0, previewLimit)
      : activeItems;

  const hasPhotos = photos.length > 0;
  const hasVideos = videos.length > 0;

  return (
    <>
      {/* Segmented control — pill-shaped, centered */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={[
              "rounded-full px-8 py-2.5 text-sm font-semibold transition-colors",
              activeTab === "photos"
                ? "bg-[#0F284E] text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:text-slate-900",
            ].join(" ")}
          >
            Photos {hasPhotos ? `(${photos.length})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("videos")}
            className={[
              "rounded-full px-8 py-2.5 text-sm font-semibold transition-colors",
              activeTab === "videos"
                ? "bg-[#0F284E] text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:text-slate-900",
            ].join(" ")}
          >
            Videos {hasVideos ? `(${videos.length})` : ""}
          </button>
        </div>
      </div>

      {displayItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
          <p className="text-sm font-medium text-slate-500">
            {activeTab === "photos" ? "No photos yet." : "No videos yet."}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {activeTab === "photos"
              ? "Photos added by admin will appear here."
              : "Videos added by admin will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => {
            const isVideo = activeTab === "videos" || item.type === "VIDEO";
            const thumb =
              item.fileUrl && String(item.fileUrl).trim().length > 0
                ? item.fileUrl
                : getVideoThumb(item.videoUrl) ?? "/placeholder.svg";
            const dateLabel = formatDateLabel(item.captureDate);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isVideo && item.videoUrl) setActiveVideo(item);
                }}
                className={`group relative aspect-[4/4] overflow-hidden rounded-xl focus-within:ring-2 focus-within:ring-[#4a2545] focus-within:ring-offset-2 ${
                  isVideo ? "cursor-pointer" : ""
                }`}
              >
                <Image
                  src={thumb}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  unoptimized
                />

                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur transition group-hover:bg-white">
                      <Play className="h-5 w-5 fill-[#0F284E] text-[#0F284E] ml-0.5" />
                    </span>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-5 text-center">
                  <h3 className="text-white text-lg font-bebas uppercase tracking-wide line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-white/75 text-xs mt-1 font-almarai">{dateLabel}</p>
                  <p className="text-white text-sm font-semibold mt-0.5 font-almarai line-clamp-1">
                    {sectionLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-slate-700 hover:bg-white"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-video w-full bg-black">
              {(() => {
                const embed = getYouTubeEmbedUrl(activeVideo.videoUrl ?? "");
                if (embed) {
                  return (
                    <iframe
                      src={embed}
                      title={activeVideo.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }
                if (activeVideo.videoUrl?.match(/\.(mp4|webm|ogg)$/i)) {
                  return <video src={activeVideo.videoUrl} controls className="h-full w-full" />;
                }
                return (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-white">
                    <p className="text-sm font-medium">{activeVideo.title}</p>
                    <a
                      href={activeVideo.videoUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#0F284E] hover:bg-slate-100"
                    >
                      Open Video
                    </a>
                  </div>
                );
              })()}
            </div>
            <div className="bg-[#0F284E] px-4 py-3 text-center">
              <p className="font-bebas text-white uppercase">{activeVideo.title}</p>
              <p className="font-almarai text-xs text-white/70">{formatDateLabel(activeVideo.captureDate)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
