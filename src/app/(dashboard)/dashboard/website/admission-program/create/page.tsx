import { PageHeader } from "@/components/shared/page-header";
import AdmissionProgramForm from "../_components/AdmissionProgramForm";
import { Card } from "@/components/ui/card";

const CreateAdmissionProgramPage = () => {
  return (
    <Card className="space-y-4 w-full p-4">
      <PageHeader
        title="Create Admission Program"
        backHref="/dashboard/website/admission-program"
      />
      <AdmissionProgramForm />
    </Card>
  );
};

export default CreateAdmissionProgramPage;