"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    // Redirect legacy /customer index to the new tabbed user portal
    router.replace("/user");
  }, [router]);
  return (
    <div className="p-6 text-sm text-gray-600">Redirecting to your portal…</div>
  );
}