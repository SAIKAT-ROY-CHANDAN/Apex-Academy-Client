"use client";

import { useState } from "react";
import { TWebsiteFAQ } from "../../page";



interface FaqSuggestionsProps {
  onSelect?: (question: string) => void;
  faqData: TWebsiteFAQ[];
}



export default function FaqSuggestions({ onSelect , faqData }: FaqSuggestionsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClick = (index: number, question: string) => {
    setOpenIndex((prev) => (prev === index ? null : index));
    onSelect?.(question);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {faqData.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="rounded-2xl bg-gray-100 overflow-hidden transition-colors"
          >
            <button
              type="button"
              onClick={() => handleClick(index, faq.question)}
              className="w-full flex items-center justify-between text-left px-6 py-5 text-[17px] text-gray-900 hover:bg-gray-200 transition-colors font-almarai"
            >
              <span>{faq.question}</span>
              <span
                className={`ml-4 shrink-0 text-gray-500 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>

            <div
              className={`grid transition-all duration-200 ease-in-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-[15px] leading-relaxed text-gray-600 font-almarai">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
