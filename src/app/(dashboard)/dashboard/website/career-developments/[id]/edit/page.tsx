import { getCareerDevelopmentsById } from "@/services/careerDevelopments";
import { PageHeader } from "@/components/shared/page-header";
import CareerDevelopmentsForm from "../../_components/CareerDevelopmentsForm";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

const EditCareerDevelopmentsPage = async (props: EditPageProps) => {
  const params = await props.params;
  const response = await getCareerDevelopmentsById(params.id);

  return (
    <div className="space-y-4 w-full p-4">
      <PageHeader
        title="Edit Career Development"
        backHref="/dashboard/website/career-developments"
      />
      <CareerDevelopmentsForm initialData={response?.data ?? null} />
    </div>
  );
};

export default EditCareerDevelopmentsPage;