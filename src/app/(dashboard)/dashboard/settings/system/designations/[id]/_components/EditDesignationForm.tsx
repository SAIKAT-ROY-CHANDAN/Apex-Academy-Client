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
import { updateDesignation } from "@/services/designation";
import { TDesignation } from "@/types/modules/designation/designation.type";
import { designationValidation } from "@/validation/designation/designation.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "sonner";

interface EditDesignationFormProps {
  designation: TDesignation;
}

const EditDesignationForm = ({ designation }: EditDesignationFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(designationValidation),
    defaultValues: {
      name: designation.name ?? "",
    },
  });

  const onSubmit = (data: FieldValues) => {
    startTransition(async () => {
      const response = await updateDesignation(designation.id, data);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update designation");
        return;
      }
      toast.success(response.message ?? "Designation updated successfully");
      router.refresh();
      router.push("/dashboard/settings/system/designations");
    });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BadgeCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">
              Edit Designation
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Update the designation name.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          {/* Designation Name */}
          <FormInput
            label="Designation Name"
            placeholder="e.g. Principal, Vice Principal, Head Teacher"
            required
            error={form.formState.errors.name?.message}
            {...form.register("name")}
            inputClassName="h-11"
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 px-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Designation
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditDesignationForm;