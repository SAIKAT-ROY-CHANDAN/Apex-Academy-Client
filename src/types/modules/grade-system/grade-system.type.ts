export type TGradeSystem = {
  id: string;
  grade_name: string;
  grade_point: number;
  mark_from: number;
  mark_to: number;
  remark?: string;
  created_at: string;
  updated_at: string;
};

export type TGradeSystemFormValues = {
  grade_name: string;
  grade_point: number;
  mark_from: number;
  mark_to: number;
  remark?: string;
};