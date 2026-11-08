export type THomework = {
  id: string;
  title: string;
  description: string;
  academic_class_id?: string;
  // Raw Prisma field names returned by the API (class_id / section_id)
  class_id?: string;
  academicClass?: {
    id: string;
    class_name: string;
  };
  academic_section_id?: string | null;
  section_id?: string | null;
  academicSection?: {
    id: string;
    section_name: string;
  } | null;
  subject_id: string;
  subject?: {
    id: string;
    name: string;
  };
  teacher_id: string;
  teacher?: {
    id: string;
    full_name: string;
  };
  due_date: string;
  created_at: string;
  updated_at: string;
};

export type THomeworkResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data: THomework[];
};