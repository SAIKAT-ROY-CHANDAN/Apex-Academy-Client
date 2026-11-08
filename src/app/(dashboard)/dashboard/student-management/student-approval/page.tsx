import { PageHeader } from "@/components/shared/page-header";
import { getPendingStudents } from "@/services/student";
import ApprovalTable from "./_components/ApprovalTable";

const PAGE_SIZE = 10;

const StudentApproval = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) => {
  const resolvedSearchParams = await searchParams;
  const pageParam = Array.isArray(resolvedSearchParams.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams.page;
  const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

  const students = await getPendingStudents([
    { label: "page", value: currentPage },
    { label: "limit", value: PAGE_SIZE },
  ]);
  const items = students?.data ?? [];
  const totalItems =
    students?.meta?.totalItems ?? students?.meta?.total ?? items.length;
  const totalPages = students?.meta?.totalPages ?? students?.meta?.lastPage;

  return (
    <div className="space-y-4">
      <PageHeader title="Student Approvals" />
      <ApprovalTable
        students={items}
        currentPage={currentPage}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  );
};

export default StudentApproval;
