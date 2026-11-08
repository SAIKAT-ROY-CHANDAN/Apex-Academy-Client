"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, HelpCircle, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { getGradeScales } from "@/services/grade";

// NOTE: adjust these import paths / route names if your actual service files differ.
import { getAcademicClassDetails } from "@/services/academicClass";
import { getDepartments } from "@/services/department";
import { getPrograms } from "@/services/program";
import { getStudentsByClassIdAndSectionId } from "@/services/student";
import { getExamSchedules, getExamConfigsWithScheduledExam, getSubjectsWithScheduledExam } from "@/services/examSchedule"; // subjects/exams now derived from ExamSchedule
import { createResult, getResults, updateResult } from "@/services/teacher"; // confirmed: lives here per your snippet — move to services/studentExamResult.ts if you split it out later
import PageRoute from "../../components/dynamicRoute";
// Grade calc is server-driven via /grade (GradeScale) — reuse DB-driven scale, do NOT use hardcoded getGradeSystems.

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Raw API shapes (schema-accurate, no guessed fallback chains)
// ---------------------------------------------------------------------------

interface AcademicClassApi {
  id: string;
  class_name: string;
  year_level: number | null;
  department_id: string | null;
  program_id: string | null;
  group: string | null;
}

interface ProgramApi {
  id: string;
  program_name: string;
}

interface DepartmentApi {
  id: string;
  department_name: string;
}

interface ExamConfigApi {
  id: string;
  exam_name: string;
  academic_class_id: string;
  batch_id: string | null;
}

interface SubjectApi {
  id: string;
  name: string;
  class_id: string;
}

interface ExamScheduleApi {
  id: string;
  examConfigId: string;
  subjectId: string;
  fullMarks: number;
  passMarks: number;
}

// Confirmed shape: getStudentsByClassIdAndSectionId returns StudentEnrollment rows
// (already filtered by class + section on the backend) with relations included.
interface StudentEnrollmentWithRelationsApi {
  id: string;
  student_id: string;
  academic_class_id: string;
  academic_section_id: string | null;
  academic_session_id: string;
  batch_id: string;
  shift_id: string | null;
  registration_number: string;
  roll_number: string | null;
  student: {
    id: string;
    name: string;
    photo: string | null;
  };
}

interface StudentExamResultApi {
  id: string;
  student_id: string;
  exam_schedule_id: string;
  obtained_marks: number | string | null;
  grade_id?: string | null;
}

// ---------------------------------------------------------------------------
// GradeScale (DB-driven, percentage-based) — reused from /grade endpoint
// ---------------------------------------------------------------------------
interface GradeScale {
  minPercent: number;
  maxPercent: number;
  letterGrade: string;
  gradePoint: number;
}

// ---------------------------------------------------------------------------
// View model used inside the table
// ---------------------------------------------------------------------------

interface StudentResultRow {
  studentId: string;
  name: string;
  photo: string | null;
  registrationNumber: string;
  rollNumber: string | null;
  obtainMarks: string; // string for controlled input: "" = blank, "13.3" preserves decimals while typing
  grade?: string | null;
  isPublished?: boolean;
  resultId?: string | null;
}

