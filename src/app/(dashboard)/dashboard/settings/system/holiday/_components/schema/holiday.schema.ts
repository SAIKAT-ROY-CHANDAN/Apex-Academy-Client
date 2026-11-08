import { z } from 'zod';
export const holidayTypes = ["PUBLIC", "ACADEMIC", "INSTITUTIONAL", "EMERGENCY"] as const;  

export const holidaySchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(150, 'Title is too long'),
    description: z.string().optional().nullable(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional().nullable(),
    holiday_type: z.enum(holidayTypes, { error: 'Holiday type is required' }),
    is_active: z.boolean(),
  })
  .refine(
    (data) => !data.end_date || new Date(data.end_date) >= new Date(data.start_date),
    { message: 'End date cannot be before start date', path: ['end_date'] }
  );

export type HolidayFormInput = z.input<typeof holidaySchema>;
export type HolidayFormValues = z.output<typeof holidaySchema>;