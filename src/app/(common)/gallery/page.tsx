"use client";

import Image from "next/image";
import banner from "@/assets/heroBanner.webp";
import { useEffect, useState } from "react";
import ClientCoverPageBanner from "@/components/shared/client-cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import { getAllWebsiteGalleryImages } from "@/services/websiteGalleryImage";
import GallerySkeletonCard from "./components/skeleton";

type TGalleryImage = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  created_at: string;
};

const titleData = {
  subTitle: "Gallery",
  title: "View our Latest Photo & Video Gallery of out campus",
};

const getYoutubeThumbnail = (url: string) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/,
  );
  const videoId = match?.[1];
  return videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "/fallback-thumbnail.jpg";
};

const page = () => {
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [photoData, setPhotoData] = useState<TGalleryImage[]>([]);
  const [videoData, setVideoData] = useState<TGalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getAllWebsiteGalleryImages();
        const rawData = Array.isArray(res?.data) ? res.data : [];
        const filterPhoto = rawData.filter(
          (item: TGalleryImage) => item?.videoUrl === null,
        );
        const filterVideo = rawData.filter(
          (item: TGalleryImage) => item?.imageUrl === null,
        );
        setPhotoData(filterPhoto);
        setVideoData(filterVideo);
      } catch (error) {
        console.error("Failed to fetch gallery data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <ClientCoverPageBanner
        pageKey="gallery"
        fallbackBanner={banner}
        title="Gallery"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />

      <div>
        <section className="bg-white pb-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto lg:max-w-4xl 2xl:max-w-6xl">
            <PageTitle titleData={titleData} />

            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center rounded-full bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("photos")}
                  className={`rounded-full px-6 py-2 text-sm font-bebas transition-colors ${
                    activeTab === "photos"
                      ? "bg-[#0F284E] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Photos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("videos")}
                  className={`rounded-full px-6 py-2 text-sm font-bebas transition-colors ${
                    activeTab === "videos"
                      ? "bg-[#0F284E] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Videos
                </button>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <GallerySkeletonCard key={idx} />
                ))}
              </div>
            ) : activeTab === "photos" ? (
              <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {photoData.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200"
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-lg font-bebas uppercase tracking-wide text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm font-almarai text-white/80">
                        {item.created_at.split("T")[0]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {videoData.map((item) => {
                  const isPlaying = playingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900"
                    >
                      {isPlaying ? (
                        <video
                          src={item.videoUrl}
                          controls
                          autoPlay
                          className="h-full w-full object-cover"
                          onEnded={() => setPlayingId(null)}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPlayingId(item.id)}
                          className="absolute inset-0 h-full w-full cursor-pointer"
                          aria-label={`Play video: ${item.title}`}
                        >
                          {/* Thumbnail image */}
                          <Image
                            src={getYoutubeThumbnail(item.videoUrl)}
                            alt={item.title}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />

                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

                          {/* Play button */}
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 group-hover:scale-110">
                              <svg
                                viewBox="0 0 24 24"
                                className="ml-1 h-6 w-6 fill-[#0F284E]"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </span>
                          </span>

                          {/* Caption */}
                          <span className="absolute bottom-0 left-0 right-0 p-5 text-left">
                            <span className="block text-lg font-bebas uppercase tracking-wide text-white">
                              {item.title}
                            </span>
                            <span className="mt-1 block font-almarai text-sm text-white/80">
                              {item.created_at.split("T")[0]}
                            </span>
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default page;
