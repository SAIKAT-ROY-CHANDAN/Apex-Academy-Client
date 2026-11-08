"use server";

import { apiRequest } from "@/lib/apiRequest";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { cache } from "react";

export const loggedInAdminUser = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {};
  }

  try {
    const decodedUser = jwtDecode(accessToken) as { [key: string]: any };
    if (decodedUser.exp && typeof decodedUser.exp === "number" && decodedUser.exp * 1000 < Date.now()) {
      cookieStore.delete({ name: "accessToken", path: "/" });
      cookieStore.delete({ name: "refreshToken", path: "/" });
      return {};
    }
    const role = decodedUser.role ?? decodedUser.userType;
    if (role !== "admin" && role !== "administrator") {
      return {};
    }
    return decodedUser;
  } catch {
    cookieStore.delete({ name: "accessToken", path: "/" });
    cookieStore.delete({ name: "refreshToken", path: "/" });
    return {};
  }
};

export const loggedInStudentUser = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {};
  }

  try {
    const decodedUser = jwtDecode(accessToken) as { [key: string]: any };
    if (decodedUser.exp && typeof decodedUser.exp === "number" && decodedUser.exp * 1000 < Date.now()) {
      cookieStore.delete({ name: "accessToken", path: "/" });
      cookieStore.delete({ name: "refreshToken", path: "/" });
      return {};
    }
    const role = decodedUser.role ?? decodedUser.userType;
    if (role !== "student") {
      return {};
    }
    return decodedUser;
  } catch {
    cookieStore.delete({ name: "accessToken", path: "/" });
    cookieStore.delete({ name: "refreshToken", path: "/" });
    return {};
  }
};

export const logoutUser = async () => {
  const cookieStore = await cookies();
  cookieStore.delete({ name: "accessToken", path: "/" });
  cookieStore.delete({ name: "refreshToken", path: "/" });

  return true;
};

export const getUserBasedPermissions = cache(async () => {
  const response = await apiRequest("role/permissions", {
    method: "GET",
    authRequired: true,
  });

  return response;
});

export const loggedInTeacherUser = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {};
  }

  try {
    const decodedUser = jwtDecode(accessToken) as { [key: string]: any };
    if (decodedUser.exp && typeof decodedUser.exp === "number" && decodedUser.exp * 1000 < Date.now()) {
      cookieStore.delete({ name: "accessToken", path: "/" });
      cookieStore.delete({ name: "refreshToken", path: "/" });
      return {};
    }
    const role = decodedUser.role ?? decodedUser.userType;
    if (role !== "teacher") {
      return {};
    }
    return decodedUser;
  } catch {
    cookieStore.delete({ name: "accessToken", path: "/" });
    cookieStore.delete({ name: "refreshToken", path: "/" });
    return {};
  }
};

export const logoutTeacherUser = async () => {
  const cookieStore = await cookies();
  cookieStore.delete({ name: "accessToken", path: "/" });
  cookieStore.delete({ name: "refreshToken", path: "/" });
  return true;
};
