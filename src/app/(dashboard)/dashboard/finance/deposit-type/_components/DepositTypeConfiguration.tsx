'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { TDepositType } from './Types/deposit-type';
import AddDepositTypeDialog from './DepositTypeDialog';

const DepositTypeConfiguration = () => {
    const [depositTypes, setDepositTypes] = useState<TDepositType[]>([]);

    const handleDepositTypeCreated = (newDepositType: TDepositType) => {
        setDepositTypes((prev) => [...prev, newDepositType]);
    };

    return (
        <div className="space-y-4">
            <PageHeader title="Deposit Types" backHref="/dashboard/finance" components={<AddDepositTypeDialog
                onDepositTypeCreated={handleDepositTypeCreated}
            />} />

         </div>
    );
};

export default DepositTypeConfiguration;