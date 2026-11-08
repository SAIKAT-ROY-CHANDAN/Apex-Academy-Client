export const ADMINISTRATIVE_POSITIONS = [
  { id: "PRINCIPAL", name: "Principal" },
  { id: "VICE_PRINCIPAL", name: "Vice Principal" },
  { id: "HEAD_OF_DEPARTMENT", name: "Head of Department" },
  { id: "ASSISTANT_HEAD_OF_DEPARTMENT", name: "Assistant Head of Department" },
  { id: "DEAN", name: "Dean" },
  { id: "ASSISTANT_DEAN", name: "Assistant Dean" },
  { id: "COORDINATOR", name: "Coordinator" },
  { id: "DIRECTOR", name: "Director" },
  { id: "NONE", name: "None" },
] as const;

export type AdministrativePosition =
  (typeof ADMINISTRATIVE_POSITIONS)[number]["id"];

export const ADMINISTRATIVE_POSITION_LABELS: Record<string, string> = {
  PRINCIPAL: "Principal",
  VICE_PRINCIPAL: "Vice Principal",
  HEAD_OF_DEPARTMENT: "Head of Department",
  ASSISTANT_HEAD_OF_DEPARTMENT: "Assistant Head of Department",
  DEAN: "Dean",
  ASSISTANT_DEAN: "Assistant Dean",
  COORDINATOR: "Coordinator",
  DIRECTOR: "Director",
  NONE: "None",
};

export {
  TEACHER_TYPES,
  TEACHER_TYPE_LABELS,
  TEACHER_TYPE_COLORS,
  formatTeacherType,
} from "@/constant/teacher/teacherType";
