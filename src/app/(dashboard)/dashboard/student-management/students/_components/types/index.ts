export type AcademicClassRelation = {
  id?: string;
  class_name?: string | null;
  name?: string | null;
  department?: { department_name?: string | null; name?: string | null } | null;
  program?: { program_name?: string | null; name?: string | null } | null;
};

export type StudentEnrollment = {
  is_primary?: boolean;
  registration_number?: string | null;
  roll_number?: string | null;
  program_name?: string | null;
  department_name?: string | null;
  academic_class_name?: string | null;
  program?: { program_name?: string | null; name?: string | null } | null;
  department?: { department_name?: string | null; name?: string | null } | null;
  academicClass?: AcademicClassRelation | null;
  academic_class?: AcademicClassRelation | null;
};

export type TStudent = {
  id: string;
  name: string;
  father_name: string;
  mother_name: string;
  religion: string;
  is_residential: boolean;
  nid_no: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  student_phone: string;
  father_phone: string;
  mother_phone: string;
  photo: string | null;
  village_road: string;
  post_office: string;
  sub_district: string;
  district: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  studentEnrollments: StudentEnrollment[];
};
