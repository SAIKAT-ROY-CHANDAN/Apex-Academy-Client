"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import DepartmentEditForm from "./DepartmentEditForm";
import { TDepartment } from "./types";

interface EditDepartmentDialogProps {
  department: TDepartment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditDepartmentDialog = ({
  department,
  open,
  onOpenChange,
}: EditDepartmentDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
        </DialogHeader>
        {department && (
          <DepartmentEditForm
            department={department}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditDepartmentDialog;