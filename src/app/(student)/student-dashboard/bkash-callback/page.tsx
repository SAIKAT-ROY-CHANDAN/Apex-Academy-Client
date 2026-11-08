"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { executeBkashHostelPayment } from "@/services/hostelFeeCollection";
import { executeStudentBkashPayment } from "@/services/student";

function BkashCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "failure">("processing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const paymentID = searchParams.get("paymentID");
    const bKashStatus = searchParams.get("status");
    const paymentType = searchParams.get("type"); // 'hostel' | 'tuition'

    if (!paymentID || bKashStatus !== "success") {
      setStatus("failure");
      setMessage(bKashStatus === "cancel" ? "Payment was cancelled." : "Payment failed or invalid response.");
      const timer = setTimeout(() => router.push("/student-dashboard"), 5000);
      return () => clearTimeout(timer);
    }

    const execute = async () => {
      try {
        if (paymentType === "hostel") {
          // Direct hostel fee payment execution
          const hostelRes = await executeBkashHostelPayment(paymentID);
          if (hostelRes?.success) {
            setStatus("success");
            setMessage("Hostel fee paid successfully via bKash!");
          } else {
            setStatus("failure");
            setMessage(hostelRes?.message ?? "Hostel payment verification failed. Please contact support.");
          }
        } else {
          // Direct student fee payment execution (tuition or general fee)
          const studentRes = await executeStudentBkashPayment(paymentID);
          if (studentRes?.success) {
            setStatus("success");
            setMessage(
              studentRes?.data?.alreadyPaid
                ? "This fee payment was already processed."
                : "Student fee paid successfully via bKash!"
            );
          } else {
            setStatus("failure");
            setMessage(studentRes?.message ?? "Student fee payment verification failed. Please contact support.");
          }
        }
      } catch (err: unknown) {
        setStatus("failure");
        setMessage(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please contact support."
        );
      }

      const timer = setTimeout(() => router.push("/student-dashboard"), 5000);
      return () => clearTimeout(timer);
    };

    execute();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          {status === "processing" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-slate-400" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Verifying Payment</h2>
                <p className="mt-1 text-sm text-slate-500">Please wait while we confirm your payment...</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Payment Successful</h2>
                <p className="mt-1 text-sm text-slate-500">{message}</p>
                <p className="mt-3 text-xs text-slate-400">Redirecting to dashboard...</p>
              </div>
            </>
          )}

          {status === "failure" && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Payment Failed</h2>
                <p className="mt-1 text-sm text-slate-500">{message}</p>
              </div>
            </>
          )}

          <Button
            variant="outline"
            onClick={() => router.push("/student-dashboard")}
            className="mt-2"
          >
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BkashCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <BkashCallbackContent />
    </Suspense>
  );
}
