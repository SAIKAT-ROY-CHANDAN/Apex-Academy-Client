export interface TDesignation {
  id: string
  name: string
}

export interface TShift {
  id: string
  name: string
  start_time: string
  end_time: string
}

export interface TDepartment {
  id: string
  department_name: string
}

export interface TSalary {
  id: string
  total_amount: number
}

export interface TOvertimeTeacherConfig {
  overtime_hourly_amount: number
}

export interface TTeacherInfoBannerProps {
  id?: string
  full_name?: string
  email?: string
  phone?: string
  address?: string
  photo?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  last_qualification?: string
  teacher_type?: string;
  isResigned?: boolean
  is_active?: boolean
  designation?: TDesignation
  shift?: TShift
  department?: TDepartment
  salary?: TSalary
  overtimeTeacherConfig?: TOvertimeTeacherConfig
}