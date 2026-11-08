import { z } from 'zod';

export const examScheduleSchema = z.object({
  examConfigId: z.string().min(1, 'Exam is required'),
  program_id: z.string().min(1, 'Program is required'),
  department_id: z.string().min(1, 'Department is required'),
  year: z.number().min(1, 'Year is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  examTakenYear: z.number().min(2000, 'Exam taken year is required'), // NEW
  examDate: z.string().min(1, 'Exam date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  durationMinutes: z.number().min(1, 'Duration must be at least 1 minute'),
  fullMarks: z.number().min(0, 'Full marks must be 0 or greater'),
  passMarks: z.number().min(0, 'Pass marks must be 0 or greater'),
}).refine((data) => data.passMarks <= data.fullMarks, {
  message: 'Pass marks cannot be greater than full marks',
  path: ['passMarks'],
});

export type ExamScheduleFormInput = z.infer<typeof examScheduleSchema>;
export type ExamScheduleFormValues = z.infer<typeof examScheduleSchema>;

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
  examDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  fullMarks: number;
  passMarks: number;
  created_at: string;
  updated_at: string;
};