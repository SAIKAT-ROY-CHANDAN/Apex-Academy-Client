"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { TGradeSystem } from "@/types/modules/grade-system/grade-system.type";
import GradeSystemForm from "./GradeSystemForm";


interface GradeSystemDialogProps {
  gradeSystem: TGradeSystem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GradeSystemDialog = ({
  gradeSystem,
  open,
  onOpenChange,
}: GradeSystemDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{gradeSystem ? "Edit Grade System" : "Add Grade System"}</DialogTitle>
        </DialogHeader>
        <GradeSystemForm
          gradeSystem={gradeSystem ?? undefined}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default GradeSystemDialog;