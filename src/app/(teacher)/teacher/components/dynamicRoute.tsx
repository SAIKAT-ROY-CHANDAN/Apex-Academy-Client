// components/PageBanner.tsx
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa6";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageRouteProps = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
};

export default function PageRoute({ title, breadcrumbs }: PageRouteProps) {
  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-semibold">{title}</h1>

      <p className="mt-2 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <span key={index} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-blue-600">{item.label}</Link>
              ) : (
                <span className={isLast ? "font-medium text-blue-600" : ""}>
                  {item.label}
                </span>
              )}
              {!isLast && <FaAngleRight className="h-3 w-3" />}
            </span>
          );
        })}
      </p>
    </div>
  );
}
