"use client";

import Image from "next/image";
import { FaAngleRight } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa6";
import { PageTitle, TTitle } from "@/components/shared/page-title";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TGalleryImage } from "@/types/image";
import { getAllWebsiteGalleryImages } from "@/services/websiteGalleryImage";
import GallerySkeletonCard from "../../gallery/components/skeleton";

const titleData: TTitle = {
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

const HomeGallery = () => {
  const [photoData, setPhotoData] = useState<TGalleryImage[]>([]);
  const [videoData, setVideoData] = useState<TGalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

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
        setPhotoData(filterPhoto.slice(0, 3));
        setVideoData(filterVideo.slice(0, 1));
      } catch (error) {
        console.error("Failed to fetch gallery data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <GallerySkeletonCard />
      </div>
    );
  }

  const [firstPhoto, secondPhoto, thirdPhoto] = photoData;
  const video = videoData[0];

  return (
    <div>
      <PageTitle titleData={titleData} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto xl:max-w-4xl 2xl:max-w-6xl px-4">
        {/* First big photo */}
        {firstPhoto && (
          <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2 min-h-[200px] lg:min-h-[480px] relative rounded-2xl overflow-hidden">
            <Image
              src={firstPhoto.imageUrl as string}
              alt={firstPhoto.title || "Gallery Image"}
              fill
              className="rounded-2xl object-cover"
            />
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="absolute inset-0 z-10 p-7 flex flex-col justify-end">
              <h2 className="text-white text-3xl uppercase font-bebas">
                {firstPhoto.title}
              </h2>
              <p className="text-white uppercase font-almarai">
                {new Date(firstPhoto.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Video block */}
        <div className="sm:col-span-2 bg-[#021421] rounded-2xl min-h-[150px] p-5 grid grid-cols-2 items-center">
          <div>
            <h1 className="text-white text-[20px] mb-7 leading-8 uppercase font-bebas">
              Explore Our Academic Excellence & Student Life
            </h1>
            <Link
              href="/about/about_college"
              className="bg-[#F59E0B] py-2.5 px-4 rounded-full flex items-center gap-2.5 font-bold text-[#0F284E] uppercase w-fit mx-auto md:mx-0 font-almarai"
            >
              About us
              <FaAngleRight className="w-7 h-7 rounded-full bg-[#0F284E] text-[#F59E0B]" />
            </Link>
          </div>

          {video && (
            <div className="w-full max-w-[350px] h-[200px] rounded-2xl overflow-hidden relative">
              {isVideoPlaying ? (
                <iframe
                  src={`${video.videoUrl}?autoplay=1`}
                  title={video.title || "YouTube video player"}
                  className="w-full h-full rounded-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsVideoPlaying(true)}
                  className="w-full h-full relative group"
                >
                  <Image
                    src={getYoutubeThumbnail(video.videoUrl as string)}
                    alt={video.title || "Video thumbnail"}
                    fill
                    className="object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-[#F59E0B] flex items-center justify-center">
                      <FaPlay className="w-5 h-5 text-[#0F284E] ml-1" />
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Second photo */}
        {secondPhoto && (
          <div className="min-h-[150px] relative rounded-2xl overflow-hidden">
            <Image
              src={secondPhoto.imageUrl as string}
              alt={secondPhoto.title || "Gallery Image"}
              fill
              className="rounded-2xl object-cover"
            />
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="absolute inset-0 z-10 p-7 flex flex-col justify-end">
              <h2 className="text-white text-3xl uppercase font-bebas">
                {secondPhoto.title}
              </h2>
              <p className="text-white uppercase font-almarai">
                {new Date(secondPhoto.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Third photo */}
        {thirdPhoto && (
          <div className="min-h-[150px] relative rounded-2xl overflow-hidden">
            <Image
              src={thirdPhoto.imageUrl as string}
              alt={thirdPhoto.title || "Gallery Image"}
              fill
              className="rounded-2xl object-cover"
            />
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="absolute inset-0 z-10 p-7 flex flex-col justify-end">
              <h2 className="text-white text-3xl uppercase font-bebas">
                {thirdPhoto.title}
              </h2>
              <p className="text-white uppercase font-almarai">
                {new Date(thirdPhoto.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeGallery;
