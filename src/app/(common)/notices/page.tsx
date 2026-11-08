import { redirect } from "next/navigation";

// Base /notices route is now intentionally empty.
// All notice categories live under /notices/[category] (general, admission, hsc, improvement, honours, masters).
// Keep this file as an empty placeholder that redirects to the default category for UX.
export default function NoticesIndexPage() {
  redirect("/notices/general");
}
