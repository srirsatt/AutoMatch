"use client";
import { useEffect, useState } from "react";
import { useOfferStore } from "@/store/offerStore";
import { initialOffers, cars, pricingPlans } from "@/lib/data";

export default function UserContractsPage() {
  const { offers, hydrate } = useOfferStore();
  const STATUS_MAP = {
    Pending: "Pending",
    Offered: "Approved",
    Denied: "Counteroffer",
  } as const;
  type ContractTab = keyof typeof STATUS_MAP;
  const [tab, setTab] = useState<ContractTab>("Offered");

  useEffect(() => {
    const selectedRaw = typeof window !== "undefined" ? sessionStorage.getItem("selectedPlan") : null;
    const selected = selectedRaw ? JSON.parse(selectedRaw) : null;
    const extra = selected
      ? [
          {
            id: 999,
            customerId: selected.customerId,
            carId: selected.carId,
            planId: selected.planId,
            status: "Pending" as const,
            dealerPDF: undefined,
          },
        ]
      : [];
    hydrate([...initialOffers, ...extra]);
  }, [hydrate]);

  const filtered = offers.filter((o) => o.customerId === 1);
  const visible = filtered.filter((o) => o.status === STATUS_MAP[tab]);

  const renderOffer = (o: typeof filtered[number]) => {
    const car = cars.find((c) => c.id === o.carId);
    const plan = pricingPlans.find((p) => p.id === o.planId);
    return (
      <div key={o.id} className="border rounded p-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-16 w-24 bg-gray-200 rounded" />
          <div>
            <div className="font-medium">{car?.model}</div>
            <div className="text-sm text-gray-600">
              {plan?.plan} — {plan?.monthly}, {plan?.term}, {plan?.apr}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const emptyByTab: Record<ContractTab, string> = {
    Pending: "No pending matches.",
    Offered: "No offers yet.",
    Denied: "No denied contracts.",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Your Contracts</h1>
          <p className="text-sm text-gray-600">Pending matches, offers, and counteroffers</p>
        </div>

        <div className="mb-4 flex gap-2">
          {(["Pending", "Offered", "Denied"] as ContractTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "px-4 py-2 rounded-md border " +
                (tab === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-800 hover:bg-gray-50")
              }
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-3 p-4 bg-gray-50 border rounded-xl">
          {visible.length === 0 ? (
            <div className="text-sm text-gray-600">{emptyByTab[tab]}</div>
          ) : (
            visible.map(renderOffer)
          )}
        </div>
      </div>
    </div>
  );
}