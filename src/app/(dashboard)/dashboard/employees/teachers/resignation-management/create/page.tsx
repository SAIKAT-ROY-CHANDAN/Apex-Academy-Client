import { PageHeader } from "@/components/shared/page-header";
import { getDesignations } from "@/services/designation";
import { getShifts } from "@/services/shift";
import { getTeachers } from "@/services/teacher";
import AddResignationForm from "./_components/AddResignationForm";

type TeacherOption = {
  id: string;
  full_name: string;
  designation_id?: string;
  designation: string;
  shift: string;
};

const CreateResignation = async () => {
  const [teachersRes, designationsRes, shiftsRes] = await Promise.all([
    getTeachers([{ label: "limit", value: "200" }]),
    getDesignations([{ label: "limit", value: "100" }]),
    getShifts([{ label: "limit", value: "100" }]),
  ]);

  const teachers: TeacherOption[] = (teachersRes?.data ?? []).map(
    (t: any) => ({
      id: t.id,
      full_name: t.full_name,
      designation_id: t.designation_id,
      designation: t.designation?.name ?? "N/A",
      shift: t.shift?.name ?? "N/A",
    }),
  );
  const designations = (designationsRes?.data ?? []).map(
    (d: { id: string; name: string }) => ({ id: d.id, name: d.name }),
  );
  const shifts = (shiftsRes?.data ?? []).map(
    (s: { id: string; name: string }) => ({ id: s.id, name: s.name }),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Resignation"
        backHref="/dashboard/employees/teachers/resignation-management"
      />
      <AddResignationForm
        teachers={teachers}
        designations={designations}
        shifts={shifts}
      />
    </div>
  );
};

export default CreateResignation;
