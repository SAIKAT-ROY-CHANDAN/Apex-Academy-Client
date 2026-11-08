"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import FeeTypeEditForm from "./FeeTypeEditForm";
import { TFeeType } from "./types/fee-type";

interface EditFeeTypeDialogProps {
  feeType: TFeeType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditFeeTypeDialog = ({
  feeType,
  open,
  onOpenChange,
}: EditFeeTypeDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Fee Type</DialogTitle>
        </DialogHeader>
        {feeType && (
          <FeeTypeEditForm
            feeType={feeType}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditFeeTypeDialog;