import {
  getAcademicClassDetails,
} from "@/services/academicClass";
import { getAcademicSections } from "@/services/academicSection";
import { getBatchDetails } from "@/services/batch";
import { getClassRoutineDetails } from "@/services/classRoutine";
import { getDepartments } from "@/services/department";
import { getPrograms } from "@/services/program";
import { getShifts } from "@/services/shift";
import { getSubjectDetails } from "@/services/subject";
import { getTeachers } from "@/services/teacher";
import ClassRoutineCreateClient from "../_components/ClassRoutineCreateClient";

const ClassRoutineCreatePage = async () => {
  const [routineRes, classRes, sectionRes, batchRes, shiftRes, subjectRes, teacherRes, departmentRes, programRes] = await Promise.all([
    getClassRoutineDetails(),
    getAcademicClassDetails([{ label: "limit", value: "100" }]),
    getAcademicSections([{ label: "limit", value: "100" }]),
    getBatchDetails([{ label: "limit", value: "100" }]),
    getShifts([{ label: "limit", value: "100" }]),
    getSubjectDetails([{ label: "limit", value: "100" }]),
    getTeachers([{ label: "limit", value: "100" }]),
    getDepartments([{ label: "limit", value: "100" }]),
    getPrograms([{ label: "limit", value: "100" }]),
  ]);

  return (
    <ClassRoutineCreateClient
      routines={routineRes?.data ?? []}
      academicClasses={classRes?.data ?? []}
      academicSections={sectionRes?.data ?? []}
      batches={batchRes?.data ?? []}
      shifts={shiftRes?.data ?? []}
      subjects={subjectRes?.data ?? []}
      teachers={teacherRes?.data ?? []}
      departments={departmentRes?.data ?? []}
      programs={programRes?.data ?? []}
    />
  );
};

export default ClassRoutineCreatePage;
