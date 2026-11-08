import { notFound } from "next/navigation";
import { getFeeManage } from "@/services/feeType";
import type { QueryParams } from "@/types/shared/query.type";
import PayDuesView from "../../_components/PayDuesView";

interface PayDuesPageProps {
  params: Promise<{ id: string }>;
}

const PayDuesPage = async ({ params }: PayDuesPageProps) => {
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

  return <PayDuesView student={student} />;
};

export default PayDuesPage;
