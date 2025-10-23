"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import PageLoader from "@/components/ui/PageLoader";

export default function NavigationEvents({ children }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pathname === "/") return;

    setLoading(true);

    // Fake delay for loader UX
    const timeout = setTimeout(() => setLoading(false), 600);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {loading && <PageLoader />}
      {children}
    </>
  );
}
 