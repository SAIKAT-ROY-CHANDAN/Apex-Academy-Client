"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import DepositEditForm from "./DepositEditForm";
import { TDeposit } from "./types/deposit";

interface EditDepositDialogProps {
  deposit: TDeposit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditDepositDialog = ({
  deposit,
  open,
  onOpenChange,
}: EditDepositDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Deposit</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          {deposit && (
            <DepositEditForm
              key={deposit.id}
              deposit={deposit}
              onSuccess={handleSuccess}
              onCancel={() => onOpenChange(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDepositDialog;