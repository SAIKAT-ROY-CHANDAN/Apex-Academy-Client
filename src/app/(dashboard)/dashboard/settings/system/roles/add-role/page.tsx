import { PageHeader } from "@/components/shared/page-header";
import AddRoleForm from "./_components/AddRoleForm";

const AddRolePage = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Role"
        backHref="/dashboard/settings/system/roles"
      />

      <div className="mt-5">
        <AddRoleForm />
      </div>
    </div>
  );
};

export default AddRolePage;
