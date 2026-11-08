import { ExternalLink } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { loggedInStudentUser } from "@/services/logged-user";
import { getMyResults } from "@/services/studentExamResult";
import type { TStudentExamResult } from "@/types/modules/student/student-result.type";
import StudentResultsView from "./_components/StudentResultsView";

const GOVT_RESULT_URL = "https://result.nu.ac.bd/";

const StudentResultsPage = async () => {
  const user = await loggedInStudentUser();
  console.log("Logged-in student user:", user);
  if (!user?.id) redirect("/student-login");

  const pageSize = 500;
  const results: TStudentExamResult[] = [];

  try {
    const res = await getMyResults([
      { label: "limit", value: String(pageSize) },
      { label: "orderBy", value: JSON.stringify({ created_at: "desc" }) },
    ]);

    // ── Problem 1 diagnostics ──────────────────────────────────────────
    // getMyResults() already injects filter.student_id via JWT (services/studentExamResult/index.ts:30)
    // but the server previously ignored it (studentExamResult.service.ts:71 had no where clause).
    // Now fixed server-side; keep defensive client filter as defense-in-depth.
    const data = res?.data ?? [];
    console.log(
      "[RESULTS] raw res.data length:",
      data.length,
      "meta:",
      res?.meta,
    );
    console.log("[RESULTS] jwt user.id:", user.id, "type:", typeof user.id);
    if (data.length > 0) {
      console.log(
        "[RESULTS] sample student_ids:",
        (data as TStudentExamResult[]).slice(0, 5).map((r) => ({
          id: r.id,
          student_id: r.student_id,
          type: typeof r.student_id,
          // handle legacy nested object case
          nested: (r as unknown as { student_id?: { id?: string } }).student_id,
          student_rel_id: r.student?.id,
        })),
      );
    }

    for (const row of data as TStudentExamResult[]) {
      // Normalize to handle string vs number vs nested-object mismatches
      const rawId: unknown = (row as unknown as { student_id?: unknown })
        .student_id;
      const rowId =
        typeof rawId === "object" &&
        rawId !== null &&
        "id" in (rawId as Record<string, unknown>)
          ? String((rawId as Record<string, unknown>).id ?? "")
          : String(rawId ?? row.student?.id ?? "");
      if (rowId && rowId === String(user.id)) {
        results.push(row);
      }
    }
    console.log(
      "[RESULTS] kept after client-side filter:",
      results.length,
      "of",
      data.length,
    );
  } catch (error) {
    console.error("Failed to load student results:", error);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Results"
        components={
          <a
            href={GOVT_RESULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ExternalLink className="h-4 w-4" />
            Government Result
          </a>
        }
      />

      <StudentResultsView results={results} studentName={user.name} />
    </div>
  );
};

export default StudentResultsPage;
