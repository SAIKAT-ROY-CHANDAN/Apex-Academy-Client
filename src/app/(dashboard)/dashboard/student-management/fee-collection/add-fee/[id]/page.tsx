import { getStudent } from '@/services/student';
import { notFound } from 'next/navigation';
import AddStudentFeeCollectionDialog from './_components/AddStudentFeeCollectionDialog';

interface StudentFeeCollectionConfigurationProps {
    params: Promise<{
        id: string;
    }>;
}

const StudentFeeCollectionConfiguration = async ({
    params,
}: StudentFeeCollectionConfigurationProps) => {
    const { id } = await params;

    const studentResponse = await getStudent(id);

    if (!studentResponse?.success || !studentResponse?.data) {
        notFound();
    }

    const student = studentResponse.data;

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Fee Collections for {student.name}</h2>
            <AddStudentFeeCollectionDialog
                defaultStudentId={id}
            />
        </div>
    );
};

export default StudentFeeCollectionConfiguration;