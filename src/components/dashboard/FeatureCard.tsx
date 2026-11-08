import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type FeatureColor = {
  bg: string;
  lightBg: string;
  iconBg: string;
  iconColor: string;
  hoverBg: string;
};

type FeatureCardProps = {
  name: string;
  icon: React.ReactNode;
  href: string;
  color: FeatureColor;
  index?: number;
};

const FeatureCard = ({
  name,
  icon,
  href,
  color,
  index = 0,
}: FeatureCardProps) => {
  // Staggered animation delay based on index
  const animationDelay = `${index * 100}ms`;

  return (
    <Link href={href} className="group block h-full">
      <div
        className="relative flex h-full flex-col items-start gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-5 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ animationDelay }}
      >
        {/* Background Glow */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        />

        {/* Top Section */}
        <div className="flex w-full items-start justify-between">
          {/* Icon */}
          <div
            className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-xl ${color.iconBg} ${color.iconColor} transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow`}
          >
            {icon}
          </div>

          {/* Hover Arrow */}
          <ArrowUpRight className="h-4 w-4 -translate-y-0.5 translate-x-0.5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-primary group-hover:opacity-100" />
        </div>

        {/* Content */}
        <div className="min-w-0 space-y-1">
          <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
            {name}
          </h3>

          <p className="text-[0.82rem] leading-snug text-muted-foreground">
            Access {name} module
          </p>
        </div>

        {/* Bottom Badge */}
        <div className="mt-auto inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/70 px-2.5 py-0.5 text-[0.7rem] font-medium text-muted-foreground transition-colors group-hover:border-primary/20">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
          Explore
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;
