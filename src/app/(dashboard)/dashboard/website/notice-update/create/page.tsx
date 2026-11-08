import { PageHeader } from "@/components/shared/page-header";
import NoticeForm from "../_components/NoticeForm";

export default function CreateNoticePage() {
  return (
    <div className="space-y-2">
      <PageHeader
        title="Add Notice"
        backHref="/dashboard/website/notice-update"
      />
      <NoticeForm />
    </div>
  );
}
