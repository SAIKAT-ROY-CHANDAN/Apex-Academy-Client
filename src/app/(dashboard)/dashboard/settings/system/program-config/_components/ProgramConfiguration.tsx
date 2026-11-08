'use client';

import { useEffect, useState } from 'react';
import { getInstitutionDetails } from '@/services/institution';
import { PageHeader } from '@/components/shared/page-header';
import { Program } from './types/type';
import AddProgramDialog from './ProgramDialog';


const ProgramConfiguration = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  // Replace with actual institution type

  const handleProgramCreated = (newProgram: Program) => {
    setPrograms((prev) => [...prev, newProgram]);
  };
  useEffect(() => {
    const fetchInstitutionDetails = async () => {
      try {
        const institutionData = await getInstitutionDetails();
        setInstitutionId(institutionData?.data?.id);
      } catch (error) {
        console.error("Error fetching institution details:", error);
      }
    };

    fetchInstitutionDetails();
  }, []);
  console.log("it it");

  return (
    <div className="space-y-4">
       <PageHeader title="Programs" backHref="/dashboard/settings/system" components={<AddProgramDialog
          institutionId={institutionId}
          onProgramCreated={handleProgramCreated}
        />} />

      {/* Render your programs table/list here using `programs` */}
    </div>
  );
};

export default ProgramConfiguration;