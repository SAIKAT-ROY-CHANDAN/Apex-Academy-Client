'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { QueryParams } from '@/types/shared/query.type';
import { Filter, X } from 'lucide-react';
import { getPrograms } from '@/services/program';
import { getDepartmentByProgramId } from '@/services/department';
import { getClassesByDepartmentId } from '@/services/academicClass';
import { getShifts } from '@/services/shift';
import { getExamYears } from '@/services/examConfig';
import { getFilteredSections } from '@/services/academicSection';
import type { Program } from '@/app/(dashboard)/dashboard/settings/system/program-config/_components/types/type';
import type { Department } from '@/app/(dashboard)/dashboard/settings/system/department/_components/types';
import type { TClass } from '@/app/(dashboard)/dashboard/settings/system/class-config/_components/types/types';
import type { TShift } from '@/types/modules/shift/shift.type';

// Reuse client-side types if not available, fallback to minimal shape
type ProgramOption = Program & { id: string; program_name: string };
type DepartmentOption = Department & { id: string; department_name: string };
type ClassOption = TClass & { id: string; class_name: string };
type ShiftOption = TShift & { id: string; name: string };
type SectionOption = { id: string; name: string };

// Static shift options used only when the shifts API returns an empty list.
// Kept in sync with the Shift select content below.
const FALLBACK_SHIFT_NAMES = ['Morning', 'Day', 'Evening'];

interface ExamFiltersProps {
    onFilterChange: (filters: QueryParams[]) => void;
    yearsRefreshKey?: number;
}

