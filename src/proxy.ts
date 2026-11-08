import { jwtDecode } from "jwt-decode";
import { type NextRequest, NextResponse } from "next/server";

type UserRole = "admin" | "teacher" | "student";

interface DecodedToken {
  id: string;
  role?: string;
  userType?: string;
  [key: string]: unknown;
}



const ROLE_HOME: Record<UserRole, string> = {
  admin: "/dashboard",
  teacher: "/teacher",
  student: "/student-dashboard",
};

const ROLE_LOGIN: Record<UserRole, string> = {
  admin: "/admin-login",
  teacher: "/teacher-login",
  student: "/student-login",
};

const PROTECTED_ROUTES: { prefix: string; role: UserRole }[] = [
  { prefix: "/dashboard", role: "admin" },
  { prefix: "/teacher", role: "teacher" },
  { prefix: "/student-dashboard", role: "student" },
];

const LOGIN_PATHS = new Set(Object.values(ROLE_LOGIN));

const normalizeUserRole = (decoded: DecodedToken | null): UserRole | null => {
  const role = decoded?.role ?? decoded?.userType;

  if (role === "admin" || role === "administrator") return "admin";
  if (role === "teacher") return "teacher";
  if (role === "student") return "student";

  return null;
};

async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    const decoded = jwtDecode(token) as DecodedToken;
    if (!decoded.id || !normalizeUserRole(decoded)) return null;
    if (decoded.exp && typeof decoded.exp === "number" && decoded.exp * 1000 < Date.now()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never intercept or loop on login pages
  if (LOGIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;

  const decoded = accessToken ? await verifyToken(accessToken) : null;
  const isAuthenticated = !!decoded;
  const role = normalizeUserRole(decoded);
  const matchedRoute = PROTECTED_ROUTES.find(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`),
  );

  if (matchedRoute && !isAuthenticated) {
    const loginUrl = new URL(ROLE_LOGIN[matchedRoute.role], request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("accessToken");
    return res;
  }

  if (matchedRoute && isAuthenticated && role !== matchedRoute.role) {
    return NextResponse.redirect(new URL(ROLE_HOME[role as UserRole], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/admin-login",
    "/teacher-login",
    "/student-login",
  ],
};