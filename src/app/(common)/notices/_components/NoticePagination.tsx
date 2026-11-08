"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type NoticePaginationProps = {
  active: number;
  totalPages: number;
  totalItems: number;
};

export default function NoticePagination({
  active,
  totalPages,
  totalItems,
}: NoticePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`, { scroll: true });
  };

  if (totalPages <= 1) {
    return (
      <div className="mt-6 flex justify-center">
        <p className="text-sm text-[#FFEFC4]/70 font-almarai">
          Showing {totalItems} {totalItems === 1 ? "entry" : "entries"}
        </p>
      </div>
    );
  }

  const pages: number[] = [];
  const visiblePages = 4;

  for (let i = 1; i <= Math.min(visiblePages, totalPages); i++) {
    pages.push(i);
  }

  const showEllipsis = totalPages > visiblePages + 1;
  const showLast = totalPages > visiblePages;

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-[#FFEFC4]/70 font-almarai">
        Showing {totalItems} {totalItems === 1 ? "entry" : "entries"} — Page {active} of {totalPages}
      </p>

      <nav className="flex items-center" aria-label="Pagination">
        <ul className="flex items-center gap-1.5">
          <li>
            <button
              type="button"
              onClick={() => handlePageChange(active - 1)}
              disabled={active === 1}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
                active === 1
                  ? "bg-white/10 text-white/30 cursor-not-allowed"
                  : "bg-[#FFEFC4] text-[#0F284E] hover:bg-[#F59E0B] cursor-pointer"
              )}
              aria-label="Previous page"
            >
              ‹
            </button>
          </li>

          {pages.map((page) => (
            <li key={page}>
              <button
                type="button"
                onClick={() => handlePageChange(page)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  active === page
                    ? "bg-[#F59E0B] text-[#0F284E]"
                    : "bg-white text-[#0F284E] hover:bg-[#FFEFC4] cursor-pointer"
                )}
                aria-label={`Go to page ${page}`}
                aria-current={active === page ? "page" : undefined}
              >
                {page}
              </button>
            </li>
          ))}

          {showEllipsis && (
            <li>
              <span className="flex h-9 w-9 items-center justify-center text-sm text-[#FFEFC4]/60">
                …
              </span>
            </li>
          )}

          {showLast && (
            <li>
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  active === totalPages
                    ? "bg-[#F59E0B] text-[#0F284E]"
                    : "bg-white text-[#0F284E] hover:bg-[#FFEFC4] cursor-pointer"
                )}
                aria-label={`Go to page ${totalPages}`}
                aria-current={active === totalPages ? "page" : undefined}
              >
                {totalPages}
              </button>
            </li>
          )}

          <li>
            <button
              type="button"
              onClick={() => handlePageChange(active + 1)}
              disabled={active === totalPages}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
                active === totalPages
                  ? "bg-white/10 text-white/30 cursor-not-allowed"
                  : "bg-[#FFEFC4] text-[#0F284E] hover:bg-[#F59E0B] cursor-pointer"
              )}
              aria-label="Next page"
            >
              ›
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
