"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import HolidayEditForm from "./HolidayEditForm";
import { THoliday } from "./types";

interface EditHolidayDialogProps {
  holiday: THoliday | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditHolidayDialog = ({
  holiday,
  open,
  onOpenChange,
}: EditHolidayDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Holiday</DialogTitle>
        </DialogHeader>
        {holiday && (
          <HolidayEditForm
            holiday={holiday}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditHolidayDialog;