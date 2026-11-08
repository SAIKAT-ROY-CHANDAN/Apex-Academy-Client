import { PageHeader } from "@/components/shared/page-header";
import SyllabusForm from "../_components/SyllabusForm";

export default function CreateSyllabusPage() {
  return (
    <div className="space-y-2">
      <PageHeader title="Add Syllabus" backHref="/dashboard/website/syllabus" />
      <SyllabusForm />
    </div>
  );
}
