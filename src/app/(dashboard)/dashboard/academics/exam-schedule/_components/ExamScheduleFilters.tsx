'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TSubject } from '@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types';
import {
    buildExamOptionLabels,
    type ExamOption,
} from './types/exam-option';
import { getExamOptions } from '@/services/examConfig';
import { getSubjectDetails } from '@/services/subject';
import { getPrograms } from '@/services/program';
import { getDepartments } from '@/services/department';
import { getAcademicClassDetails } from '@/services/academicClass';
import { QueryParams } from '@/types/shared/query.type';
import { useSearchParams, useRouter } from 'next/navigation';
import { X, Filter } from 'lucide-react';
import { Program } from '@/app/(dashboard)/dashboard/settings/system/program-config/_components/types/type';

type DepartmentOption = { id: string; department_name: string; program_id: string | null };
type AcademicClassOption = {
    id: string;
    program_id: string | null;
    department_id: string | null;
    class_name: string;
    class_level: number | null;
    year_level: number | null;
};

interface ExamScheduleFiltersProps {
    onFilterChange: (filters: QueryParams[]) => void;
}

const ExamScheduleFilters = ({ onFilterChange }: ExamScheduleFiltersProps) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    // Exam options are dynamic: narrowed by Program/Department/Year via the
    // exam-config/options endpoint. This state is separate from the schedules
    // table state — table reloads never touch it.
    const [examOptions, setExamOptions] = useState<ExamOption[]>([]);
    const [loadingExams, setLoadingExams] = useState(true);
    const [subjects, setSubjects] = useState<TSubject[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [departments, setDepartments] = useState<DepartmentOption[]>([]);
    const [academicClasses, setAcademicClasses] = useState<AcademicClassOption[]>([]);
    const [loading, setLoading] = useState(true);

    // URL-persisted states — prefill from searchParams (subject-config uses programId/departmentId/levelYear or year)
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
        searchParams.get('programId') ?? searchParams.get('program_id')
    );
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(
        searchParams.get('departmentId') ?? searchParams.get('department_id')
    );
    const [selectedYear, setSelectedYear] = useState<string | null>(
        searchParams.get('year') ?? searchParams.get('levelYear') ?? searchParams.get('level_year')
    );
    const [selectedExam, setSelectedExam] = useState<string | null>(searchParams.get('exam_config_id') ?? searchParams.get('examConfigId'));
    const [selectedSubject, setSelectedSubject] = useState<string | null>(searchParams.get('subject_id') ?? searchParams.get('subjectId'));
    const [selectedDate, setSelectedDate] = useState<string>(searchParams.get('exam_date') ?? searchParams.get('examDate') ?? '');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsData, programsData, departmentsData, classesData] = await Promise.all([
                    getSubjectDetails([{ label: 'limit', value: '100' }]),
                    getPrograms([{ label: 'limit', value: '100' }]),
                    getDepartments([{ label: 'limit', value: '100' }]),
                    getAcademicClassDetails([{ label: 'limit', value: '100' }]),
                ]);
                setSubjects(subjectsData?.data || []);
                setPrograms(programsData?.data || []);
                setDepartments((departmentsData?.data || []) as DepartmentOption[]);
                const classRaw = classesData?.data || [];
                setAcademicClasses(Array.isArray(classRaw) ? (classRaw as AcademicClassOption[]) : []);
            } catch (error) {
                console.error("Error fetching filter data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Dynamic Exam options: fetched on load and whenever a parent filter
    // changes. Previous options are kept until the new ones arrive (never
    // cleared on refetch or table reload). A selected exam that is no longer
    // in the refreshed list is reset to "All Exams".
    useEffect(() => {
        let cancelled = false;
        const fetchExams = async () => {
            setLoadingExams(true);
            try {
                const params: QueryParams[] = [];
                if (selectedProgramId) params.push({ label: 'programId', value: selectedProgramId });
                if (selectedDepartmentId) params.push({ label: 'departmentId', value: selectedDepartmentId });
                if (selectedYear) params.push({ label: 'yearLevel', value: selectedYear });
                const res = await getExamOptions(params);
                if (cancelled) return;
                const data: ExamOption[] = Array.isArray(res?.data) ? res.data : [];
                setExamOptions(data);
                setSelectedExam((prev) => (prev && !data.some((o) => o.id === prev) ? null : prev));
            } catch (error) {
                console.error("Error fetching exam options:", error);
            } finally {
                if (!cancelled) setLoadingExams(false);
            }
        };

        fetchExams();
        return () => {
            cancelled = true;
        };
    }, [selectedProgramId, selectedDepartmentId, selectedYear]);

    // Distinguishable labels: "Name - Class (Section)", plus exam date on ties.
    const examLabels = useMemo(() => buildExamOptionLabels(examOptions), [examOptions]);
    const examItems = useMemo(
        () => [
            { value: "__all__", label: "All Exams" },
            ...examOptions.map((o) => ({ value: o.id, label: examLabels.get(o.id) ?? o.name })),
        ],
        [examOptions, examLabels],
    );

    // Sync from URL when back/forward navigation changes searchParams (e.g. shared link)
    useEffect(() => {
        setSelectedProgramId(searchParams.get('programId') ?? searchParams.get('program_id'));
        setSelectedDepartmentId(searchParams.get('departmentId') ?? searchParams.get('department_id'));
        setSelectedYear(searchParams.get('year') ?? searchParams.get('levelYear') ?? searchParams.get('level_year'));
        setSelectedExam(searchParams.get('exam_config_id') ?? searchParams.get('examConfigId'));
        setSelectedSubject(searchParams.get('subject_id') ?? searchParams.get('subjectId'));
        setSelectedDate(searchParams.get('exam_date') ?? searchParams.get('examDate') ?? '');
    }, [searchParams]);

    const filteredDepartments = useMemo(() => {
        if (!selectedProgramId) return departments;
        return departments.filter((d) => d.program_id === selectedProgramId);
    }, [departments, selectedProgramId]);

    const levelYearOptions = useMemo(() => {
        let pool = academicClasses;
        if (selectedProgramId) pool = pool.filter((c) => c.program_id === selectedProgramId);
        if (selectedDepartmentId) pool = pool.filter((c) => c.department_id === selectedDepartmentId);
        const distinct = new Map<number, string>();
        for (const cls of pool) {
            const lvl = cls.year_level ?? cls.class_level;
            if (lvl == null) continue;
            if (!distinct.has(lvl)) distinct.set(lvl, String(lvl));
        }
        return Array.from(distinct.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([value, label]) => ({ value: String(value), label }));
    }, [academicClasses, selectedProgramId, selectedDepartmentId]);

    // Subject dropdown scoped to Program + Department + Year (same logic as subject-config / class-routine)
    const filteredSubjects = useMemo(() => {
        if (!selectedProgramId && !selectedDepartmentId && !selectedYear) return subjects;
        return subjects.filter((subject) => {
            const ac: any = (subject as any).academicClass;
            if (!ac) {
                // If subject has no expanded academicClass, we can't scope it — keep it only when no filters active (handled above)
                return false;
            }
            if (selectedProgramId && String(ac.program_id) !== String(selectedProgramId)) return false;
            if (selectedDepartmentId && String(ac.department_id) !== String(selectedDepartmentId)) return false;
            if (selectedYear) {
                const subjectLevel = ac.year_level ?? ac.class_level;
                if (String(subjectLevel) !== String(selectedYear)) return false;
            }
            return true;
        });
    }, [subjects, selectedProgramId, selectedDepartmentId, selectedYear]);

    // Guard: if selected department no longer belongs to selected program, clear it
    useEffect(() => {
        if (selectedDepartmentId && selectedProgramId && !filteredDepartments.some((d) => d.id === selectedDepartmentId)) {
            setSelectedDepartmentId(null);
            setSelectedSubject(null);
        }
    }, [selectedDepartmentId, selectedProgramId, filteredDepartments]);

    // Guard: if selected year no longer in options, keep it (allow independent) — but clear subject if subject no longer valid
    useEffect(() => {
        if (selectedSubject && !filteredSubjects.some((s) => s.id === selectedSubject)) {
            // Don't auto-clear immediately while loading (subjects not yet fetched)
            if (subjects.length > 0) setSelectedSubject(null);
        }
    }, [selectedSubject, filteredSubjects, subjects.length]);

    const handleProgramChange = (value: string | null) => {
        const nextProgram = !value || value === '__all__' ? null : value;
        // Cascading reset: Program -> Department, Year/Level, Course Code, Exam.
        // Date is independent and never reset.
        setSelectedProgramId(nextProgram);
        setSelectedDepartmentId(null);
        setSelectedYear(null);
        setSelectedSubject(null);
        setSelectedExam(null);
    };

    const handleDepartmentChange = (value: string | null) => {
        const nextDept = !value || value === '__all__' ? null : value;
        // Cascading reset: Department -> Year/Level, Course Code, Exam.
        setSelectedDepartmentId(nextDept);
        setSelectedYear(null);
        setSelectedSubject(null);
        setSelectedExam(null);
    };

    const handleYearChange = (value: string | null) => {
        const nextYear = !value || value === '__all__' ? null : value;
        // Cascading reset: Year/Level -> Course Code, Exam.
        setSelectedYear(nextYear);
        setSelectedSubject(null);
        setSelectedExam(null);
    };

    const handleFilter = () => {
        const filters: QueryParams[] = [];
        if (selectedProgramId) filters.push({ label: 'programId', value: selectedProgramId });
        if (selectedDepartmentId) filters.push({ label: 'departmentId', value: selectedDepartmentId });
        if (selectedYear) filters.push({ label: 'year', value: selectedYear });
        if (selectedExam) filters.push({ label: 'examConfigId', value: selectedExam });
        if (selectedSubject) filters.push({ label: 'subjectId', value: selectedSubject });
        if (selectedDate) filters.push({ label: 'exam_date', value: selectedDate });

        // Persist to URL for shareable/reloadable view (subject-config style)
        const params = new URLSearchParams(searchParams.toString());
        const sync = (key: string, val: string | null, aliases: string[] = []) => {
            if (val) params.set(key, val);
            else params.delete(key);
            aliases.forEach((a) => params.delete(a));
        };
        sync('programId', selectedProgramId, ['program_id']);
        sync('departmentId', selectedDepartmentId, ['department_id']);
        sync('year', selectedYear, ['levelYear', 'level_year']);
        sync('subject_id', selectedSubject, ['subjectId']);
        sync('exam_config_id', selectedExam, ['examConfigId']);
        if (selectedDate) { params.set('exam_date', selectedDate); params.delete('examDate'); }
        else { params.delete('exam_date'); params.delete('examDate'); }
        params.delete('page');
        router.push(`?${params.toString()}`);

        onFilterChange(filters);
    };

    const handleClearFilters = () => {
        setSelectedProgramId(null);
        setSelectedDepartmentId(null);
        setSelectedYear(null);
        setSelectedExam(null);
        setSelectedSubject(null);
        setSelectedDate('');
        const params = new URLSearchParams(searchParams.toString());
        ['programId','program_id','departmentId','department_id','year','levelYear','level_year','subject_id','subjectId','exam_config_id','examConfigId','exam_date','examDate','page'].forEach(k=>params.delete(k));
        router.push(`?${params.toString()}`);
        onFilterChange([]);
    };

    const hasActiveFilters = !!(selectedProgramId || selectedDepartmentId || selectedYear || selectedExam || selectedSubject || selectedDate);

    return (
        <div className="space-y-4 rounded-lg border border-border/50 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div className="min-w-0 space-y-2">
                    <Label htmlFor="program" className="text-xs font-medium text-slate-700">
                        Program
                    </Label>
                    <Select value={selectedProgramId ?? "__all__"} onValueChange={(v) => handleProgramChange(v)} disabled={loading}>
                        <SelectTrigger id="program" className="h-9 w-full">
                            <SelectValue placeholder="All Programs">
                                {(value: string | null) => {
                                    if (!value || value === "__all__") return "All Programs";
                                    const selected = programs.find((p) => String(p.id) === String(value));
                                    const label = selected ? (selected as any).program_name : "All Programs";
                                    return <span title={label} className="truncate">{label}</span>;
                                }}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All Programs</SelectItem>
                            {programs.map((program: any) => (
                                <SelectItem key={program.id} value={program.id}>
                                    {program.program_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="min-w-0 space-y-2">
                    <Label htmlFor="department" className="text-xs font-medium text-slate-700">
                        Department
                    </Label>
                    <Select value={selectedDepartmentId ?? "__all__"} onValueChange={(v) => handleDepartmentChange(v)} disabled={loading}>
                        <SelectTrigger id="department" className="h-9 w-full">
                            <SelectValue placeholder="All Departments">
                                {(value: string | null) => {
                                    if (!value || value === "__all__") return "All Departments";
                                    const selected = departments.find((d) => String(d.id) === String(value));
                                    const label = selected ? selected.department_name : "All Departments";
                                    return <span title={label} className="truncate">{label}</span>;
                                }}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All Departments</SelectItem>
                            {filteredDepartments.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    {selectedProgramId ? "No departments for this program" : "No departments"}
                                </div>
                            ) : (
                                filteredDepartments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                        {dept.department_name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="min-w-0 space-y-2">
                    <Label htmlFor="year" className="text-xs font-medium text-slate-700">
                        Year / Level
                    </Label>
                    <Select value={selectedYear ?? "__all__"} onValueChange={(v) => handleYearChange(v)} disabled={loading}>
                        <SelectTrigger id="year" className="h-9 w-full">
                            <SelectValue placeholder="All Years">
                                {(value: string | null) => {
                                    if (!value || value === "__all__") return "All Years";
                                    return `Year ${value}`;
                                }}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All Years</SelectItem>
                            {levelYearOptions.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">No levels</div>
                            ) : (
                                levelYearOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        Year {o.label}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="min-w-0 space-y-2">
                    <Label htmlFor="subject" className="text-xs font-medium text-slate-700">
                        Course Code
                    </Label>
                    <Select value={selectedSubject ?? "__all__"} onValueChange={(v) => setSelectedSubject(v === '__all__' ? null : v)} disabled={loading}>
                        <SelectTrigger id="subject" className="h-9 w-full">
                            <SelectValue placeholder="All Subjects">
                                {(value: string | null) => {
                                    if (!value || value === '__all__') return "All Subjects";
                                    const selected = filteredSubjects.find((s) => s.id === value) ?? subjects.find((s) => s.id === value);
                                    const label = selected ? selected.name : "All Subjects";
                                    return <span title={label} className="truncate">{label}</span>;
                                }}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All Subjects</SelectItem>
                            {filteredSubjects.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    {selectedProgramId || selectedDepartmentId || selectedYear ? "No subjects for selected Program/Dept/Year" : "No subjects"}
                                </div>
                            ) : (
                                filteredSubjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="min-w-0 space-y-2">
                    <Label htmlFor="exam" className="text-xs font-medium text-slate-700">
                        Exam
                    </Label>
                    <Select items={examItems} value={selectedExam ?? "__all__"} onValueChange={(v) => setSelectedExam(v === '__all__' ? null : v)} disabled={loading}>
                        <SelectTrigger id="exam" className="h-9 w-full">
                            <SelectValue placeholder="All Exams">
                                {(value: string | null) => {
                                    if (!value || value === '__all__') return "All Exams";
                                    // Never show a raw ID: fall back to the placeholder text.
                                    const label = examLabels.get(value) ?? examOptions.find((o) => o.id === value)?.name ?? "All Exams";
                                    return <span title={label} className="truncate">{label}</span>;
                                }}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All Exams</SelectItem>
                            {loadingExams && examOptions.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    Loading exams...
                                </div>
                            ) : examOptions.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    No exams found
                                </div>
                            ) : (
                                examOptions.map((exam) => {
                                    const label = examLabels.get(exam.id) ?? exam.name;
                                    return (
                                        <SelectItem key={exam.id} value={exam.id}>
                                            <span title={label}>{label}</span>
                                        </SelectItem>
                                    );
                                })
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="min-w-0 space-y-2">
                    <Label htmlFor="date" className="text-xs font-medium text-slate-700">
                        Date
                    </Label>
                    <Input
                        id="date"
                        type="date"
                        placeholder="Select date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="h-9 w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button onClick={handleFilter} className="h-9 px-4 text-sm font-medium">
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    Confirm
                </Button>
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        onClick={handleClearFilters}
                        className="h-9 px-4 text-sm font-medium"
                    >
                        <X className="mr-2 h-3.5 w-3.5" />
                        Clear Filter
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ExamScheduleFilters;
