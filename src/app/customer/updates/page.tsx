"use client";
import ChatBox from "@/components/ChatBox";
import { cars, pricingPlans } from "@/lib/data";

export default function UpdatesPage() {
  const selected = typeof window !== "undefined"
    ? (JSON.parse(sessionStorage.getItem("selectedPlan") ?? "null") as { customerId: number; carId: number; planId: number } | null)
    : null;

  const car = selected ? cars.find((c) => c.id === selected.carId) : null;
  const plan = selected ? pricingPlans.find((p) => p.id === selected.planId) : null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Approved Offers & Updates</h2>
      {car && plan ? (
        <div className="border rounded p-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-16 w-24 bg-gray-200 rounded" />
            <div>
              <div className="font-medium">{car.model}</div>
              <div className="text-sm text-gray-600">
                {plan.plan} — {plan.monthly}, {plan.term}, {plan.apr}
              </div>
              <div className="text-xs mt-1">
                Status: <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Pending</span>
              </div>
            </div>
          </div>
          <ChatBox />
        </div>
      ) : (
        <p className="text-sm text-gray-600">No selected plan yet.</p>
      )}
    </div>
  );
}
