"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import SectionCard from "@/components/shared/section-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createWebsiteVisionMission,
  updateWebsiteVisionMission,
} from "@/services/websiteVisionMission";

export interface WebsiteVisionMissionData {
  id: string;
  heading?: string | null;
  subHeading?: string | null;
  vision?: string | null;
  mission?: string | null;
  goal?: string | null;
}

interface VisionMissionFormProps {
  initialData?: WebsiteVisionMissionData | null;
}

export default function VisionMissionForm({
  initialData,
}: VisionMissionFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [heading, setHeading] = useState(initialData?.heading ?? "");
  const [subHeading, setSubHeading] = useState(initialData?.subHeading ?? "");
  const [vision, setVision] = useState(initialData?.vision ?? "");
  const [mission, setMission] = useState(initialData?.mission ?? "");
  const [goal, setGoal] = useState(initialData?.goal ?? "");
  const [isPending, startTransition] = useTransition();

  // Re-sync fields when the server data changes (e.g. after save + revalidate).
  useEffect(() => {
    setHeading(initialData?.heading ?? "");
    setSubHeading(initialData?.subHeading ?? "");
    setVision(initialData?.vision ?? "");
    setMission(initialData?.mission ?? "");
    setGoal(initialData?.goal ?? "");
  }, [initialData]);

  const handleReset = () => {
    setHeading(initialData?.heading ?? "");
    setSubHeading(initialData?.subHeading ?? "");
    setVision(initialData?.vision ?? "");
    setMission(initialData?.mission ?? "");
    setGoal(initialData?.goal ?? "");
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = { heading, subHeading, vision, mission, goal };

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateWebsiteVisionMission(initialData.id, payload)
          : await createWebsiteVisionMission(payload);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "Vision & Mission updated successfully"
            : "Vision & Mission created successfully",
        );
        router.refresh();
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <SectionCard
        title="Vision & Mission"
        onReset={handleReset}
        isPending={isPending}
      >
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Heading
          </Label>
          <Input
            value={heading}
            onChange={(event) => setHeading(event.target.value)}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Sub- Heading
          </Label>
          <Input
            value={subHeading}
            onChange={(event) => setSubHeading(event.target.value)}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Our Vision
          </Label>
          <Textarea
            value={vision}
            onChange={(event) => setVision(event.target.value)}
            placeholder="Write here..."
            className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Our Mission
          </Label>
          <Textarea
            value={mission}
            onChange={(event) => setMission(event.target.value)}
            placeholder="Write here..."
            className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Our Goal
          </Label>
          <Textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="Write here..."
            className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
      </SectionCard>
    </form>
  );
}
