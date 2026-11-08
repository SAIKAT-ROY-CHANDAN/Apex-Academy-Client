"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import SubjectEditForm from "./SubjectEditForm";
import { TSubject } from "./types";

interface EditSubjectDialogProps {
  subject: TSubject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditSubjectDialog = ({
  subject,
  open,
  onOpenChange,
}: EditSubjectDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
        </DialogHeader>
        {subject && (
          <SubjectEditForm
            subject={subject}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditSubjectDialog;