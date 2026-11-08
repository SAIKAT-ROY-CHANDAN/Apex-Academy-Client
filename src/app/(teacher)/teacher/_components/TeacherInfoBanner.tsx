import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Clock3,
  BriefcaseBusiness,
  Wallet,
  UserCheck,
} from 'lucide-react'
import { TTeacherInfoBannerProps } from './teacherInfoBanner.type'
import { formatTeacherType } from '@/constant/teacher/teacherType'

const QUALIFICATION_LABEL: Record<string, string> = {
  DEGREE_PASS: 'Degree (Pass)',
  HONOURS: 'Honours',
  MASTERS: "Master's",
  PHD: 'PhD',
}

const formatUtcTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}

const formatTaka = (amount: number) =>
  new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(amount)

const TeacherInfoBanner = ({ teacher }: { teacher?: TTeacherInfoBannerProps }) => {
  const {
    full_name,
    photo,
    address,
    email,
    phone,
    designation,
    department,
    shift,
    teacher_type,
    last_qualification,
    is_active,
    isResigned,
    salary,
    overtimeTeacherConfig,
  } = teacher ?? {}

  if (!teacher) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Teacher profile unavailable</h2>
          <p className="text-sm text-slate-500">
            We could not load the teacher details for this session.
          </p>
        </div>
      </div>
    )
  }

  const initials = (full_name ?? 'Teacher')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const statusLabel = isResigned ? 'Resigned' : is_active ? 'Active' : 'Inactive'
  const statusDot = isResigned
    ? 'bg-rose-400'
    : is_active
    ? 'bg-emerald-400'
    : 'bg-slate-300'
  const statusBg = isResigned
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    : is_active
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : 'bg-slate-500/20 text-slate-300 border-slate-500/30'

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-linear-to-r from-[#0F2E6B] via-[#1E4FA3] to-[#3E7CDB] shadow-[0_12px_40px_rgba(15,46,107,0.3)] border border-white/10">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
        {/* Left: identity */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 text-xl font-bold tracking-wide text-white backdrop-blur-md shadow-lg">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={full_name ?? 'Teacher'} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {/* Status ring around avatar */}
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-blue-950">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${statusDot}`}
                  title={statusLabel}
                />
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-bold leading-tight text-white drop-shadow-md">
                {full_name ?? 'Teacher'}
              </h2>
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                {designation?.name}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-blue-100/90">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-colors">
                <BriefcaseBusiness className="h-4 w-4 text-blue-200" strokeWidth={2} />
                <span className="font-medium text-white">{department?.department_name ?? 'N/A'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-colors">
                <Clock3 className="h-4 w-4 text-blue-200" strokeWidth={2} />
                <span className="font-medium text-white">{shift?.name ?? 'N/A'}</span>
                <span className="text-blue-200/60">•</span>
                <span>{shift?.start_time && shift?.end_time ? `${formatUtcTime(shift.start_time)} – ${formatUtcTime(shift.end_time)}` : 'N/A'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-colors">
                <GraduationCap className="h-4 w-4 text-blue-200" strokeWidth={2} />
                <span className="font-medium text-white">{last_qualification ? (QUALIFICATION_LABEL[last_qualification] ?? last_qualification) : 'N/A'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: financial + type */}
        <div className="flex shrink-0 items-center gap-6 md:gap-8">
          <div className="border-l border-white/20 pl-6">
            <div className="text-xs font-medium uppercase tracking-wider text-blue-200/80">Base Salary</div>
            <div className="mt-1 flex items-baseline gap-2">
              <Wallet className="h-5 w-5 text-emerald-300" strokeWidth={2} />
              <div className="font-mono text-2xl font-bold text-white">
                ৳{formatTaka(salary?.total_amount ?? 0)}
              </div>
            </div>
          </div>

          {overtimeTeacherConfig && (
            <div className="border-l border-white/20 pl-6">
              <div className="text-xs font-medium uppercase tracking-wider text-blue-200/80">Overtime / hr</div>
              <div className="mt-1 flex items-baseline gap-2">
                <UserCheck className="h-5 w-5 text-amber-300" strokeWidth={2} />
                <div className="font-mono text-2xl font-bold text-white">
                  ৳{formatTaka(overtimeTeacherConfig.overtime_hourly_amount)}
                </div>
              </div>
            </div>
          )}

          <div className="border-l border-white/20 pl-6">
            <div className="text-xs font-medium uppercase tracking-wider text-blue-200/80">Type</div>
            <div className="mt-1">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                {formatTeacherType(teacher_type)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom contact strip */}
      <div className="relative flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 px-6 py-4 text-sm text-blue-100/90">
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <Mail className="h-4 w-4 text-blue-200" strokeWidth={2} />
          <span className="font-mono">{email ?? 'N/A'}</span>
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <Phone className="h-4 w-4 text-blue-200" strokeWidth={2} />
          <span className="font-mono">{phone ?? 'N/A'}</span>
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex-1 min-w-50 truncate">
          <MapPin className="h-4 w-4 text-blue-200 shrink-0" strokeWidth={2} />
          <span className="truncate">{address ?? 'N/A'}</span>
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
          <span className={`relative flex h-2 w-2 rounded-full ${statusDot} animate-pulse`} />
          <span className="font-medium text-white">{statusLabel}</span>
        </span>
      </div>
    </div>
  )
}

export default TeacherInfoBanner
