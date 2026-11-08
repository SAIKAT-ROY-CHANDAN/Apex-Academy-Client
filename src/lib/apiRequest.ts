import { cookies } from "next/headers";
import { getAccessToken } from "./getAccessToken";
import { DEMO_FALLBACK_DATA } from "./demoData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string || "http://localhost:5000/api/v1";

// Detect runtime environment
const isServer = typeof window === "undefined";

// Function to get token from cookies (Server & Client)
const getAuthToken = async () => {
  if (isServer) {
    try {
      const cookieStore = await cookies();
      return cookieStore.get("accessToken")?.value;
    } catch {
      return undefined;
    }
  } else {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];
  }
};

export const apiRequest = async (
  endpoint: string,
  options: RequestInit & { authRequired?: boolean } = {}
): Promise<any> => {
  const headers = new Headers(options.headers);

  // Set Content-Type unless it's FormData
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Only attach token if explicitly required
  if (options.authRequired) {
    const token = await getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const cleanEndpoint = endpoint.split("?")[0];

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options,
      headers,
      cache: "no-store" as RequestCache,
      // @ts-ignore Next.js revalidation
      next: { revalidate: 0 } as unknown as Record<string, unknown>,
    });

    // Handle token expiration only if auth was required
    if (response.status === 401 && options.authRequired) {
      try {
        const newToken = await getAccessToken();
        if (newToken && typeof newToken === "string") {
          headers.set("Authorization", `Bearer ${newToken}`);
          return apiRequest(endpoint, { ...options, headers });
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }

      if (typeof window !== "undefined") {
        window.location.href = "/admin-login";
      } else {
        if (DEMO_FALLBACK_DATA[cleanEndpoint]) {
          return DEMO_FALLBACK_DATA[cleanEndpoint];
        }
        throw new Error("Unauthorized access. Please log in again.");
      }
    }

    const resJson = await response.json();

    // If API responded but data is empty, use demo fallback if available
    if (
      (!resJson ||
        !resJson.data ||
        (Array.isArray(resJson.data) && resJson.data.length === 0)) &&
      DEMO_FALLBACK_DATA[cleanEndpoint]
    ) {
      return DEMO_FALLBACK_DATA[cleanEndpoint];
    }

    return resJson;
  } catch (error) {
    // Graceful fallback to demo data on network error / server offline
    if (DEMO_FALLBACK_DATA[cleanEndpoint]) {
      return DEMO_FALLBACK_DATA[cleanEndpoint];
    }
    return {
      success: false,
      message: "Connection failed - demo fallback engaged",
      data: null,
    };
  }
};
