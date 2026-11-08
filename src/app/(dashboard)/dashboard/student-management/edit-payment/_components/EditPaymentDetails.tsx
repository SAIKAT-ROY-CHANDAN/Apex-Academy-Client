"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, History, Loader2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { updateStudentFeeCollectionItem } from "@/services/student";

type FeeRecord = Record<string, unknown>;
type Props = { studentId: string; feeItems: FeeRecord[] };

const record = (value: unknown): FeeRecord | null =>
  value && typeof value === "object" ? (value as FeeRecord) : null;
const valueAt = (item: FeeRecord, paths: string[][]) => {
  for (const path of paths) {
    let value: unknown = item;
    for (const key of path) value = record(value)?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
};
const text = (item: FeeRecord, paths: string[][]) => {
  const value = valueAt(item, paths);
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "N/A";
};
const amount = (item: FeeRecord, key: string) => {
  const value = Number(item[key] ?? 0);
  return Number.isFinite(value) ? value : 0;
};
const money = (value: number) =>
  new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function EditPaymentDetails({ studentId, feeItems }: Props) {
  const router = useRouter();
  const [formValues, setFormValues] = useState<
    Record<string, { paid: string; discount: string }>
  >(() =>
    Object.fromEntries(
      feeItems.map((item, index) => [
        String(item.id ?? index),
        {
          paid: String(amount(item, "paid_amount")),
          discount: String(amount(item, "discount_amount")),
        },
      ]),
    ),
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const shortDate = (value: unknown) => {
    if (typeof value !== "string" && typeof value !== "number") return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  };

  const setValue = (key: string, field: "paid" | "discount", value: string) =>
    setFormValues((current) => ({
      ...current,
      [key]: { ...current[key], [field]: value },
    }));

  const save = (item: FeeRecord, key: string) => {
    const itemId = typeof item.id === "string" ? item.id : null;
    const paid = Number(formValues[key]?.paid);
    const discount = Number(formValues[key]?.discount);
    const payable =
      amount(item, "line_total_amount") + amount(item, "fine_amount");
    if (!itemId)
      return toast.error("This fee item has no ID and cannot be updated.");
    if (
      !Number.isFinite(paid) ||
      !Number.isFinite(discount) ||
      paid < 0 ||
      discount < 0
    )
      return toast.error("Paid and discount must be non-negative amounts.");
    if (paid + discount > payable)
      return toast.error(
        "Paid plus discount cannot exceed the payable amount.",
      );
    setSavingId(key);
    startTransition(async () => {
      const response = await updateStudentFeeCollectionItem(studentId, itemId, {
        paid_amount: paid,
        discount_amount: discount,
      });
      if (response?.success === false)
        toast.error(response.message ?? "Unable to update this fee item.");
      else {
        toast.success(response?.message ?? "Fee item updated successfully.");
        router.refresh();
      }
      setSavingId(null);
    });
  };

  return (
    <Card size="sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="h-8 pl-3 text-xs">Fee item</TableHead>
              <TableHead className="h-8 text-right text-xs">Payable</TableHead>
              <TableHead className="h-8 w-28 text-right text-xs">Paid</TableHead>
              <TableHead className="h-8 w-28 text-right text-xs">
                Discount
              </TableHead>
              <TableHead className="h-8 text-right text-xs">Due</TableHead>
              <TableHead className="h-8 w-20 pr-3 text-right text-xs">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feeItems.map((item, index) => {
              const key = String(item.id ?? index);
              const paid = amount(item, "paid_amount");
              const discount = amount(item, "discount_amount");
              const lineTotal = amount(item, "line_total_amount");
              const fine = amount(item, "fine_amount");
              const payable = lineTotal + fine;
              const current = formValues[key] ?? {
                paid: String(paid),
                discount: String(discount),
              };
              const infos = Array.isArray(item.collectionInfos)
                ? item.collectionInfos.filter((info): info is FeeRecord =>
                    Boolean(record(info)),
                  )
                : [];
              const livePaid = Number(current.paid);
              const liveDiscount = Number(current.discount);
              const liveDue =
                Number.isFinite(livePaid) && Number.isFinite(liveDiscount)
                  ? Math.max(0, payable - livePaid - liveDiscount)
                  : Math.max(0, payable - paid - discount);
              const dirty =
                current.paid !== String(paid) ||
                current.discount !== String(discount);
              const open = expandedId === key;
              const saving = isPending && savingId === key;
              const fname = text(item, [
                ["feeItem", "name"],
                ["fee_item", "name"],
              ]);
              const ftype = text(item, [
                ["feeType", "name"],
                ["fee_type", "name"],
                ["feeItem", "feeType", "name"],
              ]);
              return (
                <Fragment key={key}>
                  <TableRow className="text-xs">
                    <TableCell className="max-w-45 py-1.5 pl-3">
                      <p className="truncate font-medium text-[13px]">{fname}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {item.fee_month == null ? "—" : String(item.fee_month)}
                        {" / "}
                        {item.fee_year == null ? "—" : String(item.fee_year)}
                        {" · "}
                        {ftype}
                        {fine > 0 ? ` · Fine ${money(fine)}` : ""}
                      </p>
                      {infos.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(open ? null : key)}
                          className="mt-0.5 inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        >
                          <History className="size-3" />
                          {infos.length} payment{infos.length > 1 ? "s" : ""}
                          <ChevronDown
                            className={cn(
                              "size-3 transition-transform",
                              open && "rotate-180",
                            )}
                          />
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="py-1.5 text-right tabular-nums">
                      {money(payable)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Input
                        id={`${key}-paid`}
                        type="number"
                        min="0"
                        step="0.01"
                        aria-label={`${fname} paid`}
                        value={current.paid}
                        onChange={(e) => setValue(key, "paid", e.target.value)}
                        className="h-7 px-1.5 text-right text-xs tabular-nums"
                      />
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Input
                        id={`${key}-discount`}
                        type="number"
                        min="0"
                        step="0.01"
                        aria-label={`${fname} discount`}
                        value={current.discount}
                        onChange={(e) =>
                          setValue(key, "discount", e.target.value)
                        }
                        className="h-7 px-1.5 text-right text-xs tabular-nums"
                      />
                    </TableCell>
                    <TableCell className="py-1.5 text-right">
                      <Badge
                        variant={liveDue <= 0 ? "secondary" : "outline"}
                        className={cn(
                          "tabular-nums",
                          liveDue > 0 &&
                            "border-amber-200 bg-amber-500/10 text-amber-700",
                        )}
                      >
                        {money(liveDue)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-1.5 pr-3 text-right">
                      <Button
                        type="button"
                        size="xs"
                        disabled={saving || !dirty}
                        onClick={() => save(item, key)}
                        title={dirty ? "Save changes" : "No changes"}
                      >
                        {saving ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Save className="size-3" />
                        )}
                        {saving ? "Saving" : "Save"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {open && infos.length > 0 && (
                    <TableRow
                      key={`${key}-history`}
                      className="bg-muted/20 hover:bg-muted/20"
                    >
                      <TableCell colSpan={6} className="py-1 pr-3 pl-8">
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
                          {infos.map((info, pi) => (
                            <span
                              key={String(info.id ?? pi)}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap text-muted-foreground"
                            >
                              <span className="font-medium text-foreground">
                                {shortDate(
                                  valueAt(info, [
                                    ["created_at"],
                                    ["createdAt"],
                                  ]),
                                )}
                              </span>
                              <span className="font-semibold text-foreground tabular-nums">
                                {money(amount(info, "paid_amount"))}
                              </span>
                              <span>
                                {text(info, [
                                  ["payment_method"],
                                  ["paymentMethod"],
                                ])}
                              </span>
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
