export {
  TEACHER_TYPES,
  ADMINISTRATIVE_POSITIONS,
  ADMINISTRATIVE_POSITION_LABELS,
} from "../_constants";

export const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateLong = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
