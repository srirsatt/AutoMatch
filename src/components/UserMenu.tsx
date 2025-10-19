"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { Users, Building2, LogOut } from "lucide-react";

type Auth = {
  role: "customer" | "dealer";
  name: string;
  customerId?: number;
};

export default function UserMenu() {
  const router = useRouter();
  const [auth, setAuth] = useState<Auth | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("auth");
      if (raw) setAuth(JSON.parse(raw));
    } catch {}

    const onStorage = () => {
      try {
        const raw = sessionStorage.getItem("auth");
        setAuth(raw ? JSON.parse(raw) : null);
      } catch {
        setAuth(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const logout = () => {
    try {
      sessionStorage.removeItem("auth");
      // Keep other mock data, but clear temp selections
      sessionStorage.removeItem("selectedPlan");
    } catch {}
    setAuth(null);
    router.push("/login");
  };

  if (!auth) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login">
          <Button className="px-3 py-1">Log In</Button>
        </Link>
      </div>
    );
  }

  const icon = auth.role === "customer" ? (
    <Users className="h-4 w-4 text-blue-600" />
  ) : (
    <Building2 className="h-4 w-4 text-blue-600" />
  );

  const homeHref = auth.role === "customer" ? "/user" : "/dealer";

  return (
    <div className="flex items-center gap-2">
      <Link href={homeHref} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted border">
        {icon}
        <span className="text-sm font-medium">{auth.name}</span>
        <span className="text-xs text-gray-600">{auth.role === "customer" ? "Customer" : "Dealership"}</span>
      </Link>
      <button onClick={logout} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-600">
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );
}