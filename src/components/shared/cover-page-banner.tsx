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

type CoverPageBannerProps = {
  pageKey: PageCoverKey;
  title: string;
  breadcrumbs: BreadcrumbItem[];
  fallbackBanner: StaticImageData | string;
};

export default async function CoverPageBanner({
  pageKey,
  title,
  breadcrumbs,
  fallbackBanner,
}: CoverPageBannerProps) {
  let banner: StaticImageData | string = fallbackBanner;

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const res = await fetch(`${baseUrl}/website-settings/page-cover`, {
      cache: "no-store",
      next: { revalidate: 0 } as any,
    });
    if (res.ok) {
      const json = await res.json();
      const coverUrl = json?.data?.[pageKey] as string | null | undefined;
      if (coverUrl) banner = coverUrl;
    }
  } catch {
    // fallback stays as static image
  }

  return <PageBanner banner={banner} title={title} breadcrumbs={breadcrumbs} />;
}
