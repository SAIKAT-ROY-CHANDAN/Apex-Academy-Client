"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  isInvalidCreatedAtMessage,
  toCreatedAtISO,
} from "@/components/shared/payment-date-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { studentFeeCollection } from "@/services/student";
import StudentFeeCollectionForm from "./StudentFeeCollectionForm";
import type { StudentFeeCollection } from "./types";
import type { StudentFeeCollectionFormValues } from "./validations";

interface AddStudentFeeCollectionDialogProps {
  feeTypes?: any[]; // kept optional for backward compat, now fetched via backend Program→Department→Class chain
  defaultStudentId: string;
  onCollected?: (newCollection: StudentFeeCollection) => void;
}

const AddStudentFeeCollectionDialog = ({
  feeTypes: _feeTypes,
  defaultStudentId,
  onCollected,
}: AddStudentFeeCollectionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const router = useRouter();

  const handleSubmit = async (values: StudentFeeCollectionFormValues) => {
    try {
      setIsSubmitting(true);

      const payload = {
        student_id: defaultStudentId,
        created_at: toCreatedAtISO((values as any).payment_date),
        studentFeeCollection: {
          fee_type_id: values.fee_type_id,
          items: values.items.map((item) => ({
            ...item,
            payment_method: values.payment_method,
            payment_note: values.payment_note,
          })),
        },
      };

      const response = await studentFeeCollection(payload);

      if (!response?.success) {
        toast.error(
          isInvalidCreatedAtMessage(response?.message)
            ? "Please select a valid payment date."
            : (response?.message ?? "Failed to collect fee"),
        );
        return;
      }

      toast.success(response?.message ?? "Fee collected successfully");
      onCollected?.(response.data as StudentFeeCollection);
      setResetSignal((current) => current + 1);
      router.push("/dashboard/student-management/fee-collection");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to collect fee",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Collect Fee</CardTitle>
        <CardDescription>
          Select fee type and item(s) to collect payment for this student.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StudentFeeCollectionForm
          defaultStudentId={defaultStudentId}
          resetSignal={resetSignal}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
};

export default AddStudentFeeCollectionDialog;
