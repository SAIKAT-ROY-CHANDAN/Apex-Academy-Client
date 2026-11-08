import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getInstitutionDetails } from "@/services/institution";
import { loggedInTeacherUser } from "@/services/logged-user";
import { getPrograms } from "@/services/program";
import PageRoute from "../../components/dynamicRoute";
import TakeAttendance from "./_components/TakeAttendance";
import TakeAttendanceFilters from "./_components/TakeAttendanceFilters";

const TakeAttendanceStudents = async ({
  searchParams,
}: {
  searchParams: Promise<{
    class_id?: string;
    section_id?: string;
    group?: string;
    subject_id?: string;
  }>;
}) => {
  const loggedInTeacher = await loggedInTeacherUser();
  const institutionDetails = await getInstitutionDetails();
  const mode = institutionDetails?.data?.mode || "SCHOOL";
  const programs = await getPrograms([]);
  const classes = await getAcademicClassDetails([]);
  const { class_id, section_id, group, subject_id } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageRoute
          title="Take Attendance"
          breadcrumbs={[
            { label: "Overview", href: "/teacher" },
            { label: "Attendance", href: "/teacher/attendance" },
            { label: "Take Attendance" },
          ]}
        />
        <Link
          href="/teacher/attendance"
          className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-100"
        >
          <FaArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>
      </div>
      <TakeAttendanceFilters
        mode={mode}
        programs={programs?.data || []}
        classes={classes?.data || []}
      />
      {class_id ? (
        <TakeAttendance
          selectedClassId={class_id}
          selectedSectionId={section_id}
          teacherId={loggedInTeacher?.id}
          group={group}
          subjectId={subject_id}
        />
      ) : (
        <div className="rounded-lg border border-border/50 bg-white p-8 text-center text-sm text-muted-foreground shadow-sm">
          Please select a class to take attendance
        </div>
      )}
      </div>
    </div>
  );
};

export default TakeAttendanceStudents;
