"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronRight, Menu, X, ArrowRight } from "lucide-react";
import logo from "@/assets/institution/logo.svg";
import NoticeBar from "./noticeBar";

type NavItem = {
  label: string;
  href?: string;
  dropdown?: NavItem[];
  forceReload?: boolean;
};

function isExternalLink(href?: string) {
  return !!href && /^https?:\/\//.test(href);
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    dropdown: [
      { label: "About College", href: "/about/about_college" },
      { label: "Management Team", href: "/about/management" },
      { label: "Administration", href: "/about/administration" },
    ],
  },
  {
    label: "Academic",
    dropdown: [
      {
        label: "Academic",
        dropdown: [
          {
            label: "Academic Programs",
            href: "/academic/academic/academic_programs",
          },
          {
            label: "Academic Calendar",
            href: "/academic/academic/academic_calender",
          },
          { label: "Curriculum", href: "/academic/academic/curriculum" },
          { label: "Syllabus", href: "/academic/academic/syllabus" },
          { label: "Tuition Fees", href: "/academic/academic/tution_fees" },
        ],
      },
      {
        label: "Academic Bodies",
        dropdown: [
          {
            label: "Departments",
            href: "/academic/academic_bodies/departments",
          },
        ],
      },
      {
        label: "Admission",
        dropdown: [
          {
            label: "HSC Program",
            href: "/academic/admission/hsc_program",
          },
          {
            label: "Undergraduate Program",
            href: "/academic/admission/undergraduate",
          },
          {
            label: "Graduate Program",
            href: "/academic/admission/graduate",
          },
          {
            label: "Post-Graduation Program",
            href: "/academic/admission/post_graduate",
          },
        ],
      },
    ],
  },
  {
    label: "Students",
    dropdown: [
      { label: "Online Admission", href: "/online_admission" },
      {
        label: "Student Facilities",
        dropdown: [
          { label: "Campus", href: "/students/student_facilities/campus" },
          {
            label: "Scholarship",
            href: "/students/student_facilities/scholarship",
          },
          { label: "Library", href: "/students/student_facilities/library" },
          {
            label: "Co-Curriculum Activities",
            href: "/students/student_facilities/co_curriculum",
          },
          {
            label: "Career Developments",
            href: "/students/student_facilities/career_developments",
          },
          {
            label: "Registration for Career Development",
            href: "/students/student_facilities/career_developments_opportunity",
          },
          {
            label: "Student Club",
            href: "/students/student_facilities/student_club",
          },
        ],
      },
      {
        label: "Online Services",
        dropdown: [
          {
            label: "Apply for Mark Sheet from DU",
            href: "https://eco.du.ac.bd/",
          },
          {
            label: "Apply for Transcript from DU",
            href: "https://eco.du.ac.bd/",
          },
          {
            label: "Apply for Certificate from DU",
            href: "https://eco.du.ac.bd/",
          },
          {
            label: "Apply for Govt. Scholarships",
            href: "https://studentscholarship.du.ac.bd/",
          },
          {
            label: "Examination Results",
            href: "https://ducmc.du.ac.bd/",
          },
          {
            label: "Exam Form Fill-up",
            href: "https://ducmc.du.ac.bd/",
          },
        ],
      },
      {
        label: "Guideline for Students",
        dropdown: [
          {
            label: "Admission & Re-admission",
            href: "/students/guideline_for_students/re-admission",
          },
          {
            label: "Improvement/Re-take Exam",
            href: "/students/guideline_for_students/improvement",
          },
          {
            label: "Instruction for HSC Students",
            href: "/students/guideline_for_students/instruction-hsc",
          },
          {
            label: "Instruction for Honors Students",
            href: "/students/guideline_for_students/instruction-honors",
          },
          {
            label: "Instruction for Masters Students",
            href: "/students/guideline_for_students/instruction-masters",
          },
        ],
      },
    ],
  },
  {
    label: "Gallery",
    href: "/gallery",
  },
  { label: "Career", href: "/career" },
  {
    label: "Notice Board",
    dropdown: [
      { label: "General Notices", href: "/notices/general", forceReload: true },
      {
        label: "Admission Notice",
        href: "/notices/admission",
        forceReload: true,
      },
      { label: "HSC Notice", href: "/notices/hsc", forceReload: true },
      {
        label: "Improvement Notice",
        href: "/notices/improvement",
        forceReload: true,
      },
      {
        label: "Honours Notice",
        href: "/notices/honours",
        forceReload: true,
      },
      {
        label: "Masters Notice",
        href: "/notices/masters",
        forceReload: true,
      },
    ],
  },
  {
    label: "Portals",
    dropdown: [
      { label: "Admin Portal", href: "/admin-login" },
      { label: "Teacher Portal", href: "/teacher-login" },
      { label: "Student Portal", href: "/student-login" },
    ],
  },
];

