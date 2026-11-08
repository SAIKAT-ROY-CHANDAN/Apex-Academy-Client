import { TAcademicSection } from "../../../section-config/_components/types/academic-section";

export interface Subject {
  id: string;
  name: string;
  class_id: string;
}

export interface CreateSubjectsPayload {
  program_id: string;
  department_id: string;
  class_id: string;
  subjects: string[];
}

export type TAcademicClass = {
  id: string;
  program_id: string | null;
  department_id: string | null;
  class_name: string;
  class_level: number | null;
  year_level: number | null;
  group: string | null;
  created_at: string;
  updated_at: string;
  subjects?: TSubject[];
  academicSections?: TAcademicSection[];
};

export type TSubject = {
  id: string;
  name: string;
  class_id: string;
  created_at: string;
  updated_at: string;
  academicClass: TAcademicClass | null;
};