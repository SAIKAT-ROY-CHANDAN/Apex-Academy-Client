'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import ExamScheduleDialog from './_components/ExamScheduleDialog';
import ExamScheduleTable from './_components/ExamScheduleTable';
import ExamScheduleFilters from './_components/ExamScheduleFilters';
import { TExamConfig } from '@/app/(dashboard)/dashboard/academics/manage-exam/_components/types/exam-config';
import { TSubject } from '@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types';
import { TClass } from '@/app/(dashboard)/dashboard/settings/system/class-config/_components/types/types';
import { Program } from '@/app/(dashboard)/dashboard/settings/system/program-config/_components/types/type';
import { getExamSchedules } from '@/services/examSchedule';
import { TExamSchedule } from './_components/types/exam-schedule';
import { QueryParams } from '@/types/shared/query.type';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const ExamSchedule = () => {
    const searchParams = useSearchParams();
    const [schedules, setSchedules] = useState<TExamSchedule[]>([]);
    const [exams, setExams] = useState<TExamConfig[]>([]);
    const [subjects, setSubjects] = useState<TSubject[]>([]);
    const [classes, setClasses] = useState<TClass[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchSchedules = useCallback(async (filters?: QueryParams[]) => {
        setLoading(true);
        try {
            const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
            setCurrentPage(page);

            // If caller passed explicit filters (including empty array for "clear"), use them directly.
            // Only when called with no args (undefined) derive from URL for shared links / reload.
            let effectiveFilters: QueryParams[];
            if (filters !== undefined) {
                effectiveFilters = filters;
            } else {
                const urlFilters: QueryParams[] = [];
                const programId = searchParams.get('programId') ?? searchParams.get('program_id');
                const departmentId = searchParams.get('departmentId') ?? searchParams.get('department_id');
                const year = searchParams.get('year') ?? searchParams.get('levelYear') ?? searchParams.get('level_year');
                const subjectId = searchParams.get('subject_id') ?? searchParams.get('subjectId');
                const examId = searchParams.get('exam_config_id') ?? searchParams.get('examConfigId');
                const examDate = searchParams.get('exam_date') ?? searchParams.get('examDate');
                if (programId) urlFilters.push({ label: 'programId', value: programId });
                if (departmentId) urlFilters.push({ label: 'departmentId', value: departmentId });
                if (year) urlFilters.push({ label: 'year', value: year });
                if (subjectId) urlFilters.push({ label: 'subjectId', value: subjectId });
                if (examId) urlFilters.push({ label: 'examConfigId', value: examId });
                if (examDate) urlFilters.push({ label: 'exam_date', value: examDate });
                effectiveFilters = urlFilters;
            }

            const response = await getExamSchedules(effectiveFilters);
            if (response?.success) {
                setSchedules(response.data || []);
                setTotalItems(response.totalItems || response.data?.length || 0);
                setTotalPages(response.totalPages || 0);
            }
        } catch (error) {
            console.error("Error fetching exam schedules:", error);
            toast.error("Failed to fetch exam schedules");
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const { getExamConfigs } = await import('@/services/examConfig');
                const { getSubjectDetails } = await import('@/services/subject');
                const { getAcademicClassDetails } = await import('@/services/academicClass');
                const { getPrograms } = await import('@/services/program');

                const [examsData, subjectsData, classesData, programsData] = await Promise.all([
                    getExamConfigs(),
                    getSubjectDetails([{ label: 'limit', value: '100' }]),
                    getAcademicClassDetails([{ label: 'limit', value: '100' }]),
                    getPrograms([{ label: 'limit', value: '100' }]),
                ]);

                setExams(examsData?.data || []);
                setSubjects(subjectsData?.data || []);
                setClasses(classesData?.data || []);
                setPrograms(programsData?.data || []);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const handleFilterChange = (filters: QueryParams[]) => {
        fetchSchedules(filters);
    };

    const handleScheduleCreated = () => {
        fetchSchedules();
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Exam Routine"
                backHref="/dashboard/academics"
                components={
                    <ExamScheduleDialog
                        exams={exams}
                        subjects={subjects}
                        classes={classes}
                        programs={programs}
                        onScheduleCreated={handleScheduleCreated}
                    />
                }
            />

            <ExamScheduleFilters onFilterChange={handleFilterChange} />

            <ExamScheduleTable
                schedules={schedules}
                currentPage={currentPage}
                totalItems={totalItems}
                totalPages={totalPages}
                exams={exams}
                subjects={subjects}
                classes={classes}
                programs={programs}
            />
        </div>
    );
};

export default ExamSchedule;