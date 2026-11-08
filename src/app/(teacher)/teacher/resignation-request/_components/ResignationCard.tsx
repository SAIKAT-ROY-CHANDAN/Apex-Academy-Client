import { FaCalendar, FaFileLines } from "react-icons/fa6";
import { TResignationRequest } from "@/types/modules/teacher/resignation.type";

const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const ResignationCard = ({
  request,
}: {
  request: TResignationRequest;
}) => {
  const resignationDate = new Date(request.resignation_date);

  const submitted =
    request.created_at
      ? new Date(request.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div className="px-6 py-5 transition-colors duration-150 hover:bg-gray-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: date badge + reason */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-100 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-rose-600">
              {resignationDate.getDate()}
            </span>
            <span className="text-xs font-medium text-rose-600 uppercase tracking-wide">
              {resignationDate.toLocaleDateString("en-US", { month: "short" })}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900">
                Resignation Request
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                Effective {formatDate(request.resignation_date)}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600 line-clamp-2 flex-1">
              {request.reason}
            </p>
          </div>
        </div>

        {/* Right: submitted date */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 flex-shrink-0">
          <FaCalendar className="w-3.5 h-3.5 text-gray-400" />
          Submitted: {submitted}
        </div>
      </div>

      {/* Reason divider */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-3">
        <FaFileLines className="w-4.5 h-4.5 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-600 whitespace-pre-wrap flex-1">
          {request.reason}
        </p>
      </div>
    </div>
  );
};

export default ResignationCard;
