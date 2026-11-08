export interface TIdCardStudent {
  id: string;
  name: string;
  father_name?: string | null;
  mother_name?: string | null;
  gender?: string | null;
  religion?: string | null;
  email?: string | null;
  student_phone?: string | null;
  father_phone?: string | null;
  photo?: string | null;
  sub_district?: string | null;
  district?: string | null;
}

export interface TIdCardEnrollment {
  id: string;
  student_id: string;
  roll_number?: string | null;
  registration_number?: string | null;
  merit_position?: number | null;
  student: TIdCardStudent;
  academicSession?: { id: string; session_name: string } | null;
  academicClass?: {
    id: string;
    class_name: string;
    class_level?: number | null;
    year_level?: number | null;
  } | null;
  academicSection?: { id: string; section_name: string } | null;
  batch?: { id: string; batch_name: string } | null;
  shift?: { id: string; name: string } | null;
}

export interface TInstitutionInfo {
  mode?: string | null;
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logo?: string | null;
}
