import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import PageRoute from "../../components/dynamicRoute";
import ApplyResignationForm from "../_components/ApplyResignationForm";
import { loggedInTeacherUser } from "@/services/logged-user";

const ApplyResignation = async () => {
  const teacher = await loggedInTeacherUser();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageRoute
          title="Apply for Resignation"
          breadcrumbs={[
            { label: "Overview", href: "/teacher" },
            { label: "Resignation Request", href: "/teacher/resignation-request" },
            { label: "Apply" },
          ]}
        />
        <Link
          href="/teacher/resignation-request"
          className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-100"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <ApplyResignationForm teacher_id={teacher.id} />
      </div>
    </div>
  );
};

export default ApplyResignation;
