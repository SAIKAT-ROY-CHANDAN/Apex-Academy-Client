import { z } from "zod";

export const institutionInvoiceSettingSchema = z.object({
  institutionName: z.string().min(1, "Institution name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  invoicePrefix: z.string().min(1, "Invoice prefix is required"),
  footerNote: z.string().optional(),
  termsAndConditions: z.string().optional(),
});

export type InstitutionInvoiceSettingFormValues = z.infer<
  typeof institutionInvoiceSettingSchema
>;

export interface InstitutionInvoiceSetting extends InstitutionInvoiceSettingFormValues {
  id: string;
  logoUrl?: string | null;
  signatureUrl?: string | null;
}

export interface InstitutionInvoiceSetting {
  id: string;
  watermarkUrl?: string | null;
  headerUrl?: string | null;
  footerUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
