"use client";

import { FormInput, FormSelect } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createHostelFeeCollection,
  getStudentHostelDue,
  searchStudentsForHostelFee,
  type StudentSearchQueryParams,
} from "@/services/hostelFeeCollection";
import { getPrograms } from "@/services/program";
import { getDepartmentByProgramId } from "@/services/department";
import { getClassesByDepartmentId } from "@/services/academicClass";
import { getAcademicSections } from "@/services/academicSection";
import { getBatchDetails } from "@/services/batch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { hostelFeeCollectionValidation } from "@/validation/hostelFeeCollection/hostelFeeCollection.validation";
import { printHostelInvoiceFromRecord } from "../../_components/hostel-invoice-print";
import type { HostelFeeCollectionRecord } from "../../_components/deposited.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Minus,
  Plus,
  Receipt,
  Check,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  FieldValues,
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HostelFeeCollectionItem {
  item_name: string;
  item_amount: number;
}

interface MealCollection {
  meal_count: number;
  meal_rate: number;
  total_amount: number;
}

interface HostelFeeFormData {
  student_id: string;
  collection_date: string;
  total_amount: number;
  scholarship_amount: number;
  paid_amount: number;
  due_amount: number;
  hostelFeeCollectionItems: HostelFeeCollectionItem[];
  mealCollection?: MealCollection;
}

interface StudentOption {
  id: string;
  name: string;
  father_name?: string;
  mother_name?: string;
  email?: string;
  student_id?: string;
  student_phone?: string;
  roll?: string;
  registration_number?: string;
}

interface CascadeOption {
  id: string;
  name: string;
}

interface FilterState {
  program_id: string;
  department_id: string;
  academic_class_id: string;
  academic_section_id: string;
  academic_batch_id: string;
  search: string;
}

const emptyItem: HostelFeeCollectionItem = {
  item_name: "",
  item_amount: 0,
};

const defaultFilter: FilterState = {
  program_id: "",
  department_id: "",
  academic_class_id: "",
  academic_section_id: "",
  academic_batch_id: "",
  search: "",
};

const CollectFeesForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const [filters, setFilters] = useState<FilterState>(defaultFilter);
  const [filterApplied, setFilterApplied] = useState(false);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(
    null,
  );
  const [previousDue, setPreviousDue] = useState(0);
  const [isLoadingDue, setIsLoadingDue] = useState(false);

  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const studentDropdownRef = useRef<HTMLDivElement>(null);

  const [includeMeal, setIncludeMeal] = useState(true);
  const [savedRecord, setSavedRecord] =
    useState<HostelFeeCollectionRecord | null>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  // Cascading enrollment filter options (Program → Department → Class → Section → Batch)
  const [programs, setPrograms] = useState<CascadeOption[]>([]);
  const [departments, setDepartments] = useState<CascadeOption[]>([]);
  const [academicClasses, setAcademicClasses] = useState<CascadeOption[]>([]);
  const [academicSections, setAcademicSections] = useState<CascadeOption[]>([]);
  const [academicBatches, setAcademicBatches] = useState<CascadeOption[]>([]);

  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(true);

  // close the student dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        studentDropdownRef.current &&
        !studentDropdownRef.current.contains(e.target as Node)
      ) {
        setIsStudentDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load all programs on initial mount
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const response = await getPrograms([]);
        setPrograms(
          (response?.data ?? []).map((item: Record<string, unknown>) => ({
            id: String(item.id),
            name: String(item.program_name || item.name || item.id),
          })),
        );
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  // Load all batches on initial mount
  useEffect(() => {
    const fetchBatches = async () => {
      setLoadingBatches(true);
      try {
        const response = await getBatchDetails([]);
        setAcademicBatches(
          (response?.data ?? []).map((item: Record<string, unknown>) => ({
            id: String(item.id),
            name: String(item.batch_name || item.name || item.id),
          })),
        );
      } catch (error) {
        console.error("Error fetching batches:", error);
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, []);

  // Fetch departments when a program is selected
  const fetchDepartments = useCallback(async (programId: string) => {
    setLoadingDepartments(true);
    try {
      const response = await getDepartmentByProgramId(programId);
      setDepartments(
        (response?.data ?? []).map((item: Record<string, unknown>) => ({
          id: String(item.id),
          name: String(item.department_name || item.name || item.id),
        })),
      );
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  // Fetch classes when a department is selected
  const fetchClasses = useCallback(async (departmentId: string) => {
    setLoadingClasses(true);
    try {
      const response = await getClassesByDepartmentId(departmentId);
      setAcademicClasses(
        (response?.data ?? []).map((item: Record<string, unknown>) => ({
          id: String(item.id),
          name: String(item.class_name || item.name || item.id),
        })),
      );
    } catch (error) {
      console.error("Error fetching academic classes:", error);
      setAcademicClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  // Fetch sections when a class is selected
  const fetchSections = useCallback(async (classId: string) => {
    setLoadingSections(true);
    try {
      const response = await getAcademicSections([
        {
          label: "filter",
          value: JSON.stringify({ class_id: classId }),
        },
      ]);
      setAcademicSections(
        (response?.data ?? []).map((item: Record<string, unknown>) => ({
          id: String(item.id),
          name: String(item.section_name || item.name || item.id),
        })),
      );
    } catch (error) {
      console.error("Error fetching academic sections:", error);
      setAcademicSections([]);
    } finally {
      setLoadingSections(false);
    }
  }, []);

  const handleProgramChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      program_id: value,
      department_id: "",
      academic_class_id: "",
      academic_section_id: "",
      academic_batch_id: "",
    }));
    setDepartments([]);
    setAcademicClasses([]);
    setAcademicSections([]);
    if (value) {
      fetchDepartments(value);
    }
  };

  const handleDepartmentChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      department_id: value,
      academic_class_id: "",
      academic_section_id: "",
      academic_batch_id: "",
    }));
    setAcademicClasses([]);
    setAcademicSections([]);
    if (value) {
      fetchClasses(value);
    }
  };

  const handleClassChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      academic_class_id: value,
      academic_section_id: "",
      academic_batch_id: "",
    }));
    setAcademicSections([]);
    if (value) {
      fetchSections(value);
    }
  };

  const handleSectionChange = (value: string) =>
    setFilters((prev) => ({
      ...prev,
      academic_section_id: value,
      academic_batch_id: "",
    }));

  const handleBatchChange = (value: string) =>
    setFilters((prev) => ({ ...prev, academic_batch_id: value }));

  const handleSearchChange = (value: string) =>
    setFilters((prev) => ({ ...prev, search: value }));

  const form = useForm<HostelFeeFormData>({
    resolver: zodResolver(hostelFeeCollectionValidation) as any,
    defaultValues: {
      student_id: "",
      collection_date: new Date().toISOString().split("T")[0],
      total_amount: 0,
      scholarship_amount: 0,
      paid_amount: 0,
      due_amount: 0,
      hostelFeeCollectionItems: [],
      mealCollection: {
        meal_count: 0,
        meal_rate: 0,
        total_amount: 0,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "hostelFeeCollectionItems",
  });

  const watchedItems = useWatch({
    control: form.control,
    name: "hostelFeeCollectionItems",
  });

  const watchedMeal = useWatch({
    control: form.control,
    name: "mealCollection",
  });

  const watchedPaid = useWatch({
    control: form.control,
    name: "paid_amount",
  });

  const watchedScholarship = useWatch({
    control: form.control,
    name: "scholarship_amount",
  });

  const itemsTotal =
    watchedItems?.reduce(
      (sum, item) => sum + (Number(item?.item_amount) || 0),
      0,
    ) ?? 0;

  const mealTotal = includeMeal
    ? (Number(watchedMeal?.meal_count) || 0) *
      (Number(watchedMeal?.meal_rate) || 0)
    : 0;

  // Gross total = current charges + any outstanding due carried forward.
  const grossTotal = itemsTotal + mealTotal + previousDue;
  const scholarshipAmount = Math.min(
    Number(watchedScholarship) || 0,
    grossTotal,
  );
  const grandTotal = Math.max(0, grossTotal - scholarshipAmount);
  const dueAmount = Math.max(0, grandTotal - (Number(watchedPaid) || 0));

  useEffect(() => {
    // total_amount stores the GROSS total (charges + carried previous due);
    // scholarship is subtracted separately when validating/saving.
    form.setValue("total_amount", grossTotal, {
      shouldDirty: true,
      shouldTouch: true,
    });
    form.setValue("due_amount", dueAmount, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [grossTotal, dueAmount, form]);

  useEffect(() => {
    if (includeMeal && watchedMeal) {
      form.setValue(
        "mealCollection",
        {
          meal_count: Number(watchedMeal.meal_count) || 0,
          meal_rate: Number(watchedMeal.meal_rate) || 0,
          total_amount: mealTotal,
        },
        { shouldDirty: true, shouldTouch: true },
      );
    }
  }, [
    watchedMeal?.meal_count,
    watchedMeal?.meal_rate,
    mealTotal,
    includeMeal,
    form,
    watchedMeal,
  ]);

  useEffect(() => {
    if (selectedStudent) {
      form.setValue("student_id", selectedStudent.id, {
        shouldDirty: true,
        shouldTouch: true,
      });
    } else {
      form.setValue("student_id", "", {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [selectedStudent, form]);

  const programSelected = Boolean(filters.program_id);
  const departmentSelected = Boolean(filters.department_id);
  const classSelected = Boolean(filters.academic_class_id);
  const searchEntered = filters.search.trim().length > 0;
  const hasSections = academicSections.length > 0;
  const hasActiveFilter =
    programSelected ||
    departmentSelected ||
    classSelected ||
    Boolean(filters.academic_section_id) ||
    Boolean(filters.academic_batch_id) ||
    searchEntered;

  const buildFilterObject = (): Record<string, any> => {
    const enrollmentWhere: Record<string, any> = {};
    const academicClassWhere: Record<string, any> = {};

    if (filters.program_id) academicClassWhere.program_id = filters.program_id;
    if (filters.department_id)
      academicClassWhere.department_id = filters.department_id;

    if (filters.academic_class_id) {
      enrollmentWhere.academic_class_id = filters.academic_class_id;
    } else if (Object.keys(academicClassWhere).length > 0) {
      enrollmentWhere.academicClass = { is: academicClassWhere };
    }

    if (filters.academic_section_id)
      enrollmentWhere.academic_section_id = filters.academic_section_id;

    if (filters.academic_batch_id)
      enrollmentWhere.batch_id = filters.academic_batch_id;

    if (Object.keys(enrollmentWhere).length === 0) {
      return {};
    }

    return {
      studentEnrollments: {
        some: enrollmentWhere,
      },
    };
  };

  const handleConfirmFilter = async () => {
    setIsLoadingStudents(true);
    setStudents([]);
    setSelectedStudent(null);
    setStudentSearchTerm("");

    try {
      const searchTerm = filters.search.trim();
      const params: StudentSearchQueryParams = {
        page: 1,
        limit: 50,
        filter: buildFilterObject(),
        ...(searchTerm ? { searchTerm } : {}),
      };

      const res = await searchStudentsForHostelFee(params);
      if (res?.success) {
        const studentList: (StudentOption & {
          studentEnrollments?: Array<{ registration_number?: string }>;
        })[] = res?.data?.data || res?.data || [];

        setStudents(
          studentList.map((student) => ({
            ...student,
            registration_number:
              student.registration_number ??
              student.studentEnrollments?.[0]?.registration_number,
          })),
        );
        setFilterApplied(true);
        setIsStudentDropdownOpen(true);
        if (studentList.length === 0) {
          toast.info("No students found with the selected filters");
        }
      } else {
        toast.error(res?.message ?? "Failed to fetch students");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleClearFilter = () => {
    setFilters(defaultFilter);
    setFilterApplied(false);
    setStudents([]);
    setSelectedStudent(null);
    setStudentSearchTerm("");
    setIsStudentDropdownOpen(false);
    setPreviousDue(0);
    setDepartments([]);
    setAcademicClasses([]);
    setAcademicSections([]);
  };

  const handleSelectStudent = async (student: StudentOption) => {
    setSelectedStudent(student);
    setStudentSearchTerm(student.name);
    setIsStudentDropdownOpen(false);
    setPreviousDue(0);
    setIsLoadingDue(true);

    try {
      const res = await getStudentHostelDue(student.id);
      if (res?.success) {
        setPreviousDue(Number(res?.data?.totalDue) || 0);
      } else {
        toast.error(res?.message ?? "Failed to fetch previous due");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch previous due");
    } finally {
      setIsLoadingDue(false);
    }
  };

  const handleClearStudentSelection = () => {
    setSelectedStudent(null);
    setStudentSearchTerm("");
    setIsStudentDropdownOpen(true);
    setPreviousDue(0);
  };

  const filteredStudents = students.filter((student) => {
    if (!studentSearchTerm.trim()) return true;
    const term = studentSearchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(term) ||
      student.father_name?.toLowerCase().includes(term) ||
      student.student_id?.toLowerCase().includes(term) ||
      student.roll?.toLowerCase().includes(term) ||
      student.registration_number?.toLowerCase().includes(term) ||
      student.email?.toLowerCase().includes(term) ||
      student.student_phone?.toLowerCase().includes(term)
    );
  });

  const handleAddItem = () => {
    append({ ...emptyItem });
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

  const submit: SubmitHandler<FieldValues> = async (payload) => {
    if (!selectedStudent) {
      toast.error("Please select a student first");
      return;
    }

    startTransition(async () => {
      const finalItemsTotal =
        payload.hostelFeeCollectionItems?.reduce(
          (sum: number, item: HostelFeeCollectionItem) =>
            sum + (Number(item?.item_amount) || 0),
          0,
        ) ?? 0;

      const finalMealTotal = includeMeal
        ? (Number(payload.mealCollection?.meal_count) || 0) *
          (Number(payload.mealCollection?.meal_rate) || 0)
        : 0;

      const finalTotal = finalItemsTotal + finalMealTotal + previousDue;
      const finalScholarship = Math.min(
        Number(payload.scholarship_amount) || 0,
        finalTotal,
      );
      const finalPaid = Number(payload.paid_amount) || 0;
      const finalDue = Math.max(0, finalTotal - finalScholarship - finalPaid);

      const formattedPayload = {
        student_id: selectedStudent.id,
        collection_date: payload.collection_date,
        total_amount: finalTotal,
        scholarship_amount: finalScholarship,
        paid_amount: finalPaid,
        due_amount: finalDue,
        hostelFeeCollectionItems: payload.hostelFeeCollectionItems.map(
          (item: HostelFeeCollectionItem) => ({
            item_name: item.item_name,
            item_amount: Number(item.item_amount),
          }),
        ),
        // Only send meal charges when actually filled in — collections
        // without meal must still be generatable.
        mealCollection:
          includeMeal && finalMealTotal > 0
            ? {
                meal_count: Number(payload.mealCollection?.meal_count) || 0,
                meal_rate: Number(payload.mealCollection?.meal_rate) || 0,
                total_amount: finalMealTotal,
              }
            : undefined,
      };

      const res = await createHostelFeeCollection(formattedPayload);

      if (!res.success) {
        toast.error(res.message ?? "Failed to collect hostel fee");
        return;
      }
      toast.success(res.message ?? "Hostel fee collected successfully");
      router.refresh();
      // Ask whether to print the generated invoice before leaving the page.
      setSavedRecord(res.data as HostelFeeCollectionRecord);
      setInvoiceDialogOpen(true);
    });
  };

  const handleGenerateInvoiceNow = () => {
    if (savedRecord) {
      printHostelInvoiceFromRecord(savedRecord);
    }
    setSavedRecord(null);
    setInvoiceDialogOpen(false);
    router.push("/dashboard/hostel/deposited");
  };

  const handleSkipInvoice = () => {
    setSavedRecord(null);
    setInvoiceDialogOpen(false);
    router.push("/dashboard/hostel/deposited");
  };

  const handleClearForm = () => {
    form.reset({
      student_id: "",
      collection_date: new Date().toISOString().split("T")[0],
      total_amount: 0,
      scholarship_amount: 0,
      paid_amount: 0,
      due_amount: 0,
      hostelFeeCollectionItems: [],
      mealCollection: {
        meal_count: 0,
        meal_rate: 0,
        total_amount: 0,
      },
    });
    setSelectedStudent(null);
    setStudents([]);
    setFilters(defaultFilter);
    setFilterApplied(false);
    setIncludeMeal(true);
    setPreviousDue(0);
    setStudentSearchTerm("");
    setIsStudentDropdownOpen(false);
  };

  return (
    <form
      className="space-y-6 w-full max-w-5xl mx-auto"
      onSubmit={form.handleSubmit(submit)}
      noValidate
    >
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">
                Collect Hostel Fee
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Narrow students down by program, department, class, or section
                &mdash; or search by phone, email, or registration number
                &mdash; then pick a student and fill in the hostel fee and meal
                details.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-5">
            <Label className="text-base font-semibold">Filter Students</Label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormSelect
                label="Program"
                placeholder={
                  loadingPrograms ? "Loading programs..." : "Select program"
                }
                value={filters.program_id}
                options={programs.map((p) => ({ value: p.id, label: p.name }))}
                onValueChange={handleProgramChange}
                disabled={loadingPrograms}
                containerClassName="w-full min-w-0"
                triggerClassName="h-11 w-full"
              />
              <FormSelect
                label="Department"
                placeholder={
                  !programSelected
                    ? "Select program first"
                    : loadingDepartments
                      ? "Loading departments..."
                      : "Select department"
                }
                value={filters.department_id}
                options={departments.map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
                onValueChange={handleDepartmentChange}
                disabled={!programSelected || loadingDepartments}
                containerClassName="w-full min-w-0"
                triggerClassName="h-11 w-full"
              />
              <FormSelect
                label="Class/Year"
                placeholder={
                  !departmentSelected
                    ? "Select department first"
                    : loadingClasses
                      ? "Loading classes..."
                      : "Select class"
                }
                value={filters.academic_class_id}
                options={academicClasses.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                onValueChange={handleClassChange}
                disabled={!departmentSelected || loadingClasses}
                containerClassName="w-full min-w-0"
                triggerClassName="h-11 w-full"
              />
              <FormSelect
                label="Section"
                placeholder={
                  !classSelected
                    ? "Select class first"
                    : loadingSections
                      ? "Loading sections..."
                      : hasSections
                        ? "Select section"
                        : "No section"
                }
                value={filters.academic_section_id}
                options={academicSections.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                onValueChange={handleSectionChange}
                disabled={!classSelected || !hasSections || loadingSections}
                containerClassName="w-full min-w-0"
                triggerClassName="h-11 w-full"
              />
              <FormSelect
                label="Batch"
                placeholder={
                  loadingBatches ? "Loading batches..." : "Select batch"
                }
                value={filters.academic_batch_id}
                options={academicBatches.map((b) => ({
                  value: b.id,
                  label: b.name,
                }))}
                onValueChange={handleBatchChange}
                disabled={loadingBatches}
                containerClassName="w-full min-w-0"
                triggerClassName="h-11 w-full"
              />
              <FormInput
                label="Search"
                type="text"
                placeholder="Search by phone, email, registration no..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                containerClassName="w-full min-w-0"
                inputClassName="h-11 w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilter}
                className="h-11 px-5"
                disabled={isLoadingStudents}
              >
                Clear Filter
              </Button>
              <Button
                type="button"
                onClick={handleConfirmFilter}
                disabled={!hasActiveFilter || isLoadingStudents}
                className="h-11 bg-blue-600 px-8 hover:bg-blue-700"
              >
                {isLoadingStudents ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Students...
                  </>
                ) : (
                  <>Confirm &amp; Show Students</>
                )}
              </Button>
              {filterApplied && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Check className="h-3 w-3" />
                  Filter Applied
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 border-t pt-6" ref={studentDropdownRef}>
            <Label className="text-base font-semibold">Select Student</Label>

            <div className="relative">
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={
                    !filterApplied
                      ? "Apply a filter first to search students"
                      : isLoadingStudents
                        ? "Loading students..."
                        : "Search by name, ID, roll, email, phone, reg no..."
                  }
                  value={studentSearchTerm}
                  disabled={!filterApplied || isLoadingStudents}
                  onChange={(e) => {
                    setStudentSearchTerm(e.target.value);
                    setIsStudentDropdownOpen(true);
                    if (selectedStudent) setSelectedStudent(null);
                  }}
                  onFocus={() => {
                    if (filterApplied) setIsStudentDropdownOpen(true);
                  }}
                  className={cn(
                    "h-11 pl-9 pr-9",
                    selectedStudent &&
                      "border-emerald-300 bg-emerald-50 font-medium text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-100",
                  )}
                />
                {selectedStudent ? (
                  <button
                    type="button"
                    onClick={handleClearStudentSelection}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : isLoadingStudents ? (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                ) : null}
              </div>

              {isStudentDropdownOpen && filterApplied && !isLoadingStudents && (
                <div className="absolute z-20 mt-2 w-full rounded-xl border border-border/50 bg-white shadow-lg dark:bg-slate-900 max-h-72 overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <UserRound className="h-8 w-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {students.length === 0
                          ? "No students found with the selected filters"
                          : "No matches for your search"}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => handleSelectStudent(student)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors dark:hover:bg-slate-800"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                            <UserRound className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                              {student.name}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {student.father_name &&
                                `Father: ${student.father_name}  •  `}
                              {student.student_id &&
                                `ID: ${student.student_id}`}
                              {student.roll && ` • Roll: ${student.roll}`}
                              {student.registration_number &&
                                ` • Reg: ${student.registration_number}`}
                              {student.student_phone &&
                                ` • Phone: ${student.student_phone}`}
                              {student.email && ` • ${student.email}`}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedStudent && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/30">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <UserRound className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                      {selectedStudent.name}
                    </div>
                    {selectedStudent.father_name && (
                      <div className="text-sm text-emerald-700 dark:text-emerald-300">
                        Father: {selectedStudent.father_name}
                      </div>
                    )}
                    {selectedStudent.student_id && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">
                        ID: {selectedStudent.student_id}
                        {selectedStudent.roll &&
                          ` • Roll: ${selectedStudent.roll}`}
                        {selectedStudent.registration_number &&
                          ` • Reg: ${selectedStudent.registration_number}`}
                      </div>
                    )}
                    {selectedStudent.student_phone && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">
                        Phone: {selectedStudent.student_phone}
                      </div>
                    )}
                    {selectedStudent.email && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">
                        {selectedStudent.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!filterApplied && (
              <p className="text-xs text-muted-foreground">
                Choose at least one filter above (or enter a phone, email, or
                registration number), then confirm to enable student search.
              </p>
            )}
          </div>

          <div className="space-y-5 border-t pt-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Collection Details
              </Label>
            </div>

            <FormInput
              label="Collection Date"
              type="date"
              required
              error={form.formState.errors.collection_date?.message as string}
              {...form.register("collection_date")}
              inputClassName="h-11"
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Hostel Fee Items
                </Label>
                <span className="text-sm text-muted-foreground">
                  {fields.length} item(s)
                </span>
              </div>

              {fields.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/60 bg-slate-50 dark:bg-slate-900/50 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No fee items yet. Add one below.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {fields.map((field, index) => {
                  const itemPrice =
                    Number(watchedItems?.[index]?.item_amount) || 0;
                  return (
                    <div
                      key={field.id}
                      className="rounded-xl border border-border/50 bg-slate-50/60 p-4 dark:bg-slate-900/40"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                        <FormInput
                          label="Item Name"
                          placeholder="e.g. Bed Rent, Electricity"
                          required
                          error={
                            form.formState.errors.hostelFeeCollectionItems?.[
                              index
                            ]?.item_name?.message
                          }
                          {...form.register(
                            `hostelFeeCollectionItems.${index}.item_name`,
                          )}
                          inputClassName="h-11"
                        />

                        <FormInput
                          label="Amount (BDT)"
                          type="number"
                          step="1"
                          min="0"
                          placeholder="e.g. 500"
                          required
                          error={
                            form.formState.errors.hostelFeeCollectionItems?.[
                              index
                            ]?.item_amount?.message
                          }
                          {...form.register(
                            `hostelFeeCollectionItems.${index}.item_amount`,
                            { valueAsNumber: true },
                          )}
                          inputClassName="h-11"
                        />

                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => handleRemoveItem(index)}
                          disabled={isPending}
                          className="h-11 w-full md:w-auto md:px-4"
                        >
                          <Minus className="mr-1 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                      {itemPrice > 0 && (
                        <div className="mt-3 flex items-center justify-end border-t border-border/40 pt-2 text-sm">
                          <span className="text-muted-foreground">
                            Item #{index + 1}:&nbsp;
                          </span>
                          <span className="font-semibold text-primary">
                            {itemPrice.toFixed(2)} BDT
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="default"
                onClick={handleAddItem}
                disabled={isPending}
                className="h-11 w-full bg-blue-600 hover:bg-blue-700 md:w-auto md:px-6"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Meal Collection</Label>
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeMeal}
                  onChange={(e) => setIncludeMeal(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-muted-foreground">
                  Include meal charges
                </span>
              </label>
            </div>

            {includeMeal ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormInput
                  label="Meal Count"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 30"
                  {...form.register("mealCollection.meal_count", {
                    valueAsNumber: true,
                  })}
                  inputClassName="h-11"
                />
                <FormInput
                  label="Meal Rate (BDT)"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 145"
                  {...form.register("mealCollection.meal_rate", {
                    valueAsNumber: true,
                  })}
                  inputClassName="h-11"
                />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Meal Bill Subtotal
                  </Label>
                  <div className="h-11 flex items-center rounded-md border border-border/50 bg-slate-100 px-3 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {mealTotal.toFixed(2)} BDT
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Meal charges disabled for this collection.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-5 dark:border-blue-800/40 dark:bg-blue-950/20 border-t pt-6">
            <Label className="text-base font-bold text-blue-900 dark:text-blue-100">
              Payment Summary
            </Label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  Items Subtotal
                </Label>
                <div className="h-11 flex items-center rounded-md border border-blue-200/50 bg-white px-3 text-sm dark:bg-slate-900 dark:border-blue-800/40">
                  <span className="text-muted-foreground mr-1.5">
                    {fields.length} item(s):
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {itemsTotal.toFixed(2)} BDT
                  </span>
                </div>
              </div>

              {includeMeal && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    Meal Subtotal
                  </Label>
                  <div className="h-11 flex items-center rounded-md border border-blue-200/50 bg-white px-3 text-sm dark:bg-slate-900 dark:border-blue-800/40">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {mealTotal.toFixed(2)} BDT
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  Previous Due
                </Label>
                <div className="h-11 flex items-center gap-2 rounded-md border border-red-200/60 bg-white px-3 text-sm dark:bg-slate-900 dark:border-red-800/40">
                  {isLoadingDue ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Checking...</span>
                    </>
                  ) : (
                    <span
                      className={cn(
                        "font-semibold",
                        previousDue > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-slate-700 dark:text-slate-200",
                      )}
                    >
                      {previousDue.toFixed(2)} BDT
                    </span>
                  )}
                </div>
                {previousDue > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Outstanding due carried into this collection
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pt-2">
              <FormInput
                label="Scholarship (BDT)"
                type="number"
                step="1"
                min="0"
                error={
                  form.formState.errors.scholarship_amount?.message as string
                }
                {...form.register("scholarship_amount", {
                  valueAsNumber: true,
                })}
                inputClassName="h-12 text-base font-semibold"
                labelClassName="text-blue-800 dark:text-blue-200 font-semibold"
              />

              <div className="space-y-2">
                <FormInput
                  label="Paid Amount (BDT)"
                  type="number"
                  step="1"
                  min="0"
                  required
                  error={form.formState.errors.paid_amount?.message as string}
                  {...form.register("paid_amount", {
                    valueAsNumber: true,
                  })}
                  inputClassName="h-12 text-base font-semibold"
                  labelClassName="text-blue-800 dark:text-blue-200 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  Due Amount
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={dueAmount}
                    onChange={(e) => {
                      form.setValue("due_amount", Number(e.target.value) || 0, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    }}
                    className={cn(
                      "h-12 bg-amber-50 pr-16 text-base font-bold text-amber-800 dark:bg-amber-950/30 dark:text-amber-200",
                      dueAmount > 0 && "border-amber-300 dark:border-amber-700",
                      form.formState.errors.due_amount &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                    readOnly
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-amber-700 dark:text-amber-300">
                    BDT
                  </span>
                </div>
                {dueAmount > 0 && (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Student will have {dueAmount.toFixed(2)} BDT remaining due
                  </p>
                )}
                {dueAmount === 0 && grandTotal > 0 && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Full payment received ✓
                  </p>
                )}
                {form.formState.errors.due_amount && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.due_amount?.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label
                htmlFor="total_amount"
                className="text-sm font-bold text-blue-900 dark:text-blue-100"
              >
                Net Payable (after scholarship)
              </Label>
              <div className="relative">
                <Input
                  id="total_amount"
                  type="number"
                  step="1"
                  min="0"
                  value={grandTotal}
                  readOnly
                  className="h-12 bg-blue-100 pr-16 text-lg font-bold text-blue-800 dark:bg-blue-900/40 dark:text-blue-100"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-700 dark:text-blue-300">
                  BDT
                </span>
              </div>
              {scholarshipAmount > 0 && (
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Scholarship of {scholarshipAmount.toFixed(2)} BDT applied
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 px-6 text-base font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={handleClearForm}
              disabled={isPending}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isPending || !selectedStudent}
              className="h-12 flex-1 bg-blue-600 px-6 text-base font-semibold hover:bg-blue-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save &amp; Generate Invoice</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fee Collection Saved</DialogTitle>
            <DialogDescription>
              The fee collection has been recorded
              {savedRecord?.hostelInvoice?.invoice_no
                ? ` and invoice ${savedRecord.hostelInvoice.invoice_no} has been generated`
                : ""}
              . Do you want to print the invoice now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkipInvoice}
              disabled={isPending}
            >
              Save Only
            </Button>
            <Button
              type="button"
              onClick={handleGenerateInvoiceNow}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Generate Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default CollectFeesForm;
