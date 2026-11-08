import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteGoverningBodyMemberById } from "@/services/websiteGoverningBody";
import MemberForm from "../../_components/MemberForm";

export default async function EditGoverningBodyMemberPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let initialData = null;

  try {
    const response = await getWebsiteGoverningBodyMemberById(id);
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load governing body member:", error);
  }

  if (!initialData) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Governing Body"
        backHref="/dashboard/website/governing-body-administrators"
      />
      <MemberForm initialData={initialData} />
    </div>
  );
}
