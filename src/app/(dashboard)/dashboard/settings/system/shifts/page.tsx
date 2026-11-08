import { PageHeader } from "@/components/shared/page-header";
import { getShifts } from "@/services/shift";
import React from "react";
import ShiftTable from "./_components/ShiftTable";

const ShiftPage = async () => {
  const shifts = await getShifts([
    {
      label: "limit",
      value: 100,
    },
  ]);
  return (  
    <div className="space-y-8">
      <PageHeader
        backHref="/dashboard/settings/system"
        title="Shift Configuration"
        actions={{
          href: "/dashboard/settings/system/shifts/add-shift",
          label: "Config Shift",
        }}
      />

      <ShiftTable shifts={shifts?.data} />
    </div>
  );
};

export default ShiftPage;
