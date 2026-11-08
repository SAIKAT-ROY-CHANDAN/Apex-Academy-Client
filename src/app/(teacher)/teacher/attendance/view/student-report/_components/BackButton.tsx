"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";

const BackButton = () => {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/teacher/attendance");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-100"
    >
      <FaArrowLeft className="h-4 w-4" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;
