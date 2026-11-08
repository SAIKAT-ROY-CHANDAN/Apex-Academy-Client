'use client';

import { useEffect, useState } from 'react';
import { getDepositTypes } from '@/services/depositType';
import { TDepositType } from '../../deposit-type/_components/Types/deposit-type';
import { TDeposit } from './types/deposit';
import { PageHeader } from '@/components/shared/page-header';
import DepositDialog from './DepositDialog';

const DepositConfiguration = () => {
    const [deposits, setDeposits] = useState<TDeposit[]>([]);
    const [depositTypes, setDepositTypes] = useState<TDepositType[]>([]);

    const handleDepositCreated = (newDeposit: TDeposit) => {
        setDeposits((prev) => [...prev, newDeposit]);
    };

    useEffect(() => {
        const fetchDepositTypes = async () => {
            try {
                const depositTypeData = await getDepositTypes();
                setDepositTypes(depositTypeData?.data);
            } catch (error) {
                console.error("Error fetching deposit types:", error);
            }
        };

        fetchDepositTypes();
    }, []);

    return (
        <div className="space-y-4">
            <PageHeader title="Deposits" backHref="/dashboard/finance" components={<DepositDialog depositTypes={depositTypes} onDepositCreated={handleDepositCreated} />} />

        </div>
    );
};

export default DepositConfiguration;