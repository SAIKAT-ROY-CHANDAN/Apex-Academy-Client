import { getAdmissionProgramById } from "@/services/admissionProgram";
import { PageHeader } from "@/components/shared/page-header";
import AdmissionProgramForm from "../../_components/AdmissionProgramForm";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

const EditAdmissionProgramPage = async (props: EditPageProps) => {
  const params = await props.params;
  const response = await getAdmissionProgramById(params.id);

  console.log('Edit page response:', response);
  console.log('Edit page response.data:', response?.data);

  if (!response?.success || !response?.data) {
    console.error('Failed to fetch admission program:', response?.message);
  }

  return (
    <div className="space-y-4 w-full p-4">
      <PageHeader
        title="Edit Admission Program"
        backHref="/dashboard/website/admission-program"
      />
      {(!response?.success || !response?.data) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4 text-red-700">
          Failed to load admission program: {response?.message || 'Unknown error'}
        </div>
      )}
      <AdmissionProgramForm initialData={response?.data ?? null} />
    </div>
  );
};

export default EditAdmissionProgramPage;