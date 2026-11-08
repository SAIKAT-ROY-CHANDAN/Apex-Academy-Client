import React from 'react';
import AcademicSectionConfiguration from './_components/AcademicSectionConfiguration';
import AcademicSectionTable from './_components/AcademicSectionTable';
import { getAcademicClassDetails } from '@/services/academicClass';
import { getAcademicSections } from '@/services/academicSection';

const PAGE_SIZE = 10;

const AcademicSection = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
  const resolvedSearchParams = await searchParams;
  const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
  const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

  const academicSection = await getAcademicSections([
    { label: 'page', value: currentPage },
    { label: 'limit', value: PAGE_SIZE },
  ]);
  const items = academicSection?.data ?? [];
  const totalItems = academicSection?.meta?.total ?? academicSection?.meta?.totalItems ?? items.length;
  const totalPages = academicSection?.meta?.totalPages ?? academicSection?.meta?.lastPage ?? academicSection?.meta?.last_page;
  return (
    <div>
      <AcademicSectionConfiguration />
      <AcademicSectionTable sections={items} currentPage={currentPage} totalItems={totalItems} totalPages={totalPages} />
    </div>
  );
};

export default AcademicSection;