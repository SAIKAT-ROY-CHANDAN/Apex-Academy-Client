'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { FeeType } from './types/fee-type';
import FeeTypeDialog from './FeeTypeDialog';

const FeeTypeConfiguration = () => {
    const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);

    const handleFeeTypeCreated = (newFeeType: FeeType) => {
        setFeeTypes((prev) => [...prev, newFeeType]);
    };

    return (
        <div className="space-y-4">
            <PageHeader title="Fee Types" backHref="/dashboard/academics" components={<FeeTypeDialog
                onFeeTypeCreated={handleFeeTypeCreated}
            />} />

        </div>
    );
};

export default FeeTypeConfiguration;