"use client";

import {
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { printJobApplicationInvoice } from "@/app/(common)/career/apply/_components/job-application-invoice";

export interface JobApplicantItem {
  id: string;
  circular_id: string;
  full_name?: string | null;
  gender?: string | null;
  nid?: string | null;
  dob?: string | null;
  phone?: string | null;
  email?: string | null;
  blood_group?: string | null;
  village?: string | null;
  post_office?: string | null;
  sub_district?: string | null;
  district?: string | null;
  degree?: string | null;
  major_subject?: string | null;
  institution?: string | null;
  cgpa?: string | null;
  graduation_year?: string | null;
  image_url?: string | null;
  certificate_url?: string | null;
  cv_url?: string | null;
  apply_fee?: string | null;
  payment_status?: string;
  transaction_id?: string | null;
  bkash_payment_id?: string | null;
  created_at?: string;
  circular?: {
    positionName?: string | null;
    positionType?: string | null;
  } | null;
}

interface ApplicantDetailDialogProps {
  applicant: JobApplicantItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicantDetailDialog({
  applicant,
  open,
  onOpenChange,
}: ApplicantDetailDialogProps) {
  if (!applicant) return null;

  const handlePrint = () => {
    printJobApplicationInvoice(applicant, applicant.transaction_id ?? undefined);
  };

  const address = [
    applicant.village,
    applicant.post_office ? `P.O: ${applicant.post_office}` : null,
    applicant.sub_district,
    applicant.district,
  ]
    .filter(Boolean)
    .join(", ");

  const formattedDate = applicant.created_at
    ? new Date(applicant.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {applicant.image_url ? (
                // biome-ignore lint/performance/noImgElement: photo url from server upload
                <img
                  src={applicant.image_url}
                  alt={applicant.full_name ?? "Applicant"}
                  className="h-16 w-16 rounded-full border-2 border-emerald-500/20 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <User className="h-8 w-8" />
                </div>
              )}
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {applicant.full_name ?? "Applicant"}
                </DialogTitle>
                <p className="text-sm text-slate-500">
                  Applied for{" "}
                  <span className="font-semibold text-slate-700">
                    {applicant.circular?.positionName ?? "Job Position"}
                  </span>
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    <CheckCircle2 className="h-3 w-3" />
                    Payment Confirmed (bKash)
                  </span>
                  {applicant.transaction_id && (
                    <span className="font-mono text-xs text-slate-500">
                      TXN: {applicant.transaction_id}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section: Personal & Contact */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Personal & Contact Information
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <span className="block text-xs text-slate-400">Phone</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {applicant.phone ?? "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Email</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {applicant.email ?? "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">National ID (NID)</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  {applicant.nid ?? "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Gender</span>
                <span className="text-sm font-medium capitalize text-slate-800">
                  {applicant.gender ?? "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Date of Birth</span>
                <span className="text-sm font-medium text-slate-800">
                  {applicant.dob ?? "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Blood Group</span>
                <span className="text-sm font-medium text-slate-800">
                  {applicant.blood_group ?? "—"}
                </span>
              </div>
            </div>

            <div className="mt-3 border-t border-slate-200/60 pt-3">
              <span className="block text-xs text-slate-400">Permanent Address</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {address || "—"}
              </span>
            </div>
          </div>

          {/* Section: Academic Qualifications */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Academic Background
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <span className="block text-xs text-slate-400">Highest Degree</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                  {applicant.degree ?? "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Major / Subject</span>
                <span className="text-sm font-medium text-slate-800">
                  {applicant.major_subject ?? "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Institution</span>
                <span className="text-sm font-medium text-slate-800">
                  {applicant.institution ?? "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">CGPA / GPA</span>
                <span className="text-sm font-semibold text-emerald-700">
                  {applicant.cgpa ?? "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Passing Year</span>
                <span className="text-sm font-medium text-slate-800">
                  {applicant.graduation_year ?? "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Uploaded Documents */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Attachments & Documents
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* CV */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Curriculum Vitae (CV)</p>
                    <p className="text-xs text-slate-400">
                      {applicant.cv_url ? "Attached" : "Not uploaded"}
                    </p>
                  </div>
                </div>
                {applicant.cv_url ? (
                  <a
                    href={applicant.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-50 px-3 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </div>

              {/* Certificate */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Educational Certificate</p>
                    <p className="text-xs text-slate-400">
                      {applicant.certificate_url ? "Attached" : "Not uploaded"}
                    </p>
                  </div>
                </div>
                {applicant.certificate_url ? (
                  <a
                    href={applicant.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Payment & Application Details */}
          <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-blue-50/50 via-white to-emerald-50/50 p-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              bKash Payment Transaction Details
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <span className="block text-xs text-slate-400">Fee Amount</span>
                <span className="text-base font-bold text-slate-900">
                  ৳ {applicant.apply_fee ?? "0"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Transaction ID (TrxID)</span>
                <span className="font-mono text-sm font-semibold text-emerald-600">
                  {applicant.transaction_id ?? "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Payment Status</span>
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                  {applicant.payment_status ?? "PAID"}
                </Badge>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Submission Date</span>
                <span className="flex items-center gap-1 text-xs text-slate-600">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
