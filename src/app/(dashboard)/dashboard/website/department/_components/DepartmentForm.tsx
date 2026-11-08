"use client";

import { Plus, SquarePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import ImageUpload, {
  type ImageUploadState,
} from "@/components/shared/image-upload";
import RichTextEditor from "@/components/shared/rich-text-editor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWebsiteDepartment,
  updateWebsiteDepartment,
} from "@/services/websiteDepartment";

export interface DepartmentData {
  id: string;
  name?: string | null;
  imageUrl?: string | null;
  details?: string | null;
  courseList?: string[] | null;
}

interface DepartmentFormProps {
  initialData?: DepartmentData | null;
}

const emptyUploadState: ImageUploadState = { file: null, removed: false };

// Each course row carries a stable id so React keys stay valid while rows
// are added, removed or reordered.
let courseRowCounter = 0;
const makeCourseRow = (value = "") => ({
  id: `course-${++courseRowCounter}`,
  value,
});

export default function DepartmentForm({ initialData }: DepartmentFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [name, setName] = useState(initialData?.name ?? "");
  const [details, setDetails] = useState(initialData?.details ?? "");
  const [courseList, setCourseList] = useState(() =>
    initialData?.courseList?.length
      ? initialData.courseList.map((course) => makeCourseRow(course))
      : [makeCourseRow()],
  );
  const [imageState, setImageState] =
    useState<ImageUploadState>(emptyUploadState);
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  // Changing the key remounts ImageUpload so its internal picked-file
  // state (which the parent cannot reach) is discarded on reset.
  const [uploadKey, setUploadKey] = useState(0);

  // Re-sync fields when the server data changes (e.g. after save + revalidate).
  useEffect(() => {
    setName(initialData?.name ?? "");
    setDetails(initialData?.details ?? "");
    setCourseList(
      initialData?.courseList?.length
        ? initialData.courseList.map((course) => makeCourseRow(course))
        : [makeCourseRow()],
    );
    setImageState(emptyUploadState);
  }, [initialData]);

  const handleReset = () => {
    setName(initialData?.name ?? "");
    setDetails(initialData?.details ?? "");
    setCourseList(
      initialData?.courseList?.length
        ? initialData.courseList.map((course) => makeCourseRow(course))
        : [makeCourseRow()],
    );
    setImageState(emptyUploadState);
    setUploadKey((key) => key + 1);
  };

  const handleCourseChange = (id: string, value: string) => {
    setCourseList((courses) =>
      courses.map((course) =>
        course.id === id ? { ...course, value } : course,
      ),
    );
  };

  const handleCourseRemove = (id: string) => {
    setCourseList((courses) =>
      courses.length > 1
        ? courses.filter((course) => course.id !== id)
        : courses,
    );
  };

  const handleCourseAdd = () => {
    setCourseList((courses) => [...courses, makeCourseRow()]);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("details", details);
    // Backend parses this back via parseFormData(['courseList']).
    formData.append(
      "courseList",
      JSON.stringify(
        courseList
          .map((course) => course.value)
          .filter((value) => value.trim() !== ""),
      ),
    );

    if (imageState.file) {
      formData.append("department_image", imageState.file);
    } else if (imageState.removed) {
      formData.append("removeImage", "true");
    }

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateWebsiteDepartment(initialData.id, formData)
          : await createWebsiteDepartment(formData);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "Department updated successfully"
            : "Department created successfully",
        );
        router.push("/dashboard/website/department");
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 pt-4">
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Department Name
        </Label>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Write here..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>

      <ImageUpload
        key={uploadKey}
        label="Department"
        name="department_image"
        defaultUrl={initialData?.imageUrl ?? undefined}
        onFileChange={setImageState}
      />

      <RichTextEditor
        label="Department Details"
        value={details}
        onChange={setDetails}
      />

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Course List
        </Label>
        <div className="space-y-3">
          {courseList.map((course, index) => (
            <div key={course.id} className="flex items-center gap-2">
              <Input
                value={course.value}
                onChange={(event) =>
                  handleCourseChange(course.id, event.target.value)
                }
                placeholder="Write here..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
              />
              {courseList.length > 1 ? (
                <button
                  type="button"
                  onClick={() => handleCourseRemove(course.id)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50"
                  title="Remove course"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              {index === courseList.length - 1 ? (
                <button
                  type="button"
                  onClick={handleCourseAdd}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
                  title="Add course"
                >
                  <Plus className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SquarePlus className="h-4 w-4" />
          Reset
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SquarePlus className="h-4 w-4" />
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset form?"
        description="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={() => {
          handleReset();
          setResetOpen(false);
        }}
      />
    </form>
  );
}
