'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { getAcademicClassDetails } from '@/services/academicClass';
import { getPrograms } from '@/services/program';
import { Program } from '../../class-config/_components/types/types';
import { Subject } from './types';
import AddSubjectDialog from './Subject-dialog';

const SubjectConfiguration = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicClasses, setAcademicClasses] = useState<any[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  const handleSubjectCreated = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
  };
  useEffect(() => {
    const fetchAcademicClassDetails = async () => {
      try {
        const academicClass = await getAcademicClassDetails();
        setAcademicClasses(academicClass?.data);
      } catch (error) {
        console.error("Error fetching academic class details:", error);
      }
    };

    fetchAcademicClassDetails();
  }, []);
  useEffect(() => {
    const fetchProgramDetails = async () => {
      try {
        const programData = await getPrograms([]);
        setPrograms(programData?.data);
      } catch (error) {
        console.error("Error fetching Program details:", error);
      }
    };

    fetchProgramDetails();
  }, []);
  return (
    <div className="space-y-4">
      <PageHeader title="Academic Subjects" backHref="/dashboard/settings/system" components={<AddSubjectDialog onSubjectCreated={handleSubjectCreated} programs={programs} academicClasses={academicClasses} />} />
    </div>
  );
};

export default SubjectConfiguration;