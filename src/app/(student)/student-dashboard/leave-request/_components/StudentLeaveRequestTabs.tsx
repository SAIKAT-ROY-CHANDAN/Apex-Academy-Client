"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type TabKey = "All Requests" | "Pending" | "Approved" | "Rejected";

const TABS: { key: TabKey; label: string; icon: string; color: string }[] = [
  { key: "All Requests", label: "All", icon: "📋", color: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200" },
  { key: "Pending", label: "Pending", icon: "⏳", color: "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200" },
  { key: "Approved", label: "Approved", icon: "✅", color: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200" },
  { key: "Rejected", label: "Rejected", icon: "❌", color: "bg-red-50 text-red-600 hover:bg-red-100 border-red-200" },
];

const TAB_STATUS_MAP: Record<TabKey, string | undefined> = {
  "All Requests": undefined,
  Pending: "PENDING",
  Approved: "APPROVED",
  Rejected: "REJECTED",
};

const StudentLeaveRequestTabs = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? searchParams.get("leave_status") ?? "";
  const activeTab =
    (Object.keys(TAB_STATUS_MAP) as TabKey[]).find((tab) => TAB_STATUS_MAP[tab] === currentStatus) ?? "All Requests";

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      const params = new URLSearchParams(searchParams.toString());
      const status = TAB_STATUS_MAP[tab];
      if (status) params.set("status", status);
      else params.delete("status");
      params.delete("leave_status");
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 border ${
              isActive ? "bg-white shadow-md" : "hover:shadow-sm"
            } ${tab.color}`}
            style={{ boxShadow: isActive ? "0 4px 14px -4px currentColor" : undefined }}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default StudentLeaveRequestTabs;
