"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BedDouble, Wallet, Loader2 } from "lucide-react";
import StampBadge from "./StampBadge";
import Perforation from "./Perforation";
import LedgerRow from "./LedgerRow";
import { toast } from "sonner";
import { initiateBkashHostelPayment } from "@/services/hostelFeeCollection";

export default function HostelDueCard({ totalDue }: { totalDue: number }) {
  const [loading, setLoading] = useState(false);

  const taka = (amount: number) => {
    return "\u09F3" + new Intl.NumberFormat("en-IN").format(amount || 0);
  };

  const handlePayNow = async () => {
    setLoading(true);
    try {
      const res = await initiateBkashHostelPayment();
      if (res?.success && res?.data?.bkashURL) {
        window.location.href = res.data.bkashURL;
      } else {
        toast.error(res?.message ?? "Failed to initiate bKash payment");
        setLoading(false);
      }
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-slate-200 shadow-sm">
      <div className="absolute right-4 top-4">
        <StampBadge label="Due" tone="due" />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-slate-400">
          <BedDouble className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Hostel ledger</span>
        </div>
        <h3
          className="mt-1 text-2xl font-semibold capitalize text-slate-900"
          style={{ fontFamily: "ui-serif, Georgia, 'Times New Roman', serif" }}
        >
          Hostel Fee
        </h3>
      </CardHeader>

      <CardContent>
        <LedgerRow label="Total amount" value={taka(totalDue)} />
        <LedgerRow label="Paid" value={taka(0)} muted />

        <Perforation />

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Amount due</p>
            <p className="text-3xl font-bold tabular-nums text-rose-600">{taka(totalDue)}</p>
          </div>
          <Button
            className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
            onClick={handlePayNow}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            {loading ? "Redirecting..." : "Pay Now"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
