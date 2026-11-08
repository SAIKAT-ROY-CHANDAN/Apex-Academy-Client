import Image from "next/image";
import logo from "@/assets/institution/logo.svg";
import AdminLoginForm from "./_components/AdminLoginForm";

const AdminLoginPage = () => {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Decorative Brand Panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0A1F44] via-[#0F2B5C] to-[#1A3F7A] p-12 text-white lg:flex">
        {/* Animated background circles */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-[#3B82F6]/10 blur-3xl" />

        {/* Decorative grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Top Section */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
              <Image
                src={logo}
                alt="Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/80">
                Apex International
              </h3>
              <p className="text-xs text-white/50">College & Academy</p>
            </div>
          </div>
        </div>

        {/* Center Content - Quote / Welcome */}
        <div className="relative z-10 max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            Admin Portal
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight">
            Shape the Future
            <br />
            <span className="bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">
              Lead with Confidence
            </span>
          </h1>
          <p className="text-base leading-relaxed text-white/60">
            Manage your staff, students, academics, and finances — all from one
            secure admin dashboard.
          </p>

          {/* Feature badges */}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60 ring-1 ring-white/10">
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              User Management
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60 ring-1 ring-white/10">
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Financial Oversight
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60 ring-1 ring-white/10">
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Academic Control
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="relative z-10">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Apex International College
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 text-center lg:hidden">
            <Image
              src={logo}
              alt="Institution Logo"
              width={72}
              height={72}
              className="mx-auto mb-3 rounded-2xl shadow-lg ring-1 ring-black/5"
            />
            <h2 className="text-xl font-bold text-gray-900">
              Apex International College
            </h2>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600" />
              Admin Login
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-gray-500">
              Enter your credentials to access the admin dashboard
            </p>
          </div>

          {/* Login Form Card */}
          <div className="rounded-2xl border border-gray-200/60 bg-white p-8 shadow-sm shadow-gray-200/50">
            <AdminLoginForm />
          </div>

          {/* Help text */}
          <p className="mt-6 text-center text-xs text-gray-400">
            Having trouble logging in? Contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
