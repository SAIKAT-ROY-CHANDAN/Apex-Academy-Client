import { TAcademicClass } from "../../../subject-config/_components/types";

export interface Department {
  id: string;
  institution_id: string;
  department_name: string;
  program_id: string;
}
export type TInstitution = {
  id: string;
  mode: string;
  address: string;
  phone: string;
  email: string;
  name: string;
  is_setup_completed: boolean;
  weekend_days: string;
  logo: string | null;
  login_background: string | null;
  color_scheme: string;
  active_modules: string;
  created_at: string;
  updated_at: string;
};

export type TProgram = {
  id: string;
  institution_id: string;
  program_name: string;
  duration_years: number;
  created_at: string;
  updated_at: string;
  departments?: TDepartment[];
};

export type TDepartment = {
  id: string;
  institution_id: string;
  department_name: string;
  program_id: string | null;
  created_at: string;
  updated_at: string;
  institution: TInstitution | null;
  program: TProgram | null;
  academicClasses?: TAcademicClass[]
};