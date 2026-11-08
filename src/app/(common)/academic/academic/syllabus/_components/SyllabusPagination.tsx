"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/shared/Pagination";

export default function SyllabusPagination({
  totalPages,
  totalItems,
  active,
}: {
  totalPages: number;
  totalItems: number;
  active: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="lg:max-w-4xl 2xl:max-w-6xl mx-auto mt-6">
      <Pagination
        active={active}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
