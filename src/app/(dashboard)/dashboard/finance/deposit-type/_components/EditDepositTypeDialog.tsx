"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import DepositTypeEditForm from "./DepositTypeEditForm";
import { TDepositType } from "./Types/deposit-type";

interface EditDepositTypeDialogProps {
  depositType: TDepositType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditDepositTypeDialog = ({
  depositType,
  open,
  onOpenChange,
}: EditDepositTypeDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Deposit Type</DialogTitle>
        </DialogHeader>
        {depositType && (
          <DepositTypeEditForm
            depositType={depositType}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditDepositTypeDialog;