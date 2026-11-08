import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import {
  getClassRoutineByStudentId,
  getMyEnrollments,
} from "@/services/classRoutine";
import { loggedInStudentUser } from "@/services/logged-user";
import StudentClassRoutineClient from "./_components/StudentClassRoutineClient";

// Per-user data: always render fresh so a promotion picked up on the admin side
// reflects immediately (never a stale Router Cache / revalidated payload).
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Enrollment = {
  academic_class_id: string;
  class_name?: string;
  is_primary?: boolean;
};

const StudentClassRoutinePage = async () => {
  const user = await loggedInStudentUser();
  if (!user?.id) redirect("/student-login");

  const [response, enrollmentsResponse] = await Promise.all([
    getClassRoutineByStudentId(),
    getMyEnrollments(),
  ]);

  const data = response?.data ?? [];
  const routines = Array.isArray(data) ? data : [data];
  // Backend resolves the student's live (primary) enrollment and reports its
  // class label so the empty state can say "No routine published yet for 2nd Year".
  const currentClass =
    typeof response?.meta?.currentClass === "string"
      ? response.meta.currentClass
      : null;

  const enrollments: Enrollment[] = Array.isArray(enrollmentsResponse?.data)
    ? enrollmentsResponse.data
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Class Routine" />
      <StudentClassRoutineClient
        routines={routines}
        currentClass={currentClass}
        enrollments={enrollments}
      />
    </div>
  );
};

export default StudentClassRoutinePage;
