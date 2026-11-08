import Image from "next/image";
import { format } from "date-fns";
import userIcon from "@/assets/about/userIcon.png";
import { getAllWebsitePrincipals } from "@/services/websitePrincipal";

interface PrincipalRow {
  id: string;
  name: string;
  photoUrl?: string | null;
  fromDate: string;
  toDate: string;
}

function formatDuration(fromDate: string, toDate: string): string {
  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return `${fromDate}  to  ${toDate}`;
    return `${format(from, "dd-MM-yyyy")}  to  ${format(to, "dd-MM-yyyy")}`;
  } catch {
    return `${fromDate}  to  ${toDate}`;
  }
}

const PrincipalsList = async () => {
  let principals: PrincipalRow[] = [];

  try {
    // Public fetch — no auth. Use a large limit so the public "List of Our Principals"
    // table shows the full history, not just the first 10 (dashboard is paginated).
    const response = await getAllWebsitePrincipals([
      { label: "limit", value: "100" },
    ]);
    if (response?.success && Array.isArray(response?.data)) {
      principals = response.data as PrincipalRow[];
    }
  } catch (error) {
    console.error("Failed to load principals for about_college:", error);
  }

  return (
    <div className="container mx-auto px-4 mb-20">
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full min-w-[500px] border-collapse text-left">
          <thead>
            <tr className="bg-[#fafafa8e] text-[#404040] font-almarai">
              <th className="px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
                SL NO.
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap">
                Name
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap">
                Duration
              </th>
            </tr>
          </thead>
          <tbody>
            {principals.length === 0 ? (
              <tr className="border-b border-gray-200 font-almarai bg-white">
                <td
                  colSpan={3}
                  className="px-4 py-8 sm:px-6 text-center text-sm text-[#404040]/60"
                >
                  No principals found.
                </td>
              </tr>
            ) : (
              principals.map((item, index) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-200 last:border-b-0 font-almarai ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base text-[#404040]">
                    {(index + 1).toString().padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base text-[#404040]">
                    <div className="flex items-center gap-5">
                      {typeof item.photoUrl === "string" && item.photoUrl ? (
                        // backend-served image URL — allowed via next.config remotePatterns (localhost:5000)
                        // biome-ignore lint/performance/noImgElement: dynamic remote URL, next/image host varies by env
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Image
                          src={userIcon}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base text-[#404040] whitespace-nowrap">
                    {formatDuration(item.fromDate, item.toDate)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrincipalsList;