const ExamFilters = ({ onFilterChange, yearsRefreshKey }: ExamFiltersProps) => {
    const [programs, setPrograms] = useState<ProgramOption[]>([]);
    const [departments, setDepartments] = useState<DepartmentOption[]>([]);
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [shifts, setShifts] = useState<ShiftOption[]>([]);
    const [sections, setSections] = useState<SectionOption[]>([]);

    const [loadingPrograms, setLoadingPrograms] = useState(true);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingShifts, setLoadingShifts] = useState(true);
    const [loadingSections, setLoadingSections] = useState(false);

    const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [selectedExamYear, setSelectedExamYear] = useState<string | null>(null);
    const [selectedShift, setSelectedShift] = useState<string | null>(null);

    const [examYears, setExamYears] = useState<number[]>([]);
    const [loadingExamYears, setLoadingExamYears] = useState(true);

    // Base UI Select label maps, passed to each Select root via `items` so the
    // closed trigger always resolves the option name (never the raw ID).
    // Filter options state lives only in this component: programs/shifts are
    // fetched once on mount and kept (never cleared on Confirm), and cascading
    // lists are only replaced together with their selection resets.
    const programItems = useMemo(
        () => programs.map((p) => ({ value: p.id, label: p.program_name })),
        [programs],
    );
    const departmentItems = useMemo(
        () => departments.map((d) => ({ value: d.id, label: d.department_name })),
        [departments],
    );
    const classItems = useMemo(
        () => classes.map((c) => ({ value: c.id, label: c.class_name })),
        [classes],
    );
    const sectionItems = useMemo(
        () => sections.map((s) => ({ value: s.id, label: s.name })),
        [sections],
    );
    const shiftItems = useMemo(
        () =>
            shifts.length > 0
                ? shifts.map((s) => ({ value: s.id, label: s.name }))
                : FALLBACK_SHIFT_NAMES.map((name) => ({ value: name, label: name })),
        [shifts],
    );
    const examYearItems = useMemo(
        () => examYears.map((year) => ({ value: String(year), label: String(year) })),
        [examYears],
    );

    // Safety net: resolve the selected ID to its label; if the ID has no
    // matching option, fall back to the placeholder text. Never returns a raw ID.
    const programLabel = selectedProgram
        ? (programItems.find((i) => i.value === selectedProgram)?.label ?? 'Select program')
        : undefined;
    const departmentLabel = selectedDepartment
        ? (departmentItems.find((i) => i.value === selectedDepartment)?.label ?? 'Select department')
        : undefined;
    const classLabel = selectedClass
        ? (classItems.find((i) => i.value === selectedClass)?.label ?? 'Select year/class')
        : undefined;
    const sectionLabel = selectedSection
        ? (sectionItems.find((i) => i.value === selectedSection)?.label ?? 'Select section')
        : undefined;
    const shiftLabel = selectedShift
        ? (shiftItems.find((i) => i.value === selectedShift)?.label ?? 'Select shift')
        : undefined;

    const fetchProgramsAndShifts = useCallback(async () => {
        setLoadingPrograms(true);
        setLoadingShifts(true);
        try {
            const [programRes, shiftRes] = await Promise.all([
                getPrograms([]),
                getShifts([]).catch(() => null),
            ]);
            setPrograms(programRes?.data || []);
            if (shiftRes) setShifts(shiftRes?.data || []);
        } catch (error) {
            console.error('Error fetching programs/shifts:', error);
        } finally {
            setLoadingPrograms(false);
            setLoadingShifts(false);
        }
    }, []);

    useEffect(() => {
        fetchProgramsAndShifts();
    }, [fetchProgramsAndShifts]);

    const fetchDepartments = useCallback(async (programId: string) => {
        setLoadingDepartments(true);
        try {
            const res = await getDepartmentByProgramId(programId);
            const data = res?.data;
            setDepartments(Array.isArray(data) ? data : data ? [data] : []);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setDepartments([]);
        } finally {
            setLoadingDepartments(false);
        }
    }, []);

    const fetchClasses = useCallback(async (departmentId: string) => {
        setLoadingClasses(true);
        try {
            const res = await getClassesByDepartmentId(departmentId);
            setClasses(res?.data || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
            setClasses([]);
        } finally {
            setLoadingClasses(false);
        }
    }, []);

    const fetchSections = useCallback(async (programId: string | null, departmentId: string | null, classId: string | null) => {
        if (!programId || !departmentId) {
            setSections([]);
            return;
        }
        setLoadingSections(true);
        try {
            const filters: QueryParams[] = [
                { label: 'programId', value: programId },
                { label: 'departmentId', value: departmentId },
            ];
            if (classId) filters.push({ label: 'classId', value: classId });
            const res = await getFilteredSections(filters);
            const data = res?.data || [];
            setSections(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching sections:', error);
            setSections([]);
        } finally {
            setLoadingSections(false);
        }
    }, []);

    const fetchExamYears = useCallback(async () => {
        setLoadingExamYears(true);
        try {
            const filters: QueryParams[] = [];
            if (selectedProgram) filters.push({ label: 'program_id', value: selectedProgram });
            if (selectedDepartment) filters.push({ label: 'department_id', value: selectedDepartment });
            if (selectedClass) filters.push({ label: 'academic_class_id', value: selectedClass });
            if (selectedSection) filters.push({ label: 'section', value: selectedSection });
            if (selectedShift) filters.push({ label: 'shift', value: selectedShift });

            const res = await getExamYears(filters);
            const raw = res?.data;
            let years: number[] = [];
            if (Array.isArray(raw)) {
                years = raw.map((v: unknown) => Number(v)).filter((n: number) => !Number.isNaN(n));
            } else if (raw && Array.isArray((raw as { years?: unknown }).years)) {
                years = ((raw as { years: unknown[] }).years).map((v) => Number(v)).filter((n) => !Number.isNaN(n));
            }
            years.sort((a, b) => b - a);
            setExamYears(years);
            setSelectedExamYear((prev) => (prev && !years.map(String).includes(prev) ? null : prev));
        } catch (error) {
            console.error('Error fetching exam years:', error);
            setExamYears([]);
        } finally {
            setLoadingExamYears(false);
        }
    }, [selectedProgram, selectedDepartment, selectedClass, selectedSection, selectedShift]);

    useEffect(() => {
        fetchExamYears();
    }, [fetchExamYears]);

    useEffect(() => {
        if (yearsRefreshKey) {
            fetchExamYears();
        }
    }, [yearsRefreshKey, fetchExamYears]);

    const handleProgramChange = (value: string | null) => {
        setSelectedProgram(value);
        // Reset dependent filters: Department, Year/Class and Section
        setSelectedDepartment(null);
        setSelectedClass(null);
        setSelectedSection(null);
        setDepartments([]);
        setClasses([]);
        setSections([]);
        if (value) fetchDepartments(value);
    };

    const handleDepartmentChange = (value: string | null) => {
        setSelectedDepartment(value);
        setSelectedClass(null);
        setSelectedSection(null);
        setClasses([]);
        setSections([]);
        if (value && selectedProgram) {
            fetchClasses(value);
            fetchSections(selectedProgram, value, null);
        } else if (value) {
            fetchClasses(value);
        }
    };

    const handleClassChange = (value: string | null) => {
        setSelectedClass(value);
        setSelectedSection(null);
        setSections([]);
        if (selectedProgram && selectedDepartment) {
            fetchSections(selectedProgram, selectedDepartment, value);
        }
    };

    const handleFilter = () => {
        const filters: QueryParams[] = [];
        if (selectedProgram) filters.push({ label: 'program_id', value: selectedProgram });
        if (selectedDepartment) filters.push({ label: 'department_id', value: selectedDepartment });
        if (selectedClass) filters.push({ label: 'academic_class_id', value: selectedClass });
        if (selectedSection) filters.push({ label: 'section', value: selectedSection });
        if (selectedExamYear) filters.push({ label: 'exam_year', value: selectedExamYear });
        if (selectedShift) filters.push({ label: 'shift', value: selectedShift });
        onFilterChange(filters);
    };

    const handleReset = () => {
        setSelectedProgram(null);
        setSelectedDepartment(null);
        setSelectedClass(null);
        setSelectedSection(null);
        setSelectedExamYear(null);
        setSelectedShift(null);
        setDepartments([]);
        setClasses([]);
        setSections([]);
        onFilterChange([]);
    };

    return (
        <div className="space-y-4 rounded-lg border border-border/50 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* 1. Program */}
                <div className="space-y-2">
                    <Label htmlFor="program" className="text-xs font-medium text-slate-700">
                        Program
                    </Label>
                    <Select
                        items={programItems}
                        value={selectedProgram}
                        onValueChange={handleProgramChange}
                        disabled={loadingPrograms}
                    >
                        <SelectTrigger id="program" className="h-9">
                            <SelectValue placeholder={loadingPrograms ? 'Loading...' : 'Select program'}>
                                {programLabel}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {loadingPrograms ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">Loading...</div>
                            ) : programs.length === 0 ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">No programs found</div>
                            ) : (
                                programs.map((program) => (
                                    <SelectItem key={program.id} value={program.id}>
                                        {program.program_name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* 2. Department */}
                <div className="space-y-2">
                    <Label htmlFor="department" className="text-xs font-medium text-slate-700">
                        Department
                    </Label>
                    <Select
                        items={departmentItems}
                        value={selectedDepartment}
                        onValueChange={handleDepartmentChange}
                        disabled={!selectedProgram || loadingDepartments}
                    >
                        <SelectTrigger id="department" className="h-9">
                            <SelectValue
                                placeholder={
                                    !selectedProgram
                                        ? 'Select program first'
                                        : loadingDepartments
                                          ? 'Loading...'
                                          : 'Select department'
                                }
                            >
                                {departmentLabel}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {!selectedProgram ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">Select a program first</div>
                            ) : loadingDepartments ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">Loading...</div>
                            ) : departments.length === 0 ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">No departments found</div>
                            ) : (
                                departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                        {dept.department_name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* 3. Year/Class */}
                <div className="space-y-2">
                    <Label htmlFor="yearClass" className="text-xs font-medium text-slate-700">
                        Year/Class
                    </Label>
                    <Select
                        items={classItems}
                        value={selectedClass}
                        onValueChange={handleClassChange}
                        disabled={!selectedDepartment || loadingClasses}
                    >
                        <SelectTrigger id="yearClass" className="h-9">
                            <SelectValue
                                placeholder={
                                    !selectedDepartment
                                        ? 'Select department first'
                                        : loadingClasses
                                          ? 'Loading...'
                                          : 'Select year/class'
                                }
                            >
                                {classLabel}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {!selectedDepartment ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">Select a department first</div>
                            ) : loadingClasses ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">Loading...</div>
                            ) : classes.length === 0 ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">No classes found</div>
                            ) : (
                                classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.class_name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* 4. Section */}
                <div className="space-y-2">
                    <Label htmlFor="section" className="text-xs font-medium text-slate-700">
                        Section
                    </Label>
                    <Select
                        items={sectionItems}
                        value={selectedSection}
                        onValueChange={setSelectedSection}
                        disabled={!selectedDepartment || loadingSections}
                    >
                        <SelectTrigger id="section" className="h-9">
                            <SelectValue
                                placeholder={
                                    !selectedDepartment
                                        ? 'Select department first'
                                        : loadingSections
                                          ? 'Loading...'
                                          : 'Select section'
                                }
                            >
                                {sectionLabel}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {!selectedDepartment ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">Select department first</div>
                            ) : loadingSections ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">Loading...</div>
                            ) : sections.length === 0 ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">No sections found</div>
                            ) : (
                                sections.map((section) => (
                                    <SelectItem key={section.id} value={section.id}>
                                        {section.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* 5. Exam Year */}
                <div className="space-y-2">
                    <Label htmlFor="examYear" className="text-xs font-medium text-slate-700">
                        Exam Year
                    </Label>
                    <Select items={examYearItems} value={selectedExamYear} onValueChange={setSelectedExamYear}>
                        <SelectTrigger id="examYear" className="h-9">
                            <SelectValue placeholder="Select year">{selectedExamYear ?? undefined}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {loadingExamYears ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">Loading...</div>
                            ) : examYears.length === 0 ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">No exam years found</div>
                            ) : (
                                examYears.map((year) => (
                                    <SelectItem key={String(year)} value={String(year)}>
                                        {year}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* 6. Shift */}
                <div className="space-y-2">
                    <Label htmlFor="shift" className="text-xs font-medium text-slate-700">
                        Shift
                    </Label>
                    <Select items={shiftItems} value={selectedShift} onValueChange={setSelectedShift} disabled={loadingShifts}>
                        <SelectTrigger id="shift" className="h-9">
                            <SelectValue placeholder={loadingShifts ? 'Loading...' : 'Select shift'}>
                                {shiftLabel}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {loadingShifts ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">Loading...</div>
                            ) : shifts.length === 0 ? (
                                FALLBACK_SHIFT_NAMES.map((name) => (
                                    <SelectItem key={name} value={name}>
                                        {name}
                                    </SelectItem>
                                ))
                            ) : (
                                shifts.map((shift) => (
                                    <SelectItem key={shift.id} value={shift.id}>
                                        {shift.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button onClick={handleFilter} className="h-9 px-4 text-sm font-medium">
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    Confirm
                </Button>
                <Button
                    variant="outline"
                    onClick={handleReset}
                    className="h-9 px-4 text-sm font-medium"
                >
                    <X className="mr-2 h-3.5 w-3.5" />
                    Reset
                </Button>
            </div>
        </div>
    );
};

export default ExamFilters;
