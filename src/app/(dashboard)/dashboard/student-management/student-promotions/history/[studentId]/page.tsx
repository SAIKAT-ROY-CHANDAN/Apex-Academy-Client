import { History } from "lucide-react";
import type { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";
import { PageHeader } from "@/components/shared/page-header";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getAcademicSessions } from "@/services/academicSession";
import { getBatchDetails } from "@/services/batch";
import { getShifts } from "@/services/shift";
import { getStudentEnrollments } from "@/services/studentEnrollment";
import EnrollmentHistoryTable from "./_components/EnrollmentHistoryTable";
import type { THistoryEnrollment } from "./_components/types";

const PromotionHistoryPage = async (props: {
  params: Promise<{ studentId: string }>;
}) => {
  const { studentId } = await props.params;

  const [enrollmentsRes, sessionsRes, classesRes, batchesRes, shiftsRes] =
    await Promise.all([
      getStudentEnrollments([
        { label: "limit", value: "100" },
        { label: "filter", value: JSON.stringify({ student_id: studentId }) },
      ]),
      getAcademicSessions([]),
      getAcademicClassDetails([]),
      getBatchDetails([]),
      getShifts([]),
    ]);

  // Oldest first so the table reads as a promotion timeline.
  const enrollments = (
    (enrollmentsRes?.data ?? []) as THistoryEnrollment[]
  ).sort(
    (a, b) =>
      new Date(a.created_at ?? 0).getTime() -
      new Date(b.created_at ?? 0).getTime(),
  );

  const sessions = sessionsRes?.data ?? [];
  const classes = (classesRes?.data ?? []) as TAcademicClass[];
  const batches = batchesRes?.data ?? [];
  const shifts = shiftsRes?.data ?? [];

  const student = enrollments[0]?.student;
  const current = enrollments.find((e) => e.is_primary);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          student ? `Promotion History — ${student.name}` : "Promotion History"
        }
        backHref="/dashboard/student-management/student-promotions"
      />

      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-white py-16 text-center shadow-sm">
          <History className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-slate-900">
            No enrollments found
          </p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            This student has no enrollment records, or the link is invalid. Go
            back and pick a student from the promotions list.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg border border-border/50 bg-white px-4 py-3 text-xs shadow-sm">
            <span className="font-medium text-slate-900">
              {student?.name ?? "—"}
            </span>
            <span className="text-muted-foreground">
              {student?.student_phone || student?.email || "—"}
            </span>
            <span className="text-muted-foreground">
              Current: {current?.academicClass?.class_name ?? "—"}
              {current?.academicSession?.session_name
                ? ` · ${current.academicSession.session_name}`
                : ""}
            </span>
            <span className="text-muted-foreground">
              {enrollments.length} record{enrollments.length === 1 ? "" : "s"}
            </span>
          </div>

          <EnrollmentHistoryTable
            enrollments={enrollments}
            lookups={{ sessions, classes, batches, shifts }}
          />
        </>
      )}
    </div>
  );
};

export default PromotionHistoryPage;
