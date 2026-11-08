import { PageHeader } from "@/components/shared/page-header";
import type { TProgram } from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import type { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getClassTakenReport } from "@/services/studentAttendance";
import { getInstitutionDetails } from "@/services/institution";
import { getPrograms } from "@/services/program";
import { getTeachers } from "@/services/teacher";
import ClassTakenReportFilter from "./_components/ClassTakenReportFilter";
import ClassTakenReportTable from "./_components/ClassTakenReportTable";

const ClassTakenReportPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;

  const currentTeacherId =
    typeof searchParams.teacher_id === "string" ? searchParams.teacher_id : "";
  const currentClassId =
    typeof searchParams.academic_class_id === "string"
      ? searchParams.academic_class_id
      : "";
  const currentProgramId =
    typeof searchParams.program_id === "string" ? searchParams.program_id : "";
  const currentDepartmentId =
    typeof searchParams.department_id === "string"
      ? searchParams.department_id
      : "";
  const currentSubjectId =
    typeof searchParams.subject_id === "string" ? searchParams.subject_id : "";
  const currentAdminPosition =
    typeof searchParams.administrative_position === "string"
      ? searchParams.administrative_position
      : "";
  const currentStartDate =
    typeof searchParams.start_date === "string" ? searchParams.start_date : "";
  const currentEndDate =
    typeof searchParams.end_date === "string" ? searchParams.end_date : "";

  const query: { label: string; value: string }[] = [];
  if (currentTeacherId)
    query.push({ label: "teacher_id", value: currentTeacherId });
  if (currentClassId)
    query.push({ label: "academic_class_id", value: currentClassId });
  if (currentProgramId)
    query.push({ label: "program_id", value: currentProgramId });
  if (currentDepartmentId)
    query.push({ label: "department_id", value: currentDepartmentId });
  if (currentSubjectId)
    query.push({ label: "subject_id", value: currentSubjectId });
  if (currentAdminPosition)
    query.push({
      label: "administrative_position",
      value: currentAdminPosition,
    });
  if (currentStartDate)
    query.push({ label: "start_date", value: currentStartDate });
  if (currentEndDate) query.push({ label: "end_date", value: currentEndDate });

  const [reportRes, teachersRes, classesRes, programsRes, institutionRes] =
    await Promise.all([
      getClassTakenReport(query),
      getTeachers([{ label: "limit", value: "200" }]),
      getAcademicClassDetails([{ label: "limit", value: "200" }]),
      getPrograms([]),
      getInstitutionDetails(),
    ]);

  const teachers = (teachersRes?.data ?? []).map(
    (t: { id: string; full_name: string }) => ({
      id: t.id,
      name: t.full_name,
    }),
  );
  const classes = (classesRes?.data ?? []) as TAcademicClass[];
  const programs = (programsRes?.data ?? []) as TProgram[];
  const mode = institutionRes?.data?.mode || "SCHOOL";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Class Taken Report"
        backHref="/dashboard/employees"
      />

      <ClassTakenReportFilter
        mode={mode}
        teachers={teachers}
        classes={classes}
        programs={programs}
        currentTeacherId={currentTeacherId}
        currentClassId={currentClassId}
        currentProgramId={currentProgramId}
        currentDepartmentId={currentDepartmentId}
        currentSubjectId={currentSubjectId}
        currentAdminPosition={currentAdminPosition}
        currentStartDate={currentStartDate}
        currentEndDate={currentEndDate}
      />

      <ClassTakenReportTable
        data={reportRes?.data ?? []}
        totalRecords={reportRes?.meta?.totalRecords ?? 0}
      />
    </div>
  );
};

export default ClassTakenReportPage;
