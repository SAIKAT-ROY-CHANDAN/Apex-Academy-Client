import Link from "next/link";
import React from "react";
import { LayoutGrid } from "lucide-react";

const Menus = () => {
  return (
    <div>
      <h2 className="text-xl text-foreground font-semibold mt-5 mb-4">
        Menus
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Link
          href=""
          className="rounded-xl border border-border/50 bg-white p-5 text-center shadow-sm transition-all hover:shadow-md"
        >
          <LayoutGrid className="mx-auto h-8 w-8 text-blue-600" />
          <p className="text-sm font-medium">Class Routine</p>
        </Link>
        <Link
          href=""
          className="rounded-xl border border-border/50 bg-white p-5 text-center shadow-sm transition-all hover:shadow-md"
        >
          <LayoutGrid className="mx-auto h-8 w-8 text-blue-600" />
          <p className="text-sm font-medium">Class Routine</p>
        </Link>
        <Link
          href=""
          className="rounded-xl border border-border/50 bg-white p-5 text-center shadow-sm transition-all hover:shadow-md"
        >
          <LayoutGrid className="mx-auto h-8 w-8 text-blue-600" />
          <p className="text-sm font-medium">Class Routine</p>
        </Link>
        <Link
          href=""
          className="rounded-xl border border-border/50 bg-white p-5 text-center shadow-sm transition-all hover:shadow-md"
        >
          <LayoutGrid className="mx-auto h-8 w-8 text-blue-600" />
          <p className="text-sm font-medium">Class Routine</p>
        </Link>
        <Link
          href=""
          className="rounded-xl border border-border/50 bg-white p-5 text-center shadow-sm transition-all hover:shadow-md"
        >
          <LayoutGrid className="mx-auto h-8 w-8 text-blue-600" />
          <p className="text-sm font-medium">Class Routine</p>
        </Link>
      </div>
    </div>
  );
};

export default Menus;
