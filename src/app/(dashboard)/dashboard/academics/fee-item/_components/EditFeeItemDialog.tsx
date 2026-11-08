"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import FeeItemEditForm from "./FeeItemEditForm";
import { TFeeItem } from "./types/fee-item";

interface EditFeeItemDialogProps {
  feeItem: TFeeItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditFeeItemDialog = ({
  feeItem,
  open,
  onOpenChange,
}: EditFeeItemDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Fee Item</DialogTitle>
        </DialogHeader>
        {feeItem && (
          <div className="overflow-y-auto overflow-x-hidden flex-1 pr-2">
            <FeeItemEditForm
              feeItem={feeItem}
              onSuccess={handleSuccess}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditFeeItemDialog;