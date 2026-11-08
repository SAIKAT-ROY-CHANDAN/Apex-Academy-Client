import { PageHeader } from "@/components/shared/page-header";
import { getAllRoles } from "@/services/role";
import type { TRole } from "@/types/modules/role/role.type";
import RoleTable from "./_components/RoleTable";

const RoleManagementPage = async () => {
  const response = await getAllRoles();
  const roles = (response?.data ?? []) as TRole[];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Role Management"
        backHref="/dashboard/settings/system"
        actions={{
          label: "Add Role",
          href: "/dashboard/settings/system/roles/add-role",
        }}
      />

      <RoleTable roles={roles} />
    </div>
  );
};

export default RoleManagementPage;
