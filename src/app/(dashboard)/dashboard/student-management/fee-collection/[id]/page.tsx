import { getFeeManage } from "@/services/feeType";
import { QueryParams } from "@/types/shared/query.type";
import { notFound } from "next/navigation";
import StudentFeeDetailView from "../_components/Studentfeedetailview";

interface FeeCollectionDetailPageProps {
    params: Promise<{ id: string }>;
}

const FeeCollectionDetailPage = async ({
    params,
}: FeeCollectionDetailPageProps) => {
    const { id } = await params;

    const query: QueryParams[] = [
        { label: "filter", value: JSON.stringify({ id }) },
        { label: "limit", value: 1 },
    ];

    const response = await getFeeManage(query);

    const student = response.success ? response.data?.[0] : undefined;

    if (!response.success || !student) {
        notFound();
    }

    return <StudentFeeDetailView student={student} />;
};

export default FeeCollectionDetailPage;