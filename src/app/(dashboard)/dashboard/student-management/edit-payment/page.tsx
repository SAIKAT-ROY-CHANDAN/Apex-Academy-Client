import { PageHeader } from "@/components/shared/page-header";
import { getStudents } from "@/services/student";
import EditPaymentTable from "./_components/EditPaymentTable";

const PAGE_SIZE = 10;

const Student = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
    const resolvedSearchParams = await searchParams;
    const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
    const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

    const students = await getStudents([
        { label: "page", value: currentPage },
        { label: "limit", value: PAGE_SIZE },
    ]);
    const items = students?.data ?? [];
    const totalItems = students?.meta?.total ?? students?.meta?.totalItems ?? items.length;
    const totalPages = students?.meta?.totalPages ?? students?.meta?.lastPage ?? students?.meta?.last_page;

console.log(students);

    return (
        <div className="space-y-4">
            <PageHeader title="Payment Edit" backHref="/dashboard/student-management" actions={{ label: "Add Student", href: "/dashboard/student-management/students/create-student" }} />
            <EditPaymentTable students={items} currentPage={currentPage} totalItems={totalItems} totalPages={totalPages} />
        </div>
    );
};

export default Student;
