"use client";

import { useEffect, useState } from "react";
import type { StaticImageData } from "next/image";
import PageBanner from "./page-banner";

type PageCoverKey =
  | "aboutCollege"
  | "managementTeam"
  | "academic"
  | "students"
  | "gallery"
  | "career"
  | "noticeBoard"
  | "contactUs";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  pageKey: PageCoverKey;
  title: string;
  breadcrumbs: BreadcrumbItem[];
  fallbackBanner: StaticImageData | string;
};

export default function ClientCoverPageBanner({
  pageKey,
  title,
  breadcrumbs,
  fallbackBanner,
}: Props) {
  const [banner, setBanner] = useState<StaticImageData | string>(fallbackBanner);

  useEffect(() => {
    let cancelled = false;
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    fetch(`${baseUrl}/website-settings/page-cover`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const url = json?.data?.[pageKey] as string | null | undefined;
        if (!cancelled && url) setBanner(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pageKey]);

  return <PageBanner banner={banner} title={title} breadcrumbs={breadcrumbs} />;
}
