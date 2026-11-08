import { PageHeader } from "@/components/shared/page-header";
import { getAllAdminsUser } from "@/services/admin-auth";
import AdminUserTable from "./_components/AdminUserTable";

const AdminUserPage = async () => {
  const allAdmins = await getAllAdminsUser([
    { label: "page", value: "1" },
    { label: "limit", value: "20" },
  ]);
  const admins = allAdmins?.data ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        backHref="/dashboard/settings/system"
        actions={{
          href: "/dashboard/settings/system/users/add",
          label: "Add Administrator",
        }}
      />

      <AdminUserTable admins={admins} />
    </div>
  );
};

export default AdminUserPage;