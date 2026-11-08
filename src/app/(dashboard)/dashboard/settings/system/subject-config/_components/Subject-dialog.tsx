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
import { AcademicClass, Program } from '../../class-config/_components/types/types';
import { Subject } from './types';
import { SubjectFormValues } from './schema/subject.schema';
import { createSubject } from '@/services/subject';
import SubjectForm from './Subject-form';

interface AddSubjectDialogProps {
  programs: Program[];
  academicClasses: AcademicClass[];
  onSubjectCreated?: (newSubject: Subject) => void;
}

const AddSubjectDialog = ({ programs, academicClasses, onSubjectCreated }: AddSubjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: SubjectFormValues) => {
    try {
      setIsSubmitting(true);
      const newSubject = await createSubject({
        program_id: values.program_id,
        department_id: values.department_id,
        class_id: values.class_id,
        subjects: values.subjects.map((s) => s.value),
      });

      if (newSubject?.success) {
        toast.success(newSubject?.message || 'Subject created successfully');
        onSubjectCreated?.(newSubject);
        setOpen(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create subject');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200">
        <Plus className="mr-2 h-4 w-4" />
        Add subject
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="space-y-1 border-b pb-4">
          <DialogTitle className="text-xl font-semibold">Add New Subject</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new subject.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <SubjectForm
            programs={programs}
            academicClasses={academicClasses}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubjectDialog;