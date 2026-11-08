import {
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  Hash,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { loggedInStudentUser } from "@/services/logged-user";
import { getMyStudentProfile } from "@/services/student";

type ProfileEnrollment = {
  is_primary?: boolean;
  registration_number?: string | null;
  batch?: { batch_name?: string | null } | null;
  academicClass?: {
    class_name?: string | null;
    department?: {
      department_name?: string | null;
      name?: string | null;
    } | null;
    program?: { program_name?: string | null; name?: string | null } | null;
  } | null;
  academic_class?: {
    class_name?: string | null;
    department?: {
      department_name?: string | null;
      name?: string | null;
    } | null;
    program?: { program_name?: string | null; name?: string | null } | null;
  } | null;
  class_name?: string | null;
  department_name?: string | null;
  program_name?: string | null;
};

type StudentProfile = {
  name?: string | null;
  email?: string | null;
  photo?: string | null;
  registration_number?: string | number | null;
  student_phone?: string | null;
  father_name?: string | null;
  father_phone?: string | null;
  mother_name?: string | null;
  mother_phone?: string | null;
  gender?: string | null;
  religion?: string | null;
  nid_no?: string | null;
  village_road?: string | null;
  post_office?: string | null;
  sub_district?: string | null;
  district?: string | null;
  created_at?: string | null;
  is_active?: boolean;
  studentEnrollments?: ProfileEnrollment[];
};

const display = (value: unknown) =>
  value === null || value === undefined || value === "" ? "—" : String(value);

const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);
};

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: unknown;
  icon: typeof UserRound;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon className="h-4 w-4 text-sky-600" />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {display(value)}
      </p>
    </div>
  );
}

export default async function StudentProfilePage() {
  const user = await loggedInStudentUser();
  if (!user?.id) redirect("/student-login");

  const response = await getMyStudentProfile();
  const student = (response?.data ?? {}) as StudentProfile;
  const enrollment =
    student.studentEnrollments?.find((item) => item.is_primary) ??
    student.studentEnrollments?.[0];
  const academicClass = enrollment?.academicClass ?? enrollment?.academic_class;
  const address = [
    student.village_road,
    student.post_office,
    student.sub_district,
    student.district,
  ]
    .filter(Boolean)
    .join(", ");
  const initials =
    student.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST";

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" />

      {!response?.success ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          We could not load your profile right now. Please refresh and try
          again.
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-sm">
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
              <div className="h-24 w-24 shrink-0 rounded-2xl bg-sky-100 p-1.5 shadow-sm">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-white text-2xl font-bold text-sky-700">
                  {student.photo ? (
                    <Image
                      src={student.photo}
                      alt={`${display(student.name)} profile`}
                      width={96}
                      height={96}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {display(student.name)}
                  </h1>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {student.is_active === false ? "Inactive" : "Active"}
                  </span>
                </div>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <Hash className="h-4 w-4 text-sky-600" />
                  Registration: {display(
                    enrollment?.registration_number ?? student.registration_number,
                  )}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <GraduationCap className="h-5 w-5 text-sky-600" />
              Academic information
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Program"
                value={
                  academicClass?.program?.program_name ??
                  academicClass?.program?.name ??
                  enrollment?.program_name
                }
                icon={GraduationCap}
              />
              <InfoItem
                label="Department"
                value={
                  academicClass?.department?.department_name ??
                  academicClass?.department?.name ??
                  enrollment?.department_name
                }
                icon={Building2}
              />
              <InfoItem
                label="Class"
                value={academicClass?.class_name ?? enrollment?.class_name}
                icon={BookOpen}
              />
              <InfoItem
                label="Batch"
                value={enrollment?.batch?.batch_name}
                icon={CalendarDays}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <UserRound className="h-5 w-5 text-sky-600" />
              Personal information
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Gender"
                value={student.gender}
                icon={UserRound}
              />
              <InfoItem
                label="Religion"
                value={student.religion}
                icon={UserRound}
              />
              <InfoItem
                label="Father's name"
                value={student.father_name}
                icon={UserRound}
              />
              <InfoItem
                label="Mother's name"
                value={student.mother_name}
                icon={UserRound}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Phone className="h-5 w-5 text-sky-600" />
              Contact information
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem label="Email" value={student.email} icon={Mail} />
              <InfoItem
                label="Phone"
                value={student.student_phone}
                icon={Phone}
              />
              <InfoItem label="Address" value={address} icon={MapPin} />
              <InfoItem
                label="Father's phone"
                value={student.father_phone}
                icon={Phone}
              />
              <InfoItem
                label="Mother's phone"
                value={student.mother_phone}
                icon={Phone}
              />
              <InfoItem
                label="Joined"
                value={formatDate(student.created_at)}
                icon={CalendarDays}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
