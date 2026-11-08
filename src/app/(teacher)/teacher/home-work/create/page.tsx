import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import PageRoute from "../../components/dynamicRoute";
import { loggedInTeacherUser } from "@/services/logged-user";
import CreateHomeworkForm from "../_components/CreateHomeworkForm";
import { getPrograms } from "@/services/program";
import { getInstitutionDetails } from "@/services/institution";
import { getAcademicClassDetails } from "@/services/academicClass";

const CreateHomework = async () => {
  const teacher = await loggedInTeacherUser();
  const institutionDetails = await getInstitutionDetails();
  const mode = institutionDetails?.data?.mode || "SCHOOL";
  const programs = await getPrograms([]);
  const classes = await getAcademicClassDetails([]);
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageRoute
          title="Create Homework"
          breadcrumbs={[
            { label: "Overview", href: "/teacher" },
            { label: "Homework", href: "/teacher/home-work" },
            { label: "Create Homework" },
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

      <CreateHomeworkForm
        teacherId={teacher.id}
        mode={mode}
        programs={programs?.data || []}
        classes={classes?.data || []}
      />
      </div>
    </div>
  );
};

export default CreateHomework;
