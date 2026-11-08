import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TResignationRequest } from "@/types/modules/teacher/resignation.type";
import { CalendarX2, FileText, Phone } from "lucide-react";
import {
  formatDate,
  formatDateLong,
  getInitials,
} from "../_constants";

const getSubmitted = (isoDate?: string) => {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ResignationCard = ({
  request,
}: {
  request: TResignationRequest;
}) => {
  const teacher = request.teacher;

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-200 hover:border-border hover:shadow-md">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        {/* Teacher identity */}
        <div className="flex shrink-0 items-center gap-3 lg:w-64">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-rose-100 text-sm font-semibold text-rose-600">
              {getInitials(teacher?.full_name ?? "TE")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {teacher?.full_name ?? "Unknown Teacher"}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span className="truncate">{teacher?.phone ?? "—"}</span>
            </p>
          </div>
        </div>

        {/* Resignation info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <CalendarX2 className="h-4 w-4 text-rose-500" />
            <p className="font-semibold text-foreground">Resignation</p>
            <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
              Effective {formatDate(request.resignation_date)}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {request.reason}
          </p>
        </div>

        {/* Submitted */}
        <div className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground lg:items-start lg:text-right">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
            Submitted
          </span>
          <span className="font-medium text-foreground">
            {getSubmitted(request.created_at)}
          </span>
        </div>
      </div>

      {/* Full reason */}
      <div className="mt-4 flex items-start gap-2.5 border-t pt-4">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
            Reason
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {request.reason}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResignationCard;
