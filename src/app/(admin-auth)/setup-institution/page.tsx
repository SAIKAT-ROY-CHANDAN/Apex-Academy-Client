import SetupWizard from "./_components/SetupWizard";

const SetupInstitutionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="border-b border-border/40 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0840A0] text-white shadow-sm">
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Institution Setup
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure your institution to get started
            </p>
          </div>
        </div>
      </div>

      {/* Wizard Content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <SetupWizard />

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} EIMS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SetupInstitutionPage;
