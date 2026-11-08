export interface AcademicSession {
  id: string;
  institution_id: string;
  session_name: string;
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

export type TAcademicSession = {
  id: string;
  institution_id: string;
  session_name: string;
  created_at: string;
  updated_at: string;
  institution: TInstitution | null;
};