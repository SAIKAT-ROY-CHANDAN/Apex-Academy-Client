export type NoticeCategory =
  | "general"
  | "admission"
  | "hsc"
  | "improvement"
  | "honours"
  | "masters";

export type NoticeConfig = {
  label: string;
  noticeType: string;
  bannerTitle: string;
  breadcrumbLabel: string;
  subTitle: string;
  title: string;
};

export const NOTICE_CATEGORY_MAP: Record<NoticeCategory, NoticeConfig> = {
  general: {
    label: "General Notices",
    noticeType: "GENERAL_NOTICE",
    bannerTitle: "General Notices",
    breadcrumbLabel: "General Notices",
    subTitle: "General Notices",
    title: "View Our General Notices",
  },
  admission: {
    label: "Admission Notice",
    noticeType: "ADMISSION_NOTICE",
    bannerTitle: "Admission Notice",
    breadcrumbLabel: "Admission Notice",
    subTitle: "Admission Notice",
    title: "View Our Admission Notices",
  },
  hsc: {
    label: "HSC Notice",
    noticeType: "HSC_NOTICE",
    bannerTitle: "HSC Notice",
    breadcrumbLabel: "HSC Notice",
    subTitle: "HSC Notice",
    title: "View Our HSC Notices",
  },
  improvement: {
    label: "Improvement Notice",
    noticeType: "IMPROVEMENT_NOTICE",
    bannerTitle: "Improvement Notice",
    breadcrumbLabel: "Improvement Notice",
    subTitle: "Improvement Notice",
    title: "View Our Improvement Notices",
  },
  honours: {
    label: "Honours Notice",
    noticeType: "HONOURS_NOTICE",
    bannerTitle: "Honours Notice",
    breadcrumbLabel: "Honours Notice",
    subTitle: "Honours Notice",
    title: "View Our Honours Notices",
  },
  masters: {
    label: "Masters Notice",
    noticeType: "MASTER_NOTICE",
    bannerTitle: "Masters Notice",
    breadcrumbLabel: "Masters Notice",
    subTitle: "Masters Notice",
    title: "View Our Masters Notices",
  },
};

export const NOTICE_CATEGORY_SLUGS = Object.keys(NOTICE_CATEGORY_MAP) as NoticeCategory[];
