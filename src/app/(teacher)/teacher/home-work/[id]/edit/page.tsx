import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import PageRoute from "../../../components/dynamicRoute";
import { loggedInTeacherUser } from "@/services/logged-user";
import { getHomeworkById } from "@/services/homework";
import { getInstitutionDetails } from "@/services/institution";
import { notFound } from "next/navigation";
import EditHomeworkForm from "../../_components/EditHomeworkForm";

const EditHomework = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;
  const teacher = await loggedInTeacherUser();
  const institutionDetails = await getInstitutionDetails();
  const mode = institutionDetails?.data?.mode || "SCHOOL";
  const response = await getHomeworkById(id);

  if (!response?.success || !response?.data) {
    notFound();
  }

  const homework = response.data;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageRoute
          title="Edit Homework"
          breadcrumbs={[
            { label: "Overview", href: "/teacher" },
            { label: "Homework", href: "/teacher/home-work" },
            { label: "Edit Homework" },
          ]}
        />
        <Link
          href="/teacher/home-work"
          className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-100"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <EditHomeworkForm
        homework={homework}
        teacherId={teacher.id}
        mode={mode}
      />
      </div>
    </div>
  );
};

export default EditHomework;