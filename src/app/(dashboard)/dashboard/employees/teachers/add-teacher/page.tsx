import { PageHeader } from "@/components/shared/page-header";
import AddTeacherForm from "./_components/AddTeacherForm";
import { getInstitutionDetails } from "@/services/institution";
import { getShifts } from "@/services/shift";
import { getPrograms } from "@/services/program";
import { getDesignations } from "@/services/designation";

const AddTeacher = async () => {
  const institutionDetails = await getInstitutionDetails();
  const mode = institutionDetails?.data?.mode || "SCHOOL";
  const shifts = await getShifts([]);
  const programs = await getPrograms([]);
  const designations = await getDesignations([]);
  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Teacher"
        backHref="/dashboard/employees/teachers"
      />
      <AddTeacherForm
        mode={mode}
        shifts={shifts?.data || []}
        programs={programs?.data || []}
        designations={designations?.data || []}
      />
    </div>
  );
};

export default AddTeacher;
