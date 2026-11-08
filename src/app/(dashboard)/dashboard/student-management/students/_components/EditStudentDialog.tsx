"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { TStudent } from "./types";
import StudentEditForm from "./StudentEditForm";


interface EditStudentDialogProps {
  student: TStudent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditStudentDialog = ({
  student,
  open,
  onOpenChange,
}: EditStudentDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        {student && (
          <StudentEditForm
            student={student}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentDialog;