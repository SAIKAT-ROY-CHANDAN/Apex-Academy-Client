import { PageHeader } from "@/components/shared/page-header";
import { getAdminUserById } from "@/services/admin-auth";
import { getAllRoles } from "@/services/role";
import React from "react";
import EditAdminForm from "./_components/EditAdminForm";

const EditAdminUserPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const [adminResponse, rolesResponse] = await Promise.all([
    getAdminUserById(id),
    getAllRoles(),
  ]);
  const admin = adminResponse?.data;
  const roles = rolesResponse?.data ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/dashboard/settings/system/users"
        title="Edit Administrator"
      />

      <EditAdminForm admin={admin} roles={roles} />
    </div>
  );
};

export default EditAdminUserPage;