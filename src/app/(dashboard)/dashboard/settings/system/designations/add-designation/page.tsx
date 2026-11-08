import { PageHeader } from "@/components/shared/page-header";
import React from "react";
import AddDesignationForm from "./_components/AddDesignationForm";

const AddDesignation = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Designation"
        backHref="/dashboard/settings/system/designations"
      />
      <div className="flex items-center justify-center">
        <AddDesignationForm />
      </div>
    </div>
  );
};

export default AddDesignation;
