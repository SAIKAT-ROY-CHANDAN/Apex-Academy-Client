import { PageHeader } from "@/components/shared/page-header";
import { getAllRoles } from "@/services/role";
import AddAdminFrom from "./_components/AddAdminFrom";

const AddAdminUser = async () => {
  const allRoles = await getAllRoles();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Administrator"
        backHref="/dashboard/settings/system/users"
      />

      <AddAdminFrom roles={allRoles.data} />
    </div>
  );
};

export default AddAdminUser;
