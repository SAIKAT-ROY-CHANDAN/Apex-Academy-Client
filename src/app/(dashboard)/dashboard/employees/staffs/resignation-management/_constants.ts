export const formatDate = (isoDate: string) => {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateLong = (isoDate: string) => {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Convert an ISO date/datetime into a YYYY-MM-DD string (for date inputs)
export const toDateInputValue = (isoDate: string) => {
  if (!isoDate) return "";
  return new Date(isoDate).toISOString().slice(0, 10);
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
