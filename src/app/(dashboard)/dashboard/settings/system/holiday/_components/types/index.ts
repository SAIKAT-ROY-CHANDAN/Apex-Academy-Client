export interface Holiday {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  holiday_type: string;
  is_active: boolean;
}
export type THoliday = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  holiday_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};