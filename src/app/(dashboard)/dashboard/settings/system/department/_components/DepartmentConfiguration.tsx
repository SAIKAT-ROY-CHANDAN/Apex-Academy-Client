'use client';

import { useEffect, useState } from 'react';
import { getInstitutionDetails } from '@/services/institution';
import { getPrograms } from '@/services/program';
import { PageHeader } from '@/components/shared/page-header';
import { Department } from './types';
import DepartmentDialog from './department-dialog';
import { Program } from '../../program-config/_components/types/type';

const DepartmentConfiguration = ({}) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [institutionId, setInstitutionId] = useState<string | null>(null);

    const handleDepartmentCreated = (newDepartment: Department) => {
        setDepartments((prev) => [...prev, newDepartment]);
    };
    useEffect(() => {
        const fetchInstitutionDetails = async () => {
            try {
                const institutionData = await getInstitutionDetails();
                setInstitutionId(institutionData?.data?.id);
            } catch (error) {
                console.error("Error fetching institution details:", error);
            }
        };

        fetchInstitutionDetails();
    }, []);
    useEffect(() => {
        const fetchDepartmentDetails = async () => {
            try {
                const programData = await getPrograms([]);
                setPrograms(programData?.data);
            } catch (error) {
                console.error("Error fetching Program details:", error);
            }
        };

        fetchDepartmentDetails();
    }, []);
    return (
        <div className="space-y-4">
            <PageHeader title="Departments" backHref="/dashboard/settings/system" components={<DepartmentDialog
                institutionId={institutionId}
                programs={programs}
                onDepartmentCreated={handleDepartmentCreated}
            />} />
        </div>
    );
};

export default DepartmentConfiguration;