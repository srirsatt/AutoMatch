"use client";

import { useParams, useRouter } from "next/navigation";
import { customers, cars, pricingPlans } from "@/lib/data";
import { useState } from "react";
import Button from "@/components/Button";
import Link from "next/link";
import { UserRound, Mail, Phone, MapPin, FileText } from "lucide-react";
import SendOfferDialog from "@/components/SendOfferDialog";

export default function DealerCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const customer = customers.find((c) => String(c.id) === params.id);
  const [pdfName, setPdfName] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!customer) return <p>Customer not found.</p>;

  const firstPlan = pricingPlans[0];
  const car = cars.find((c) => c.id === firstPlan.carId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Profile</h1>
            <p className="text-sm text-gray-600">Review details and send an offer</p>
          </div>
          <Link href="/dealer/dashboard" className="text-sm text-blue-600">Back to Dashboard</Link>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <UserRound className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold">{customer.name}</div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" />{customer.email}</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{customer.phone}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" />Zip Code: {customer.zip}</div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-1">Documents:</div>
                <div className="flex flex-wrap gap-2">
                  {customer.documents.map((d, i) => (
                    <span key={i} className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">
                      <FileText className="mr-1 h-3 w-3 text-gray-500" />
                      {d}
                    </span>
                  ))}
                  {customer.documents.length === 0 && (
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-500">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Offer Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="font-medium mb-2">Selected Car + Plan</div>
          <div className="text-sm text-gray-700">
            {car?.model} — {firstPlan.plan} {firstPlan.monthly} / {firstPlan.term} @ {firstPlan.apr}
          </div>

          <Button className="mt-4" onClick={() => setDialogOpen(true)}>
            Upload Contract & Send
          </Button>
        </div>

        <SendOfferDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSend={(pdfName) => {
            try {
              sessionStorage.setItem(
                "selectedPlan",
                JSON.stringify({ customerId: customer.id, carId: car?.id, planId: firstPlan.id, dealerPDF: pdfName }),
              );
            } catch {}
            setDialogOpen(false);
            router.push("/user?tab=contracts");
          }}
        />
      </div>
    </div>
  );
}
