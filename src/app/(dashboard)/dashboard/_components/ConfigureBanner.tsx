import { Button } from "@/components/ui/button";
import { Sparkles, Play } from "lucide-react";
import Link from "next/link";

const ConfigureBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-700 via-blue-800 to-indigo-900 px-8 py-6">
      <Sparkles className="absolute right-24 top-4 h-10 w-10 text-white/10" />
      <Sparkles className="absolute right-10 top-1/2 h-16 w-16 -translate-y-1/2 text-white/10" />
      <Sparkles className="absolute right-40 bottom-2 h-8 w-8 text-white/10" />

      <div className="absolute inset-0 border border-white/10 bg-white/5 backdrop-blur-2xl" />

      <div className="relative flex items-center justify-between gap-6">
        <div>
          <p className="mb-1 text-xs font-medium text-white/60">
            System configuration
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            First, configure your system!
          </h1>
        </div>

        <Link href="/dashboard/settings/system">
          <Button
            size="lg"
            className="group shrink-0 gap-2 rounded-full border border-white/20 bg-white/15 pl-5 pr-2 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/25"
          >
            Go to settings
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-700 transition-transform group-hover:scale-110">
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ConfigureBanner;
