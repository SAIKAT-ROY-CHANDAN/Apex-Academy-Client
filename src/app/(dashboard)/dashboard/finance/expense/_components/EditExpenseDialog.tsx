"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import ExpenseEditForm from "./ExpenseEditForm";
import { TExpense } from "./types/expense";

interface EditExpenseDialogProps {
  expense: TExpense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditExpenseDialog = ({
  expense,
  open,
  onOpenChange,
}: EditExpenseDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          {expense && (
            <ExpenseEditForm
              key={expense.id}
              expense={expense}
              onSuccess={handleSuccess}
              onCancel={() => onOpenChange(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseDialog;