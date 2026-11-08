'use client';

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AcademicSection } from "./types/academic-section";
import AcademicSectionDialog from "./Academic-section-dialog";

const AcademicSectionConfiguration = () => {
  const [sections, setSections] = useState<AcademicSection[]>([]); 

  const handleSectionCreated = (newSection: AcademicSection) => {
    setSections((prev) => [...prev, newSection]);
  };
  return (
    <div className="space-y-4">
        <PageHeader title="Academic Sections" backHref="/dashboard/settings/system" components={<AcademicSectionDialog
          onSectionCreated={handleSectionCreated}
        />} />
    </div>
  );
};

export default AcademicSectionConfiguration;