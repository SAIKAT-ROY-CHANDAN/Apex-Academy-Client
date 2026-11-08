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

import { toast } from 'sonner';
import { createClass } from '@/services/academicClass';
import { AcademicClassFormValues, InstitutionType } from './schema/academic-class.schema';
import { TClass, Department, Program } from './types/types';
import ClassForm from './ClassForm';

interface AddClassDialogProps {
  institutionType?: InstitutionType | null;
  programs: Program[];
  departments: Department[];
  onClassCreated?: (newClass: TClass) => void;
  institutionId: string;
}

const AddClassDialog = ({
  institutionType,
  programs,
  departments,
  onClassCreated,
  institutionId
}: AddClassDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: AcademicClassFormValues) => {
      if (!institutionType) {
          toast.error('Institution not found');
          return;
        }
        try {
          setIsSubmitting(true);
          const newClass = await createClass({
            
            ...values,
            institution_id: institutionId,
          });
          
          if(newClass?.success) {
            toast.success('Class created successfully');
            onClassCreated?.(newClass.data);
            setOpen(false);
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to create class');
        } finally {
          setIsSubmitting(false);
        }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200">
        <Plus className="mr-2 h-4 w-4" />
        Add Year / Class
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="space-y-1 border-b pb-4">
          <DialogTitle className="text-xl font-semibold">Add New Year</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new academic class.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <ClassForm
            institutionType={institutionType}
            programs={programs}
            departments={departments}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddClassDialog;