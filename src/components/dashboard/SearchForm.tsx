"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useDebounce from "@/utils/debounce";

interface SearchFormProps {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function SearchForm({
  defaultValue = "",
  placeholder = "Search...",
  className = "",
  inputClassName = "",
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(defaultValue);
  const debouncedValue = useDebounce<string>(searchQuery);
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams);
    if (debouncedValue) {
      params.set("search", debouncedValue);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className={cn("flex w-full", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "px-10 relative rounded-s-lg rounded-e-none",
            inputClassName,
          )}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <Button
        type="button"
        size="icon"
        className="h-9 bg-primary hover:bg-primary/90 rounded-l-none cursor-pointer"
      >
        <Search className="h-4 w-4 text-white" />
      </Button>
    </div>
  );
}