interface FilterOption {
  value: string;
  label: string;
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select one",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-lg border border-input bg-white px-3 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-muted"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ColumnHeaderWithHint({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function GiveResultPage() {
  const router = useRouter();
  // Raw reference data
  const [academicClasses, setAcademicClasses] = useState<AcademicClassApi[]>([]);
  const [programs, setPrograms] = useState<ProgramApi[]>([]);
  const [departments, setDepartments] = useState<DepartmentApi[]>([]);
  const [examConfigs, setExamConfigs] = useState<ExamConfigApi[]>([]);
  const [subjects, setSubjects] = useState<SubjectApi[]>([]);
  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(true);
  const [gradeScales, setGradeScales] = useState<GradeScale[]>([]);

  // Filter selections
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState("");
  const [selectedExamConfigId, setSelectedExamConfigId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // Resolved exam schedule (the actual thing the submit payload needs)
  const [examScheduleId, setExamScheduleId] = useState<string | null>(null);
  const [fullMarks, setFullMarks] = useState<number | null>(null);
  const [isResolvingExamSchedule, setIsResolvingExamSchedule] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingExams, setIsLoadingExams] = useState(false);

  // Students + pagination
  const [students, setStudents] = useState<StudentResultRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const confirmSeqRef = useRef(0); // race guard: only latest Confirm's response wins

  // Search (client-side, debounced)
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ---------------------------------------------------------------------
  // Load all reference/filter data once
  // ---------------------------------------------------------------------
  useEffect(() => {
    const loadReferenceData = async () => {
      setIsLoadingReferenceData(true);
      try {
        const [classRes, programRes, departmentRes] = await Promise.all([
          getAcademicClassDetails([{ label: "limit", value: "500" }]),
          getPrograms([{ label: "limit", value: "200" }]),
          getDepartments([{ label: "limit", value: "200" }]),
        ]);

        setAcademicClasses((classRes?.data ?? []) as AcademicClassApi[]);
        setPrograms((programRes?.data ?? []) as ProgramApi[]);
        setDepartments((departmentRes?.data ?? []) as DepartmentApi[]);
      } catch (error) {
        console.error("Failed to load Give Result reference data:", error);
        setAcademicClasses([]);
        setPrograms([]);
        setDepartments([]);
      } finally {
        setIsLoadingReferenceData(false);
      }
    };

    void loadReferenceData();
  }, []);

  // ---------------------------------------------------------------------
  // GradeScale (DB-driven) — fetch once, reuse for live grade calc
  // ---------------------------------------------------------------------
  useEffect(() => {
    const fetchScales = async () => {
      try {
        const res = await getGradeScales();
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (Array.isArray(data) && data.length > 0) setGradeScales(data as GradeScale[]);
      } catch (e) {
        console.error("Failed to load grade scales", e);
      }
    };
    void fetchScales();
  }, []);

  const getGradeForMarks = (obtainStr: string, total: number | null): string | null => {
    if (!obtainStr.trim() || total == null || total <= 0) return null;
    const obtain = Number(obtainStr);
    if (Number.isNaN(obtain) || obtain < 0 || obtain > total) return null;
    const percentage = Math.round((obtain / total) * 100 * 100) / 100;
    const match = gradeScales.find((s) => percentage >= s.minPercent && percentage <= s.maxPercent);
    return match ? match.letterGrade : null;
  };

  // ---------------------------------------------------------------------
  // Derived dropdown options (cascading)
  // ---------------------------------------------------------------------

  const programOptions: FilterOption[] = useMemo(
    () => programs.map((p) => ({ value: p.id, label: p.program_name })),
    [programs],
  );

  // Department dropdown: scoped to the selected program (if any)
  const departmentOptions: FilterOption[] = useMemo(() => {
    const scoped = selectedProgramId
      ? academicClasses
          .filter((c) => c.program_id === selectedProgramId)
          .map((c) => c.department_id)
          .filter((id): id is string => id != null)
      : departments.map((d) => d.id);
    const idSet = new Set(scoped);
    return departments.filter((d) => idSet.has(d.id)).map((d) => ({ value: d.id, label: d.department_name }));
  }, [departments, academicClasses, selectedProgramId]);

  // Class/Year dropdown: academicClass rows scoped to program + department — value is the class id,
  // so Level/Year (year_level) is derived directly from the selected class (e.g. "1st Year" → 1),
  // matching the Class Routine fix and removing the redundant Label Year field.
  const classNameOptions: FilterOption[] = useMemo(() => {
    const scoped = academicClasses.filter(
      (c) =>
        (!selectedProgramId || c.program_id === selectedProgramId) &&
        (!selectedDepartmentId || c.department_id === selectedDepartmentId),
    );
    return scoped.map((c) => ({ value: c.id, label: c.class_name }));
  }, [academicClasses, selectedProgramId, selectedDepartmentId]);

  const resolvedAcademicClassId = selectedAcademicClassId;

  const selectedAcademicClassYearLevel = useMemo(() => {
    if (!selectedAcademicClassId) return "";
    const cls = academicClasses.find((c) => c.id === selectedAcademicClassId);
    return cls?.year_level != null ? String(cls.year_level) : "";
  }, [academicClasses, selectedAcademicClassId]);

  const examOptions: FilterOption[] = useMemo(
    () => examConfigs.map((e) => ({ value: e.id, label: e.exam_name })),
    [examConfigs],
  );

  const subjectOptions: FilterOption[] = useMemo(
    () => subjects.map((s) => ({ value: s.id, label: s.name })),
    [subjects],
  );

  // ---------------------------------------------------------------------
  // Load Subjects via ExamSchedule (filtered by Program/Department/Class/Year)
  // Year is derived from the selected Class/Year's year_level (e.g. "1st Year" → 1)
  // ---------------------------------------------------------------------
  useEffect(() => {
    setSelectedExamConfigId("");
    setSelectedSubjectId("");
    setExamConfigs([]);
    setSubjects([]);
    setExamScheduleId(null);
    setFullMarks(null);
    setStudents([]); // clear old exam's marks immediately to avoid stale display

    if (!resolvedAcademicClassId) return;

    const loadSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const subjectQuery: { label: string; value: string }[] = [
          { label: "academicClassId", value: resolvedAcademicClassId },
        ];
        if (selectedProgramId) subjectQuery.push({ label: "programId", value: selectedProgramId });
        if (selectedDepartmentId) subjectQuery.push({ label: "departmentId", value: selectedDepartmentId });
        if (selectedAcademicClassYearLevel) subjectQuery.push({ label: "year", value: selectedAcademicClassYearLevel });
        const subjectRes = await getSubjectsWithScheduledExam(subjectQuery);
        setSubjects((subjectRes?.data ?? []) as SubjectApi[]);
      } catch (error) {
        console.error("Failed to load subjects with scheduled exam:", error);
        setSubjects([]);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    void loadSubjects();
  }, [resolvedAcademicClassId, selectedProgramId, selectedDepartmentId, selectedAcademicClassYearLevel]);

  // ---------------------------------------------------------------------
  // Load Exams via ExamSchedule once Subject is selected (scoped by same filters + subject)
  // ---------------------------------------------------------------------
  useEffect(() => {
    setSelectedExamConfigId("");
    setExamConfigs([]);
    setExamScheduleId(null);
    setFullMarks(null);
    setStudents([]); // stale exam's students must not remain visible

    if (!resolvedAcademicClassId || !selectedSubjectId) return;

    const loadExams = async () => {
      setIsLoadingExams(true);
      try {
        const examQuery: { label: string; value: string }[] = [
          { label: "academicClassId", value: resolvedAcademicClassId },
          { label: "subjectId", value: selectedSubjectId },
        ];
        if (selectedProgramId) examQuery.push({ label: "programId", value: selectedProgramId });
        if (selectedDepartmentId) examQuery.push({ label: "departmentId", value: selectedDepartmentId });
        if (selectedAcademicClassYearLevel) examQuery.push({ label: "year", value: selectedAcademicClassYearLevel });
        const examRes = await getExamConfigsWithScheduledExam(examQuery);
        setExamConfigs((examRes?.data ?? []) as ExamConfigApi[]);
      } catch (error) {
        console.error("Failed to load exams with scheduled exam:", error);
        setExamConfigs([]);
      } finally {
        setIsLoadingExams(false);
      }
    };

    void loadExams();
  }, [resolvedAcademicClassId, selectedSubjectId, selectedProgramId, selectedDepartmentId, selectedAcademicClassYearLevel]);

  // ---------------------------------------------------------------------
  // Resolve ExamSchedule (id + fullMarks) once Exam + Course are both picked
  // ---------------------------------------------------------------------
  useEffect(() => {
    setExamScheduleId(null);
    setFullMarks(null);
    setStudents([]); // new exam context → discard previous exam's marks

    if (!selectedExamConfigId || !selectedSubjectId) return;

    const resolveExamSchedule = async () => {
      setIsResolvingExamSchedule(true);
      try {
        const res = await getExamSchedules([
          { label: "examConfigId", value: selectedExamConfigId },
          { label: "subjectId", value: selectedSubjectId },
        ]);

        const schedules = (res?.data ?? []) as ExamScheduleApi[];
        const match = schedules[0];
        if (match) {
          setExamScheduleId(match.id);
          setFullMarks(match.fullMarks);
        }
      } catch (error) {
        console.error("Failed to resolve exam schedule:", error);
      } finally {
        setIsResolvingExamSchedule(false);
      }
    };

    void resolveExamSchedule();
  }, [selectedExamConfigId, selectedSubjectId]);

  // ---------------------------------------------------------------------
  // Search debounce (client-side, ~250ms)
  // ---------------------------------------------------------------------
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // ---------------------------------------------------------------------
  // Confirm -> load students for Class + Section (+ narrow by Batch client-side)
  // ---------------------------------------------------------------------
  const handleConfirm = async () => {
    if (!resolvedAcademicClassId) return;
    if (!examScheduleId) {
      setSubmitError("Please select Subject and Exam before confirming.");
      return;
    }

    const seq = ++confirmSeqRef.current;
    // (b) clear before fetch so old exam's marks don't linger
    setIsLoadingStudents(true);
    setSubmitError(null);
    setStudents([]);
    setCurrentPage(1);

    try {
      const [studentRes, resultRes] = await Promise.all([
        getStudentsByClassIdAndSectionId(resolvedAcademicClassId),
        getResults([{ label: "exam_schedule_id", value: examScheduleId }]),
      ]);

      // (d) race guard — discard if a newer Confirm was started
      if (seq !== confirmSeqRef.current) return;

      const rawEnrollments = (studentRes?.data ?? []) as StudentEnrollmentWithRelationsApi[];
      const resultList = (resultRes?.data ?? []) as StudentExamResultApi[];
      const resultMap = new Map<string, StudentExamResultApi>();
      resultList.forEach((result) => {
        if (result.student_id) {
          resultMap.set(result.student_id, result);
        }
      });

      const rows: StudentResultRow[] = rawEnrollments
        .map((enrollment) => {
          const existingResult: any = resultMap.get(enrollment.student_id);
          const existingMarks = existingResult?.obtained_marks;
          const marksStr = existingMarks !== null && existingMarks !== undefined && String(existingMarks) !== "" ? String(existingMarks) : "";
          // Prefer DB-driven grade from result's computed/enriched field; fall back to live calc via GradeScale
          const existingGrade =
            existingResult?.letterGrade ??
            existingResult?.computed?.letterGrade ??
            existingResult?.grade?.grade_name ??
            (marksStr ? getGradeForMarks(marksStr, fullMarks) : null);
          return {
            studentId: enrollment.student_id,
            name: enrollment.student.name,
            photo: enrollment.student.photo,
            registrationNumber: enrollment.registration_number,
            rollNumber: enrollment.roll_number,
            obtainMarks: marksStr,
            grade: existingGrade ?? null,
            isPublished: Boolean(existingResult?.id),
            resultId: existingResult?.id ?? null,
          };
        });

      if (seq !== confirmSeqRef.current) return;
      setStudents(rows);
    } catch (error) {
      if (seq !== confirmSeqRef.current) return;
      console.error("Failed to load students:", error);
      setStudents([]);
    } finally {
      if (seq === confirmSeqRef.current) setIsLoadingStudents(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!debouncedSearch) return students;
    const q = debouncedSearch;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.rollNumber ?? "").toLowerCase().includes(q) ||
        s.registrationNumber.toLowerCase().includes(q)
    );
  }, [students, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));

  const currentPageStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, currentPage]);

  const handleObtainMarksChange = (studentId: string, value: string) => {
    // Allow decimals: "", "0", "9", "9.", "9.5", "13.3" — reject letters/multiple dots
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setStudents((prev) =>
      prev.map((student) => {
        if (student.studentId !== studentId) return student;
        let nextGrade: string | null = null;
        const trimmed = value.trim();
        if (trimmed === "") {
          nextGrade = null;
        } else if (trimmed.endsWith(".")) {
          // Incomplete decimal while typing — don't calculate yet
          nextGrade = null;
        } else {
          const num = Number(trimmed);
          if (!Number.isNaN(num)) {
            if (fullMarks != null && num > fullMarks) {
              nextGrade = "Invalid";
            } else if (fullMarks != null && num >= 0) {
              nextGrade = getGradeForMarks(trimmed, fullMarks);
            }
          }
        }
        // Keep grade in local row state only — no backend call per keystroke
        return { ...student, obtainMarks: value, grade: nextGrade };
      }),
    );
  };

  const getResultIdFromResponse = (response: any) => {
    return (
      response?.data?.id ??
      response?.id ??
      response?.data?.result_id ??
      response?.data?.student_exam_result_id ??
      response?.result?.id ??
      response?.result_id ??
      null
    );
  };

  const handleUpdateResult = async (student: StudentResultRow) => {

    const raw = String(student.obtainMarks).trim();
    const marks = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(marks)) {
      setSubmitError(`Invalid marks for ${student.name}`);
      return;
    }
    if (fullMarks !== null && marks > fullMarks) {
      setSubmitError(`Obtain marks ${marks} exceeds total ${fullMarks}`);
      return;
    }

    if (!examScheduleId) {
      setSubmitError("No exam schedule selected.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const liveGrade = getGradeForMarks(String(marks), fullMarks);
      const gradePayload = liveGrade && liveGrade !== "Invalid" ? { letterGrade: liveGrade } : {};
      const isUpdate = Boolean(student.resultId);
      let response: any;
      let newResultId: string | null = student.resultId ?? null;
      if (isUpdate) {
        console.log("PATCH student result", { resultId: student.resultId, marks });
        response = await updateResult(student.resultId!, {
          obtained_marks: marks,
          ...gradePayload,
        });
        console.log("PATCH response", response);
      } else {
        console.log("POST student result", { studentId: student.studentId, marks });
        response = await createResult({
          student_id: student.studentId,
          exam_schedule_id: examScheduleId,
          obtained_marks: marks,
          ...gradePayload,
        });
        console.log("POST response", response);
        newResultId = getResultIdFromResponse(response) ?? newResultId;
      }
      if (response?.success) {
        const returnedGrade =
          (response as any)?.data?.letterGrade ??
          (response as any)?.data?.computed?.letterGrade ??
          (response as any)?.data?.grade?.grade_name ??
          liveGrade ??
          getGradeForMarks(String(marks), fullMarks);
        setStudents((prev) =>
          prev.map((row) =>
            row.studentId === student.studentId
              ? { ...row, isPublished: true, resultId: newResultId, grade: returnedGrade }
              : row,
          ),
        );
        toast.success(isUpdate ? "Result updated successfully" : "Result saved successfully");
      } else {
        const message = response?.message ?? (isUpdate ? "Failed to update result." : "Failed to save result.");
        toast.error(message);
        setSubmitError(message);
      }
    } catch (error) {
      console.error("Failed to save result:", error);
      const message = "Something went wrong while saving result.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build the "1 2 3 ... 8 9 10" style page list
  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    const lastThree = [totalPages - 2, totalPages - 1, totalPages].filter((p) => p > 3);
    pages.push(1, 2, 3);
    if (lastThree.length && lastThree[0] > 4) {
      pages.push("ellipsis");
    }
    lastThree.forEach((p) => pages.push(p));
    return Array.from(new Set(pages)).filter((p) => p === "ellipsis" || (p >= 1 && p <= totalPages));
  }, [totalPages]);

  const canConfirm =
    Boolean(resolvedAcademicClassId && examScheduleId) &&
    !isLoadingReferenceData &&
    !isLoadingStudents &&
    !isResolvingExamSchedule &&
    !isLoadingSubjects &&
    !isLoadingExams;

  const hasActiveFilters = Boolean(
    selectedProgramId || selectedDepartmentId || selectedAcademicClassId || selectedSubjectId || selectedExamConfigId,
  );
  const handleClearFilters = () => {
    setSelectedProgramId("");
    setSelectedDepartmentId("");
    setSelectedAcademicClassId("");
    setSelectedSubjectId("");
    setSelectedExamConfigId("");
    setExamScheduleId(null);
    setFullMarks(null);
    setStudents([]);
    setSubmitError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageRoute
            title="Give Result"
            breadcrumbs={[
              { label: "Overview", href: "/teacher" },
              { label: "Give Result" },
            ]}
          />
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/teacher");
              }
            }}
            className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        {/* Filters card */}
        <div className="mb-6 rounded-2xl border border-border/50 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Program"
              value={selectedProgramId}
              onChange={(v) => {
                setSelectedProgramId(v);
                setSelectedDepartmentId("");
                setSelectedAcademicClassId("");
                setSelectedSubjectId("");
              }}
              options={programOptions}
              disabled={isLoadingReferenceData}
            />
            <FilterSelect
              label="Department"
              value={selectedDepartmentId}
              onChange={(v) => {
                setSelectedDepartmentId(v);
                setSelectedAcademicClassId("");
                setSelectedSubjectId("");
              }}
              options={departmentOptions}
              disabled={isLoadingReferenceData || !selectedProgramId}
            />
            <FilterSelect
              label="Class/Year"
              value={selectedAcademicClassId}
              onChange={(v) => {
                setSelectedAcademicClassId(v);
                setSelectedSubjectId("");
              }}
              options={classNameOptions}
              disabled={isLoadingReferenceData}
            />

            <div>
              <FilterSelect
                label="Subject"
                value={selectedSubjectId}
                onChange={setSelectedSubjectId}
                options={subjectOptions}
                placeholder={
                  !resolvedAcademicClassId
                    ? "Select Program/Department/Class first"
                    : isLoadingSubjects
                      ? "Loading subjects..."
                      : subjectOptions.length === 0
                        ? "No exam scheduled for this selection"
                        : "Select subject"
                }
                disabled={!resolvedAcademicClassId || isLoadingSubjects || (subjectOptions.length === 0 && !!resolvedAcademicClassId)}
              />
              {resolvedAcademicClassId && !isLoadingSubjects && subjectOptions.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">No exam scheduled for this selection</p>
              )}
            </div>
            
            <div>
              <FilterSelect
                label="Exam"
                value={selectedExamConfigId}
                onChange={setSelectedExamConfigId}
                options={examOptions}
                placeholder={
                  !selectedSubjectId
                    ? "Select subject first"
                    : isLoadingExams
                      ? "Loading exams..."
                      : examOptions.length === 0
                        ? "No exam scheduled for this subject"
                        : "Select exam"
                }
                disabled={!selectedSubjectId || isLoadingExams || (examOptions.length === 0 && !!selectedSubjectId)}
              />
              {selectedSubjectId && !isLoadingExams && examOptions.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">No exam scheduled for this subject</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Clear Filter
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="h-11 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingStudents ? "Loading..." : "Confirm"}
            </button>
          </div>
        </div>

        {/* Students table card */}
        <div className="rounded-2xl border border-border/50 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-foreground">Students</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, roll, or reg no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-8 pr-8 text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedSearch("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {fullMarks != null && (
                <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">Full marks: {fullMarks}</span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left text-sm">
              <thead>
                <tr className="border-b border-border/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">Student&apos;s Name</th>
                  <th className="px-6 py-3">Student&apos;s ID</th>
                  <th className="px-6 py-3">
                    <ColumnHeaderWithHint label="Total Marks" />
                  </th>
                  <th className="px-6 py-3">
                    <ColumnHeaderWithHint label="Grade" />
                  </th>
                  <th className="px-6 py-3">
                    <ColumnHeaderWithHint label="Obtain Marks" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoadingStudents ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground">
                      Loading students...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground">
                      Select filters above and press Confirm to load students.
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground">
                      No student found matching &apos;{debouncedSearch || searchQuery}&apos;
                    </td>
                  </tr>
                ) : currentPageStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground">
                      No students on this page.
                    </td>
                  </tr>
                ) : (
                  currentPageStudents.map((student) => (
                    <tr key={`${student.studentId}-${examScheduleId ?? `${selectedSubjectId}-${selectedExamConfigId}`}`} className="border-b border-border/40 last:border-0">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.photo ?? `https://i.pravatar.cc/64?u=${student.studentId}`}
                            alt={student.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{student.name}</p>
                            {student.rollNumber && (
                              <p className="text-xs text-muted-foreground">Roll: {student.rollNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Reg: {student.registrationNumber}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{fullMarks ?? "—"}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            min={0}
                            max={fullMarks ?? undefined}
                            value={student.obtainMarks}
                            placeholder={fullMarks ? `0 - ${fullMarks}` : "0"}
                            onChange={(e) => handleObtainMarksChange(student.studentId, e.target.value)}
                            disabled={!examScheduleId}
                            className="h-9 w-24 rounded-lg border border-input px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-muted"
                          />

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              void handleUpdateResult(student);
                            }}
                            disabled={isSubmitting}
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {student.isPublished || student.resultId ? "Update" : "Save"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-1.5">
              {pageNumbers.map((page, idx) =>
                page === "ellipsis" ? (
                  <span key={`ellipsis-${idx}`} className="px-1.5 text-sm text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-md text-sm font-medium transition ${
                      page === currentPage ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {submitError && (
          <p className="mt-4 text-sm font-medium text-red-500">{submitError}</p>
        )}
        {!examScheduleId && selectedExamConfigId && selectedSubjectId && !isResolvingExamSchedule && (
          <p className="mt-4 text-sm font-medium text-amber-600">
            No exam schedule found for this Exam + Course combination.
          </p>
        )}

      </div>
    </div>
  );
}