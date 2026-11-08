'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreateStudentFormValues } from './_components/schema/student.schema';
import CreateStudentForm from './_components/CreateStudentForm';
import { createStudent } from '@/services/student';
import { HostelRoom } from './_components/types/student';
import { useStudentFormData } from './_components/hooks/useStudentFormData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { printFeeCollectionReceipt } from '@/app/(dashboard)/dashboard/student-management/fee-collection/_components/feeCollectionInvoice';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';

// Replace with real fetched data for these dropdowns
const MOCK_HOSTEL_ROOMS: HostelRoom[] = [];

interface StudentFeeCollectionItemSummary {
  id: string;
  fee_item_id: string;
  discount_amount: number;
  paid_amount: number;
  line_total_amount: number;
  fine_amount: number;
  fee_month: string | null;
  fee_year: number | null;
  feeItem?: {
    id: string;
    name: string;
    FeeItemType: 'Monthly' | 'OneTime';
  };
}

interface CreateStudentResponseData {
  student?: { id: string; name: string; student_phone: string };
  studentFeeCollection?: {
    id: string;
    fee_type_id: string;
    student_id: string;
    studentFeeCollectionItems?: StudentFeeCollectionItemSummary[];
  } | null;
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 2,
  }).format(amount);

const CreateStudentPage = () => {
  const router = useRouter();
  const [createdStudent, setCreatedStudent] = useState<CreateStudentResponseData | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [printingInvoice, setPrintingInvoice] = useState(false);
  const {
    loading,
    shifts,
    sessions,
    batches,
  } = useStudentFormData();

  const handleSubmit = async (formData: FormData) => {
    try {
      const newStudent = await createStudent(formData);
      console.log(newStudent);

      if (newStudent?.statusCode == 400) {
        toast.error(newStudent?.message || 'Failed to create student');
      }
      if (newStudent?.success) {
        toast.success(newStudent.message || 'Student created successfully');
        setCreatedStudent(newStudent.data ?? null);

        // Print invoice if there are fee items with payments
        const feeItems = newStudent.data?.studentFeeCollection?.studentFeeCollectionItems ?? [];
        if (feeItems.length > 0) {
          setPrintingInvoice(true);
          try {
            const student = newStudent.data?.student;
            const feeTypeId = newStudent.data?.studentFeeCollection?.fee_type_id;

            // Get class name from enrollment (if available in form data)
            const className = ''; // Would need to extract from formData if needed

            await printFeeCollectionReceipt({
              studentName: student?.name ?? 'Student',
              studentPhone: student?.student_phone ?? '',
              method: formData.get('studentFeeCollection') ? JSON.parse(formData.get('studentFeeCollection') as string).payment_method ?? 'CASH' : 'CASH',
              note: formData.get('studentFeeCollection') ? JSON.parse(formData.get('studentFeeCollection') as string).payment_note ?? null : null,
              entries: feeItems.map((item: StudentFeeCollectionItemSummary) => ({
                name: item.feeItem?.name ?? item.fee_item_id,
                period: item.fee_month && item.fee_year
                  ? `${item.fee_month.charAt(0)}${item.fee_month.slice(1).toLowerCase()} ${item.fee_year}`
                  : item.feeItem?.FeeItemType === 'OneTime'
                    ? 'One-time'
                    : 'Monthly',
                amount: item.line_total_amount + item.fine_amount,
                paid: item.paid_amount,
                discount: item.discount_amount,
              })),
            });
          } catch (e) {
            console.error('Failed to print invoice:', e);
          } finally {
            setPrintingInvoice(false);
          }
        }

        router.push('/dashboard/student-management/students');
        setShowSummary(true);
      }
      if (newStudent?.errorSources) {
        toast.error(newStudent?.errorSources ? newStudent?.errorSources[0]?.message : 'Failed to create student');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create student');
    }
  };

  const feeItems = createdStudent?.studentFeeCollection?.studentFeeCollectionItems ?? [];

  return (
    <Card className="p-4">
      <PageHeader title="Students" backHref="/dashboard/student-management/students" />
      <CreateStudentForm
        academicSessions={sessions}
        batches={batches}
        shifts={shifts}
        hostelRooms={MOCK_HOSTEL_ROOMS}
        onSubmit={handleSubmit}
      />

      {/* Created student summary with fine amounts */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Student Created Successfully
            </DialogTitle>
            <DialogDescription>
              {createdStudent?.student?.name
                ? `${createdStudent.student.name} has been created with the following fee details.`
                : 'Student has been created successfully.'}
            </DialogDescription>
          </DialogHeader>

          {feeItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Fee Collection Summary</h3>
              <div className="space-y-2">
                {feeItems.map((item) => {
                  const totalWithFine = item.line_total_amount + item.fine_amount;
                  const dueAmount = totalWithFine - item.discount_amount - item.paid_amount;

                  return (
                    <div key={item.id} className="rounded-md border p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Fee Item</span>
                        <span className="text-muted-foreground">{item.feeItem?.name ?? item.fee_item_id}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Line Total:</span>
                          <span className="font-medium">{formatAmount(item.line_total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fine:</span>
                          <span className={`font-medium ${item.fine_amount > 0 ? 'text-amber-700' : 'text-green-600'}`}>
                            {formatAmount(item.fine_amount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Discount:</span>
                          <span className="font-medium">{formatAmount(item.discount_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Paid:</span>
                          <span className="font-medium">{formatAmount(item.paid_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total (incl. fine):</span>
                          <span className="font-medium">{formatAmount(totalWithFine)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Due:</span>
                          <span className={`font-medium ${dueAmount > 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {formatAmount(Math.max(dueAmount, 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            {printingInvoice && (
              <Button variant="outline" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Printing Invoice...
              </Button>
            )}
            <Button onClick={() => setShowSummary(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CreateStudentPage;