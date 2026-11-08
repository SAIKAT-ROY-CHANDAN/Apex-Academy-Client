"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Filter, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardOverview } from "@/services/dashboard";
import type {
  DashboardFilter,
  DashboardOverviewData,
} from "@/types/dashboard/overview.type";
import { SummaryCards } from "./SummaryCards";
import { PieChartCard } from "./PieChartCard";
import { BarChartCard } from "./BarChartCard";
import { AttendanceRings } from "./AttendanceRings";
import { LeaveOverview } from "./LeaveOverview";
import { FilterDrawer } from "./FilterDrawer";
import {
  genderToPieData,
  religionToPieData,
  teacherTypeToPieData,
} from "./dashboard-utils";

export function DashboardOverview() {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    startDate?: string;
    endDate?: string;
    filter: DashboardFilter;
  }>({ filter: {} });

  const fetchData = useCallback(async (filters: typeof activeFilters) => {
    setLoading(true);
    setError(false);
    try {
      const response = await getDashboardOverview(filters);
      if (response?.success && response?.data) {
        setData(response.data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeFilters);
  }, [fetchData, activeFilters]);

  const handleApplyFilters = (filters: typeof activeFilters) => {
    setActiveFilters(filters);
  };

  const formatDateRange = () => {
    if (activeFilters.startDate && activeFilters.endDate) {
      const start = new Date(activeFilters.startDate);
      const end = new Date(activeFilters.endDate);
      const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
      return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`;
    }
    return "All Time";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-300 bg-white py-20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">Failed to load dashboard data</p>
          <p className="mt-1 text-sm text-slate-500">Please try again.</p>
        </div>
        <Button variant="outline" onClick={() => fetchData(activeFilters)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const studentGenderData = genderToPieData(data.students?.gender ?? {});
  const studentReligionData = religionToPieData(data.students?.religion ?? []);
  const teacherTypeData = teacherTypeToPieData(data.teachers?.typeWise ?? []);
  const staffGenderData = genderToPieData(data.staff?.gender ?? {});

  const classWiseData = (data.students?.classWise ?? []).map((item) => ({
    name: item.className ?? "Unassigned",
    count: item.count,
  }));

  const subjectWiseData = (data.teachers?.subjectWise ?? []).map((item) => ({
    name: item.subjectName ?? "Unassigned",
    count: item.count,
  }));

  const teacherGenderData = genderToPieData(data.teachers?.gender ?? {});

  const attendanceComparisonData = [
    { name: "Students", Present: data.attendance?.students?.present ?? 0, Absent: data.attendance?.students?.absent ?? 0 },
    { name: "Teachers", Present: data.attendance?.teachers?.present ?? 0, Absent: data.attendance?.teachers?.absent ?? 0 },
    { name: "Staff", Present: data.attendance?.staff?.present ?? 0, Absent: data.attendance?.staff?.absent ?? 0 },
  ];

  const classNames = (data.students?.classWise ?? [])
    .map((item) => item.className)
    .filter((name): name is string => !!name);

  const subjectNames = (data.teachers?.subjectWise ?? [])
    .map((item) => item.subjectName)
    .filter((name): name is string => !!name);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarDays className="h-4 w-4" />
            {formatDateRange()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <SummaryCards summary={data.summary} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PieChartCard title="Student Gender Distribution" data={studentGenderData} />
        <PieChartCard title="Student Religion Distribution" data={studentReligionData} />
        <PieChartCard title="Teacher Type Distribution" data={teacherTypeData} />
        <PieChartCard title="Staff Gender Distribution" data={staffGenderData} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChartCard
          title="Class-wise Student Count"
          data={classWiseData}
          bars={[{ dataKey: "count", name: "Students", fill: "#3B82F6" }]}
        />
        <BarChartCard
          title="Teacher Subject-wise Count"
          data={subjectWiseData}
          bars={[{ dataKey: "count", name: "Teachers", fill: "#22C55E" }]}
          layout="horizontal"
          yDataKey="name"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AttendanceRings attendance={data.attendance} />
        <BarChartCard
          title="Attendance Comparison"
          data={attendanceComparisonData}
          bars={[
            { dataKey: "Present", name: "Present", fill: "#22C55E" },
            { dataKey: "Absent", name: "Absent", fill: "#EF4444" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeaveOverview leaves={data.leaves} />
        <BarChartCard
          title="Teacher Gender Distribution"
          data={teacherGenderData}
          bars={[{ dataKey: "value", name: "Count", fill: "#8B5CF6" }]}
          xDataKey="name"
        />
      </div>

      <FilterDrawer
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onApply={handleApplyFilters}
        classNames={classNames}
        subjectNames={subjectNames}
      />
    </div>
  );
}