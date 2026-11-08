import { PageHeader } from "@/components/shared/page-header";
import { getTeacherById } from "@/services/teacher";
import { getInstitutionDetails } from "@/services/institution";
import { getShifts } from "@/services/shift";
import { getPrograms } from "@/services/program";
import { getDesignations } from "@/services/designation";
import { notFound } from "next/navigation";
import EditTeacherForm from "./_components/EditTeacherForm";

const EditTeacherPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;

  const [teacherRes, institutionDetails, shiftsRes, programsRes, designationsRes] =
    await Promise.all([
      getTeacherById(id),
      getInstitutionDetails(),
      getShifts([]),
      getPrograms([]),
      getDesignations([]),
    ]);

  if (!teacherRes?.success || !teacherRes?.data) {
    notFound();
  }

  const mode = institutionDetails?.data?.mode || "SCHOOL";

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Edit: ${teacherRes.data.full_name}`}
        backHref="/dashboard/employees/teachers"
      />
      <EditTeacherForm
        teacher={teacherRes.data}
        mode={mode}
        shifts={shiftsRes?.data || []}
        programs={programsRes?.data || []}
        designations={designationsRes?.data || []}
      />
    </div>
  );
};

export default EditTeacherPage;