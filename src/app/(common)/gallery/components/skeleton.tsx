import React from "react";

const GallerySkeletonCard = () => {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200">
      <div className="h-full w-full animate-pulse bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%]" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-400/50" />
        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-400/40" />
      </div>
    </div>
  );
};

export default GallerySkeletonCard;
