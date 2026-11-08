"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Wallet } from "lucide-react";
import StampBadge from "./StampBadge";
import Perforation from "./Perforation";
import LedgerRow from "./LedgerRow";
import { Progress } from "@/components/ui/progress";


export default function DueItemCard({ item, onPay }:any) {
const taka = (amount:any) => {
  return "\u09F3" + new Intl.NumberFormat("en-IN").format(amount || 0);
}
  const pct = Math.round((item.paid_amount / item.total_amount) * 100);

  return (
    <Card className="relative overflow-hidden border-slate-200 shadow-sm">
      <div className="absolute right-4 top-4">
        <StampBadge label="Due" tone="due" />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-slate-400">
          <Receipt className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Fee ledger</span>
        </div>
        <h3
          className="mt-1 text-2xl font-semibold capitalize text-slate-900"
          style={{ fontFamily: "ui-serif, Georgia, 'Times New Roman', serif" }}
        >
          {item.feeItem.name}
        </h3>
      </CardHeader>

      <CardContent>
        <LedgerRow label="Total amount" value={taka(item.total_amount)} />
        <LedgerRow label="Paid" value={taka(item.paid_amount)} />
        <LedgerRow label="Scholarship" value={"- " + taka(item. _amount)} muted />

        <div className="mt-3">
          <Progress value={pct} className="h-2" />
          <div className="mt-1 flex justify-between text-[11px] text-slate-400">
            <span>{pct}% settled</span>
            <span>{100 - pct}% remaining</span>
          </div>
        </div>

        <Perforation />

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Amount due</p>
            <p className="text-3xl font-bold tabular-nums text-rose-600">
              {taka(item.due_amount)}
            </p>
          </div>
          <Button
            className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
            onClick={() =>
              onPay({ id: item.id, label: item.feeItem.name, amount: item.due_amount, kind: "Due balance", fee_month: item.fee_month, fee_year: item.fee_year, FeeItemType: item.feeItem.FeeItemType })
            }
          >
            <Wallet className="h-4 w-4" />
            Pay {taka(item.due_amount)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}