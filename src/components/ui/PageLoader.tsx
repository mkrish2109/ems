"use client";

import { LoaderOne } from "@/components/ui/loader";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <LoaderOne />
    </div>
  );
}
 