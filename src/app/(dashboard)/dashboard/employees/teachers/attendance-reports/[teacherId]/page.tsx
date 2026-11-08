import { PageHeader } from "@/components/shared/page-header";
import { notFound } from "next/navigation";
import { getTeacherAttendanceHistory } from "@/services/teacherAttendance";
import TeacherAttendanceHistory, {
  type TeacherAttendanceHistoryData,
} from "../_components/TeacherAttendanceHistory";

const TeacherAttendanceDetailsPage = async (props: {
  params: Promise<{ teacherId: string }>;
}) => {
  const { teacherId } = await props.params;
  const res = await getTeacherAttendanceHistory(teacherId);

  if (!res?.success || !res?.data) {
    notFound();
  }

  const history = res.data as TeacherAttendanceHistoryData;

  return (
    <div className="space-y-6">
      <PageHeader
        title={history.teacher.full_name}
        backHref="/dashboard/employees/teachers/attendance-reports"
      />

      <TeacherAttendanceHistory history={history} />
    </div>
  );
};

export default TeacherAttendanceDetailsPage;
