import { Suspense } from "react";
import FeatureCard from "@/components/dashboard/FeatureCard";
import TEACHER_FEATURES from "@/constant/feature/teacherPorta";
import { getCalendarHolidays } from "@/services/holiday";
import { getInstitutionDetails } from "@/services/institution";
import { loggedInTeacherUser } from "@/services/logged-user";
import { getTeacherById } from "@/services/teacher";
import type { ICalendarHoliday } from "@/utils/academicCalendar";
import AcademicCalendar from "./_components/AcademicCalendar";
import OverviewCount, {
  OverviewCountSkeleton,
} from "./_components/OverviewCount";
import TeacherInfoBanner from "./_components/TeacherInfoBanner";

const TeacherPortalPage = async () => {
  const loggedIn = await loggedInTeacherUser();
  const [teacher, institutionConfig, holidaysResponse] = await Promise.all([
    getTeacherById(loggedIn.id),
    getInstitutionDetails().catch(() => null),
    getCalendarHolidays(new Date().getFullYear()).catch(() => null),
  ]);

  const weekendDays = institutionConfig?.data?.weekend_days ?? [];
  const holidays: ICalendarHoliday[] =
    holidaysResponse?.success && Array.isArray(holidaysResponse.data)
      ? holidaysResponse.data
      : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Teacher Info Banner */}
        <TeacherInfoBanner teacher={teacher?.data} />

        {/* Main Content Grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Left Column - Overview Stats */}
          <div className="lg:col-span-8">
            <Suspense fallback={<OverviewCountSkeleton />}>
              <OverviewCount teacherId={loggedIn.id} />
            </Suspense>
          </div>

          {/* Right Column - Academic Calendar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <AcademicCalendar
                weekendDays={weekendDays}
                initialHolidays={holidays}
              />
            </div>
          </div>
        </div>

        {/* Teacher Features Section */}
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Teacher Features
              </h2>
              <p className="mt-1 text-gray-600">
                Access all your teaching tools and modules
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{TEACHER_FEATURES.length} modules available</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {TEACHER_FEATURES.map((feature, index) => (
              <FeatureCard
                key={feature.name}
                name={feature.name}
                icon={feature.icon}
                href={feature.href}
                color={feature.color}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPortalPage;
