export type TExamSchedule = {
  id: string;
  examConfigId: string;
  examConfig?: {
    id: string;
    exam_name: string;
    exam_date: string;
    academicClass?: {
      id: string;
      class_name: string;
      class_level?: number;
      year_level?: number;
    };
    group?: 'SCIENCE' | 'COMMERCE' | 'HUMANITIES' | null;
    batch?: {
      id: string;
      batch_name: string;
    };
  };

  // TOP-LEVEL relations on examSchedule — matches backend
  // `include: { program: true, department: true }`
  program_id?: string | null;
  program?: {
    id: string;
    program_name: string;
  } | null;

  department_id?: string | null;
  department?: {
    id: string;
    department_name: string;
  } | null;

  year?: number | null;

  subjectId: string;
  subject?: {
    id: string;
    name: string;
    subject_code?: string;
  };
  examTakenYear: number; // NEW
  examDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  fullMarks: number;
  passMarks: number;
  created_at: string;
  updated_at: string;
};