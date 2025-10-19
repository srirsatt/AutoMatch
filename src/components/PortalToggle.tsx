"use client";
import { Button } from "@/components/ui/button";
import { Users, Building2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function PortalToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const isCustomerView = pathname?.startsWith("/customer") ?? false;

  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
      <Button
        variant={isCustomerView ? "default" : "ghost"}
        size="sm"
        onClick={() => !isCustomerView && router.push("/customer/onboarding")}
        className="gap-2"
      >
        <Users className="h-4 w-4" />
        Customer View
      </Button>
      <Button
        variant={!isCustomerView ? "default" : "ghost"}
        size="sm"
        onClick={() => isCustomerView && router.push("/dealer/dashboard")}
        className="gap-2"
      >
        <Building2 className="h-4 w-4" />
        Dealership View
      </Button>
    </div>
  );
}