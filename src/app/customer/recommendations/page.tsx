"use client";
import { cars, pricingPlans } from "@/lib/data";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function RecommendationsPage() {
  const router = useRouter();
  const customer = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("customer") ?? "null") : null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recommended Cars & Plans</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {cars.map((car) => {
          const plans = pricingPlans.filter((p) => p.carId === car.id);
          return (
            <div key={car.id} className="border rounded p-4 bg-white">
              {/* Use a placeholder if you don’t have /public images yet */}
              <div className="relative w-full h-32 bg-gray-200 rounded" />
              <h3 className="font-medium mt-2">{car.model}</h3>
              <p className="text-sm text-gray-600">{car.msrp}</p>
              <div className="mt-3 space-y-2">
                {plans.map((plan) => (
                  <div key={plan.id} className="border rounded p-2">
                    <div className="text-sm">
                      {plan.plan} — {plan.monthly} / {plan.term} @ {plan.apr}
                    </div>
                    <Button
                      className="mt-2 text-sm"
                      onClick={() => {
                        const selected = { customerId: 1, carId: car.id, planId: plan.id };
                        sessionStorage.setItem("selectedPlan", JSON.stringify(selected));
                        router.push("/customer/updates");
                      }}
                    >
                      Select Plan
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
