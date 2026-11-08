import { getStudentsByClassIdAndSectionId } from "@/services/student";
import { checkStudentAttendanceToday } from "@/services/studentAttendance";
import AttendanceTable from "./AttendanceTable";

type TakeAttendanceProps = {
  selectedClassId: string;
  selectedSectionId?: string;
  teacherId: string;
  group?: string;
  subjectId?: string;
};

const TakeAttendance = async ({
  selectedClassId,
  selectedSectionId,
  teacherId,
  group,
  subjectId,
}: TakeAttendanceProps) => {
  const [response, todayStatusResponse] = await Promise.all([
    getStudentsByClassIdAndSectionId(selectedClassId, selectedSectionId),
    checkStudentAttendanceToday([
      { label: "teacher_id", value: teacherId },
      { label: "academic_class_id", value: selectedClassId },
      ...(subjectId ? [{ label: "subject_id", value: subjectId }] : []),
      ...(group ? [{ label: "group", value: group }] : []),
    ]),
  ]);

  const students = response?.data ?? [];
  const attendanceTakenToday = todayStatusResponse?.data?.exists ?? false;

  return (
    <AttendanceTable
      students={students}
      teacherId={teacherId}
      selectedClassId={selectedClassId}
      group={group}
      subjectId={subjectId}
      attendanceTakenToday={attendanceTakenToday}
    />
  );
};

export default TakeAttendance;
