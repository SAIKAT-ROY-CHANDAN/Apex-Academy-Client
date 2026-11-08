"use client";

import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LABEL_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "Employees",
  overview: "Overview",
  students: "Students",
  teachers: "Teachers",
  staff: "Staff",
  finance: "Finance",
  academics: "Academics",
  settings: "Settings",
  administration: "Administration",
  hostel: "Hostel",
  quarter: "Quarter",
  transport: "Transport",
  library: "Library",
  complaints: "Complaints",
  feedback: "Feedback",
  account: "My Account",
};

function segmentToLabel(segment: string) {
  return (
    LABEL_MAP[segment] ??
    segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
  );
}

// Dynamic route ids (uuid / ObjectId / cuid / numeric) should never show up
// in breadcrumbs or the fallback title.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;
const CUID_PATTERN = /^c[a-z0-9]{20,}$/i;
const NUMERIC_ID_PATTERN = /^\d+$/;

function isIdSegment(segment: string) {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    // keep raw segment
  }
  return (
    UUID_PATTERN.test(decoded) ||
    OBJECT_ID_PATTERN.test(decoded) ||
    CUID_PATTERN.test(decoded) ||
    NUMERIC_ID_PATTERN.test(decoded)
  );
}

type PageHeaderProps = {
  title?: string;
  backHref?: string;
  actions?: {
    label: string;
    href: string;
  };
  components?: React.ReactNode;
};

export function PageHeader({ title, backHref, actions, components }: PageHeaderProps) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  // Skip id segments in the trail, but keep them inside link hrefs so the
  // intermediate breadcrumb links still point at valid URLs.
  const breadcrumbs: { label: string; href: string | undefined }[] = [];
  segments.forEach((segment, index) => {
    if (isIdSegment(segment)) return;
    breadcrumbs.push({
      label: segmentToLabel(segment),
      href: "/" + segments.slice(0, index + 1).join("/"),
    });
  });
  if (breadcrumbs.length > 0) {
    breadcrumbs[breadcrumbs.length - 1].href = undefined;
  }

  const lastVisibleSegment = [...segments].reverse().find((s) => !isIdSegment(s));

  const resolvedTitle =
    title ?? (lastVisibleSegment ? segmentToLabel(lastVisibleSegment) : "Dashboard");

  return (
    <header className="relative overflow-hidden p-6">
      {/* Decorative Blur */}
      <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div className="space-y-4">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 rounded-full border border-white/20 bg-white/60 px-2.5 py-1 text-slate-500 backdrop-blur transition hover:bg-primary hover:text-white dark:bg-white/10 dark:text-slate-300"
            >
              <Home className="h-3.5 w-3.5" />
            </Link>

            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                <ChevronRight className="mx-1 h-3.5 w-3.5 text-slate-300" />

                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="rounded-full px-2 py-1 text-slate-500 transition hover:bg-primary/10 hover:text-primary"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </nav>

          {/* Title */}
          <div className="space-y-1">
            <h1 className="bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              {resolvedTitle}
            </h1>

            <p className="text-sm text-slate-500">
              Manage and monitor everything related to{" "}
              <span className="font-medium text-primary">{resolvedTitle}</span>.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-wrap items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back
            </Link>
          )}
          {actions && (
            <Link
              href={actions.href}
              className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200"
            >
              {actions.label}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          )}
          {components && (
            <div className="flex items-center gap-2">
              {components}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
