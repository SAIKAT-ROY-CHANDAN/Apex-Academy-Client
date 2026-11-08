"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import BatchEditForm from "./BatchEditForm";
import { TBatch } from "./Types/batch";

interface EditBatchDialogProps {
  batch: TBatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditBatchDialog = ({
  batch,
  open,
  onOpenChange,
}: EditBatchDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Batch</DialogTitle>
        </DialogHeader>
        {batch && (
          <BatchEditForm
            batch={batch}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditBatchDialog;