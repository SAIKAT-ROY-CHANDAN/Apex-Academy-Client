export interface Program {
  id: string;
  program_name: string;
}

export interface Department {
  id: string;
  department_name: string;
}

// Replace with your actual Prisma StudentGroup enum values
export type StudentGroup = 'SCIENCE' | 'COMMERCE' | 'HUMANITIES';

export interface AcademicClass {
  id: string;
  program_id: string | null;
  department_id: string | null;
  class_name: string;
  class_level: number | null;
  year_level: number | null;
  group: StudentGroup | null;
}
export type TProgram = {
  id: string;
  program_name: string;
} | null;
 
export type TDepartment = {
  id: string;
  department_name: string;
} | null;
 
export type TClass = {
  id: string;
  program_id: string | null;
  department_id: string | null;
  class_name: string;
  class_level: number;
  year_level: number | null;
  group: string | null;
  created_at: string;
  updated_at: string;
  program: TProgram;
  department: TDepartment;
  
};