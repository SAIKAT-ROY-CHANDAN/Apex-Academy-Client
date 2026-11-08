"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import AcademicSectionEditForm from "./AcademicSectionEditForm";
import { TAcademicSection } from "./types/academic-section";
interface EditAcademicSectionDialogProps {
  section: TAcademicSection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditAcademicSectionDialog = ({
  section,
  open,
  onOpenChange,
}: EditAcademicSectionDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Section</DialogTitle>
        </DialogHeader>
        {section && (
          <AcademicSectionEditForm
            section={section}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditAcademicSectionDialog;