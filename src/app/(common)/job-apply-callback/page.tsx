"use client";

import { CheckCircle2, Download, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  type JobApplicationRecord,
  printJobApplicationInvoice,
} from "@/app/(common)/career/apply/_components/job-application-invoice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { executeJobApplication } from "@/services/jobApplication";

interface ExecutePayload {
  application: JobApplicationRecord;
  transactionId?: string;
  alreadyPaid?: boolean;
}

// Clears the fixed site navbar and keeps the card centered on every breakpoint.
const shellClass =
  "mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-8";

function JobApplyCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "failure">(
    "processing",
  );
  const [message, setMessage] = useState("");
  const [payload, setPayload] = useState<ExecutePayload | null>(null);

  const handleDownloadInvoice = () => {
    if (payload?.application) {
      printJobApplicationInvoice(payload.application, payload.transactionId);
    }
  };

  useEffect(() => {
    const paymentID = searchParams.get("paymentID");
    const bKashStatus = searchParams.get("status");

    if (!paymentID || bKashStatus !== "success") {
      setStatus("failure");
      setMessage(
        bKashStatus === "cancel"
          ? "Payment was cancelled."
          : "Payment failed or invalid response.",
      );
      return;
    }

    const execute = async () => {
      try {
        const res = await executeJobApplication(paymentID);
        if (res?.success) {
          setStatus("success");
          setPayload(res.data as ExecutePayload);
          setMessage(
            res.data?.alreadyPaid
              ? "This application was already paid."
              : "Your application was submitted successfully and the fee was paid via bKash.",
          );
        } else {
          setStatus("failure");
          setMessage(
            res?.message ??
              "Payment verification failed. Please contact support.",
          );
        }
      } catch {
        setStatus("failure");
        setMessage("An unexpected error occurred. Please contact support.");
      }
    };

    execute();
  }, [searchParams]);

  if (status === "processing") {
    return (
      <section className={shellClass}>
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-slate-400" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Verifying Payment
              </h2>
              <p className="mt-1 text-sm break-words whitespace-normal text-slate-500">
                Please wait while we confirm your payment...
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className={shellClass}>
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Application Submitted
                </h2>
                <p className="mt-1 text-sm break-words whitespace-normal text-slate-500">
                  {message}
                </p>
              </div>
              <Button
                onClick={handleDownloadInvoice}
                className="mt-2 w-full gap-2 sm:w-auto"
              >
                <Download className="h-4 w-4" />
                Download Invoice
              </Button>
            </>
          )}

          {status === "failure" && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Payment Failed
                </h2>
                <p className="mt-1 text-sm break-words whitespace-normal text-slate-500">
                  {message}
                </p>
              </div>
            </>
          )}

          <Link
            href="/career"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-border bg-background shadow-xs px-2.5 py-1.5 text-sm font-medium text-foreground transition-all hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
          >
            Back to Career
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}

export default function JobApplyCallbackPage() {
  return (
    <Suspense
      fallback={
        <section className={shellClass}>
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </section>
      }
    >
      <JobApplyCallbackContent />
    </Suspense>
  );
}
