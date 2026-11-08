"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClassEditForm from "./ClassEditForm";
import { TClass } from "./types/types";
import type { Department, Program } from "./types/types";

interface EditClassDialogProps {
  classData: TClass | null;
  institution: string;
  programs: Program[];
  departments: Department[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassUpdated?: (updatedClass: TClass) => void;
}

const EditClassDialog = ({
  classData,
  institution,
  programs,
  departments,
  open,
  onOpenChange,
  onClassUpdated,
}: EditClassDialogProps) => {
  const handleSuccess = (updatedClass: TClass) => {
    onOpenChange(false);
    onClassUpdated?.(updatedClass);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Class</DialogTitle>
        </DialogHeader>
        {classData && (
          <div className="overflow-y-auto overflow-x-hidden flex-1 pr-2">
            <ClassEditForm
              classData={classData}
              institution={institution}
              programs={programs}
              departments={departments}
              onSuccess={handleSuccess}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditClassDialog;
