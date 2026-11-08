"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState, useTransition } from "react";
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

import { updateAcademicSection } from "@/services/academicSection";
import type { TAcademicClass, TAcademicSection } from "./types/academic-section";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getPrograms } from "@/services/program";
import { getDepartmentByProgramId } from "@/services/department";
import type { Department, Program } from "../../class-config/_components/types/types";

const academicSectionSchema = z.object({
    section_name: z.string().min(1, "Section name is required"),
    class_id: z.string().min(1, "Class is required"),
});

export type TAcademicSectionFormValues = z.infer<
    typeof academicSectionSchema
>;

interface AcademicSectionEditFormProps {
    section: TAcademicSection;
    onSuccess: () => void;
    onCancel: () => void;
}

const AcademicSectionEditForm = ({
    section,
    onSuccess,
    onCancel,
}: AcademicSectionEditFormProps) => {
    const [isPending, startTransition] = useTransition();

    const [programs, setPrograms] = useState<Program[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [classes, setClasses] = useState<TAcademicClass[]>([]);

    const [loadingPrograms, setLoadingPrograms] = useState(true);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);

    const [selectedProgramId, setSelectedProgramId] = useState<string>(
        section.academicClass?.program_id ?? ""
    );
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(
        section.academicClass?.department_id ?? ""
    );

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TAcademicSectionFormValues>({
        resolver: zodResolver(academicSectionSchema),
        defaultValues: {
            section_name: section.section_name,
            class_id: section.class_id,
        },
    });

    // Load all programs on initial mount
    useEffect(() => {
        const fetchPrograms = async () => {
            setLoadingPrograms(true);
            try {
                const response = await getPrograms([]);
                setPrograms(response?.data ?? []);
            } catch (error) {
                console.error("Error fetching programs:", error);
            } finally {
                setLoadingPrograms(false);
            }
        };

        fetchPrograms();
    }, []);

    // Fetch departments when a program is selected (or pre-selected on mount)
    const fetchDepartments = useCallback(async (programId: string) => {
        if (!programId) {
            setDepartments([]);
            return;
        }

        setLoadingDepartments(true);
        try {
            const response = await getDepartmentByProgramId(programId);
            setDepartments(response?.data ?? []);
        } catch (error) {
            console.error("Error fetching departments:", error);
            setDepartments([]);
        } finally {
            setLoadingDepartments(false);
        }
    }, []);

    // Fetch classes when a department is selected (or pre-selected on mount)
    const fetchClasses = useCallback(async (departmentId: string) => {
        if (!departmentId) {
            setClasses([]);
            return;
        }

        setLoadingClasses(true);
        try {
            const response = await getAcademicClassDetails([
                { label: "department_id", value: departmentId },
            ]);
            setClasses(response?.data ?? []);
        } catch (error) {
            console.error("Error fetching academic classes:", error);
            setClasses([]);
        } finally {
            setLoadingClasses(false);
        }
    }, []);

    // Load departments and classes for pre-selected program/department on mount
    useEffect(() => {
        if (selectedProgramId) {
            fetchDepartments(selectedProgramId);
        }
        if (selectedDepartmentId) {
            fetchClasses(selectedDepartmentId);
        }
    }, [selectedProgramId, selectedDepartmentId, fetchDepartments, fetchClasses]);

    const handleProgramChange = (programId: string | null) => {
        const id = programId ?? "";
        setSelectedProgramId(id);
        setSelectedDepartmentId("");
        setDepartments([]);
        setClasses([]);
        setValue("class_id", "");
    };

    const handleDepartmentChange = (departmentId: string | null) => {
        const id = departmentId ?? "";
        setSelectedDepartmentId(id);
        setClasses([]);
        setValue("class_id", "");
    };

    const onSubmit = (values: TAcademicSectionFormValues) => {
        startTransition(async () => {
            const response = await updateAcademicSection(section.id, values);

            if (!response.success) {
                toast.error(response.message ?? "Failed to update section");
                return;
            }
            toast.success(response.message ?? "Section updated successfully");
            onSuccess();
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-5">
                <div className="space-y-1.5">
                    <Label htmlFor="section_name">Section Name</Label>
                    <Input id="section_name" {...register("section_name")} />
                    {errors.section_name && (
                        <p className="text-xs text-destructive">
                            {errors.section_name.message}
                        </p>
                    )}
                </div>

                {/* Program */}
                <div className="space-y-1.5">
                    <Label htmlFor="program_id">Program</Label>
                    <Select
                        value={selectedProgramId || undefined}
                        onValueChange={handleProgramChange}
                        disabled={loadingPrograms}
                    >
                        <SelectTrigger id="program_id" className="w-full">
                            <SelectValue>
                                {programs.find((p) => p.id === selectedProgramId)?.program_name ??
                                    (loadingPrograms ? "Loading programs..." : "Select a program")}
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
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                    <Label htmlFor="department_id">Department</Label>
                    <Select
                        value={selectedDepartmentId || undefined}
                        onValueChange={handleDepartmentChange}
                        disabled={!selectedProgramId || loadingDepartments}
                    >
                        <SelectTrigger id="department_id" className="w-full">
                            <SelectValue>
                                {departments.find((d) => d.id === selectedDepartmentId)?.department_name ??
                                    (!selectedProgramId
                                        ? "Select a program first"
                                        : loadingDepartments
                                            ? "Loading departments..."
                                            : "Select a department")}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((department) => (
                                <SelectItem key={department.id} value={department.id}>
                                    {department.department_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                                {classes.find((cls) => cls.id === watch("class_id"))?.class_name ??
                                    (!selectedDepartmentId
                                        ? "Select a department first"
                                        : loadingClasses
                                            ? "Loading classes..."
                                            : "Select a class")}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                    {cls.class_name}
                                </SelectItem>
                            ))}
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

export default AcademicSectionEditForm;