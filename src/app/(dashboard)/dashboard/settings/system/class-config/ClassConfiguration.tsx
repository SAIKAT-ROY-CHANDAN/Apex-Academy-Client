'use client';

import { useEffect, useState } from 'react';
import { TClass, Department, Program } from './_components/types/types';
import AddClassDialog from './_components/ClassDIalogue';
import { PageHeader } from '@/components/shared/page-header';
import ClassTable from './_components/ClassTable';

interface ClassConfigurationProps {
  initialClasses: TClass[];
  institution: string;
  institutionId: string;
  programs: Program[];
  departments: Department[];
  currentPage?: number;
  totalItems?: number;
  totalPages?: number;
}

const ClassConfiguration = ({
  initialClasses,
  institution,
  institutionId,
  programs,
  departments,
  currentPage = 1,
  totalItems,
  totalPages,
}: ClassConfigurationProps) => {
  const enrichClass = (cls: TClass): TClass => {
    const prog =
      cls.program ??
      (cls.program_id
        ? programs.find((p) => p.id === cls.program_id) ?? null
        : null);
    const dept =
      cls.department ??
      (cls.department_id
        ? departments.find((d) => d.id === cls.department_id) ?? null
        : null);
    return {
      ...cls,
      program: prog as any,
      department: dept as any,
    };
  };

  const [classes, setClasses] = useState<TClass[]>(() =>
    initialClasses.map(enrichClass)
  );
  const [institutionType] = useState<string>(institution);

  useEffect(() => {
    setClasses(initialClasses.map(enrichClass));
  }, [initialClasses, programs, departments]);

  const handleClassCreated = (newClass: TClass) => {
    setClasses((prev) => [...prev, enrichClass(newClass)]);
  };

  const handleClassUpdated = (updatedClass: TClass) => {
    const enriched = enrichClass(updatedClass);
    setClasses((prev) =>
      prev.map((cls) => (cls.id === enriched.id ? enriched : cls))
    );
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Academic Years / Classes"
        backHref="/dashboard/settings/system"
        components={
          <AddClassDialog
            institutionType={institutionType}
            programs={programs}
            departments={departments}
            onClassCreated={handleClassCreated}
            institutionId={institutionId}
          />
        }
      />
      <ClassTable
        classes={classes}
        institution={institutionType}
        currentPage={currentPage}
        totalItems={totalItems ?? classes.length}
        totalPages={totalPages}
        programs={programs}
        departments={departments}
        onClassUpdated={handleClassUpdated}
      />
    </div>
  );
};

export default ClassConfiguration;
