import { z } from "zod";

export const NoticeTypeValues = [
  "UPDATE_NEWS",
  "GENERAL_NOTICE",
  "ADMISSION_NOTICE",
  "IMPROVEMENT_NOTICE",
  "HSC_NOTICE",
  "HONOURS_NOTICE",
  "MASTER_NOTICE",
] as const;

export const academicNoticeValidation = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  noticeType: z.enum(NoticeTypeValues, { message: "Select notice type" }),
});

export type AcademicNoticeFormValues = z.infer<
  typeof academicNoticeValidation
>;
