"use client";
import { useEffect, useState } from "react";
import Button from "@/components/Button";

export default function SendOfferDialog({
  open,
  onClose,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  onSend: (pdfName?: string, note?: string) => void;
}) {
  const [pdfName, setPdfName] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setPdfName("");
      setNote("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl border bg-white shadow-lg">
        <div className="px-6 py-4 border-b">
          <div className="text-lg font-semibold">Upload Contract & Send</div>
          <div className="text-xs text-gray-600">Attach a pricing PDF and include an optional note</div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="text-sm">
            <label className="block font-medium">Pricing PDF (simulated upload)</label>
            <input
              type="file"
              onChange={(e) => setPdfName(e.target.files?.[0]?.name ?? "")}
              className="mt-1 text-sm"
            />
            {pdfName && <div className="text-xs text-gray-500 mt-1">Attached: {pdfName}</div>}
          </div>

          <div className="text-sm">
            <label className="block font-medium">Note (optional)</label>
            <textarea
              className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button className="text-sm text-gray-600" onClick={onClose}>Cancel</button>
            <Button onClick={() => onSend(pdfName || undefined, note || undefined)}>Send Offer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}