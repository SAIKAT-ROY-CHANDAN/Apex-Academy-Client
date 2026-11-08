import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CollectionRecord } from "./types/collectionReport";

interface CollectionRecordsTableProps {
  records: CollectionRecord[];
}

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export function CollectionRecordsTable({ records }: CollectionRecordsTableProps) {
  if (records.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-400">
        No collection records available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Student</TableHead>
            <TableHead>Class/Year</TableHead>
            <TableHead>Fee Item</TableHead>
            <TableHead>Collection Date</TableHead>
            <TableHead className="text-right">Paid Amount</TableHead>
            <TableHead className="text-right">Scholarship</TableHead>
            <TableHead className="text-right">Fine</TableHead>
            <TableHead className="text-right">Line Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">
                {record.student_name}
              </TableCell>
              <TableCell>{record.class_name}</TableCell>
              <TableCell>{record.fee_item_name}</TableCell>
              <TableCell>{record.collection_date}</TableCell>
              <TableCell className="text-right">
                ৳{formatAmount(record.paid_amount)}
              </TableCell>
              <TableCell className="text-right">
                ৳{formatAmount(record.discount_amount)}
              </TableCell>
              <TableCell className="text-right">
                ৳{formatAmount(record.fine_amount)}
              </TableCell>
              <TableCell className="text-right">
                ৳{formatAmount(record.line_total_amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}