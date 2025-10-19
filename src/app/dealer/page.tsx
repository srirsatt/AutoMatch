"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import CustomerProfileDialog from "@/components/CustomerProfileDialog";
import { customers, cars, pricingPlans } from "@/lib/data";
import { Search, UserRound, Mail, Phone, MapPin, FileText, Eye } from "lucide-react";

export default function DealerPortalPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s));
  }, [q]);

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  const firstPlan = pricingPlans[0];
  const car = cars.find((c) => c.id === firstPlan.carId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dealership Portal</h1>
          <p className="text-sm text-gray-600">Dashboard of matches and customer profiles</p>
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
                  <div className="text-lg font-semibold">{c.name}</div>
                  <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" />{c.email}</div>
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{c.phone}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" />{c.zip}</div>
                  </div>

                  <div className="mt-6">
                    <Button
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => {
                        setSelectedId(c.id);
                        setProfileOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Profile Modal */}
        <CustomerProfileDialog
          open={profileOpen}
          customer={selected}
          onClose={() => setProfileOpen(false)}
          onSend={(pdfName) => {
            if (!selected) return;
            try {
              sessionStorage.setItem(
                "selectedPlan",
                JSON.stringify({ customerId: selected.id, carId: car?.id, planId: firstPlan.id, dealerPDF: pdfName })
              );
            } catch {}
            setProfileOpen(false);
            // Navigate dealer to user contracts if desired:
            // router.push("/user?tab=contracts");
          }}
        />
      </div>
    </div>
  );
}