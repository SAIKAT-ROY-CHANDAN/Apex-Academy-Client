"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Landmark, Wallet } from "lucide-react";
import StampBadge from "./StampBadge";
import LedgerRow from "./LedgerRow";
import Perforation from "./Perforation";

const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
] as const;

export default function UnpaidItemCard({ entry, onPay }: any) {
  const now = new Date();
  const [feeMonth, setFeeMonth] = useState<string>(MONTHS[now.getMonth()]);
  const [feeYear, setFeeYear] = useState<string>(String(now.getFullYear()));

  const isOneTime = entry.FeeItemType === "OneTime";

  const taka = (amount: any) => {
    return "\u09F3" + new Intl.NumberFormat("en-IN").format(amount || 0);
  };

  return (
    <Card className="relative overflow-hidden border-slate-200 shadow-sm">
      <div className="absolute right-4 top-4">
        <StampBadge label="Unpaid" tone="unpaid" />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-slate-400">
          <Landmark className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Fee ledger</span>
        </div>
        <h3
          className="mt-1 text-2xl font-semibold text-slate-900"
          style={{ fontFamily: "ui-serif, Georgia, 'Times New Roman', serif" }}
        >
          {entry.name}
        </h3>
      </CardHeader>

      <CardContent>
        <LedgerRow label="Total amount" value={taka(entry.amount)} />
        <LedgerRow label="Paid" value={taka(0)} muted />

        {!isOneTime && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Fee Month</label>
              <Select value={feeMonth} onValueChange={(v) => v && setFeeMonth(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m} className="text-xs">
                      {m.charAt(0) + m.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Fee Year</label>
              <Select value={feeYear} onValueChange={(v) => v && setFeeYear(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <SelectItem key={y} value={String(y)} className="text-xs">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <Perforation />

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Amount due</p>
            <p className="text-3xl font-bold tabular-nums text-rose-600">{taka(entry.amount)}</p>
          </div>
          <Button
            className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
            onClick={() =>
              onPay({
                id: entry.id,
                label: entry.name,
                amount: entry.amount,
                kind: isOneTime ? "" : "",
                fee_month: isOneTime ? undefined : feeMonth,
                fee_year: isOneTime ? undefined : Number(feeYear),
                FeeItemType: entry.FeeItemType,
              })
            }
          >
            <Wallet className="h-4 w-4" />
            Pay {taka(entry.amount)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
