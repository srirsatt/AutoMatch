"use client";
import { customers } from "@/lib/data";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function DealerDashboardPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dealership Dashboard</h2>
      <input
        className="border rounded px-3 py-2 w-full sm:w-80"
        placeholder="Search by name or email"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="border rounded p-4 bg-white">
            <div className="font-medium">{c.name}</div>
            <div className="text-sm text-gray-600">{c.email}</div>
            <div className="text-xs mt-1">Zip: {c.zip}</div>
            <div className="text-xs">Docs: {c.documents.join(", ") || "—"}</div>
            <Link href={`/dealer/customers/${c.id}`} className="inline-block mt-3 underline">
              View &amp; Send Offer
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
