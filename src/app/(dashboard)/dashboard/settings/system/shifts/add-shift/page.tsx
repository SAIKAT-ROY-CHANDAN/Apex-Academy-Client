import { PageHeader } from "@/components/shared/page-header";
import React from "react";
import AddShiftForm from "./_components/AddShiftForm";

const CreateShift = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/dashboard/settings/system/shifts"
        title="Add Shift"
      />

      <AddShiftForm />
    </div>
  );
};

export default CreateShift;
