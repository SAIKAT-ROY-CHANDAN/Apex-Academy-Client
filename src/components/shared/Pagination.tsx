"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  active: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  active = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange = () => {},
}: PaginationProps) {
  const pages: React.ReactNode[] = [];
  const visiblePages = 4;

  // Show first N pages
  for (let i = 1; i <= Math.min(visiblePages, totalPages); i++) {
    pages.push(
      <Button
        key={i}
        size="sm"
        className={cn(
          "h-8 w-8 rounded-none",
          active === i
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-transparent text-white hover:bg-red-50"
        )}
        onClick={() => onPageChange(i)}
        variant={active === i ? "default" : "ghost"}
      >
        {i}
      </Button>
    );
  }

  if (totalPages > visiblePages + 1) {
    pages.push(
      <Button
        key="ellipsis"
        size="sm"
        className="h-8 w-8 rounded-none bg-transparent text-white"
        variant="ghost"
        disabled
      >
        ...
      </Button>
    );
  }

  if (totalPages > visiblePages) {
    pages.push(
      <Button
        key={totalPages}
        size="sm"
        className={cn(
          "h-8 w-8 rounded-none",
          active === totalPages
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-transparent text-white hover:bg-red-50"
        )}
        onClick={() => onPageChange(totalPages)}
        variant={active === totalPages ? "default" : "ghost"}
      >
        {totalPages}
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-between mt-4">
      {/* ✅ Left side text */}
      <p className="text-sm text-gray-400">Showing {totalItems} entries</p>

      {/* ✅ Right side pagination */}
      <nav className="flex items-center">
        <ul className="flex items-center gap-1 backdrop-blur-md bg-primary/10 border border-red-300/30 shadow-lg">
          <li>
            <Button
              size="sm"
              className={cn(
                "h-8 w-8 rounded-none flex items-center justify-center transition-all duration-300 transform hover:scale-105 backdrop-blur-sm",
                active === 1
                  ? "bg-red-200/30 text-red-400 cursor-not-allowed border border-red-300/20"
                  : "bg-red-100/40 text-white hover:bg-red-200/60 hover:shadow-md border border-red-300/30 cursor-pointer"
              )}
              onClick={() => onPageChange(active - 1)}
              disabled={active === 1}
              variant="ghost"
            >
              {"<"}
            </Button>
          </li>
          {pages.map((page, idx) => (
            <li
              key={idx}
              className="transform transition-all duration-200 hover:scale-105"
            >
              {page}
            </li>
          ))}
          <li>
            <Button
              size="sm"
              className={cn(
                "h-8 w-8 rounded-none flex items-center justify-center transition-all duration-300 transform hover:scale-105 backdrop-blur-sm",
                active === totalPages
                  ? "bg-red-200/30 text-red-400 cursor-not-allowed border border-red-300/20"
                  : "bg-red-100/40 text-white hover:bg-red-200/60 hover:shadow-md border border-red-300/30 cursor-pointer"
              )}
              onClick={() => onPageChange(active + 1)}
              disabled={active === totalPages}
              variant="ghost"
            >
              {">"}
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
