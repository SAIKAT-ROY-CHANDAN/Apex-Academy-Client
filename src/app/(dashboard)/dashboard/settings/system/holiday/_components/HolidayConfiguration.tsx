'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Holiday } from './types';
import AddHolidayDialog from './HolidayDialog';

const HolidayConfiguration = () => {
    const [holidays, setHolidays] = useState<Holiday[]>([]);

    const handleHolidayCreated = (newHoliday: Holiday) => {
        setHolidays((prev) => [...prev, newHoliday]);
    };

    return (
        <div className="space-y-4">
            <PageHeader title="Holidays" backHref="/dashboard/settings/system" components={<AddHolidayDialog onHolidayCreated={handleHolidayCreated} />} />
            {/* Render your holidays table/list here using `holidays` */}
        </div>
    );
};

export default HolidayConfiguration;