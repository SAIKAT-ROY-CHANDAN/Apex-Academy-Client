"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
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

import { updateDepartment } from "@/services/department";
import { getPrograms } from "@/services/program";
import { TDepartment, TProgram } from "./types";

const departmentSchema = z.object({
    department_name: z.string().min(1, "Department name is required"),
    program_id: z.string().nullable().optional(),
});

export type TDepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentEditFormProps {
    department: TDepartment;
    onSuccess: () => void;
    onCancel: () => void;
}

const DepartmentEditForm = ({
    department,
    onSuccess,
    onCancel,
}: DepartmentEditFormProps) => {
    const [isPending, startTransition] = useTransition();
    const [programs, setPrograms] = useState<TProgram[]>([]);
    const [loadingPrograms, setLoadingPrograms] = useState(true);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TDepartmentFormValues>({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            department_name: department.department_name,
            program_id: department.program_id,
        },
    });

    useEffect(() => {
        const loadPrograms = async () => {
            setLoadingPrograms(true);
            const response = await getPrograms([]);

            if (!response.success) {
                toast.error(response.message ?? "Failed to load programs");
                setLoadingPrograms(false);
                return;
            }
            setPrograms(response.data ?? []);
            setLoadingPrograms(false);
        };

        loadPrograms();
    }, [department.institution_id]);

    const onSubmit = (values: TDepartmentFormValues) => {
        startTransition(async () => {
            const response = await updateDepartment(department.id, values);

            if (!response.success) {
                toast.error(response.message ?? "Failed to update department");
                return;
            }
            toast.success(response.message ?? "Department updated successfully");
            onSuccess();
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-5">
                <div className="space-y-1.5">
                    <Label htmlFor="department_name">Department Name</Label>
                    <Input id="department_name" {...register("department_name")} />
                    {errors.department_name && (
                        <p className="text-xs text-destructive">
                            {errors.department_name.message}
                        </p>
                    )}
                </div>

                {/* program_id is scoped to this department's institution and
            fetched from the backend via getPrograms(institution_id) */}
                <div className="space-y-1.5">
                    <Label htmlFor="program_id">Program</Label>
                    <Select
                        value={watch("program_id") ?? undefined}
                        onValueChange={(value) => setValue("program_id", value)}
                        disabled={loadingPrograms}
                    >
                        <SelectTrigger id="program_id">
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
                </div>

                {/* Institution is fixed per department and shown read-only */}
                {department.institution && (
                    <div className="space-y-1.5">
                        <Label>Institution</Label>
                        <Input
                            value={department.institution.name}
                            disabled
                            className="text-muted-foreground"
                        />
                    </div>
                )}
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

export default DepartmentEditForm;