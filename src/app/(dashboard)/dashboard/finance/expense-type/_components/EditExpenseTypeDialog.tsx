"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import ExpenseTypeEditForm from "./ExpenseTypeEditForm";
import { TExpenseType } from "./Types/expense-type";

interface EditExpenseTypeDialogProps {
  expenseType: TExpenseType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditExpenseTypeDialog = ({
  expenseType,
  open,
  onOpenChange,
}: EditExpenseTypeDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Expense Type</DialogTitle>
        </DialogHeader>
        {expenseType && (
          <ExpenseTypeEditForm
            expenseType={expenseType}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseTypeDialog;