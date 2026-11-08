import { PageHeader } from "@/components/shared/page-header";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getFeeManage } from "@/services/feeType";
import { getInstitutionDetails } from "@/services/institution";
import StudentFeeCollectionTable from "./_components/StudentFeeCollectionTable";

const FeeCollection = async () => {
  const [feeManage, classesRes, institutionRes] = await Promise.all([
    getFeeManage(),
    getAcademicClassDetails([]),
    getInstitutionDetails(),
  ]);

  return (
    <div>
      <PageHeader
        title="Students Fee Collection"
        backHref="/dashboard/student-management"
      />
      <StudentFeeCollectionTable
        students={feeManage?.data ?? []}
        meta={feeManage?.meta}
        mode={institutionRes?.data?.mode || "SCHOOL"}
        classes={classesRes?.data ?? []}
      />
    </div>
  );
};

export default FeeCollection;
