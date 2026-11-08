import { getAcademicClassDetails } from "@/services/academicClass";
import { getAcademicSections } from "@/services/academicSection";
import { getBatchDetails } from "@/services/batch";
import { getDepartments } from "@/services/department";
import DueFeePageClient from "./_components/DueFeePageClient";

const DueFeePage = async () => {
  const [classRes, departmentRes, batchRes, sectionRes] = await Promise.all([
    getAcademicClassDetails(),
    getDepartments([]),
    getBatchDetails(),
    getAcademicSections(),
  ]);

  return (
    <DueFeePageClient
      academicClasses={classRes?.data ?? []}
      departments={departmentRes?.data ?? []}
      batches={batchRes?.data ?? []}
      academicSections={sectionRes?.data ?? []}
    />
  );
};

export default DueFeePage;
