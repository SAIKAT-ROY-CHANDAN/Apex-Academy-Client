import { getWebsitePageCovers } from "@/services/websitePageCover";
import PageCoverSettings from "./_components/PageCoverSettings";

export default async function PageCoverPage() {
  let initialCovers: Record<string, string> | undefined = undefined;

  try {
    const response = await getWebsitePageCovers();
    if (response?.success && response?.data) {
      // Backend returns map of pageKey -> imageUrl (string|null).
      // Filter out nulls and keep only truthy URLs for the client.
      const raw = response.data as Record<string, string | null>;
      const filtered: Record<string, string> = {};
      for (const [key, url] of Object.entries(raw)) {
        if (url) filtered[key] = url;
      }
      initialCovers = filtered;
    }
  } catch (error) {
    console.error("Failed to load page covers:", error);
  }

  return <PageCoverSettings initialCovers={initialCovers} />;
}
