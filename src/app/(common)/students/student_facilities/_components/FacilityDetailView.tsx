export type FacilityData = {
  id: string;
  name: string;
  facilities_type: string;
  main_image_url?: string | null;
  sub_one_image_url?: string | null;
  sub_two_image_url?: string | null;
  description?: string | null;
};

type Props = {
  facility: FacilityData | null;
  fallbackName: string;
  fallbackDescription?: string;
};

export default function FacilityDetailView({
  facility,
  fallbackName,
  fallbackDescription,
}: Props) {
  const name = facility?.name ?? fallbackName;
  const description = facility?.description ?? fallbackDescription ?? null;
  const isHtml = description ? /<\/?[a-z][\s\S]*>/i.test(description) : false;

  const hasMain = !!facility?.main_image_url;
  const hasSubOne = !!facility?.sub_one_image_url;
  const hasSubTwo = !!facility?.sub_two_image_url;
  const hasAnyImage = hasMain || hasSubOne || hasSubTwo;
  const hasSubSection = hasSubOne || hasSubTwo;

  return (
    <div className="lg:max-w-4xl 2xl:max-w-6xl mx-auto mb-20 px-4 md:px-0">
      {hasAnyImage && (
        <div
          className={
            hasMain && hasSubSection
              ? "grid grid-cols-1 md:grid-cols-2 gap-6"
              : "grid grid-cols-1 gap-6"
          }
        >
          {hasMain && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={facility!.main_image_url!}
              alt={name}
              className="h-[450px] w-full object-cover rounded-2xl"
            />
          )}
          {hasSubSection && (
            <div
              className={
                hasMain
                  ? "grid grid-rows-2 h-[450px] gap-6 overflow-hidden"
                  : hasSubOne && hasSubTwo
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "grid grid-cols-1 gap-6"
              }
            >
              {hasSubOne && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={facility!.sub_one_image_url!}
                  alt={`${name} sub 1`}
                  className={
                    hasMain
                      ? "h-[220px] w-full object-cover rounded-2xl"
                      : "h-[450px] w-full object-cover rounded-2xl"
                  }
                />
              )}
              {hasSubTwo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={facility!.sub_two_image_url!}
                  alt={`${name} sub 2`}
                  className={
                    hasMain
                      ? "h-[220px] w-full object-cover rounded-2xl"
                      : hasSubOne
                        ? "h-[450px] w-full object-cover rounded-2xl"
                        : "h-[450px] w-full object-cover rounded-2xl"
                  }
                />
              )}
            </div>
          )}
        </div>
      )}

      <p className="mt-10 font-bebas text-lg text-[#4a2545]">{name}</p>

      {facility ? (
        description ? (
          isHtml ? (
            <div
              className="mt-2 font-almarai prose prose-sm max-w-none prose-p:my-2 prose-headings:font-bebas"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="mt-2 font-almarai whitespace-pre-line break-words">
              {description}
            </p>
          )
        ) : (
          <p className="mt-2 font-almarai text-muted-foreground">
            No description available for this facility.
          </p>
        )
      ) : (
        <p className="mt-2 font-almarai text-muted-foreground">
          No facility data found for this type. Please create one from Dashboard
          → Website → Student Facilities.
        </p>
      )}
    </div>
  );
}
