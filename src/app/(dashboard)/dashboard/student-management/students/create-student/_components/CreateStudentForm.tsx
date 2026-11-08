'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createStudentSchema,
  CreateStudentFormInput,
  CreateStudentFormValues,
} from './schema/student.schema';

import { cn } from '@/lib/utils';
import { Batch, HostelRoom, Shift } from './types/student';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import StudentInfoFields from './StudentInfoFields';
import { Switch } from '@/components/ui/switch';
import EnrollmentInfoFields from './EnrollmentInfoFields';
import FeeCollectionFields from './FeeCollectionFields';
import HostelFields from './HostelFields';
import { Button } from '@/components/ui/button';
import { AcademicSession } from '@/app/(dashboard)/dashboard/settings/system/session-config/_components/types/academic-session';

interface CreateStudentFormProps {
  academicSessions: AcademicSession[];
  batches: Batch[];
  shifts: Shift[];
  feeTypes?: any[]; // kept optional for backward compat, FeeCollection now fetches via backend chain Program→Department→Class
  hostelRooms: HostelRoom[];
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

const STUDENT_INFO_FIELDS = [
  'name', 'father_name', 'mother_name', 'religion', 'nid_no',
  'gender', 'student_phone', 'father_phone', 'mother_phone', 'village_road',
  'post_office', 'sub_district', 'district', 'email', 'password', 'photo',
] as const;

type StepKey = 'student-info' | 'enrollment' | 'fee-collection' | 'hostel';

interface StepConfig {
  id: StepKey;
  title: string;
}

const getActiveSteps = (includeFeeCollection: boolean, includeHostel: boolean): StepConfig[] => {
  const steps: StepConfig[] = [
    { id: 'student-info', title: 'Student Info' },
    { id: 'enrollment', title: 'Enrollment' },
  ];

  if (includeFeeCollection) {
    steps.push({ id: 'fee-collection', title: 'Fee Collection' });
  }

  if (includeHostel) {
    steps.push({ id: 'hostel', title: 'Hostel' });
  }

  return steps;
};

const CreateStudentForm = ({
  academicSessions,
  batches,
  shifts,
  feeTypes: _feeTypes,
  hostelRooms,
  onSubmit,
  isSubmitting,
}: CreateStudentFormProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [includeFeeCollection, setIncludeFeeCollection] = useState(true);
  const [isPending, startTransition] = useTransition();
  // Controlling hostel by this state
  const [includeHostel, setIncludeHostel] = useState(false);

  const activeSteps = getActiveSteps(includeFeeCollection, includeHostel);
  const currentStep = activeSteps[stepIndex];
  const isLastStep = stepIndex === activeSteps.length - 1;

  const filesRef = useRef<Record<string, File>>({});

  const form = useForm<CreateStudentFormInput, any, CreateStudentFormValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      name: '',
      father_name: '',
      mother_name: '',
      religion: undefined,
      nid_no: '',
      gender: undefined,
      student_phone: '',
      father_phone: '',
      mother_phone: '',
      photo: null,
      village_road: '',
      post_office: '',
      sub_district: '',
      district: '',
      email: '',
      password: '',
      enrollment: {
        academic_session_id: undefined,
        academic_class_id: undefined,
        academic_section_id: undefined,
        batch_id: undefined,
        shift_id: undefined,
        roll_number: '',
        registration_number: '',
        password: 'non',
        merit_position: undefined,
      },
      studentFeeCollection: undefined,
      hostelAllocation: undefined,
      hostelFeeCollection: undefined,
    },
  });

  const handleFileChange = useCallback(
    (fieldName: string, file: File | null) => {
      if (file) {
        filesRef.current[fieldName] = file;
      } else {
        delete filesRef.current[fieldName];
      }
    },
    [],
  );

  useEffect(() => {
    setStepIndex((current) => Math.min(current, Math.max(activeSteps.length - 1, 0)));
  }, [activeSteps.length]);

  const handleNext = async () => {
    if (currentStep?.id === 'student-info') {
      const isValid = await form.trigger(STUDENT_INFO_FIELDS as any);
      if (!isValid) return;
    }

    if (currentStep?.id === 'enrollment') {
      const isValid = await form.trigger('enrollment' as any);
      if (!isValid) return;
    }

    if (currentStep?.id === 'fee-collection' && includeFeeCollection) {
      const isValid = await form.trigger('studentFeeCollection' as any);
      if (!isValid) return;
    }

    if (!isLastStep) {
      setStepIndex((s) => s + 1);
    }
  };

  const handleBack = () => setStepIndex((s) => Math.max(s - 1, 0));


  const handleFeeCollectionToggle = (checked: boolean) => {
    setIncludeFeeCollection(checked);
    form.setValue('studentFeeCollection', checked ? ({ fee_type_id: undefined, items: [] } as any) : undefined);
  };

  const handleHostelToggle = (checked: boolean) => {
    setIncludeHostel(checked);
    form.setValue('hostelAllocation', checked ? ({ hostel_room_id: undefined, allocated_at: '' } as any) : undefined);
    form.setValue(
      'hostelFeeCollection',
      checked
        ? ({ collection_date: '', total_amount: undefined, paid_amount: undefined, due_amount: undefined, items: [], mealCollections: [] } as any)
        : undefined
    );
  };

  const handleFormSubmit = (values: CreateStudentFormValues) => {
    if (!isLastStep) return;

    const fd = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (key === 'enrollment') {
        fd.append('enrollment', JSON.stringify(value));
      } else if (key === 'studentFeeCollection' && value) {
        fd.append('studentFeeCollection', JSON.stringify(value));
      } else if (key === 'hostelAllocation' && value) {
        fd.append('hostelAllocation', JSON.stringify(value));
      } else if (key === 'hostelFeeCollection' && value) {
        fd.append('hostelFeeCollection', JSON.stringify(value));
      } else if (value && typeof value === 'string' && value.trim()) {
        fd.append(key, value.trim());
      }
    });

    Object.entries(filesRef.current).forEach(([fieldName, file]) => {
      fd.append(fieldName, file);
    });

    startTransition(async () => {
      await onSubmit(fd);
    });
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && !isLastStep) {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} onKeyDown={handleFormKeyDown} className="space-y-6">
      {/* Step indicator */}
      <div className="flex flex-wrap items-center gap-4">
        {activeSteps.map((s, index) => (
          <div key={s.id} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium',
                  stepIndex === index
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : stepIndex > index
                      ? 'border-blue-500 bg-blue-50 text-blue-500'
                      : 'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {stepIndex > index ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className={cn('text-sm font-medium', stepIndex === index ? 'text-foreground' : 'text-muted-foreground')}>
                {s.title}
              </span>
            </div>
            {index < activeSteps.length - 1 && <div className="h-px w-8 bg-muted-foreground/30" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      {currentStep?.id === 'student-info' && <StudentInfoFields control={form.control} onPhotoChange={(file) => handleFileChange('photo', file)} />}

      {currentStep?.id === 'enrollment' && (
        <EnrollmentInfoFields
          control={form.control}
          setValue={form.setValue}
          academicSessions={academicSessions}
          batches={batches}
          shifts={shifts}
        />
      )}

      {currentStep?.id === 'fee-collection' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-md border p-3">
            <Switch checked={includeFeeCollection} onCheckedChange={handleFeeCollectionToggle} />
            <span className="text-sm font-medium">Collect fees now</span>
          </div>
          {includeFeeCollection && (
            <FeeCollectionFields control={form.control} setValue={form.setValue} />
          )}
        </div>
      )}

      {currentStep?.id === 'hostel' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-md border p-3">
            <Switch checked={includeHostel} onCheckedChange={handleHostelToggle} />
            <span className="text-sm font-medium">Allocate hostel now</span>
          </div>
          {includeHostel && <HostelFields control={form.control} hostelRooms={hostelRooms} />}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {stepIndex > 0 ? (
          <Button type="button" variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {!isLastStep ? (
          <Button type="button" onClick={handleNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting} className="min-w-40">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Student'
            )}
          </Button>
        )}
      </div>
    </form>
  );
};

export default CreateStudentForm;