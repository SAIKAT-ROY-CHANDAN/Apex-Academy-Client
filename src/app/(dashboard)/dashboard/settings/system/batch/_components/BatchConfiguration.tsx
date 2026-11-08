'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Batch } from './Types/batch';
import AddBatchDialog from './BatchDialog';

const BatchConfiguration = () => {
    const [batches, setBatches] = useState<Batch[]>([]);

    const handleBatchCreated = (newBatch: Batch) => {
        setBatches((prev) => [...prev, newBatch]);
    };

    return (
        <div className="space-y-4">
            <PageHeader title="Batches" backHref="/dashboard/settings/system" components={<AddBatchDialog
                onBatchCreated={handleBatchCreated}
            />} />

         </div>
    );
};

export default BatchConfiguration;