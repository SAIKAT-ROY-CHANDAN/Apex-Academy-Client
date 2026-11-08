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
import { createDesignation } from "@/services/designation";
import { designationValidation } from "@/validation/designation/designation.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

const AddDesignationForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(designationValidation),
    defaultValues: {
      name: "",
    },
  });

  const submit: SubmitHandler<FieldValues> = async (payload) => {
    startTransition(async () => {
      const res = await createDesignation(payload);

      if (!res.success) {
        toast.error(res.message ?? "Failed to add designation");
        return;
      }
      toast.success(res.message ?? "Designation added successfully");
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
              Add Designation
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Create a new designation for the institution.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(submit)}
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
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Designation
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddDesignationForm;