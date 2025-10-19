"use client";

import { customers } from "@/lib/data";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, MapPin, FileText, Eye, UserRound } from "lucide-react";
import Button from "@/components/Button";

export default function DealerDashboardPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dealership Dashboard</h1>
          <p className="text-sm text-gray-600">Manage customer applications and offers</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <input
              className="w-full rounded-xl border px-10 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search customers by name or email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <UserRound className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">{c.name}</div>
                      <div className="text-sm text-gray-600">{c.email}</div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>Zip Code: {c.zip}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span>{c.documents.length} documents uploaded</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-1">Documents:</div>
                    <div className="flex flex-wrap gap-2">
                      {c.documents.map((d, i) => (
                        <span key={i} className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">
                          {d}
                        </span>
                      ))}
                      {c.documents.length === 0 && (
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-500">None</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link href={`/dealer/customers/${c.id}`}>
                      <Button className="w-full flex items-center justify-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
