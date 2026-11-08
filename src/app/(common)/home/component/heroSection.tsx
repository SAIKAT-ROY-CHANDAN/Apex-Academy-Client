import Image from "next/image";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa";
import { Award, BookOpen, Building2, Globe, GraduationCap, Sparkles } from "lucide-react";
import { getWebsiteHeroSection } from "@/services/websiteHeroSection";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=85&w=1920&auto=format&fit=crop";

const HeroSection = async () => {
  const heroData = await getWebsiteHeroSection();
  const heading =
    heroData?.data?.heading ||
    "Empowering Future Leaders with Excellence & Innovation";
  const subHeading =
    heroData?.data?.subHeading ||
    "Welcome to Apex International College. We offer accredited academic curricula, world-class research laboratories, and a global learning community dedicated to scholarly distinction.";
  const imageUrl = heroData?.data?.imageUrl || DEFAULT_HERO_IMAGE;

  return (
    <div className="min-h-[95vh] relative rounded-2xl lg:rounded-3xl overflow-hidden flex flex-col justify-between pt-36 sm:pt-44 lg:pt-48 pb-8 sm:pb-12 px-6 sm:px-10 lg:px-14 my-2 shadow-2xl">
      {/* Background High-Definition Academic Campus Image */}
      <Image
        src={imageUrl}
        alt="Apex International College Campus"
        fill
        priority
        unoptimized
        className="object-cover object-center transform scale-105 transition-transform duration-1000"
      />

      {/* Modern Multi-Layer Gradient Overlays for Razor-Sharp Readability & Navbar Integration */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07152B]/85 via-transparent to-[#07152B]/95 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07152B] via-[#0A1C36]/70 to-black/30 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 pointer-events-none" />

      {/* Top Header Pill Badge */}
      <div className="relative z-10 w-fit">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#F59E0B] text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Apex International College • Est. 1998</span>
        </div>
      </div>

      {/* Center / Main Content Area */}
      <div className="relative z-10 my-auto py-8 max-w-4xl flex flex-col gap-5">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-md">
          {heading}
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl font-normal leading-relaxed drop-shadow-sm">
          {subHeading}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3.5 pt-3">
          <Link
            href="/about/about_college"
            className="bg-[#F59E0B] hover:bg-[#D97706] text-[#0F284E] font-bold px-6 py-3 rounded-full flex items-center gap-2.5 transition-all duration-200 shadow-lg shadow-amber-500/25 text-sm uppercase tracking-wider group"
          >
            <span>About Us</span>
            <FaAngleRight className="w-6 h-6 p-1 rounded-full bg-[#0F284E] text-[#F59E0B] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/academic/academic/academic_programs"
            className="bg-white/15 hover:bg-white/25 text-white font-semibold px-5 py-3 rounded-full flex items-center gap-2 border border-white/25 backdrop-blur-md transition-all duration-200 text-sm uppercase tracking-wider"
          >
            <BookOpen className="w-4 h-4 text-[#F59E0B]" />
            <span>Academic Programs</span>
          </Link>

          <Link
            href="/online_admission"
            className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 font-semibold px-5 py-3 rounded-full flex items-center gap-2 border border-sky-400/30 backdrop-blur-md transition-all duration-200 text-sm uppercase tracking-wider"
          >
            <GraduationCap className="w-4 h-4 text-sky-300" />
            <span>Online Admission</span>
          </Link>
        </div>
      </div>

      {/* Bottom Key Metric / Institutional Highlights Bar */}
      <div className="relative z-10 w-full border border-white/15 bg-black/40 backdrop-blur-md py-4 px-6 rounded-xl lg:rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-white">98.8%</div>
            <div className="text-xs text-gray-300">Graduate Success Rate</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-white">25+</div>
            <div className="text-xs text-gray-300">Global Affiliations</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-white">18+</div>
            <div className="text-xs text-gray-300">Advanced Research Labs</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-white">Top 10</div>
            <div className="text-xs text-gray-300">National Academic Rank</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
