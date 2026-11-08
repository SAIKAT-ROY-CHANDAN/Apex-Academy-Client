import { PageHeader } from "@/components/shared/page-header";
import React from "react";
import AddStaffForm from "./_components/AddStaffForm";
import { getDesignations } from "@/services/designation";

const AddStaff = async () => {
  const designations = await getDesignations([]);
  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Staff"
        backHref="/dashboard/employees/staffs"
      />
      <AddStaffForm
        designations={designations?.data || []}
      />
    </div>
  );
};

export default AddStaff;