/* ---------------- Desktop recursive menu item ---------------- */
function DesktopMenuItem({
  item,
  level,
  scrolled,
}: {
  item: NavItem;
  level: number;
  scrolled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.dropdown?.length;
  const external = isExternalLink(item.href);

  // Top-level styling depends on scrolled state
  const topLevelClasses = `flex items-center gap-1.5 px-3 py-2 text-[13px] xl:text-sm font-semibold tracking-wide transition-all rounded-lg ${
    item.label === "Home"
      ? scrolled
        ? "text-amber-600 font-bold"
        : "text-[#F59E0B] font-bold drop-shadow-sm"
      : scrolled
        ? "text-slate-700 hover:text-[#0A1C36] hover:bg-slate-100/70"
        : "text-white/90 hover:text-white hover:bg-white/10"
  }`;

  // Nested styling inside dropdowns
  const nestedClasses = `flex w-full items-center justify-between gap-3 px-4 py-2.5 text-xs sm:text-sm transition-colors ${
    scrolled
      ? "text-slate-700 hover:bg-slate-50 hover:text-[#0A1C36]"
      : "text-slate-200 hover:bg-white/10 hover:text-[#F59E0B]"
  }`;

  const labelClasses = level === 0 ? topLevelClasses : nestedClasses;
  const Icon = level === 0 ? ChevronDown : ChevronRight;

  const labelContent = (
    <>
      <span>{item.label}</span>
      {hasChildren && (
        <Icon
          size={13}
          className={`shrink-0 transition-transform duration-200 ${
            level === 0 ? (open ? "rotate-180" : "") : ""
          } ${scrolled ? "opacity-60" : "opacity-80"}`}
        />
      )}
    </>
  );

  return (
    <li
      className="relative"
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => hasChildren && setOpen(false)}
    >
      {item.href ? (
        item.forceReload ? (
          <a href={item.href} className={labelClasses}>
            {labelContent}
          </a>
        ) : (
          <Link
            href={item.href}
            className={labelClasses}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {labelContent}
          </Link>
        )
      ) : (
        <span
          className={`${labelClasses} ${level === 0 ? "cursor-pointer" : "cursor-default select-none"}`}
        >
          {labelContent}
        </span>
      )}

      {hasChildren && (
        <ul
          className={`absolute min-w-[230px] rounded-xl py-2 shadow-2xl transition-all duration-200 ${
            level === 0 ? "left-0 top-full pt-1" : "left-full top-0 pl-1"
          } ${
            scrolled
              ? "bg-white/98 backdrop-blur-xl border border-slate-200/90 shadow-slate-900/10 text-slate-800"
              : "bg-[#07152B]/95 backdrop-blur-2xl border border-white/15 shadow-black/50 text-white"
          } ${
            open
              ? "visible translate-x-0 translate-y-0 opacity-100"
              : level === 0
                ? "invisible -translate-y-2 opacity-0"
                : "invisible -translate-x-2 opacity-0"
          }`}
        >
          {item.dropdown!.map((child, i) => (
            <DesktopMenuItem
              key={`${child.label}-${i}`}
              item={child}
              level={level + 1}
              scrolled={scrolled}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ---------------- Mobile recursive menu item ---------------- */
function MobileMenuItem({
  item,
  level,
  onNavigate,
}: {
  item: NavItem;
  level: number;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.dropdown?.length;
  const external = isExternalLink(item.href);

  const labelClasses =
    level === 0
      ? `flex-1 py-2.5 text-sm font-semibold ${
          item.label === "Home" ? "text-[#F59E0B]" : "text-slate-100"
        }`
      : "flex-1 select-none py-2 pl-3 text-xs sm:text-sm text-slate-300";

  return (
    <div className={level > 0 ? "border-l border-white/10" : ""}>
      <div className="flex items-center justify-between">
        {item.href ? (
          item.forceReload ? (
            <a href={item.href} onClick={onNavigate} className={labelClasses}>
              {item.label}
            </a>
          ) : (
            <Link
              href={item.href}
              onClick={onNavigate}
              className={labelClasses}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
            >
              {item.label}
            </Link>
          )
        ) : (
          <span className={labelClasses}>{item.label}</span>
        )}
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="p-2 text-slate-400 hover:text-white"
            aria-label={`Toggle ${item.label} submenu`}
          >
            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${
                open ? "rotate-180 text-[#F59E0B]" : ""
              }`}
            />
          </button>
        )}
      </div>

      {hasChildren && (
        <div
          className={`overflow-hidden pl-3 transition-[max-height] duration-200 ${
            open ? "max-h-[2000px]" : "max-h-0"
          }`}
        >
          {item.dropdown!.map((child, i) => (
            <MobileMenuItem
              key={`${child.label}-${i}`}
              item={child}
              level={level + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.25rem)] sm:w-[calc(100%-2.5rem)] max-w-7xl rounded-2xl lg:rounded-3xl overflow-hidden transition-all duration-300 ease-out ${
        scrolled
          ? "top-2 sm:top-3 bg-white/95 backdrop-blur-xl shadow-xl shadow-slate-900/10 border border-slate-200/90 text-slate-900"
          : "top-3 sm:top-5 bg-[#0A1C36]/80 backdrop-blur-xl shadow-2xl shadow-black/40 border border-white/15 text-white"
      }`}
    >
      <nav className="flex items-center justify-between px-4 sm:px-6 py-2.5 lg:py-3">
        {/* Brand & Crest */}
        <Link href="/" className="flex shrink-0 items-center gap-3 group">
          <Image
            src={logo}
            alt="Apex International College Crest"
            width={44}
            height={44}
            className="h-9 w-auto sm:h-11 transition-transform group-hover:scale-105"
            loading="eager"
            priority
          />
          <div className="flex flex-col">
            <span
              className={`font-black tracking-tight text-sm sm:text-base leading-tight uppercase transition-colors ${
                scrolled ? "text-[#0A1C36]" : "text-white"
              }`}
            >
              Apex College
            </span>
            <span
              className={`text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                scrolled ? "text-amber-700" : "text-[#F59E0B]"
              }`}
            >
              Excellence & Innovation
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-1 xl:gap-2 lg:flex z-50">
          {navItems.map((item, i) => (
            <DesktopMenuItem
              key={`${item.label}-${i}`}
              item={item}
              level={0}
              scrolled={scrolled}
            />
          ))}
        </ul>

        {/* Contact CTA Button - Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/contact"
            className={`flex items-center gap-2 rounded-full py-2 pl-4 pr-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md group ${
              scrolled
                ? "bg-[#0A1C36] text-white hover:bg-[#07152B] hover:shadow-slate-900/20"
                : "bg-[#F59E0B] text-[#0A1C36] hover:bg-[#D97706] hover:shadow-amber-500/25"
            }`}
          >
            <span>Contact Us</span>
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5 ${
                scrolled
                  ? "bg-[#F59E0B] text-[#0A1C36]"
                  : "bg-[#0A1C36] text-[#F59E0B]"
              }`}
            >
              <ArrowRight size={13} />
            </span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors lg:hidden ${
            scrolled
              ? "text-slate-800 hover:bg-slate-100"
              : "text-white hover:bg-white/10"
          }`}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile nav panel drawer */}
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out lg:hidden ${
          scrolled ? "bg-white/98 text-slate-900" : "bg-[#07152B]/98 text-white"
        } ${mobileOpen ? "max-h-[80vh] overflow-y-auto border-t border-white/10" : "max-h-0"}`}
      >
        <ul className="flex flex-col gap-1 px-5 py-4">
          {navItems.map((item, i) => (
            <li key={`${item.label}-${i}`}>
              <MobileMenuItem
                item={item}
                level={0}
                onNavigate={() => setMobileOpen(false)}
              />
            </li>
          ))}

          <li className="mt-3 pt-3 border-t border-white/10">
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] py-3 text-sm font-bold uppercase tracking-wider text-[#0A1C36] shadow-md"
            >
              <span>Contact Us</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A1C36] text-[#F59E0B]">
                <ArrowRight size={12} />
              </span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Integrated Live Notice Ribbon (Desktop & Tablet) */}
      <div className="hidden md:block">
        <NoticeBar scrolled={scrolled} />
      </div>
    </header>
  );
}
