export interface AcademicSection {
  id: string;
  section_name: string;
  class_id: string;
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
};

export type TAcademicSection = {
  id: string;
  section_name: string;
  class_id: string;
  created_at: string;
  updated_at: string;
  academicClass: TAcademicClass | null;
};