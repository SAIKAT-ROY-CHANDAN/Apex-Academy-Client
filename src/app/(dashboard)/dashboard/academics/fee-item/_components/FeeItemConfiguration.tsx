'use client';

import { useState } from 'react';
import { FeeItem } from './types/fee-item';
import { PageHeader } from '@/components/shared/page-header';
import FeeItemDialog from './FeeItemDialog';

const FeeItemConfiguration = () => {
    const [feeItems, setFeeItems] = useState<FeeItem[]>([]);

    const handleFeeItemCreated = (newFeeItem: FeeItem) => {
        setFeeItems((prev) => [...prev, newFeeItem]);
    };
    return (
        <div className="space-y-4">
            <PageHeader title="Fee Item" backHref="/dashboard/academics" components={<FeeItemDialog onFeeItemCreated={handleFeeItemCreated} />} />

        </div>
    );
};

export default FeeItemConfiguration;