"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { updateSubject } from "@/services/subject";
import { TAcademicClass, TSubject } from "./types";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getPrograms } from "@/services/program";
import { getDepartmentByProgramId } from "@/services/department";
import { Department, Program } from "../../class-config/_components/types/types";


const subjectSchema = z.object({
    name: z.string().min(1, "Subject name is required"),
    program_id: z.string().min(1, "Program is required"),
    department_id: z.string().min(1, "Department is required"),
    class_id: z.string().min(1, "Class is required"),
});

export type TSubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectEditFormProps {
    subject: TSubject;
    onSuccess: () => void;
    onCancel: () => void;
}

const SubjectEditForm = ({
    subject,
    onSuccess,
    onCancel,
}: SubjectEditFormProps) => {
    const [isPending, startTransition] = useTransition();
    const [classes, setClasses] = useState<TAcademicClass[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [programDepartments, setProgramDepartments] = useState<Department[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TSubjectFormValues>({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            name: subject.name,
            program_id: subject.academicClass?.program_id ?? "",
            department_id: subject.academicClass?.department_id ?? "",
            class_id: subject.class_id,
        },
    });

    const selectedProgramId = watch("program_id");
    const selectedDepartmentId = watch("department_id");

    // Fetch departments when a program is selected
    const fetchDepartments = useCallback(async (programId: string) => {
        if (!programId) {
            setProgramDepartments([]);
            return;
        }

        setLoadingDepartments(true);
        try {
            const response = await getDepartmentByProgramId(programId);
            setProgramDepartments(response?.data ?? []);
        } catch (error) {
            console.error("Error fetching departments:", error);
            setProgramDepartments([]);
        } finally {
            setLoadingDepartments(false);
        }
    }, []);

    useEffect(() => {
        const loadClasses = async () => {
            setLoadingClasses(true);
            const response = await getAcademicClassDetails();

            if (!response.success) {
                toast.error(response.message ?? "Failed to load classes");
                setLoadingClasses(false);
                return;
            }
            setClasses(response.data ?? []);
            setLoadingClasses(false);
        };

        const loadPrograms = async () => {
            try {
                const programData = await getPrograms([]);
                setPrograms(programData?.data ?? []);
            } catch (error) {
                console.error("Error fetching programs:", error);
            }
        };

        loadClasses();
        loadPrograms();
    }, []);

    // Load departments for the initial program
    useEffect(() => {
        if (selectedProgramId) {
            fetchDepartments(selectedProgramId);
        }
    }, [selectedProgramId, fetchDepartments]);

    const handleProgramChange = (programId: string | null) => {
        const id = programId ?? "";
        setValue("program_id", id);
        setValue("department_id", "");
        setValue("class_id", "");
        setProgramDepartments([]);
        if (id) {
            fetchDepartments(id);
        }
    };

    const handleDepartmentChange = (departmentId: string | null) => {
        const id = departmentId ?? "";
        setValue("department_id", id);
        setValue("class_id", "");
    };

    // Filter classes by the selected department
    const departmentClasses = useMemo(() => {
        if (!selectedDepartmentId) return [];
        return classes.filter((cls) => cls.department_id === selectedDepartmentId);
    }, [classes, selectedDepartmentId]);

    const onSubmit = (values: TSubjectFormValues) => {
        startTransition(async () => {
            const response = await updateSubject(subject.id, values);

            if (!response.success) {
                toast.error(response.message ?? "Failed to update subject");
                return;
            }
            toast.success(response.message ?? "Subject updated successfully");
            onSuccess();
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-5">
                <div className="space-y-1.5">
                    <Label htmlFor="name">Subject Name</Label>
                    <Input id="name" {...register("name")} />
                    {errors.name && (
                        <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                </div>

                {/* Program */}
                <div className="space-y-1.5">
                    <Label htmlFor="program_id">Program</Label>
                    <Select
                        value={watch("program_id")}
                        onValueChange={handleProgramChange}
                        disabled={loadingClasses}
                    >
                        <SelectTrigger id="program_id" className="w-full">
                            <SelectValue>
                                {programs.find((p) => p.id === watch("program_id"))?.program_name ?? "Select a program"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {programs.map((program) => (
                                <SelectItem key={program.id} value={program.id}>
                                    {program.program_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.program_id && (
                        <p className="text-xs text-destructive">
                            {errors.program_id.message}
                        </p>
                    )}
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                    <Label htmlFor="department_id">Department</Label>
                    <Select
                        value={watch("department_id")}
                        onValueChange={handleDepartmentChange}
                        disabled={!selectedProgramId || loadingDepartments}
                    >
                        <SelectTrigger id="department_id" className="w-full">
                            <SelectValue>
                                {programDepartments.find((d) => d.id === watch("department_id"))?.department_name ??
                                    (!selectedProgramId
                                        ? "Select a program first"
                                        : loadingDepartments
                                            ? "Loading departments..."
                                            : "Select a department")}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {programDepartments.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    {selectedProgramId ? "No departments for this program" : "Select a program first"}
                                </div>
                            ) : (
                                programDepartments.map((department) => (
                                    <SelectItem key={department.id} value={department.id}>
                                        {department.department_name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    {errors.department_id && (
                        <p className="text-xs text-destructive">
                            {errors.department_id.message}
                        </p>
                    )}
                </div>

                {/* Class */}
                <div className="space-y-1.5">
                    <Label htmlFor="class_id">Class</Label>
                    <Select
                        value={watch("class_id")}
                        onValueChange={(value) => setValue("class_id", (value as string) ?? "")}
                        disabled={!selectedDepartmentId || loadingClasses}
                    >
                        <SelectTrigger id="class_id" className="w-full">
                            <SelectValue>
                                {departmentClasses.find((c) => c.id === watch("class_id"))?.class_name ??
                                    (!selectedDepartmentId
                                        ? "Select a department first"
                                        : "Select a class")}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {departmentClasses.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    {selectedDepartmentId ? "No classes for this department" : "Select a department first"}
                                </div>
                            ) : (
                                departmentClasses.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.class_name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    {errors.class_id && (
                        <p className="text-xs text-destructive">
                            {errors.class_id.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isPending}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    );
};

export default SubjectEditForm;