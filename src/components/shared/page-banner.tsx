// components/PageBanner.tsx
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageBannerProps = {
  banner: StaticImageData | string;
  title: string;
  breadcrumbs: BreadcrumbItem[];
};

export default function PageBanner({
  banner,
  title,
  breadcrumbs,
}: PageBannerProps) {
  const isStaticImage = typeof banner !== "string";
  const isRemoteString = typeof banner === "string";

  return (
    <div className="h-[60vh] sm:h-[70vh] relative rounded lg:rounded-2xl overflow-hidden">
      <Image
        src={banner}
        alt={title}
        fill
        className="object-cover"
        sizes="100vw"
        quality={70}
        priority
        unoptimized={isRemoteString}
        {...(isStaticImage && { placeholder: "blur" })}
      />
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="absolute inset-0 z-10 max-w-6xl mx-auto px-4 pt-28 sm:pt-36 pb-10 flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl uppercase text-white font-bebas">
          {title}
        </h1>

        <p className="text-base sm:text-xl lg:text-2xl text-white flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-3 sm:mt-4 font-almarai">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={index} className="flex items-center gap-2 sm:gap-3">
                {item.href && !isLast ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span className={isLast ? "text-[#F59E0B]" : ""}>
                    {item.label}
                  </span>
                )}
                {!isLast && <FaArrowRight />}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}
