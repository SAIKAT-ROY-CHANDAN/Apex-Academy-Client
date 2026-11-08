"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  Printer,
  User,
  Users,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ApplicantDetailDialog,
  type JobApplicantItem,
} from "./ApplicantDetailDialog";
import { printJobApplicationInvoice } from "@/app/(common)/career/apply/_components/job-application-invoice";

interface JobApplicantsTableProps {
  applicants: JobApplicantItem[];
}

export function JobApplicantsTable({ applicants }: JobApplicantsTableProps) {
  const [selectedApplicant, setSelectedApplicant] =
    useState<JobApplicantItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleView = (applicant: JobApplicantItem) => {
    setSelectedApplicant(applicant);
    setDialogOpen(true);
  };

  const handlePrint = (applicant: JobApplicantItem) => {
    printJobApplicationInvoice(applicant, applicant.transaction_id ?? undefined);
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {applicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              No Paid Applicants Found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              No applicants have completed their bKash application fee payment
              for this job circular yet.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="h-12 w-14 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  #
                </TableHead>
                <TableHead className="h-12 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Applicant
                </TableHead>
                <TableHead className="h-12 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Contact Info
                </TableHead>
                <TableHead className="h-12 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Education & CGPA
                </TableHead>
                <TableHead className="h-12 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  bKash Payment
                </TableHead>
                <TableHead className="h-12 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  Documents
                </TableHead>
                <TableHead className="h-12 w-28 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((applicant, index) => (
                <TableRow
                  key={applicant.id}
                  className="border-slate-100 transition hover:bg-blue-50/30"
                >
                  <TableCell className="text-center font-medium text-slate-500">
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>

                  {/* Applicant Name & Photo */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {applicant.image_url ? (
                        // biome-ignore lint/performance/noImgElement: candidate photo
                        <img
                          src={applicant.image_url}
                          alt={applicant.full_name ?? "Candidate"}
                          className="h-10 w-10 rounded-full border border-slate-200 object-cover shadow-xs"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <span className="block font-semibold text-slate-800">
                          {applicant.full_name ?? "Unnamed"}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="capitalize">{applicant.gender ?? "—"}</span>
                          {applicant.nid && (
                            <>
                              <span>•</span>
                              <span>NID: {applicant.nid}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact Info */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{applicant.phone ?? "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="max-w-44 truncate">{applicant.email ?? "—"}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Education & CGPA */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                        <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                        <span>{applicant.degree ?? "—"}</span>
                        {applicant.major_subject && (
                          <span className="text-slate-500">
                            ({applicant.major_subject})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="max-w-40 truncate">{applicant.institution ?? "—"}</span>
                        {applicant.cgpa && (
                          <span className="font-semibold text-emerald-600">
                            CGPA {applicant.cgpa}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* bKash Payment */}
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <CheckCircle2 className="h-3 w-3" />
                        ৳ {applicant.apply_fee ?? "0"}
                      </span>
                      {applicant.transaction_id && (
                        <span className="font-mono text-[11px] text-slate-400">
                          {applicant.transaction_id}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Quick Documents */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {applicant.cv_url ? (
                        <a
                          href={applicant.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                          title="Open CV"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          CV
                        </a>
                      ) : (
                        <span className="text-xs text-slate-300">No CV</span>
                      )}
                      {applicant.certificate_url && (
                        <a
                          href={applicant.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100"
                          title="Open Certificate"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Cert
                        </a>
                      )}
                    </div>
                  </TableCell>

                  {/* Action Buttons */}
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(applicant)}
                        className="h-8 w-8 rounded-lg p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        title="View Full Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrint(applicant)}
                        className="h-8 w-8 rounded-lg p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                        title="Print Receipt"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Profile Detail Dialog */}
      <ApplicantDetailDialog
        applicant={selectedApplicant}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
