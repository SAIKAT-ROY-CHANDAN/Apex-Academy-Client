import { PageHeader } from "@/components/shared/page-header";
import HostelExpenseDetails from "../_components/HostelExpenseDetails";
import { getHostelExpenseById } from "@/services/hostelExpense";
import { notFound } from "next/navigation";

const ExpenseDetailPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;
  const res = await getHostelExpenseById(id);

  if (!res?.success || !res?.data) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Hostel Expense Details"
        backHref="/dashboard/hostel/expense"
      />
      <HostelExpenseDetails expense={res.data} />
    </div>
  );
};

export default ExpenseDetailPage;
