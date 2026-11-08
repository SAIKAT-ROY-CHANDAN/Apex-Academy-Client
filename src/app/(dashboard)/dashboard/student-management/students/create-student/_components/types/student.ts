export interface Student {
  id: string;
  name: string;
  email: string | null;
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
}

export interface StudentFeeCollection {
  id: string;
  student_id: string;
}

export interface HostelAllocation {
  id: string;
  student_id: string;
}

export interface HostelFeeCollection {
  id: string;
  student_id: string;
}

export interface CreateStudentResponse {
  student: Student;
  enrollment: StudentEnrollment | null;
  studentFeeCollection: StudentFeeCollection | null;
  hostelAllocation: HostelAllocation | null;
  hostelFeeCollection: HostelFeeCollection | null;
}

// Minimal shapes for select dropdowns — adjust fields to match your actual models
export interface Batch {
  id: string;
  batch_name: string;
}

export interface Shift {
  id: string;
  name: string;
}

export interface HostelRoom {
  id: string;
  room_number: string;
}
