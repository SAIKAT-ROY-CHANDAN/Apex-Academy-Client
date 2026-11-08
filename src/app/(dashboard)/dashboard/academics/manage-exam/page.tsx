'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import ExamConfigDialog from './_components/ExamConfigDialog';
import ExamConfigTable from './_components/ExamConfigTable';
import ExamFilters from './_components/ExamFilters';
import { TClass } from '@/app/(dashboard)/dashboard/settings/system/class-config/_components/types/types';
import { Program } from '@/app/(dashboard)/dashboard/settings/system/program-config/_components/types/type';
import { getExamConfigs } from '@/services/examConfig';
import { TExamConfig } from './_components/types/exam-config';
import { QueryParams } from '@/types/shared/query.type';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const ManageExam = () => {
    const searchParams = useSearchParams();
    const [exams, setExams] = useState<TExamConfig[]>([]);
    const [classes, setClasses] = useState<TClass[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [yearsRefreshKey, setYearsRefreshKey] = useState(0);

    const fetchExams = useCallback(async (filters: QueryParams[] = []) => {
        setLoading(true);
        try {
            const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
            setCurrentPage(page);
            // Pass page to API for server-side pagination
            const paginatedFilters = [...filters];
            if (page > 1) paginatedFilters.push({ label: 'page', value: String(page) });

            const response = await getExamConfigs(paginatedFilters);
            if (response?.success) {
                const data = response.data || [];
                // New backend returns { data, meta } via sendResponse; legacy returns flat totals
                const meta = response.meta as { totalItems?: number; totalPages?: number } | undefined;
                setExams(Array.isArray(data) ? data : []);
                setTotalItems(meta?.totalItems ?? (response as unknown as { totalItems?: number }).totalItems ?? data.length ?? 0);
                setTotalPages(meta?.totalPages ?? (response as unknown as { totalPages?: number }).totalPages ?? 0);
            }
        } catch (error) {
            console.error("Error fetching exams:", error);
            toast.error("Failed to fetch exams");
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch classes and programs for filters and forms
                const { getAcademicClassDetails } = await import('@/services/academicClass');
                const { getPrograms } = await import('@/services/program');
                
                const [classesData, programsData] = await Promise.all([
                    getAcademicClassDetails(),
                    getPrograms([]),
                ]);
                
                setClasses(classesData?.data || []);
                setPrograms(programsData?.data || []);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    const handleFilterChange = (filters: QueryParams[]) => {
        fetchExams(filters);
    };

    const handleExamCreated = () => {
        fetchExams();
        setYearsRefreshKey((k) => k + 1);
    };

    const handleExamChanged = () => {
        fetchExams();
        setYearsRefreshKey((k) => k + 1);
    };

    const handleExport = () => {
        // Implement export functionality
        toast.info('Export functionality coming soon');
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Manage Exam" 
                backHref="/dashboard/academics" 
                components={<ExamConfigDialog programs={programs} onExamCreated={handleExamCreated} />}
            />

            <ExamFilters onFilterChange={handleFilterChange} yearsRefreshKey={yearsRefreshKey} />

            <ExamConfigTable
                exams={exams}
                currentPage={currentPage}
                totalItems={totalItems}
                totalPages={totalPages}
                classes={classes}
                programs={programs}
                onChanged={handleExamChanged}
            />
        </div>
    );
};

export default ManageExam;