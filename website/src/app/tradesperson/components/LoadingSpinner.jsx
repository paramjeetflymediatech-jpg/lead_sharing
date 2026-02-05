"use client";

import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-[#155DFC] animate-spin" />
        <p className="text-zinc-600 dark:text-zinc-400">Processing payment...</p>
      </div>
    </div>
  );
}