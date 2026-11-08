import { PageHeader } from '@/components/shared/page-header'
import DesignationTable from './_components/DesignationTable'
import { getDesignations } from '@/services/designation'

const Designation = async () => {
  const designations = await getDesignations([]);
  return (
    <div className="space-y-8">
      <PageHeader
        title="Designations"
        backHref="/dashboard/settings/system"
        actions={{
          href: "/dashboard/settings/system/designations/add-designation",
          label: "Add Designation",
        }}
      />
      <DesignationTable designations={designations?.data} />
    </div>
  );
};

export default Designation