import { PageHeader } from "@/components/shared/page-header";
import { getTeacherById } from "@/services/teacher";
import { notFound } from "next/navigation";
import TeacherProfileView from "./_components/TeacherProfileView";

const TeacherViewPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;
  const res = await getTeacherById(id);

  if (!res?.success || !res?.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={res.data.full_name}
        backHref="/dashboard/employees/teachers"
      />
      <TeacherProfileView teacher={res.data} />
    </div>
  );
};

export default TeacherViewPage;