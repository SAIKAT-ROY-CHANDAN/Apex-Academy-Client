import { PageHeader } from "@/components/shared/page-header";
import AddExpenseForm from "./_components/AddExpenseForm";

const AddExpensePage = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Hostel Expense"
        backHref="/dashboard/hostel/expense"
      />
      <div className="flex items-center justify-center px-6">
        <AddExpenseForm />
      </div>
    </div>
  );
};

export default AddExpensePage;
