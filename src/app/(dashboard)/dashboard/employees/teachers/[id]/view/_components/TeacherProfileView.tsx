"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  School,
  GraduationCap,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Pencil,
  ArrowLeft,
  Banknote,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import type { TTeacher } from "@/types/modules/teacher/teacher.type";
import { Badge } from "@/components/ui/badge";
import { ADMINISTRATIVE_POSITION_LABELS } from "../../../_constants";
import { formatTeacherType } from "@/constant/teacher/teacherType";

type TeacherProfileViewProps = {
  teacher: TTeacher & {
    designation?: { name: string };
    shift?: { name: string };
    department?: { department_name: string };
    salary?: {
      customSalaries?: {
        salary_component: string;
        salary_amount: number;
      }[];
    };
  };
};

const labelMap: Record<string, string> = {
  SSC: "SSC",
  HSC: "HSC",
  DIPLOMA: "Diploma",
  DEGREE_PASS: "Degree Pass",
  HONORS: "Honours",
  MASTERS: "Masters",
  PHD: "PhD",
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined | null;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value || "—"}</p>
    </div>
  </div>
);

const SectionCard = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <Card className="border-border/50 shadow-sm">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">{children}</CardContent>
  </Card>
);

const DocumentBadge = ({
  label,
  url,
  icon: Icon,
}: {
  label: string;
  url: string | undefined | null;
  icon: React.ElementType;
}) => {
  if (!url) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground/60">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}: Not provided</span>
      </div>
    );
  }

  const isImage = /\.(webp|png|jpg|jpeg)$/i.test(url);
  return (
    <Link
      href={url}
      target="_blank"
      className="group flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 transition-colors hover:border-primary/30 hover:bg-primary/5"
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
      <span className="text-xs font-medium">{label}</span>
      {isImage && (
        <div className="ml-auto h-6 w-6 overflow-hidden rounded border">
          <img
            src={url}
            alt={label}
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </Link>
  );
};

const TeacherProfileView = ({ teacher }: TeacherProfileViewProps) => {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden border-border/50 shadow-sm py-0">
        <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent px-6 pb-6 pt-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 border-2 border-background shadow-md">
              <AvatarImage src={teacher.photo} alt={teacher.full_name} />
              <AvatarFallback className="text-lg">
                {getInitials(teacher.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  {teacher.full_name}
                </h1>
                <Badge
                  variant={
                    teacher.is_active === false ? "secondary" : "default"
                  }
                  className="text-[10px]"
                >
                  {teacher.is_active === false ? "Inactive" : "Active"}
                </Badge>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {teacher.designation?.name && (
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {teacher.designation.name}
                  </span>
                )}
                {teacher.administrative_position && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {ADMINISTRATIVE_POSITION_LABELS[
                        teacher.administrative_position
                      ] ?? teacher.administrative_position}
                    </Badge>
                  </>
                )}
                <span className="text-muted-foreground/40">•</span>
                {teacher.teacher_type && (
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {formatTeacherType(teacher.teacher_type)}
                  </Badge>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Link href={`/dashboard/employees/teachers/${teacher.id}`}>
                  <Button size="sm" variant="default" className="h-8 gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/dashboard/employees/teachers">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 text-muted-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: 2 columns on md+ */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <SectionCard icon={BookOpen} title="Personal Information">
          <InfoItem
            icon={Mail}
            label="Email"
            value={teacher.email}
          />
          <InfoItem
            icon={Phone}
            label="Phone"
            value={teacher.phone}
          />
          <InfoItem
            icon={CreditCard}
            label="bKash Number"
            value={teacher.bkash_number}
          />
          <InfoItem
            icon={MapPin}
            label="Address"
            value={teacher.address}
          />
          <InfoItem
            icon={Calendar}
            label="Gender"
            value={teacher.gender ? labelMap[teacher.gender] ?? teacher.gender : undefined}
          />
        </SectionCard>

        {/* Academic & Employment */}
        <SectionCard icon={GraduationCap} title="Academic & Employment">
          <InfoItem
            icon={School}
            label="Last Qualification"
            value={
              teacher.last_qualification
                ? labelMap[teacher.last_qualification] ?? teacher.last_qualification
                : undefined
            }
          />
          <InfoItem
            icon={Briefcase}
            label="Designation"
            value={teacher.designation?.name}
          />
          <InfoItem
            icon={Briefcase}
            label="Administrative Position"
            value={
              teacher.administrative_position
                ? ADMINISTRATIVE_POSITION_LABELS[
                    teacher.administrative_position
                  ] ?? teacher.administrative_position
                : undefined
            }
          />
          <InfoItem
            icon={Calendar}
            label="Shift"
            value={teacher.shift?.name}
          />
          {teacher.department?.department_name && (
            <InfoItem
              icon={School}
              label="Department"
              value={teacher.department.department_name}
            />
          )}
          <InfoItem
            icon={Briefcase}
            label="Teacher Type"
            value={
              teacher.teacher_type
                ? formatTeacherType(teacher.teacher_type)
                : undefined
            }
          />
        </SectionCard>
      </div>

      {/* Salary Details */}
      {teacher.salary?.customSalaries &&
        teacher.salary.customSalaries.length > 0 && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Banknote className="h-3.5 w-3.5 text-primary" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Salary Details
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/40 rounded-lg border border-border/50">
                <div className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Component</span>
                  <span>Amount</span>
                </div>
                {teacher.salary.customSalaries.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.salary_component}
                    </span>
                    <span className="font-semibold">
                      ৳{item.salary_amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between px-4 py-2.5 text-sm font-bold">
                  <span>Total</span>
                  <span>
                    ৳
                    {teacher.salary.customSalaries
                      .reduce((sum, s) => sum + s.salary_amount, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Documents & Photos */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-3.5 w-3.5 text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold">
              Documents & Photos
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            <DocumentBadge
              label="NID Front"
              url={teacher.nid_front}
              icon={ImageIcon}
            />
            <DocumentBadge
              label="NID Back"
              url={teacher.nid_back}
              icon={ImageIcon}
            />
            <DocumentBadge
              label="Photo"
              url={teacher.photo}
              icon={ImageIcon}
            />
            <DocumentBadge
              label="Academic Document"
              url={teacher.academic_document}
              icon={FileText}
            />
            <div className="sm:col-span-2">
              <DocumentBadge
                label="Previous Institution Resign Letter"
                url={teacher.previous_institution_resign_letter}
                icon={FileText}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherProfileView;