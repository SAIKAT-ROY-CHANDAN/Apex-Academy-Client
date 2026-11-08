import type { TStudentFilterValues } from "./student-filters";
import type { TStudent } from "./types";

export const getPrimaryEnrollment = (student: TStudent) =>
  student.studentEnrollments?.find((item) => item.is_primary) ??
  student.studentEnrollments?.[0];

export const getEnrollmentValue = (
  student: TStudent,
  field: "program" | "department" | "class",
) => {
  const enrollment = getPrimaryEnrollment(student);

  if (!enrollment) return "N/A";

  if (field === "program") {
    return (
      enrollment.academicClass?.program?.program_name ??
      enrollment.academicClass?.program?.name ??
      enrollment.program_name ??
      enrollment.program?.program_name ??
      enrollment.program?.name ??
      "N/A"
    );
  }

  if (field === "department") {
    return (
      enrollment.academicClass?.department?.department_name ??
      enrollment.academicClass?.department?.name ??
      enrollment.department_name ??
      enrollment.department?.department_name ??
      enrollment.department?.name ??
      "N/A"
    );
  }

  return (
    enrollment.academicClass?.class_name ??
    enrollment.academicClass?.name ??
    enrollment.academic_class_name ??
    enrollment.academic_class?.class_name ??
    enrollment.academic_class?.name ??
    "N/A"
  );
};

const csvEscape = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export type StudentExportRow = Record<string, string>;

/** Flatten a student into the downloadable list columns. */
export const toStudentExportRow = (student: TStudent): StudentExportRow => {
  const enrollment = getPrimaryEnrollment(student);
  const address = [
    student.village_road,
    student.post_office,
    student.sub_district,
    student.district,
  ]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(", ");
  const guardianPhone =
    [student.father_phone, student.mother_phone]
      .map((part) => (part ?? "").trim())
      .filter(Boolean)
      .join(" / ") || "N/A";

  return {
    Name: student.name ?? "",
    Department: getEnrollmentValue(student, "department"),
    Year: getEnrollmentValue(student, "class"),
    Program: getEnrollmentValue(student, "program"),
    "Father's Name": student.father_name ?? "",
    "Mother's Name": student.mother_name ?? "",
    "Registration Number": enrollment?.registration_number ?? "",
    "Class Roll": enrollment?.roll_number ?? "",
    "Mobile Number": student.student_phone ?? "",
    "Email Address": student.email ?? "",
    "Guardian's Phone Number": guardianPhone,
    Gender: student.gender ?? "",
    Address: address,
    Status: student.is_active ? "Active" : "Inactive",
  };
};

const STUDENT_EXPORT_HEADERS = [
  "Name",
  "Department",
  "Year",
  "Program",
  "Father's Name",
  "Mother's Name",
  "Registration Number",
  "Class Roll",
  "Mobile Number",
  "Email Address",
  "Guardian's Phone Number",
  "Gender",
  "Address",
  "Status",
];

/** Build an Excel-friendly CSV (UTF-8 BOM keeps Bangla names intact). */
export const buildStudentsCsv = (students: TStudent[]) => {
  const lines = [STUDENT_EXPORT_HEADERS.map(csvEscape).join(",")];
  for (const student of students) {
    const row = toStudentExportRow(student);
    lines.push(STUDENT_EXPORT_HEADERS.map((h) => csvEscape(row[h])).join(","));
  }
  return `﻿${lines.join("\r\n")}\r\n`;
};

export const downloadStudentsCsv = (
  students: TStudent[],
  filters: TStudentFilterValues,
  meta?: { departmentName?: string; className?: string },
) => {
  if (students.length === 0) return 0;
  const csv = buildStudentsCsv(students);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const slug = (value?: string) =>
    (value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
  const parts = ["students", slug(meta?.departmentName), slug(meta?.className)]
    .filter(Boolean)
    .join("_");
  const date = new Date().toISOString().slice(0, 10);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${parts || "students"}_${filters.academic_class_id ? "year" : "list"}_${date}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return students.length;
};
