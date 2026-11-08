"use client";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { getAllAcademicNotices } from "@/services/academicNotice";

type NoticeItem = {
  id: string;
  title: string;
  noticeType: string;
};

const FALLBACK_TEXT =
  "Admission open for Academic Session 2026-2027 • Orientation Ceremony schedule announced • Pre-Board Examinations start next month.";

interface NoticeBarProps {
  scrolled?: boolean;
}

const NoticeBar = ({ scrolled = false }: NoticeBarProps) => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const query = [
          { label: "page", value: "1" },
          { label: "limit", value: "5" },
          { label: "filter", value: JSON.stringify({ noticeType: "UPDATE_NEWS" }) },
        ];
        const res = (await getAllAcademicNotices(query)) as {
          success?: boolean;
          data?: NoticeItem[];
        };
        if (res?.success !== false && Array.isArray(res?.data) && res.data.length > 0) {
          setNotices(res.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load UPDATE_NEWS for NoticeBar:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestNews();
  }, []);

  const hasNews = notices.length > 0;

  return (
    <div
      className={`border-t transition-colors duration-300 px-4 sm:px-6 py-1.5 flex items-center gap-3 overflow-hidden ${
        scrolled
          ? "border-slate-100 bg-slate-50/70 text-slate-700"
          : "border-white/10 bg-black/25 text-slate-200"
      }`}
    >
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span
          className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            scrolled
              ? "bg-amber-100 text-amber-900 border border-amber-200"
              : "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
          }`}
        >
          Announcements
        </span>
      </div>

      <div className="flex-1 min-w-0 overflow-hidden text-xs sm:text-sm">
        {isLoading ? (
          <p className="opacity-70 text-xs animate-pulse">Loading updates...</p>
        ) : hasNews ? (
          <Marquee speed={55} pauseOnHover gradient={false}>
            <div className="flex items-center gap-8 pr-8">
              {notices.map((notice) => (
                <span key={notice.id} className="whitespace-nowrap flex items-center gap-8">
                  <span className="font-medium">{notice.title}</span>
                  <span className={scrolled ? "text-amber-600" : "text-[#F59E0B]"}>✦</span>
                </span>
              ))}
            </div>
          </Marquee>
        ) : (
          <Marquee speed={55} pauseOnHover gradient={false}>
            <p className="mx-0 flex gap-2 pr-8 font-medium">{FALLBACK_TEXT}</p>
          </Marquee>
        )}
      </div>
    </div>
  );
};

export default NoticeBar;
