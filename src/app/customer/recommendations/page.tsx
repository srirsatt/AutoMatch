"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import { cars, pricingPlans } from "@/lib/data";
import Image from "next/image";

export default function RecommendationsPage() {
  const router = useRouter();
  const customer =
    typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("customer") ?? "null") : null;

  // Track selected plan per car (carId -> planId)
  const [selectedPlanByCar, setSelectedPlanByCar] = useState<Record<number, number | undefined>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [candidate, setCandidate] = useState<{ carId: number; planId: number } | null>(null);

  const handleSelectClick = (carId: number, planId: number) => {
    setCandidate({ carId, planId });
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!candidate) return;
    const { carId, planId } = candidate;

    // Persist the selection in sessionStorage (placeholder for DB write)
    try {
      const payload = { customerId: 1, carId, planId };
      sessionStorage.setItem("selectedPlan", JSON.stringify(payload));
    } catch {}

    toast.success("Request put into system");

    // Reflect selection in UI: show "Plan selected" for the chosen plan
    setSelectedPlanByCar((prev) => ({ ...prev, [carId]: planId }));

    setConfirmOpen(false);
    setCandidate(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setCandidate(null);
  };

  const visibleCars = cars; // No removal; show all cards

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Recommended Cars</h1>
          <p className="text-gray-600">Based on your financial profile, here are the best matches</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleCars.map((car) => {
            const plans = pricingPlans.filter((p) => p.carId === car.id);
            return (
              <div key={car.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <svg
                    className="h-24 w-24 text-indigo-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M3 13l2-5h14l2 5M5 13h14M7 13v4m10-4v4M4 17h16" />
                  </svg>
                </div>
                <div className="px-6 py-4 border-b flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-semibold">{car.model}</h3>
                    <p className="text-sm text-gray-600 mt-1">MSRP: {car.msrp}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">Recommended</span>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Available Plans</h4>
                    {plans.map((plan) => {
                      const isSelected = selectedPlanByCar[car.id] === plan.id;
                      return (
                        <div key={plan.id} className="p-4 border rounded-lg hover:border-blue-500 transition-colors space-y-3">
                          <div className="flex justify-between items-center">
                            <span
                              className={`${plan.plan === "Lease" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700"} text-xs px-2 py-1 rounded`}
                            >
                              {plan.plan}
                            </span>
                            <span className="text-2xl font-bold text-blue-600">
                              {plan.monthly}
                              <span className="text-sm text-gray-500">/mo</span>
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 2h8a2 2 0 0 1 2 2v16l-6-3-6 3V4a2 2 0 0 1 2-2z" />
                              </svg>
                              <span>{plan.term}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 1v22M5 6h14M5 12h14M5 18h14" />
                              </svg>
                              <span>{plan.apr} APR</span>
                            </div>
                          </div>

                          {isSelected ? (
                            <span className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white">
                              Plan selected
                            </span>
                          ) : (
                            <Button className="w-full" onClick={() => handleSelectClick(car.id, plan.id)}>
                              Select This Plan
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ConfirmDialog
          open={confirmOpen}
          title="Are you sure you want to send the details"
          description="We will send your selected car and plan for processing."
          confirmText="Yes, send"
          cancelText="Cancel"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
