import { PageHeader } from "@/components/shared/page-header";
import CareerDevelopmentsForm from "../_components/CareerDevelopmentsForm";
import { Card } from "@/components/ui/card";

const CreateCareerDevelopmentsPage = () => {
  return (
    <Card className="space-y-4 w-full p-4">
      <PageHeader
        title="Create Career Development"
        backHref="/dashboard/website/career-developments"
      />
      <CareerDevelopmentsForm />
    </Card>
  );
};

export default CreateCareerDevelopmentsPage;