import { PageHeader } from "@/components/shared/page-header";
import { getShift } from "@/services/shift";
import React from "react";
import EditShiftForm from "./_components/EditShiftForm";

const EditShiftPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const response = await getShift(id);
  const shift = response?.data;

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/dashboard/settings/system/shifts"
        title="Edit Shift"
      />

      <EditShiftForm shift={shift} />
    </div>
  );
};

export default EditShiftPage;