import Image from "next/image";
import banner from "@/assets/heroBanner.webp";
import { PageTitle } from "@/components/shared/page-title";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { getAdmissionProgramsByType } from "@/services/admissionProgram";

type TAdmissionProgram = {
  id: string;
  title: string;
  type: string;
  imageUrl?: string | null;
  description?: string | null;
  requirements?: string | null;
  courseList?: string | null;
};

const titleData = {
  subTitle: "Program",
  title: "View Our Post-Graduate Program",
};

const Page = async () => {
  const response = await getAdmissionProgramsByType("POST_GRADUATE");
  const programs: TAdmissionProgram[] = response?.data ?? [];
  const program = programs[0];

  return (
    <div>
      <CoverPageBanner
        pageKey="academic"
        fallbackBanner={banner}
        title="Post Graduate Program"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Academic" },
          { label: "Admission" },
          { label: "Post Graduate Program" },
        ]}
      />
      <PageTitle titleData={titleData} />
      <div className="lg:max-w-4xl 2xl:max-w-6xl mx-auto mb-20 px-4 md:px-0">
        {program?.imageUrl ? (
          <Image
            src={program.imageUrl}
            alt={program.title}
            width={800}
            height={450}
            className="h-[450px] w-full object-cover rounded-2xl"
          />
        ) : (
          <div className="h-[450px] rounded-2xl bg-gray-100 flex items-center justify-center">
            <p className="text-muted-foreground">No image available</p>
          </div>
        )}
        <h3 className="text-xl mt-10 font-bebas">Description</h3>
        <div className="mt-2 font-almarai space-y-2">
          {program?.description ? (
            program.description.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))
          ) : (
            <p>No description available.</p>
          )}
        </div>
        {program?.requirements && (
          <div className="mt-5">
            <h4 className="text-xl font-bebas mb-2">Requirements</h4>
            <ul className="flex flex-col gap-2 list-disc list-inside marker:text-[#5C1A3B] font-almarai">
              {program.requirements.split('\n').filter(Boolean).map((line, i) => (
                <li key={i}>{line.trim()}</li>
              ))}
            </ul>
          </div>
        )}
        {program?.courseList && (
          <div className="mt-5">
            <h4 className="text-xl font-bebas mb-2">Course List:</h4>
            <ul className="flex flex-col gap-2 list-disc list-inside marker:text-[#5C1A3B] font-almarai">
              {program.courseList.split('\n').filter(Boolean).map((line, i) => (
                <li key={i}>{line.trim()}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;