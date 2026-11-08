"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster"
      closeButton
      offset="4.5rem"
      mobileOffset="4.5rem"
      visibleToasts={4}
      icons={{
        success: <CircleCheckIcon className="size-4" strokeWidth={2.25} />,
        info: <InfoIcon className="size-4" strokeWidth={2.25} />,
        warning: <TriangleAlertIcon className="size-4" strokeWidth={2.25} />,
        error: <OctagonXIcon className="size-4" strokeWidth={2.25} />,
        loading: (
          <Loader2Icon className="size-4 animate-spin" strokeWidth={2.25} />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-lg)",
          "--width": "400px",
          "--gap": "12px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
