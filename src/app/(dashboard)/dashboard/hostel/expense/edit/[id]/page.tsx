import { PageHeader } from "@/components/shared/page-header";
import AddExpenseForm from "../../add-expense/_components/AddExpenseForm";
import { getHostelExpenseById } from "@/services/hostelExpense";
import { notFound } from "next/navigation";

const EditExpensePage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;
  const res = await getHostelExpenseById(id);

  if (!res?.success || !res?.data) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Edit Hostel Expense"
        backHref={`/dashboard/hostel/expense`}
      />
      <div className="flex items-center justify-center px-6">
        <AddExpenseForm initialData={res.data} isEdit />
      </div>
    </div>
  );
};

export default EditExpensePage;
