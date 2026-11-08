import { PageHeader } from "@/components/shared/page-header";
import JobCircularForm from "../_components/JobCircularForm";

export default function CreateJobCircularPage() {
  return (
    <div className="space-y-2">
      <PageHeader
        title="Post A Job"
        backHref="/dashboard/website/job-circular"
      />
      <JobCircularForm />
    </div>
  );
}
