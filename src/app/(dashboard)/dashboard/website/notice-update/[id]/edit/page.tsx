import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getAcademicNoticeById } from "@/services/academicNotice";
import NoticeForm from "../../_components/NoticeForm";

export default async function EditNoticePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let initialData = null;

  try {
    const response = await getAcademicNoticeById(id);
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load notice:", error);
  }

  if (!initialData) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Edit Notice"
        backHref="/dashboard/website/notice-update"
      />
      <NoticeForm initialData={initialData} />
    </div>
  );
}
