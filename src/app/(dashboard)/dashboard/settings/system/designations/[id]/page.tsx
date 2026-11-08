import { PageHeader } from "@/components/shared/page-header";
import { getDesignationById } from "@/services/designation";
import React from "react";
import EditDesignationForm from "./_components/EditDesignationForm";

const EditDesignationPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const response = await getDesignationById(id);
  const designation = response?.data;

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/dashboard/settings/system/designations"
        title="Edit Designation"
      />

      <EditDesignationForm designation={designation} />
    </div>
  );
};

export default EditDesignationPage;