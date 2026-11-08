"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { deleteStudent } from "@/services/student";
import {
    Users,
    Edit,
    Search,
    ArrowUpDown,
    Trash2,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
    View,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useTransition, useEffect, useRef } from "react";
import { toast } from "sonner";
import { TStudent } from "../../students/_components/types";
import { getStudents } from "@/services/student";



interface StudentTableProps {
    students: TStudent[] | [];
    currentPage: number;
    totalItems: number;
    totalPages?: number;
}

const PAGE_SIZE = 10;

const EditPaymentTable = ({ students: initialStudents, currentPage, totalItems, totalPages }: StudentTableProps) => {
    const [students, setStudents] = useState<TStudent[]>(initialStudents);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keep rows in sync when server page changes (pagination)
    useEffect(() => {
        if (!searchQuery.trim()) {
            setStudents(initialStudents);
        }
    }, [initialStudents, searchQuery]);

    // Debounce typing → settled searchQuery (400ms)
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearchQuery(searchInput);
        }, 400);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchInput]);

    // Backend search across ALL students (not just current page)
    useEffect(() => {
        const term = searchQuery.trim();
        if (!term) {
            setStudents(initialStudents);
            setIsSearching(false);
            return;
        }
        let cancelled = false;
        const run = async () => {
            setIsSearching(true);
            try {
                const response = await getStudents([
                    { label: "page", value: 1 },
                    { label: "limit", value: PAGE_SIZE },
                    { label: "searchTerm", value: term },
                ]);
                if (cancelled) return;
                if (response?.success === false) {
                    toast.error(response?.message ?? "Search failed");
                    return;
                }
                setStudents(response?.data ?? []);
            } catch {
                if (!cancelled) toast.error("Search failed");
            } finally {
                if (!cancelled) setIsSearching(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [searchQuery, initialStudents]);

    const handleViewStudent = (student: TStudent) => {
        const enrollment =
            student.studentEnrollments?.find((item) => item.is_primary) ?? student.studentEnrollments?.[0];
        const academicClassId = enrollment?.academicClass?.id;
        const query = academicClassId ? `?academic_class_id=${encodeURIComponent(academicClassId)}` : "";

        router.push(`/dashboard/student-management/edit-payment/${student.id}${query}`);
    };

    const filteredStudents = useMemo(() => {
        // Backend already filtered when searching; keep a null-safe
        // client fallback so rows with missing fields never crash render.
        if (!searchQuery.trim()) return students;
        return students;
    }, [students, searchQuery]);

    const paginatedStudents = filteredStudents;
    const canGoNext = totalPages ? currentPage < totalPages : students.length === PAGE_SIZE;

    const getPrimaryEnrollment = (student: TStudent) =>
        student.studentEnrollments?.find((item) => item.is_primary) ?? student.studentEnrollments?.[0];

    const getEnrollmentValue = (student: TStudent, field: "program" | "department" | "class") => {
        const enrollment = getPrimaryEnrollment(student);

        if (!enrollment) return "N/A";

        if (field === "program") {
            return (
                enrollment.academicClass?.program?.program_name ??
                enrollment.academicClass?.program?.name ??
                enrollment.program_name ??
                enrollment.program?.program_name ??
                enrollment.program?.name ??
                "N/A"
            );
        }

        if (field === "department") {
            return (
                enrollment.academicClass?.department?.department_name ??
                enrollment.academicClass?.department?.name ??
                enrollment.department_name ??
                enrollment.department?.department_name ??
                enrollment.department?.name ??
                "N/A"
            );
        }

        return (
            enrollment.academicClass?.class_name ??
            enrollment.academicClass?.name ??
            enrollment.academic_class_name ??
            enrollment.academic_class?.class_name ??
            enrollment.academic_class?.name ??
            "N/A"
        );
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(page));
        router.push(`?${params.toString()}`);
    };
    return (
        <>
            <Card className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                    <CardTitle className="text-lg font-semibold">Students</CardTitle>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search all students by name, email, NID..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="h-9 pl-8 text-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <p className="text-sm font-medium text-muted-foreground">
                                Searching students...
                            </p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {searchQuery
                                    ? "No students match your search."
                                    : "No students found."}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/60">
                                {searchQuery
                                    ? "Try a different search term."
                                    : "Add a student to get started."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            #
                                        </TableHead>
                                        <TableHead className="h-10 w-16 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Photo
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                Name
                                                <ArrowUpDown className="h-3 w-3" />
                                            </span>
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Roll & REG
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Program
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Department
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Class/ Year
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Guardian
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Gender
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <Phone className="h-3.5 w-3.5" />
                                                Contact
                                            </span>
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <Mail className="h-3.5 w-3.5" />
                                                Email
                                            </span>
                                        </TableHead>
                                        <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Status
                                        </TableHead>
                                        <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedStudents.map((student, index) => (
                                        <TableRow
                                            key={student.id}
                                            className="group transition-colors hover:bg-muted/20"
                                        >
                                            <TableCell className="text-center text-xs text-muted-foreground">
                                                {(currentPage - 1) * PAGE_SIZE + index + 1}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="relative mx-auto h-10 w-10 overflow-hidden rounded-full border border-border/60 bg-muted">
                                                    <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                                                        {student.name
                                                            .split(" ")
                                                            .filter(Boolean)
                                                            .slice(0, 2)
                                                            .map((part) => part[0])
                                                            .join("")
                                                            .toUpperCase()}
                                                    </span>
                                                    {student.photo && (
                                                        <img
                                                            src={student.photo}
                                                            alt={`${student.name} photo`}
                                                            className="absolute inset-0 h-full w-full object-cover"
                                                            onError={(event) => {
                                                                event.currentTarget.style.display = "none";
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {student.name}
                                                <div className="text-xs font-normal text-muted-foreground">
                                                    NID: {student.nid_no}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {(() => {
                                                    const enrollment = getPrimaryEnrollment(student);
                                                    return (
                                                        <>
                                                            <div className="text-xs font-normal text-muted-foreground">
                                                                Roll: {enrollment?.roll_number || "N/A"}
                                                            </div>
                                                            <div className="text-xs font-normal text-muted-foreground">
                                                                REG: {enrollment?.registration_number || "N/A"}
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell className="max-w-36 text-xs text-muted-foreground">
                                                <span className="line-clamp-2">{getEnrollmentValue(student, "program")}</span>
                                            </TableCell>
                                            <TableCell className="max-w-36 text-xs text-muted-foreground">
                                                <span className="line-clamp-2">{getEnrollmentValue(student, "department")}</span>
                                            </TableCell>
                                            <TableCell className="max-w-36 text-xs text-muted-foreground">
                                                <span className="line-clamp-2">{getEnrollmentValue(student, "class")}</span>
                                            </TableCell>

                                            <TableCell className="text-xs">
                                                <div>F: {student.father_name}</div>
                                                <div className="text-muted-foreground">
                                                    M: {student.mother_name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                    {student.gender}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {student.student_phone}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {student.email}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${student.is_active
                                                        ? "bg-green-500/10 text-green-600"
                                                        : "bg-red-500/10 text-red-600"
                                                        }`}
                                                >
                                                    {student.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                                                        title="View student"
                                                        onClick={() => handleViewStudent(student)}
                                                    >
                                                        <View className="h-4 w-4" />
                                                    </Button>


                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
                                <p className="text-xs text-muted-foreground">
                                    {searchQuery.trim()
                                        ? `Showing ${filteredStudents.length} matching item${filteredStudents.length === 1 ? "" : "s"} for "${searchQuery.trim()}"`
                                        : `Showing ${Math.min((currentPage - 1) * PAGE_SIZE + 1, totalItems)}–${Math.min(currentPage * PAGE_SIZE, totalItems)} of ${totalItems}`}
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={currentPage === 1 || !!searchQuery.trim()}
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="px-2 text-xs text-muted-foreground">
                                        {searchQuery.trim() ? "Search results" : `Page ${currentPage}`}
                                        {!searchQuery.trim() && totalPages ? ` of ${totalPages}` : ""}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={!canGoNext || !!searchQuery.trim()}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>



        </>
    );
};

export default EditPaymentTable;