export interface FeeType {
  id: string;
  name: string;
  academicClass: AcademicClass | null;
}

export type TFeeType = {
  id: string;
  name: string;
  academicClass: AcademicClass | null;
  created_at: string;
  updated_at: string;
};

export interface AcademicClass {
  id: string;
  class_name: string;
  class_level: number | null;
  year_level: number | null;
  department: Department | null;
}

export interface Department {
  id: string;
  department_name: string;
  program: Program | null;
}

export interface Program {
  id: string;
  program_name: string;
}
