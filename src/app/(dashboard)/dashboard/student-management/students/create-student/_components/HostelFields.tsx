"use client";

import { Plus, X } from "lucide-react";
import { type Control, Controller, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateStudentFormInput } from "./schema/student.schema";
import type { HostelRoom } from "./types/student";

interface HostelFieldsProps {
  control: Control<CreateStudentFormInput>;
  hostelRooms: HostelRoom[];
}

const HostelFields = ({ control, hostelRooms }: HostelFieldsProps) => {
  const itemsArray = useFieldArray({
    control,
    name: "hostelFeeCollection.items",
  });
  const mealsArray = useFieldArray({
    control,
    name: "hostelFeeCollection.mealCollections",
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hostel Allocation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="hostelAllocation.hostel_room_id"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Hostel Room</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? null}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostelRooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.room_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="hostelAllocation.allocated_at"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Allocated Date</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hostel Fee Collection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="hostelFeeCollection.collection_date"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Collection Date</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="hostelFeeCollection.total_amount"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Total Amount</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    value={(field.value ?? "") as string | number}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="hostelFeeCollection.paid_amount"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Paid Amount</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    value={(field.value ?? "") as string | number}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="hostelFeeCollection.due_amount"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Due Amount</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    value={(field.value ?? "") as string | number}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="space-y-3">
            <FieldLabel>Fee Items</FieldLabel>
            {itemsArray.fields.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[2fr_1fr_auto] items-end gap-2 rounded-md border p-3"
              >
                <Controller
                  name={`hostelFeeCollection.items.${index}.item_name`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Item Name</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="e.g. Bed Fee"
                      />
                    </Field>
                  )}
                />
                <Controller
                  name={`hostelFeeCollection.items.${index}.item_amount`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        value={(field.value ?? "") as string | number}
                      />
                    </Field>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => itemsArray.remove(index)}
                  aria-label="Remove item"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                itemsArray.append({
                  item_name: "",
                  item_amount: undefined as any,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add fee item
            </Button>
          </div>

          <div className="space-y-3">
            <FieldLabel>Meal Collections</FieldLabel>
            {mealsArray.fields.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 rounded-md border p-3"
              >
                <Controller
                  name={`hostelFeeCollection.mealCollections.${index}.meal_count`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Meal Count</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        value={(field.value ?? "") as string | number}
                      />
                    </Field>
                  )}
                />
                <Controller
                  name={`hostelFeeCollection.mealCollections.${index}.meal_rate`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Meal Rate</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        value={(field.value ?? "") as string | number}
                      />
                    </Field>
                  )}
                />
                <Controller
                  name={`hostelFeeCollection.mealCollections.${index}.total_amount`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Total</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        value={(field.value ?? "") as string | number}
                      />
                    </Field>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => mealsArray.remove(index)}
                  aria-label="Remove meal"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                mealsArray.append({
                  meal_count: undefined as any,
                  meal_rate: undefined as any,
                  total_amount: undefined as any,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add meal collection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HostelFields;
