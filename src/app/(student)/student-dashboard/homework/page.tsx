import { format as formatDate, isPast, isToday } from "date-fns";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHomeworksByClass } from "@/services/homework";
import { loggedInStudentUser } from "@/services/logged-user";
import type { THomework } from "@/types/modules/teacher/homework.type";

function getHomeworkStatus(dueDate: string) {
  const due = new Date(dueDate);
  if (isPast(due) && !isToday(due)) return "overdue" as const;
  if (isToday(due)) return "dueToday" as const;
  return "pending" as const;
}

const STATUS_MAP = {
  overdue: { label: "Overdue", variant: "destructive" as const },
  dueToday: { label: "Due Today", variant: "default" as const },
  pending: { label: "Pending", variant: "secondary" as const },
} as const;

function HomeworkCard({ homework }: { homework: THomework }) {
  const statusKey = getHomeworkStatus(homework.due_date);
  const status = STATUS_MAP[statusKey];

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
      {/* Top accent bar */}
      <div
        className={`absolute inset-x-0 top-0 h-1 ${statusKey === "overdue"
            ? "bg-red-500"
            : statusKey === "dueToday"
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="line-clamp-1 text-base font-semibold">
              {homework.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={status.variant}
                className="text-[11px] uppercase tracking-wider"
              >
                {status.label}
              </Badge>
              {homework.subject && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 text-[11px]"
                >
                  <GraduationCap className="size-3" />
                  {homework.subject.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {homework.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {homework.description}
          </p>
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-foreground">Due Date</p>
              <p
                className={`${statusKey === "overdue" ? "text-red-500 font-medium" : ""}`}
              >
                {formatDate(new Date(homework.due_date), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-foreground">Created</p>
              <p>{formatDate(new Date(homework.created_at), "MMM d, yyyy")}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-foreground">Class</p>
              <p>{homework.academicClass?.class_name ?? "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-foreground">Section</p>
              <p>{homework.academicSection?.section_name ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* Teacher */}
        {homework.teacher && (
          <div className="flex items-center gap-1.5 border-t pt-2 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span>
              Assigned by{" "}
              <strong className="font-medium text-foreground">
                {homework.teacher.full_name}
              </strong>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function StudentHomework() {
  const student = await loggedInStudentUser();
  const classId = student?.class_id;

  let homeworks: THomework[] = [];
  let error: string | null = null;

  if (!classId) {
    error = "No class assigned to your account. Please contact your administrator.";
  } else {
    try {
      const response = await getHomeworksByClass(classId);
console.log(response);

      if (response?.success) {
        homeworks = response.data ?? [];
      } else {
        const message = response?.message ?? "Failed to load homework.";
        // Check for permission-related errors
        if (response?.statusCode === 403 || message.toLowerCase().includes("permission") || message.toLowerCase().includes("unauthorized")) {
          error = "You don't have permission to view homework. Please contact your administrator.";
        } else {
          error = message;
        }
      }
    } catch (err: unknown) {
      error =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Homework</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and track homework assignments for your class.
        </p>
      </div>

      {/* Content */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-base font-semibold">Error Loading Homework</h3>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : homeworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold">No Homework Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            There are no homework assignments for your class yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homeworks.map((hw) => (
            <HomeworkCard key={hw.id} homework={hw} />
          ))}
        </div>
      )}
    </div>
  );
}
