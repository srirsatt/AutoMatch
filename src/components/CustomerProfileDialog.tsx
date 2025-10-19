"use client";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { UserRound, Mail, Phone, MapPin, UploadCloud } from "lucide-react";
import type { Customer } from "@/lib/types";

export default function CustomerProfileDialog({
  open,
  customer,
  onClose,
  onSend,
}: {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSend: (pdfName?: string) => void;
}) {
  const [pdfName, setPdfName] = useState<string>("");
  // Remove inline edit state from dialog
  useEffect(() => {
    if (!open) setPdfName("");
  }, [open]);

  if (!open || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-2xl border bg-white shadow-lg">
        {/* Header */}
        <div className="px-6 pt-6">
          <h2 className="text-2xl font-bold">Customer Profile</h2>
          <p className="text-sm text-gray-600">Review customer details and send financing offers</p>
        </div>

        {/* Details */}
        <div className="px-6 py-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <UserRound className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold">{customer.name}</div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" />{customer.email}</div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{customer.phone}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" />{customer.zip}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Pricing Plan */}
          <div className="mt-8">
            <div className="text-sm font-medium mb-2">Upload Pricing Plan</div>
            <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400">
              <div className="flex items-center justify-center gap-3 text-gray-600">
                <UploadCloud className="h-5 w-5" />
                <span className="text-sm">Upload dealership pricing plan (PDF)</span>
              </div>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setPdfName(e.target.files?.[0]?.name ?? "")}
              />
            </label>
            {pdfName && <div className="mt-2 text-xs text-gray-500">Attached: {pdfName}</div>}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex items-center justify-between border-t">
          <button className="text-sm text-gray-600" onClick={onClose}>Close</button>
          <Button onClick={() => onSend(pdfName || undefined)}>Send Offer to Customer</Button>
        </div>
      </div>
    </div>
  );
}