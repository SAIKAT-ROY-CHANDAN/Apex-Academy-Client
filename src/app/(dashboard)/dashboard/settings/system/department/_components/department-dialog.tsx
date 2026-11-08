'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import DepartmentForm from './department-form';
import { toast } from 'sonner';
import { Program } from '../../program-config/_components/types/type';
import { Department } from './types';
import { DepartmentFormValues } from './schema/department.schema';
import { createDepartment } from '@/services/department';

interface DepartmentDialogProps {
  institutionId?: string | null;
  programs: Program[];
  onDepartmentCreated?: (newDepartment: Department) => void;
}

const DepartmentDialog = ({
  institutionId,
  programs,
  onDepartmentCreated,
}: DepartmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: DepartmentFormValues) => {
    if (!institutionId) {
      toast.error('Institution not found');
      return;
    }
    try {
      setIsSubmitting(true);
      const newDepartment = await createDepartment({
        ...values,
        institution_id: institutionId,
      });

      if (newDepartment?.success) {
        toast.success('Department created successfully');
        onDepartmentCreated?.(newDepartment.data);
        setOpen(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add department
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="space-y-1 border-b pb-4">
          <DialogTitle className="text-xl font-semibold">Add New Department</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new department.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <DepartmentForm
            programs={programs}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentDialog;