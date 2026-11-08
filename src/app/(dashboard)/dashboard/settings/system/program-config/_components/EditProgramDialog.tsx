"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import ProgramEditForm from "./ProgramEditForm";
import { TProgram } from "./types/type";

interface EditProgramDialogProps {
  program: TProgram | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProgramDialog = ({
  program,
  open,
  onOpenChange,
}: EditProgramDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
        </DialogHeader>
        {program && (
          <ProgramEditForm
            program={program}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditProgramDialog;