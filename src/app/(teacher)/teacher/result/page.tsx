"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageRoute from "../components/dynamicRoute";
import { ResultTable } from "./components/givenResultTable";

interface Option {
  label: string;
  value: string;
}

const Departments = [
  { label: "Department 1", value: "dept1" },
  { label: "Department 2", value: "dept2" },
  { label: "Department 3", value: "dept3" },
  { label: "Department 4", value: "dept4" },
  { label: "Department 5", value: "dept5" },
];

// Classes shown in the Class dropdown depend on the selected Department
const DEPARTMENT_CLASSES: Record<string, Option[]> = {
  dept1: [
    { label: "Class 1", value: "class1" },
    { label: "Class 2", value: "class2" },
  ],
  dept2: [
    { label: "Class 3", value: "class3" },
    { label: "Class 4", value: "class4" },
  ],
  dept3: [{ label: "Class 5", value: "class5" }],
  dept4: [],
  dept5: [],
};

const Batches = [
  { label: "Select a Batch", value: "" },
  { label: "Batch 1", value: "batch1" },
  { label: "Batch 2", value: "batch2" },
  { label: "Batch 3", value: "batch3" },
  { label: "Batch 4", value: "batch4" },
  { label: "Batch 5", value: "batch5" },
];
const Years = [
  { label: "Select a Year", value: "" },
  { label: "1st", value: "1st" },
  { label: "2nd ", value: "2nd" },
  { label: "3rd ", value: "3rd" },
  { label: "4th ", value: "4th" },
  { label: "5th ", value: "5th" },
];
const Sections = [
  { label: "Select a Section", value: "" },
  { label: "Section A", value: "sectionA" },
  { label: "Section B", value: "sectionB" },
  { label: "Section C", value: "sectionC" },
  { label: "Section D", value: "sectionD" },
  { label: "Section E", value: "sectionE" },
];
const Exam = [
  { label: "Select a Course", value: "" },
  { label: "Course 1", value: "course1" },
  { label: "Course 2", value: "course2" },
  { label: "Course 3", value: "course3" },
  { label: "Course 4", value: "course4" },
  { label: "Course 5", value: "course5" },
];
const Course = [
  { label: "Select a Teacher", value: "" },
  { label: "Teacher 1", value: "teacher1" },
  { label: "Teacher 2", value: "teacher2" },
  { label: "Teacher 3", value: "teacher3" },
  { label: "Teacher 4", value: "teacher4" },
  { label: "Teacher 5", value: "teacher5" },
];

const page = () => {
  const router = useRouter();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/teacher");
    }
  };

  // Classes scoped to the selected department
  const classOptions: Option[] = useMemo(() => {
    const classes = DEPARTMENT_CLASSES[selectedDepartmentId] ?? [];
    return [{ label: "Select a Class", value: "" }, ...classes];
  }, [selectedDepartmentId]);

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartmentId(value);
    setSelectedClassId("");
    setSelectedYear("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageRoute
          title="Result"
          breadcrumbs={[
            { label: "Overview", href: "/teacher" },
            { label: "Result" },
          ]}
        />
        <button
          type="button"
          onClick={handleBack}
          className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-100"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* filter Section */}
      <div className="rounded-lg border border-border/50 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="Group/Department-select"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Group/Department
            </label>
            <Select
              items={Departments}
              value={selectedDepartmentId}
              onValueChange={(value) => handleDepartmentChange(value as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Group/Department</SelectLabel>
                  {Departments.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="class-select"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Class
            </label>
            <Select
              items={classOptions}
              value={selectedClassId}
              onValueChange={(value) => setSelectedClassId(value as string)}
              disabled={!selectedDepartmentId}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Class</SelectLabel>
                  {classOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="Year-select"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Year
            </label>
            <Select
              items={Years}
              value={selectedYear}
              onValueChange={(value) => setSelectedYear(value as string)}
            >
              <SelectTrigger className="w-full ">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Year</SelectLabel>
                  {Years.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="batch-select"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Batch
            </label>
            <Select items={Batches}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Batch</SelectLabel>
                  {Batches.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="section-select"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Section
            </label>
            <Select items={Sections}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Section</SelectLabel>
                  {Sections.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="course-select"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Exam
            </label>
            <Select items={Exam}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Course</SelectLabel>
                  {Exam.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="Teacher-select"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Course Name
            </label>
            <Select items={Course}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Teacher</SelectLabel>
                  {Course.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              // onClick={handleSubmit}
              className="h-9 rounded-lg px-5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors w-full"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
      <ResultTable />
      </div>
    </div>
  );
};

export default page;
