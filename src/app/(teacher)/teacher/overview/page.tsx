import Image from "next/image";
import manImage from "@/assets/Management/3.jpg";
import Calendar from "./components/calendar";
import Menus from "./components/menus";

const Overview = () => {
  return (
    <div className="mt-8">
      <div className="bg-blue-900 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex gap-4 items-center">
          <Image
            src={manImage}
            alt="use image"
            className="h-16 w-16 md:h-20 md:w-20 rounded-2xl object-cover"
          />
          <div className="flex flex-col text-white">
            <h2 className="text-lg md:text-xl font-semibold mb-1">
              Olivia Rhye
            </h2>
            <p className="text-sm">
              Phone: <span>+880 1234-567890</span>
            </p>
            <p className="text-sm">
              E-Mail: <span>olivia@gmail.com</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 w-fit">
          <p className="bg-blue-50 rounded-full py-1.5 px-4 text-blue-600 text-sm font-medium text-center whitespace-nowrap">
            Designation: Lecture
          </p>
          <p className="bg-blue-50 rounded-full py-1.5 px-4 text-blue-600 text-sm font-medium text-center whitespace-nowrap">
            Shift: Day
          </p>
          <p className="bg-blue-50 rounded-full py-1.5 px-4 text-blue-600 text-sm font-medium text-center whitespace-nowrap">
            Teacher Type: Full-Time
          </p>
          <p className="bg-blue-50 rounded-full py-1.5 px-4 text-blue-600 text-sm font-medium text-center whitespace-nowrap">
            Department: Food and Nutrition
          </p>
        </div>
      </div>
      {/* card section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-5 mt-6">
        <div className="sm:col-span-1 md:col-span-8 grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm flex flex-col gap-2.5 ">
            <p className="uppercase text-sm text-muted-foreground">
              Total Approved Leaves
            </p>
            <h3 className="text-3xl font-semibold text-blue-600">50</h3>
          </div>
          <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm flex flex-col gap-2.5 ">
            <p className="uppercase text-sm text-muted-foreground">
              Total Pending Leaves
            </p>
            <h3 className="text-3xl font-semibold text-amber-500">50</h3>
          </div>
          <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm flex flex-col gap-2.5 ">
            <p className="uppercase text-sm text-muted-foreground">
              Total Rejected Leaves
            </p>
            <h3 className="text-3xl font-semibold text-red-500">50</h3>
          </div>
          <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm flex flex-col gap-2.5 ">
            <p className="uppercase text-sm text-muted-foreground">Average Present</p>
            <h3 className="text-3xl font-semibold text-emerald-500">50</h3>
          </div>
          <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm flex flex-col gap-2.5 ">
            <p className="uppercase text-sm text-muted-foreground">Average Absent</p>
            <h3 className="text-3xl font-semibold text-violet-500">50</h3>
          </div>
          <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm flex flex-col gap-2.5 ">
            <p className="uppercase text-sm text-muted-foreground">Total Overtime</p>
            <h3 className="text-3xl font-semibold text-cyan-500">50</h3>
          </div>
        </div>
        <div className="sm:col-span-1 md:col-span-4">
          <Calendar />
        </div>
      </div>
      <Menus />
    </div>
  );
};

export default Overview;
