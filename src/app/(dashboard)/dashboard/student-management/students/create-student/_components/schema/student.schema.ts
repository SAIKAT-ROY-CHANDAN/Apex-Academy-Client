import { z } from "zod";
import { MONTHS } from "@/app/(dashboard)/dashboard/academics/fee-item/_components/types/fee-item";

// Replace with your actual Prisma enum values
export const religionOptions = [
  "ISLAM",
  "HINDU",
  "CHRISTIAN",
  "BUDDHIST",
  "OTHER",
] as const;
export const genderOptions = ["MALE", "FEMALE", "OTHER"] as const;

const studentEnrollmentSchema = z.object({
  academic_session_id: z.string().uuid('Invalid academic session ID'),
  academic_class_id: z.string().uuid('Invalid academic class ID'),
  academic_section_id: z.string().uuid('Invalid academic section ID').optional(),
  batch_id: z.string().uuid('Invalid batch ID'),
  shift_id: z.string().uuid('Invalid shift ID').optional(),
  roll_number: z.string().min(1, 'Roll number is required').max(20).regex(/^\d+$/, 'Roll number must contain only numbers'),
  registration_number: z.string().regex(/^\d*$/, 'Registration number must contain only numbers').max(20).optional(),
  password: z.string().default('non'),
  merit_position: z.coerce.number().int().optional(),
  program_id: z.string().uuid("Invalid program ID").optional().nullable(),
  department_id: z.string().uuid("Invalid department ID").optional().nullable(),
});

const studentFeeCollectionItemSchema = z.object({
  fee_item_id: z.string().uuid("Invalid fee item ID"),
  fee_month: z.enum(MONTHS).nullable().optional(),
  fee_year: z.coerce.number().int().min(2000).max(2100).nullable().optional(),
  discount_amount: z.coerce.number().optional(),
  paid_amount: z.coerce.number().optional(),
  line_total_amount: z.coerce.number().optional(),
});

const studentFeeCollectionSchema = z.object({
  fee_type_id: z.string().uuid("Invalid fee type ID"),
  payment_method: z.enum(["CASH", "BANK", "BKASH"]).optional().default("CASH"),
  payment_note: z.string().max(100).optional(),
  items: z.array(studentFeeCollectionItemSchema).optional(),
});

const hostelAllocationSchema = z.object({
  hostel_room_id: z.string().uuid("Invalid hostel room ID"),
  allocated_at: z.string().optional(),
});

const hostelFeeCollectionItemSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  item_amount: z.coerce.number(),
});

const mealCollectionSchema = z.object({
  meal_count: z.coerce.number().int(),
  meal_rate: z.coerce.number(),
  total_amount: z.coerce.number(),
});

const hostelFeeCollectionSchema = z.object({
  collection_date: z.string().min(1, "Collection date is required"),
  total_amount: z.coerce.number(),
  paid_amount: z.coerce.number(),
  due_amount: z.coerce.number(),
  items: z.array(hostelFeeCollectionItemSchema).optional(),
  mealCollections: z.array(mealCollectionSchema).optional(),
});

export const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  father_name: z.string().min(1, "Father's name is required"),
  mother_name: z.string().min(1, "Mother's name is required"),
  religion: z.enum(religionOptions, { error: "Invalid religion" }).optional(),
  nid_no: z.string().optional(),
  gender: z.enum(genderOptions, { error: 'Invalid gender' }),
  student_phone: z.string().regex(/^01\d{9}$/, 'Phone must be 11 digits starting with 01').regex(/^\d+$/, 'Phone must contain only numbers').max(20).optional(),
  father_phone: z.string().min(1, "Father's phone is required").regex(/^01\d{9}$/, 'Phone must be 11 digits starting with 01').regex(/^\d+$/, 'Phone must contain only numbers').max(20),
  mother_phone: z.string().regex(/^01\d{9}$/, 'Phone must be 11 digits starting with 01').regex(/^\d+$/, 'Phone must contain only numbers').max(20).optional(),
  photo: z.union([z.instanceof(File), z.string(), z.null()]).optional().nullable(),
  village_road: z.string().optional(),
  post_office: z.string().optional(),
  sub_district: z.string().min(1, "Sub-district is required"),
  district: z.string().min(1, "District is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  enrollment: studentEnrollmentSchema,
  studentFeeCollection: studentFeeCollectionSchema.optional(),
  hostelAllocation: hostelAllocationSchema.optional(),
  hostelFeeCollection: hostelFeeCollectionSchema.optional(),
});

export type CreateStudentFormInput = z.input<typeof createStudentSchema>;
export type CreateStudentFormValues = z.output<typeof createStudentSchema>;
