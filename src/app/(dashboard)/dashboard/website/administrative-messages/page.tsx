import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteChairmanMessage } from "@/services/websiteChairmanMessage";
import { getWebsitePrincipalMessage } from "@/services/websitePrincipalMessage";
import MessageSectionForm from "./_components/MessageSectionForm";

export default async function AdministrativeMessagesPage() {
  let chairmanData = null;
  let principalData = null;

  try {
    const response = await getWebsiteChairmanMessage();
    chairmanData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load chairman message:", error);
  }

  try {
    const response = await getWebsitePrincipalMessage();
    principalData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load principal message:", error);
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Administrative Messages"
        backHref="/dashboard/website"
      />
      <MessageSectionForm
        section="chairman"
        title="Message from Chairman"
        nameLabel="Chairman's Name"
        initialData={chairmanData}
      />
      <MessageSectionForm
        section="principal"
        title="Message from Principal"
        nameLabel="Principal's Name"
        initialData={principalData}
      />
    </div>
  );
}
