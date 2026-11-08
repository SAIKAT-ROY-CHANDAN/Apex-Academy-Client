export default function DevelopmentSkeleton() {
  return (
    <div className="lg:max-w-4xl 2xl:max-w-6xl mx-auto px-4 md:px-0 mb-20 animate-pulse">
      {/* Description heading */}
      <div className="h-5 w-32 bg-gray-200 rounded mb-4" />

      {/* Description content */}
      <div className="space-y-2 mb-10">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-11/12" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>

      {/* Form card */}
      <div className="border border-blue-100 rounded-xl p-6 sm:p-8">
        {/* Basic Information badge */}
        <div className="h-8 w-44 bg-gray-200 rounded-md mb-6" />

        {/* Row 1: Full Name, Phone, Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-10 bg-gray-200 rounded-md w-full" />
            </div>
          ))}
        </div>

        {/* Row 2: Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-10 bg-gray-200 rounded-md w-full" />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <div className="h-12 bg-gray-200 rounded-full w-full" />
        <div className="h-12 bg-gray-200 rounded-full w-full" />
      </div>
    </div>
  );
}
