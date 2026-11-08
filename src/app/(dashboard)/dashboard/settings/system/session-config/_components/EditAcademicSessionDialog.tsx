"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import AcademicSessionEditForm from "./AcademicSessionEditForm";
import { TAcademicSession } from "./types/academic-session";

interface EditAcademicSessionDialogProps {
  session: TAcademicSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditAcademicSessionDialog = ({
  session,
  open,
  onOpenChange,
}: EditAcademicSessionDialogProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
        </DialogHeader>
        {session && (
          <AcademicSessionEditForm
            session={session}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditAcademicSessionDialog;