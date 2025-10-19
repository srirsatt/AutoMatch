"use client";
import { useParams, useRouter } from "next/navigation";
import { customers, cars, pricingPlans } from "@/lib/data";
import { useState } from "react";
import Button from "@/components/Button";

export default function DealerCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const customer = customers.find((c) => String(c.id) === params.id);
  const [pdfName, setPdfName] = useState<string>("");

  if (!customer) return <p>Customer not found.</p>;

  const firstPlan = pricingPlans[0];
  const car = cars.find((c) => c.id === firstPlan.carId);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Customer Detail</h2>
      <div className="border rounded p-4 bg-white">
        <div className="font-medium">{customer.name}</div>
        <div className="text-sm text-gray-600">{customer.email}</div>
        <div className="text-xs">Zip: {customer.zip}</div>
        <div className="text-xs mt-1">Documents: {customer.documents.join(", ") || "—"}</div>
      </div>

      <div className="border rounded p-4 bg-white">
        <div className="font-medium mb-2">Selected Car + Plan (example)</div>
        <div className="text-sm">{car?.model} — {firstPlan.plan} {firstPlan.monthly} / {firstPlan.term} @ {firstPlan.apr}</div>

        <div className="mt-3">
          <label className="text-sm mr-2">Upload Pricing PDF (simulated):</label>
          <input type="file" onChange={(e) => setPdfName(e.target.files?.[0]?.name ?? "")} />
          {pdfName && <div className="text-xs mt-1">Attached: {pdfName}</div>}
        </div>

        <Button
          className="mt-3"
          onClick={() => {
            sessionStorage.setItem("selectedPlan", JSON.stringify({
              customerId: customer.id, carId: car?.id, planId: firstPlan.id,
            }));
            router.push("/customer/updates");
          }}
        >
          Send Offer
        </Button>
      </div>
    </div>
  );
}
