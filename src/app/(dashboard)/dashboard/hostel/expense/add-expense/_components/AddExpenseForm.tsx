"use client";

import { FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createHostelExpense,
  updateHostelExpense,
} from "@/services/hostelExpense";
import { HostelExpense } from "../../_components/types/hostelExpense";
import { hostelExpenseValidation } from "@/validation/hostelExpense/hostelExpense.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Minus, Plus, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import {
  FieldValues,
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HostelExpenseItem {
  item_name: string;
  item_amount: number;
}

interface HostelExpenseFormData {
  expense_date: string;
  total_amount: number;
  hostelExpenseItems: HostelExpenseItem[];
}

const emptyItem: HostelExpenseItem = {
  item_name: "",
  item_amount: 0,
};

const toDateInputValue = (date?: string) => {
  if (!date) return new Date().toISOString().split("T")[0];
  return new Date(date).toISOString().split("T")[0];
};

const buildDefaultValues = (
  initialData?: HostelExpense,
): HostelExpenseFormData => {
  if (initialData) {
    return {
      expense_date: toDateInputValue(initialData.expense_date),
      total_amount: Number(initialData.total_amount) || 0,
      hostelExpenseItems:
        initialData.hostelExpenseItems?.length > 0
          ? initialData.hostelExpenseItems.map((item) => ({
            item_name: item.item_name,
            item_amount: Number(item.item_amount) || 0,
          }))
          : [{ ...emptyItem }],
    };
  }

  return {
    expense_date: new Date().toISOString().split("T")[0],
    total_amount: 0,
    hostelExpenseItems: [{ ...emptyItem }, { ...emptyItem }],
  };
};

type AddExpenseFormProps = {
  initialData?: HostelExpense;
  isEdit?: boolean;
};

const AddExpenseForm = ({
  initialData,
  isEdit = false,
}: AddExpenseFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<HostelExpenseFormData>({
    resolver: zodResolver(hostelExpenseValidation) as any,
    defaultValues: buildDefaultValues(initialData),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "hostelExpenseItems",
  });

  const watchedItems = useWatch({
    control: form.control,
    name: "hostelExpenseItems",
  });

  const calculatedTotal =
    watchedItems?.reduce(
      (sum, item) => sum + (Number(item?.item_amount) || 0),
      0,
    ) ?? 0;

  useEffect(() => {
    form.setValue("total_amount", calculatedTotal, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [calculatedTotal, form]);

  const submit: SubmitHandler<FieldValues> = async (payload) => {
    startTransition(async () => {
      const finalTotal =
        payload.hostelExpenseItems?.reduce(
          (sum: number, item: HostelExpenseItem) =>
            sum + (Number(item?.item_amount) || 0),
          0,
        ) ?? 0;

      const formattedPayload = {
        expense_date: payload.expense_date,
        total_amount: finalTotal,
        hostelExpenseItems: payload.hostelExpenseItems.map(
          (item: HostelExpenseItem) => ({
            item_name: item.item_name,
            item_amount: Number(item.item_amount),
          }),
        ),
      };

      const res = isEdit
        ? await updateHostelExpense(initialData!.id, formattedPayload)
        : await createHostelExpense(formattedPayload);


      if (!res.success) {
        toast.error(
          res.message ??
          `Failed to ${isEdit ? "update" : "add"} hostel expense`,
        );
        return;
      }
      toast.success(
        res.message ??
        `Hostel expense ${isEdit ? "updated" : "added"} successfully`,
      );
      router.push("/dashboard/hostel/expense");
    });
  };

  const onInvalidSubmit = (errors: any) => {
    console.error("Validation errors:", errors);
    const errorCount =
      Object.values(errors).reduce((sum: number, field) => {
        if (Array.isArray(field)) {
          return (
            sum +
            field.reduce(
              (itemSum: number, itemErrors: any) =>
                itemSum + Object.keys(itemErrors || {}).length,
              0,
            )
          );
        }
        return sum + 1;
      }, 0) || 1;
    toast.error(
      `Please fix ${errorCount} validation error${errorCount !== 1 ? "s" : ""} in the form`,
    );
  };

  const handleClearForm = () => {
    form.reset(buildDefaultValues(isEdit ? initialData : undefined));
  };

  const handleAddItem = () => {
    append({ ...emptyItem });
  };

  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Card className="w-full max-w-5xl border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">
              {isEdit ? "Edit Hostel Expense" : "Add Hostel Expense"}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {isEdit
                ? "Update the hostel expense items and details."
                : "Create a new hostel expense with grocery items and details."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(submit, onInvalidSubmit)}
          noValidate
        >
          <FormInput
            label="Date"
            type="date"
            required
            error={form.formState.errors.expense_date?.message as string}
            {...form.register("expense_date")}
            inputClassName="h-11"
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Items</Label>
              <span className="text-sm text-muted-foreground">
                {fields.length} item(s)
              </span>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => {
                const itemPrice =
                  Number(watchedItems?.[index]?.item_amount) || 0;
                return (
                  <div
                    key={field.id}
                    className="rounded-xl border border-border/50 bg-slate-50/50 p-4 dark:bg-slate-900/20"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                      <FormInput
                        label="Items"
                        placeholder="e.g. Rent, Water, Electricity"
                        required
                        error={
                          form.formState.errors.hostelExpenseItems?.[index]
                            ?.item_name?.message
                        }
                        {...form.register(
                          `hostelExpenseItems.${index}.item_name`,
                        )}
                        inputClassName="h-11"
                      />

                      <FormInput
                        label="Price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 500"
                        required
                        error={
                          form.formState.errors.hostelExpenseItems?.[index]
                            ?.item_amount?.message
                        }
                        {...form.register(
                          `hostelExpenseItems.${index}.item_amount`,
                          { valueAsNumber: true },
                        )}
                        inputClassName="h-11"
                      />

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleRemoveItem(index)}
                        disabled={isPending || fields.length <= 1}
                        className="h-11 w-full md:w-auto md:px-4"
                      >
                        <Minus className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                    {itemPrice > 0 && (
                      <div className="mt-3 flex items-center justify-end border-t border-border/40 pt-2 text-sm">
                        <span className="text-muted-foreground">
                          Item #{index + 1} subtotal:&nbsp;
                        </span>
                        <span className="font-semibold text-primary">
                          {itemPrice.toFixed(2)} BDT
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="default"
              onClick={handleAddItem}
              disabled={isPending}
              className="h-11 w-full bg-primary hover:bg-primary/90 md:w-auto md:px-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add More
            </Button>
          </div>

          <div>
            <Label htmlFor="total_amount" className="text-base font-semibold">
              Total Amount
              <span className="text-destructive"> *</span>
            </Label>
            <div className="relative mt-2">
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                min="0"
                value={calculatedTotal}
                onChange={(e) => {
                  form.setValue("total_amount", Number(e.target.value) || 0, {
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                }}
                className={cn(
                  "h-12 bg-blue-50 pr-16 text-lg font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
                  form.formState.errors.total_amount &&
                  "border-destructive focus-visible:ring-destructive",
                )}
                readOnly
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 dark:text-blue-400">
                BDT
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Sum of {fields.length} item(s)</span>
              <span>
                {watchedItems
                  ?.map((item) => Number(item?.item_amount) || 0)
                  .join(" + ") || "0"}{" "}
                = {calculatedTotal}
              </span>
            </div>
            {form.formState.errors.total_amount && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.total_amount?.message as string}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 px-6 text-base font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={handleClearForm}
              disabled={isPending}
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-12 flex-1 bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                <>Update</>
              ) : (
                <>Save</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddExpenseForm;