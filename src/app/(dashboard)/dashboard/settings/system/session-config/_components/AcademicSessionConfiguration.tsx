'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { getInstitutionDetails } from '@/services/institution';
import { AcademicSession } from './types/academic-session';
import AcademicSessionDialog from './academic-session-dialog';

const AcademicSessionConfiguration = () => {
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [institutionId, setInstitutionId] = useState<string | null>(null);

    const handleSessionCreated = (newSession: AcademicSession) => {
        setSessions((prev) => [...prev, newSession]);
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
    return (
        <div className="space-y-4">
            <PageHeader title="Academic Sessions" backHref="/dashboard/settings/system" components={<AcademicSessionDialog
                institutionId={institutionId}
                onSessionCreated={handleSessionCreated}
            />} />

            {/* Render your sessions table/list here using `sessions` */}
        </div>
    );
};

export default AcademicSessionConfiguration;